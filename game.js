const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = 900;
const H = 500;

canvas.width = W;
canvas.height = H;

const $ = id => document.getElementById(id);

let running = false;
let score = 0;
let coins = 0;
let lives = 5;
let ammo = 30;
let shield = 3;

let world = 1;
let level = 1;
let camera = 0;

let platforms = [];
let enemies = [];
let coinItems = [];
let ammoItems = [];
let heartItems = [];
let bullets = [];
let particles = [];
let boss = null;

let levelWidth = 3200;

const keys = {
    left: false,
    right: false
};

const player = {
    x: 120,
    y: 350,
    w: 38,
    h: 58,
    vx: 0,
    vy: 0,
    speed: 5,
    jump: 13,
    ground: false,
    direction: 1,
    shootTimer: 0,
    invincible: 0
};

const worlds = {
    1: {
        name: "🌲 جنگل",
        sky: "#77c96b",
        ground: "#70452b",
        top: "#3e9b4f"
    },
    2: {
        name: "❄️ سرزمین برفی",
        sky: "#aee7ff",
        ground: "#dcecf2",
        top: "#ffffff"
    },
    3: {
        name: "🌊 دنیای آبی",
        sky: "#168fd0",
        ground: "#075c78",
        top: "#35c6df"
    },
    4: {
        name: "🔥 سرزمین آتش",
        sky: "#ed7049",
        ground: "#4c2020",
        top: "#9d3527"
    }
};

// -------------------- شروع --------------------

$("startBtn").addEventListener("click", startGame);

function startGame() {
    score = 0;
    coins = 0;
    lives = 5;
    ammo = 30;
    shield = 3;

    world = 1;
    level = 1;

    player.x = 120;
    player.y = 350;
    player.vx = 0;
    player.vy = 0;
    player.invincible = 0;

    running = true;

    $("startBtn").textContent = "🔄 شروع دوباره";

    loadLevel();
    updateUI();

    $("message").textContent = "🌟 ماموریت نجات پدر شروع شد!";

    requestAnimationFrame(loop);
}

// -------------------- ساخت مرحله --------------------

function loadLevel() {
    platforms = [];
    enemies = [];
    coinItems = [];
    ammoItems = [];
    heartItems = [];
    bullets = [];
    particles = [];
    boss = null;

    camera = 0;

    levelWidth = 2800 + level * 80;

    // زمین
    platforms.push({
        x: 0,
        y: 450,
        w: levelWidth,
        h: 50,
        type: "ground"
    });

    // سکوها
    for (let i = 0; i < 20; i++) {
        platforms.push({
            x: 220 + i * 135,
            y: 300 + Math.sin(i * 1.5) * 55,
            w: 110,
            h: 20,
            type: "platform"
        });
    }

    // سکوهای قلب
    for (let i = 0; i < 5; i++) {
        heartItems.push({
            x: 500 + i * 500,
            y: 260,
            collected: false
        });
    }

    // سکه
    for (let i = 0; i < 38; i++) {
        coinItems.push({
            x: 180 + i * 72,
            y: 240 + Math.sin(i * 0.8) * 75,
            collected: false
        });
    }

    // تیر
    for (let i = 0; i < 12; i++) {
        ammoItems.push({
            x: 350 + i * 230,
            y: 410,
            collected: false
        });
    }

    // دشمن
    for (let i = 0; i < 14; i++) {
        let type;

        if (world === 1) {
            type = ["snail", "turtle", "cabbage"][i % 3];
        } else if (world === 2) {
            type = ["penguin", "sheep", "snowball"][i % 3];
        } else if (world === 3) {
            type = ["fish", "bubble"][i % 2];
        } else {
            type = ["fire", "lava", "monster"][i % 3];
        }

        enemies.push({
            x: 420 + i * 175,
            y: 405,
            w: 44,
            h: 44,
            type,
            alive: true,
            direction: i % 2 === 0 ? 1 : -1,
            speed: 0.7 + Math.random() * 0.5
        });
    }

    // باس مرحله ۱۰
    if (level === 10) {
        boss = {
            x: levelWidth - 470,
            y: 300,
            w: 130,
            h: 130,
            hp: 15,
            maxHp: 15,
            direction: -1,
            speed: 0.8
        };
    }
}

// -------------------- کنترل‌ها --------------------

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowRight") keys.right = true;

    if (e.key === "ArrowUp" || e.code === "Space") {
        jump();
        e.preventDefault();
    }

    if (e.key.toLowerCase() === "z") {
        shoot();
    }
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
});

// دکمه‌های موبایل
const leftBtn = $("leftBtn");
const rightBtn = $("rightBtn");
const shootBtn = $("shootBtn");
const jumpBtn = $("jumpBtn");

function holdButton(button, on, off) {
    button.addEventListener("touchstart", e => {
        e.preventDefault();
        on();
    });

    button.addEventListener("touchend", e => {
        e.preventDefault();
        off();
    });

    button.addEventListener("mousedown", on);
    button.addEventListener("mouseup", off);
    button.addEventListener("mouseleave", off);
}

holdButton(
    leftBtn,
    () => keys.left = true,
    () => keys.left = false
);

holdButton(
    rightBtn,
    () => keys.right = true,
    () => keys.right = false
);

jumpBtn.addEventListener("click", jump);
shootBtn.addEventListener("click", shoot);

jumpBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    jump();
});

shootBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    shoot();
});

// -------------------- پرش --------------------

function jump() {
    if (!running) return;

    if (player.ground) {
        player.vy = -player.jump;
        player.ground = false;
    }
}

// -------------------- تیر --------------------

function shoot() {
    if (!running) return;
    if (ammo <= 0) {
        $("message").textContent = "🔫 تیر نداری! جعبه تیر پیدا کن.";
        return;
    }

    if (player.shootTimer > 0) return;

    ammo--;

    bullets.push({
        x: player.x + player.w / 2,
        y: player.y + 25,
        w: 18,
        h: 7,
        vx: player.direction * 12
    });

    player.shootTimer = 10;

    updateUI();
}

// -------------------- آپدیت --------------------

function update() {
    if (!running) return;

    player.vx = 0;

    if (keys.left) {
        player.vx = -player.speed;
        player.direction = -1;
    }

    if (keys.right) {
        player.vx = player.speed;
        player.direction = 1;
    }

    player.x += player.vx;

    player.vy += 0.65;
    player.y += player.vy;

    player.ground = false;

    // برخورد با سکو
    for (const p of platforms) {
        if (
            player.x < p.x + p.w &&
            player.x + player.w > p.x &&
            player.y + player.h <= p.y + 15 &&
            player.y + player.h + player.vy >= p.y
        ) {
            player.y = p.y - player.h;
            player.vy = 0;
            player.ground = true;
        }
    }

    if (player.x < 0) player.x = 0;

    if (player.x > levelWidth - player.w) {
        player.x = levelWidth - player.w;
    }

    // افتادن
    if (player.y > H + 100) {
        loseLife();
        return;
    }

    collectCoins();
    collectAmmo();
    collectHearts();

    updateEnemies();
    updateBullets();
    updateBoss();
    updateParticles();

    if (player.shootTimer > 0) {
        player.shootTimer--;
    }

    if (player.invincible > 0) {
        player.invincible--;
    }

    // دوربین
    camera = player.x - 330;

    if (camera < 0) camera = 0;

    if (camera > levelWidth - W) {
        camera = levelWidth - W;
    }

    // پایان مرحله
    if (
        player.x >= levelWidth - 120 &&
        boss === null
    ) {
        nextLevel();
    }
}

// -------------------- سکه --------------------

function collectCoins() {
    for (const c of coinItems) {
        if (c.collected) continue;

        if (distance(
            player.x + player.w / 2,
            player.y + player.h / 2,
            c.x,
            c.y
        ) < 35) {
            c.collected = true;
            coins++;
            score += 100;

            sparkle(c.x, c.y);

            updateUI();
        }
    }
}

// -------------------- تیر --------------------

function collectAmmo() {
    for (const a of ammoItems) {
        if (a.collected) continue;

        if (
            player.x < a.x + 35 &&
            player.x + player.w > a.x &&
            player.y < a.y + 35 &&
            player.y + player.h > a.y
        ) {
            a.collected = true;
            ammo += 10;
            score += 50;

            $("message").textContent = "🔫 ده تیر گرفتی!";

            updateUI();
        }
    }
}

// -------------------- قلب --------------------

function collectHearts() {
    for (const h of heartItems) {
        if (h.collected) continue;

        if (
            player.x < h.x + 45 &&
            player.x + player.w > h.x &&
            player.y < h.y + 45 &&
            player.y + player.h > h.y
        ) {
            h.collected = true;

            if (lives < 8) {
                lives++;
            }

            score += 200;

            $("message").textContent =
                "❤️ یک جان اضافه گرفتی!";

            sparkle(h.x, h.y);

            updateUI();
        }
    }
}

// -------------------- دشمن --------------------

function updateEnemies() {
    for (const e of enemies) {
        if (!e.alive) continue;

        e.x += e.direction * e.speed;

        if (e.x < 250) e.direction = 1;
        if (e.x > levelWidth - 180) e.direction = -1;

        if (collision(player, e)) {
            if (
                player.vy > 0 &&
                player.y + player.h < e.y + 22
            ) {
                e.alive = false;
                player.vy = -9;
                score += 200;

                sparkle(e.x, e.y);
                updateUI();
            } else {
                damagePlayer();
            }
        }
    }
}

// -------------------- گلوله --------------------

function updateBullets() {
    for (const b of bullets) {
        b.x += b.vx;

        for (const e of enemies) {
            if (
                e.alive &&
                collision(b, e)
            ) {
                e.alive = false;
                b.x = -10000;

                score += 250;
                sparkle(e.x, e.y);

                updateUI();
            }
        }

        if (
            boss &&
            collision(b, boss)
        ) {
            boss.hp--;
            b.x = -10000;

            score += 50;
            sparkle(
                boss.x + boss.w / 2,
                boss.y + boss.h / 2
            );

            updateUI();
        }
    }

    bullets = bullets.filter(
        b =>
            b.x > camera - 100 &&
            b.x < camera + W + 100
    );
}

// -------------------- باس --------------------

function updateBoss() {
    if (!boss) return;

    boss.x += boss.direction * boss.speed;

    if (boss.x < levelWidth - 650) {
        boss.direction = 1;
    }

    if (boss.x > levelWidth - 230) {
        boss.direction = -1;
    }

    if (collision(player, boss)) {
        damagePlayer();
    }

    if (boss.hp <= 0) {
        score += 2000;

        sparkle(
            boss.x + boss.w / 2,
            boss.y + boss.h / 2
        );

        boss = null;

        $("message").textContent =
            "🏆 هیولا شکست خورد! به پرچم برو!";

        updateUI();
    }
}

// -------------------- آسیب --------------------

function damagePlayer() {
    if (player.invincible > 0) return;

    player.invincible = 90;

    if (shield > 0) {
        shield--;

        $("message").textContent =
            "🛡️ محافظت کرد!";

        player.x -= 80;

        updateUI();
        return;
    }

    loseLife();
}

function loseLife() {
    lives--;

    updateUI();

    if (lives <= 0) {
        running = false;

        $("message").textContent =
            "💥 بازی تمام شد! دوباره تلاش کن.";

        return;
    }

    player.x = Math.max(100, player.x - 300);
    player.y = 300;
    player.vy = 0;

    $("message").textContent =
        "❤️ یک جان کم شد!";
}

// -------------------- مرحله بعد --------------------

function nextLevel() {
    level++;

    if (level > 10) {
        level = 1;
        world++;

        if (world > 4) {
            finishGame();
            return;
        }
    }

    player.x = 120;
    player.y = 330;
    player.vx = 0;
    player.vy = 0;

    $("message").textContent =
        worlds[world].name +
        " | مرحله " +
        level +
        " شروع شد!";

    loadLevel();
    updateUI();
}

// -------------------- پایان بازی --------------------

function finishGame() {
    running = false;

    score += 10000;

    $("message").textContent =
        "🏆🎉 تبریک! پدر نجات پیدا کرد! ❤️";

    $("startBtn").textContent =
        "🎮 بازی دوباره";

    updateUI();
}

// -------------------- رسم --------------------

function draw() {
    drawBackground();
    drawPlatforms();
    drawCoins();
    drawAmmo();
    drawHearts();
    drawEnemies();
    drawBoss();
    drawBullets();
    drawFlag();
    drawParticles();
    drawPlayer();
    drawStageInfo();
}

// -------------------- پس‌زمینه --------------------

function drawBackground() {
    const wd = worlds[world];

    ctx.fillStyle = wd.sky;
    ctx.fillRect(0, 0, W, H);

    if (world === 1) drawForest();
    if (world === 2) drawSnow();
    if (world === 3) drawWater();
    if (world === 4) drawFire();
}

function drawForest() {
    for (let x = -100; x < W + 200; x += 130) {
        const px = x - camera * 0.2;

        ctx.fillStyle = "#70452b";
        ctx.fillRect(px, 260, 25, 190);

        ctx.fillStyle = "#2f9346";

        ctx.beginPath();
        ctx.arc(px + 12, 235, 65, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSnow() {
    ctx.fillStyle = "rgba(255,255,255,0.9)";

    for (let i = 0; i < 100; i++) {
        let x = (i * 137 - camera * 0.2) % W;
        if (x < 0) x += W;

        let y = (i * 67) % 430;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawWater() {
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;

    for (let y = 80; y < H; y += 70) {
        ctx.beginPath();
        ctx.moveTo(0, y);

        ctx.quadraticCurveTo(
            220,
            y - 30,
            450,
            y
        );

        ctx.quadraticCurveTo(
            700,
            y + 30,
            W,
            y
        );

        ctx.stroke();
    }
}

function drawFire() {
    for (let i = 0; i < 30; i++) {
        let x = (i * 91 - camera * 0.15) % W;
        if (x < 0) x += W;

        let y = 80 + (i * 43) % 300;

        ctx.fillStyle = "rgba(255,190,0,0.35)";

        ctx.beginPath();
        ctx.arc(x, y, 17, 0, Math.PI * 2);
        ctx.fill();
    }
}

// -------------------- سکو --------------------

function drawPlatforms() {
    const wd = worlds[world];

    for (const p of platforms) {
        const x = p.x - camera;

        ctx.fillStyle = wd.ground;

        ctx.fillRect(
            x,
            p.y,
            p.w,
            p.h
        );

        ctx.fillStyle = wd.top;

        ctx.fillRect(
            x,
            p.y,
            p.w,
            8
        );
    }
}

// -------------------- دختر --------------------

function drawPlayer() {
    if (
        player.invincible > 0 &&
        Math.floor(player.invincible / 6) % 2 === 0
    ) {
        return;
    }

    const x = player.x - camera;
    const y = player.y;

    // مو
    ctx.fillStyle = "#4b2412";

    ctx.beginPath();
    ctx.arc(
        x + 19,
        y + 15,
        20,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // صورت
    ctx.fillStyle = "#ffd0a8";

    ctx.beginPath();
    ctx.arc(
        x + 19,
        y + 20,
        15,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // مو روی پیشانی
    ctx.fillStyle = "#4b2412";
    ctx.fillRect(
        x + 4,
        y + 3,
        30,
        12
    );

    // چشم
    ctx.fillStyle = "#222";

    ctx.fillRect(x + 12, y + 18, 4, 5);
    ctx.fillRect(x + 23, y + 18, 4, 5);

    // لباس
    ctx.fillStyle = "#ff4f81";

    ctx.fillRect(
        x + 5,
        y + 35,
        29,
        23
    );

    // دست
    ctx.fillStyle = "#ffd0a8";

    ctx.fillRect(
        x - 2,
        y + 37,
        8,
        20
    );

    ctx.fillRect(
        x + 32,
        y + 37,
        8,
        20
    );

    // پا
    ctx.fillStyle = "#273746";

    ctx.fillRect(
        x + 7,
        y + 56,
        9,
        15
    );

    ctx.fillRect(
        x + 23,
        y + 56,
        9,
        15
    );

    // سپر
    if (shield > 0) {
        ctx.strokeStyle = "rgba(0,190,255,0.65)";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(
            x + 19,
            y + 35,
            37,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }
}

// -------------------- سکه --------------------

function drawCoins() {
    for (const c of coinItems) {
        if (c.collected) continue;

        const x = c.x - camera;

        ctx.fillStyle = "#ffd700";

        ctx.beginPath();
        ctx.arc(
            x,
            c.y,
            12,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#fff3a3";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            "$",
            x,
            c.y + 4
        );
    }
}

// -------------------- جعبه تیر --------------------

function drawAmmo() {
    for (const a of ammoItems) {
        if (a.collected) continue;

        const x = a.x - camera;

        ctx.fillStyle = "#704d32";

        ctx.fillRect(
            x,
            a.y,
            35,
            35
        );

        ctx.fillStyle = "#ffd700";

        ctx.font = "20px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "🔫",
            x + 17,
            a.y + 25
        );
    }
}

// -------------------- قلب --------------------

function drawHearts() {
    for (const h of heartItems) {
        if (h.collected) continue;

        const x = h.x - camera;

        ctx.fillStyle = "#ff3158";

        ctx.font = "34px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "❤️",
            x + 18,
            h.y + 30
        );

        // سکوی زیر قلب
        ctx.fillStyle = "#f4b942";

        ctx.fillRect(
            x - 18,
            h.y + 38,
            72,
            10
        );
    }
}

// -------------------- دشمن‌ها --------------------

function drawEnemies() {
    for (const e of enemies) {
        if (!e.alive) continue;

        drawEnemy(
            e.type,
            e.x - camera,
            e.y
        );
    }
}

function drawEnemy(type, x, y) {

    if (type === "snail") {
        ctx.fillStyle = "#8e44ad";

        ctx.beginPath();
        ctx.arc(
            x + 22,
            y + 24,
            20,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#6c3483";

        ctx.beginPath();
        ctx.arc(
            x + 22,
            y + 24,
            10,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#5dade2";
        ctx.fillRect(x + 35, y + 5, 4, 18);
        ctx.fillRect(x + 44, y + 5, 4, 18);

        return;
    }

    if (type === "turtle") {
        ctx.fillStyle = "#267a45";

        ctx.beginPath();
        ctx.ellipse(
            x + 21,
            y + 25,
            23,
            17,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "#145a32";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(
            x + 21,
            y + 25,
            11,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.fillStyle = "#4caf50";

        ctx.beginPath();
        ctx.arc(
            x + 43,
            y + 22,
            9,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(
            x + 46,
            y + 19,
            2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        return;
    }

    if (type === "cabbage") {
        ctx.fillStyle = "#27ae60";

        ctx.beginPath();
        ctx.arc(
            x + 22,
            y + 22,
            22,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "#145a32";
        ctx.lineWidth = 2;

        ctx.stroke();

        return;
    }

    if (type === "penguin") {
        ctx.fillStyle = "#263238";

        ctx.beginPath();
        ctx.ellipse(
            x + 22,
            y + 23,
            19,
            25,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.ellipse(
            x + 22,
            y + 28,
            12,
            17,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#f39c12";

        ctx.fillRect(
            x + 16,
            y + 25,
            12,
            6
        );

        return;
    }

    if (type === "sheep") {
        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.arc(
            x + 21,
            y + 22,
            22,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#333";

        ctx.beginPath();
        ctx.arc(
            x + 41,
            y + 23,
            9,
            0,
            Math.PI * 2
        );
        ctx.fill();

        return;
    }

    if (type === "snowball") {
        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.arc(
            x + 22,
            y + 22,
            22,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "#8bd8ff";
        ctx.lineWidth = 3;
        ctx.stroke();

        return;
    }

    if (type === "fish") {
        ctx.fillStyle = "#ff7675";

        ctx.beginPath();
        ctx.ellipse(
            x + 23,
            y + 23,
            24,
            14,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#ff5252";

        ctx.beginPath();
        ctx.moveTo(x, y + 23);
        ctx.lineTo(x - 17, y + 10);
        ctx.lineTo(x - 17, y + 36);
        ctx.closePath();
        ctx.fill();

        return;
    }

    if (type === "bubble") {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(
            x + 22,
            y + 22,
            19,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        return;
    }

    if (type === "fire") {
        ctx.fillStyle = "#ff3d00";

        ctx.beginPath();
        ctx.moveTo(x + 22, y);
        ctx.lineTo(x + 45, y + 43);
        ctx.lineTo(x, y + 43);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffd600";

        ctx.beginPath();
        ctx.arc(
            x + 22,
            y + 29,
            10,
            0,
            Math.PI * 2
        );
        ctx.fill();

        return;
    }

    if (type === "lava") {
        ctx.fillStyle = "#ff5722";

        ctx.beginPath();
        ctx.arc(
            x + 22,
            y + 22,
            22,
            0,
            Math.PI * 2
        );
        ctx.fill();

        return;
    }

    // هیولای کوچک
    ctx.fillStyle = "#6c5ce7";

    ctx.fillRect(
        x,
        y,
        44,
        43
    );

    ctx.fillStyle = "white";

    ctx.fillRect(
        x + 8,
        y + 9,
        9,
        9
    );

    ctx.fillRect(
        x + 28,
        y + 9,
        9,
        9
    );
}

// -------------------- باس --------------------

function drawBoss() {
    if (!boss) return;

    const x = boss.x - camera;
    const y = boss.y;

    ctx.fillStyle =
        world === 1 ? "#7b241c" :
        world === 2 ? "#34495e" :
        world === 3 ? "#145a86" :
        "#641e16";

    ctx.beginPath();
    ctx.arc(
        x + 65,
        y + 65,
        63,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // شاخ
    ctx.fillStyle = "#f1c40f";

    ctx.beginPath();
    ctx.moveTo(x + 25, y + 18);
    ctx.lineTo(x + 45, y - 15);
    ctx.lineTo(x + 55, y + 25);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 75, y + 25);
    ctx.lineTo(x + 88, y - 15);
    ctx.lineTo(x + 108, y + 18);
    ctx.fill();

    // چشم
    ctx.fillStyle = "white";

    ctx.fillRect(x + 30, y + 45, 18, 18);
    ctx.fillRect(x + 82, y + 45, 18, 18);

    ctx.fillStyle = "#111";

    ctx.fillRect(x + 36, y + 51, 7, 10);
    ctx.fillRect(x + 88, y + 51, 7, 10);

    // دهان
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 32,
        y + 91,
        66,
        14
    );

    // نوار جان
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y - 25,
        130,
        15
    );

    ctx.fillStyle = "#e74c3c";

    ctx.fillRect(
        x,
        y - 25,
        130 * (boss.hp / boss.maxHp),
        15
    );
}

// -------------------- گلوله --------------------

function drawBullets() {
    ctx.fillStyle = "#fff200";

    for (const b of bullets) {
        ctx.fillRect(
            b.x - camera,
            b.y,
            b.w,
            b.h
        );
    }
}

// -------------------- پرچم --------------------

function drawFlag() {
    const x = levelWidth - 90 - camera;

    ctx.fillStyle = "#555";

    ctx.fillRect(
        x,
        350,
        6,
        100
    );

    ctx.fillStyle = "#ff4757";

    ctx.beginPath();
    ctx.moveTo(x + 6, 350);
    ctx.lineTo(x + 70, 370);
    ctx.lineTo(x + 6, 392);
    ctx.closePath();
    ctx.fill();
}

// -------------------- ذرات --------------------

function sparkle(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7,
            life: 30
        });
    }
}

function updateParticles() {
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life--;
    }

    particles = particles.filter(
        p => p.life > 0
    );
}

function drawParticles() {
    ctx.fillStyle = "#ffd700";

    for (const p of particles) {
        ctx.fillRect(
            p.x - camera,
            p.y,
            5,
            5
        );
    }
}

// -------------------- اطلاعات مرحله --------------------

function drawStageInfo() {
    ctx.direction = "rtl";

    ctx.fillStyle = "rgba(0,0,0,0.55)";

    ctx.fillRect(
        15,
        15,
        250,
        55
    );

    ctx.fillStyle = "white";

    ctx.font = "bold 18px Arial";
    ctx.textAlign = "right";

    ctx.fillText(
        worlds[world].name,
        245,
        38
    );

    ctx.font = "15px Arial";

    ctx.fillText(
        "مرحله " + level + " از 10",
        245,
        60
    );
}

// -------------------- رابط کاربری --------------------

function updateUI() {
    $("score").textContent = score;
    $("coins").textContent = coins;
    $("lives").textContent = lives;
    $("ammo").textContent = ammo;
    $("shield").textContent = shield;

    $("worldName").textContent =
        worlds[world].name;

    $("levelNumber").textContent =
        level;
}

// -------------------- توابع کمکی --------------------

function collision(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(
        (x1 - x2) ** 2 +
        (y1 - y2) ** 2
    );
}

// -------------------- حلقه بازی --------------------

function loop() {
    if (!running) {
        draw();
        return;
    }

    update();
    draw();

    requestAnimationFrame(loop);
}

updateUI();
draw();
