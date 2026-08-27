// ======================================================
// ELINA GAME
// 4 دنیا × 10 مرحله
// ======================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = 900;
const H = 500;

canvas.width = W;
canvas.height = H;

// ======================================================
// وضعیت بازی
// ======================================================

let gameRunning = false;

let world = 1;
let level = 1;

let score = 0;
let coins = 0;
let lives = 5;
let ammo = 30;
let shield = 3;

let camera = 0;
let levelWidth = 3000;

let platforms = [];
let enemies = [];
let coinItems = [];
let ammoItems = [];
let heartItems = [];
let bullets = [];
let particles = [];

let flag = null;
let boss = null;

let endingScene = false;
let endingTimer = 0;

const keys = {
    left: false,
    right: false
};

// ======================================================
// دنیاها
// ======================================================

const worlds = {
    1: {
        name: "🌲 جنگل اسرارآمیز",
        sky: "#70c86a",
        ground: "#70452b",
        top: "#3d9b4c",
        enemies: ["snail", "turtle", "cabbage"]
    },

    2: {
        name: "❄️ سرزمین برفی",
        sky: "#9edfff",
        ground: "#aabdc5",
        top: "#ffffff",
        enemies: ["penguin", "sheep", "snowball"]
    },

    3: {
        name: "🌊 دنیای زیر آب",
        sky: "#168fc7",
        ground: "#07516c",
        top: "#35c8df",
        enemies: ["fish", "bubble"]
    },

    4: {
        name: "🔥 سرزمین آتش",
        sky: "#e96b43",
        ground: "#482020",
        top: "#a83a26",
        enemies: ["fire", "lava", "monster"]
    }
};

// ======================================================
// بازیکن
// ======================================================

const player = {
    x: 100,
    y: 300,
    w: 38,
    h: 58,

    vx: 0,
    vy: 0,

    speed: 5,
    jumpPower: 13,

    ground: false,
    direction: 1,

    invincible: 0,
    shootCooldown: 0
};

// ======================================================
// شروع بازی
// ======================================================

const startBtn = document.getElementById("startBtn");

if (startBtn) {
    startBtn.addEventListener("click", startGame);
}

function startGame() {

    world = 1;
    level = 1;

    score = 0;
    coins = 0;
    lives = 5;
    ammo = 30;
    shield = 3;

    endingScene = false;
    endingTimer = 0;

    gameRunning = true;

    loadLevel();

    showMessage("🌟 مأموریت نجات پدر شروع شد!");

    requestAnimationFrame(loop);
}

// ======================================================
// ساخت مرحله
// ======================================================

function loadLevel() {

    platforms = [];
    enemies = [];
    coinItems = [];
    ammoItems = [];
    heartItems = [];
    bullets = [];
    particles = [];

    boss = null;
    flag = null;

    camera = 0;

    // طول مراحل کمی متفاوت است
    levelWidth = 2400 + level * 120;

    createMainGround();
    createPlatforms();
    createCoins();
    createAmmo();
    createHearts();
    createEnemies();

    // مرحله دهم = باس
    if (level === 10) {
        createBoss();
    }

    flag = {
        x: levelWidth - 110,
        y: 350,
        active: level !== 10
    };

    resetPlayer();
    updateUI();
}

// ======================================================
// زمین
// ======================================================

function createMainGround() {

    platforms.push({
        x: 0,
        y: 450,
        w: levelWidth,
        h: 50
    });
}

// ======================================================
// سکوهای متفاوت
// ======================================================

function createPlatforms() {

    const pattern = level % 6;

    if (pattern === 0) {

        // پرش‌های بلند
        for (let i = 0; i < 15; i++) {

            platforms.push({
                x: 230 + i * 175,
                y: i % 2 === 0 ? 260 : 150,
                w: 105,
                h: 20
            });
        }
    }

    else if (pattern === 1) {

        // مسیر جنگلی
        for (let i = 0; i < 20; i++) {

            platforms.push({
                x: 160 + i * 125,
                y: 310 - (i % 3) * 45,
                w: 95,
                h: 20
            });
        }
    }

    else if (pattern === 2) {

        // پله
        for (let i = 0; i < 18; i++) {

            platforms.push({
                x: 150 + i * 125,
                y: 420 - (i % 5) * 55,
                w: 100,
                h: 20
            });
        }
    }

    else if (pattern === 3) {

        // سکوهای بلند
        for (let i = 0; i < 16; i++) {

            platforms.push({
                x: 220 + i * 155,
                y: 170 + Math.sin(i) * 100,
                w: 110,
                h: 20
            });
        }
    }

    else if (pattern === 4) {

        // مسیر پراکنده
        for (let i = 0; i < 18; i++) {

            platforms.push({
                x: 180 + i * 140,
                y: 180 + ((i * 73) % 190),
                w: 90,
                h: 20
            });
        }
    }

    else {

        // پرش‌های خیلی متنوع
        for (let i = 0; i < 17; i++) {

            platforms.push({
                x: 190 + i * 155,
                y: 220 + Math.cos(i) * 120,
                w: 105,
                h: 20
            });
        }
    }
}

// ======================================================
// سکه
// ======================================================

function createCoins() {

    for (let i = 0; i < 38; i++) {

        coinItems.push({
            x: 170 + i * 68,
            y: 190 + Math.sin(i * 0.8) * 100,
            collected: false
        });
    }
}

// ======================================================
// جعبه جادویی
// ======================================================

function createAmmo() {

    for (let i = 0; i < 10; i++) {

        ammoItems.push({
            x: 380 + i * 230,
            y: 400,
            collected: false
        });
    }
}

// ======================================================
// قلب
// ======================================================

function createHearts() {

    for (let i = 0; i < 5; i++) {

        heartItems.push({
            x: 550 + i * 430,
            y: 210 + (i % 2) * 70,
            collected: false
        });
    }
}

// ======================================================
// دشمن
// ======================================================

function createEnemies() {

    const types = worlds[world].enemies;

    for (let i = 0; i < 16; i++) {

        enemies.push({

            x: 430 + i * 145,

            y: 405,

            w: 44,
            h: 44,

            type: types[i % types.length],

            alive: true,

            direction: i % 2 === 0 ? 1 : -1,

            speed: 0.5 + Math.random() * 0.6
        });
    }
}

// ======================================================
// باس
// ======================================================

function createBoss() {

    boss = {

        x: levelWidth - 500,
        y: 280,

        w: 150,
        h: 150,

        hp: 15,
        maxHp: 15,

        direction: -1,
        speed: 0.7
    };
}

// ======================================================
// ریست بازیکن
// ======================================================

function resetPlayer() {

    player.x = 100;
    player.y = 300;

    player.vx = 0;
    player.vy = 0;

    player.direction = 1;

    player.ground = false;

    player.invincible = 0;

    camera = 0;
}

// ======================================================
// کیبورد
// ======================================================

document.addEventListener("keydown", function(e) {

    if (e.key === "ArrowLeft") {
        keys.left = true;
    }

    if (e.key === "ArrowRight") {
        keys.right = true;
    }

    if (
        e.key === "ArrowUp" ||
        e.code === "Space"
    ) {

        jump();
        e.preventDefault();
    }

    if (e.key.toLowerCase() === "z") {
        shoot();
    }
});

document.addEventListener("keyup", function(e) {

    if (e.key === "ArrowLeft") {
        keys.left = false;
    }

    if (e.key === "ArrowRight") {
        keys.right = false;
    }
});

// ======================================================
// کنترل موبایل
// ======================================================

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");
const shootBtn = document.getElementById("shootBtn");

if (leftBtn) {
    buttonControl(
        leftBtn,
        () => keys.left = true,
        () => keys.left = false
    );
}

if (rightBtn) {
    buttonControl(
        rightBtn,
        () => keys.right = true,
        () => keys.right = false
    );
}

if (jumpBtn) {
    jumpBtn.addEventListener("click", jump);
}

if (shootBtn) {
    shootBtn.addEventListener("click", shoot);
}

function buttonControl(button, start, end) {

    button.addEventListener("touchstart", function(e) {
        e.preventDefault();
        start();
    });

    button.addEventListener("touchend", function(e) {
        e.preventDefault();
        end();
    });

    button.addEventListener("mousedown", start);
    button.addEventListener("mouseup", end);
    button.addEventListener("mouseleave", end);
}

// ======================================================
// پرش
// ======================================================

function jump() {

    if (!gameRunning) return;

    if (player.ground) {

        player.vy = -player.jumpPower;

        player.ground = false;
    }
}

// ======================================================
// پرتاب ستاره جادویی
// ======================================================

function shoot() {

    if (!gameRunning) return;

    if (ammo <= 0) {

        showMessage("✨ نیروی جادویی نداری!");

        return;
    }

    if (player.shootCooldown > 0) return;

    ammo--;

    bullets.push({

        x: player.x + player.w / 2,

        y: player.y + 25,

        w: 18,
        h: 18,

        vx: player.direction * 11
    });

    player.shootCooldown = 12;

    updateUI();
}

// ======================================================
// آپدیت
// ======================================================

function update() {

    if (!gameRunning) return;

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

    // جاذبه
    player.vy += 0.65;

    player.y += player.vy;

    player.ground = false;

    // برخورد با سکو
    for (const p of platforms) {

        if (

            player.x < p.x + p.w &&
            player.x + player.w > p.x &&
            player.y + player.h <= p.y + 20 &&
            player.y + player.h + player.vy >= p.y

        ) {

            player.y = p.y - player.h;

            player.vy = 0;

            player.ground = true;
        }
    }

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x > levelWidth - player.w) {
        player.x = levelWidth - player.w;
    }

    // افتادن
    if (player.y > 600) {

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

    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }

    if (player.invincible > 0) {
        player.invincible--;
    }

    // دوربین
    camera = player.x - 330;

    if (camera < 0) {
        camera = 0;
    }

    if (camera > levelWidth - W) {
        camera = levelWidth - W;
    }

    checkFlag();
}

// ======================================================
// پرچم
// ======================================================

function checkFlag() {

    if (!flag || !flag.active) return;

    if (

        player.x + player.w > flag.x &&
        player.x < flag.x + 55 &&
        player.y + player.h > flag.y

    ) {

        finishLevel();
    }
}

// ======================================================
// پایان مرحله
// ======================================================

function finishLevel() {

    gameRunning = false;

    showMessage(
        "🎉 مرحله " + level + " تمام شد!"
    );

    setTimeout(nextLevel, 1200);
}

// ======================================================
// مرحله بعد
// ======================================================

function nextLevel() {

    level++;

    if (level > 10) {

        level = 1;

        world++;

        if (world > 4) {

            startEnding();

            return;
        }
    }

    // مرحله جدید کاملاً از اول ساخته می‌شود
    loadLevel();

    gameRunning = true;

    showMessage(
        worlds[world].name +
        " | مرحله " +
        level
    );

    requestAnimationFrame(loop);
}

// ======================================================
// پایان کل بازی
// ======================================================

function startEnding() {

    gameRunning = false;

    endingScene = true;

    endingTimer = 0;

    requestAnimationFrame(loop);
}

// ======================================================
// جان
// ======================================================

function loseLife() {

    lives--;

    updateUI();

    if (lives <= 0) {

        gameRunning = false;

        showMessage("💔 بازی تمام شد!");

        return;
    }

    resetPlayer();

    showMessage("❤️ یک جان کم شد!");
}

// ======================================================
// آسیب
// ======================================================

function damagePlayer() {

    if (player.invincible > 0) return;

    player.invincible = 90;

    if (shield > 0) {

        shield--;

        player.x -= 80;

        showMessage(
            "🛡️ محافظ ازت مراقبت کرد!"
        );

    } else {

        loseLife();
    }

    updateUI();
}

// ======================================================
// سکه
// ======================================================

function collectCoins() {

    for (const c of coinItems) {

        if (c.collected) continue;

        if (

            distance(
                player.x + player.w / 2,
                player.y + player.h / 2,
                c.x,
                c.y
            ) < 30

        ) {

            c.collected = true;

            coins++;

            score += 100;

            sparkle(c.x, c.y);
        }
    }

    updateUI();
}

// ======================================================
// نیروی جادویی
// ======================================================

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

            showMessage(
                "✨ ۱۰ نیروی جادویی گرفتی!"
            );
        }
    }

    updateUI();
}

// ======================================================
// قلب
// ======================================================

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

            sparkle(h.x, h.y);

            showMessage(
                "❤️ یک جان اضافه گرفتی!"
            );
        }
    }

    updateUI();
}

// ======================================================
// دشمن‌ها
// ======================================================

function updateEnemies() {

    for (const e of enemies) {

        if (!e.alive) continue;

        e.x += e.direction * e.speed;

        if (e.x < 250) {
            e.direction = 1;
        }

        if (e.x > levelWidth - 200) {
            e.direction = -1;
        }

        if (collision(player, e)) {

            // پریدن روی دشمن
            if (

                player.vy > 0 &&
                player.y + player.h < e.y + 25

            ) {

                e.alive = false;

                player.vy = -9;

                score += 200;

                sparkle(e.x, e.y);

            } else {

                damagePlayer();
            }
        }
    }

    updateUI();
}

// ======================================================
// ستاره‌های جادویی
// ======================================================

function updateBullets() {

    for (const b of bullets) {

        b.x += b.vx;

        for (const e of enemies) {

            if (
                e.alive &&
                collision(b, e)
            ) {

                e.alive = false;

                b.x = -9999;

                score += 250;

                sparkle(e.x, e.y);
            }
        }

        if (boss && collision(b, boss)) {

            boss.hp--;

            b.x = -9999;

            score += 50;

            sparkle(
                boss.x + boss.w / 2,
                boss.y + boss.h / 2
            );

            if (boss.hp <= 0) {
                bossDefeated();
            }
        }
    }

    bullets = bullets.filter(
        b =>
            b.x > camera - 300 &&
            b.x < camera + W + 300
    );

    updateUI();
}

// ======================================================
// باس
// ======================================================

function updateBoss() {

    if (!boss) return;

    boss.x += boss.direction * boss.speed;

    if (boss.x < levelWidth - 700) {
        boss.direction = 1;
    }

    if (boss.x > levelWidth - 200) {
        boss.direction = -1;
    }

    if (collision(player, boss)) {
        damagePlayer();
    }
}

function bossDefeated() {

    boss = null;

    score += 2000;

    flag.active = true;

    showMessage(
        "👹 هیولا شکست خورد! 🚩 به پرچم برو!"
    );

    sparkle(
        levelWidth - 450,
        350
    );
}

// ======================================================
// رسم
// ======================================================

function draw() {

    if (endingScene) {

        drawEnding();

        return;
    }

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

// ======================================================
// پس زمینه
// ======================================================

function drawBackground() {

    const wd = worlds[world];

    ctx.fillStyle = wd.sky;

    ctx.fillRect(0, 0, W, H);

    if (world === 1) drawForest();
    if (world === 2) drawSnow();
    if (world === 3) drawWater();
    if (world === 4) drawFire();
}

// ======================================================
// جنگل
// ======================================================

function drawForest() {

    for (let x = -100; x < W + 200; x += 130) {

        const px = x - camera * 0.2;

        ctx.fillStyle = "#70452b";

        ctx.fillRect(
            px,
            260,
            25,
            190
        );

        ctx.fillStyle = "#31944b";

        ctx.beginPath();

        ctx.arc(
            px + 12,
            235,
            65,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

// ======================================================
// برف
// ======================================================

function drawSnow() {

    ctx.fillStyle =
        "rgba(255,255,255,0.9)";

    for (let i = 0; i < 110; i++) {

        let x =
            (i * 137 - camera * 0.2) % W;

        if (x < 0) x += W;

        let y =
            (i * 67) % 430;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    // کوه‌های برفی
    ctx.fillStyle = "#e8f7ff";

    for (let x = -100; x < W + 300; x += 260) {

        ctx.beginPath();

        ctx.moveTo(
            x - camera * 0.15,
            330
        );

        ctx.lineTo(
            x + 130 - camera * 0.15,
            150
        );

        ctx.lineTo(
            x + 260 - camera * 0.15,
            330
        );

        ctx.closePath();

        ctx.fill();
    }
}

// ======================================================
// آب
// ======================================================

function drawWater() {

    ctx.strokeStyle =
        "rgba(255,255,255,0.35)";

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

    // حباب‌های پس‌زمینه
    ctx.strokeStyle =
        "rgba(255,255,255,0.3)";

    for (let i = 0; i < 25; i++) {

        const x =
            (i * 91 - camera * 0.1) % W;

        const y =
            80 + (i * 47) % 330;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            7,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }
}

// ======================================================
// آتش
// ======================================================

function drawFire() {

    for (let i = 0; i < 35; i++) {

        let x =
            (i * 91 - camera * 0.15) % W;

        if (x < 0) x += W;

        let y =
            70 + (i * 43) % 330;

        ctx.fillStyle =
            "rgba(255,190,0,0.4)";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            16,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

// ======================================================
// سکو
// ======================================================

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

// ======================================================
// دختر
// ======================================================

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

    // چشم‌ها
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 12,
        y + 18,
        4,
        5
    );

    ctx.fillRect(
        x + 23,
        y + 18,
        4,
        5
    );

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

    // پاها
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

    // محافظ
    if (shield > 0) {

        ctx.strokeStyle =
            "rgba(0,190,255,0.65)";

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

// ======================================================
// سکه
// ======================================================

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
            "★",
            x,
            c.y + 4
        );
    }
}

// ======================================================
// جعبه نیروی جادویی
// ======================================================

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

        ctx.font = "22px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "✨",
            x + 17,
            a.y + 26
        );
    }
}

// ======================================================
// قلب‌ها
// ======================================================

function drawHearts() {

    for (const h of heartItems) {

        if (h.collected) continue;

        const x = h.x - camera;

        ctx.font = "34px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "❤️",
            x + 18,
            h.y + 30
        );

        ctx.fillStyle = "#f4b942";

        ctx.fillRect(
            x - 18,
            h.y + 38,
            72,
            10
        );
    }
}

// ======================================================
// دشمن‌ها
// ======================================================

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

    // حلزون
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

        return;
    }

    // لاکپشت
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

    // کلم
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

        return;
    }

    // پنگوئن
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

    // گوسفند
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

    // گلوله برفی
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

    // ماهی
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

        ctx.moveTo(
            x,
            y + 23
        );

        ctx.lineTo(
            x - 17,
            y + 10
        );

        ctx.lineTo(
            x - 17,
            y + 36
        );

        ctx.closePath();

        ctx.fill();

        return;
    }

    // حباب
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

    // آتش
    if (type === "fire") {

        ctx.fillStyle = "#ff3d00";

        ctx.beginPath();

        ctx.moveTo(
            x + 22,
            y
        );

        ctx.lineTo(
            x + 45,
            y + 43
        );

        ctx.lineTo(
            x,
            y + 43
        );

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

    // گدازه
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

// ======================================================
// باس
// ======================================================

function drawBoss() {

    if (!boss) return;

    const x = boss.x - camera;
    const y = boss.y;

    const bossColors = [
        "#7b241c",
        "#34495e",
        "#145a86",
        "#641e16"
    ];

    ctx.fillStyle =
        bossColors[world - 1];

    ctx.beginPath();

    ctx.arc(
        x + 75,
        y + 75,
        70,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // شاخ
    ctx.fillStyle = "#ddd";

    ctx.beginPath();

    ctx.moveTo(x + 35, y + 25);
    ctx.lineTo(x + 10, y - 15);
    ctx.lineTo(x + 55, y + 15);

    ctx.closePath();

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(x + 115, y + 25);
    ctx.lineTo(x + 140, y - 15);
    ctx.lineTo(x + 95, y + 15);

    ctx.closePath();

    ctx.fill();

    // چشم
    ctx.fillStyle = "white";

    ctx.fillRect(
        x + 35,
        y + 55,
        20,
        20
    );

    ctx.fillRect(
        x + 95,
        y + 55,
        20,
        20
    );

    ctx.fillStyle = "#111";

    ctx.fillRect(
        x + 41,
        y + 61,
        8,
        12
    );

    ctx.fillRect(
        x + 101,
        y + 61,
        8,
        12
    );

    // دهان
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 35,
        y + 105,
        80,
        18
    );

    // سلامتی
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y - 35,
        150,
        15
    );

    ctx.fillStyle = "#e74c3c";

    ctx.fillRect(
        x,
        y - 35,
        150 * (boss.hp / boss.maxHp),
        15
    );
}

// ======================================================
// پرچم
// ======================================================

function drawFlag() {

    if (!flag) return;

    const x = flag.x - camera;

    ctx.fillStyle = "#555";

    ctx.fillRect(
        x,
        350,
        7,
        100
    );

    ctx.fillStyle =
        flag.active ? "#ff4757" : "#777";

    ctx.beginPath();

    ctx.moveTo(
        x + 7,
        350
    );

    ctx.lineTo(
        x + 70,
        370
    );

    ctx.lineTo(
        x + 7,
        392
    );

    ctx.closePath();

    ctx.fill();
}

// ======================================================
// ستاره‌ها
// ======================================================

function drawBullets() {

    for (const b of bullets) {

        const x = b.x - camera;

        ctx.fillStyle = "#fff200";

        ctx.beginPath();

        ctx.arc(
            x,
            b.y,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#ffffff";

        ctx.beginPath();

        ctx.arc(
            x - 3,
            b.y - 3,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

// ======================================================
// ذرات
// ======================================================

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

function sparkle(x, y) {

    for (let i = 0; i < 15; i++) {

        particles.push({

            x: x,
            y: y,

            vx:
                (Math.random() - 0.5) * 7,

            vy:
                (Math.random() - 0.5) * 7,

            life: 30
        });
    }
}

// ======================================================
// اطلاعات مرحله
// ======================================================

function drawStageInfo() {

    ctx.fillStyle =
        "rgba(0,0,0,0.55)";

    ctx.fillRect(
        15,
        15,
        280,
        65
    );

    ctx.fillStyle = "white";

    ctx.textAlign = "right";

    ctx.font = "bold 18px Arial";

    ctx.fillText(
        worlds[world].name,
        280,
        40
    );

    ctx.font = "15px Arial";

    ctx.fillText(
        "مرحله " + level + " از 10",
        280,
        63
    );
}

// ======================================================
// پایان بازی
// ======================================================

function drawEnding() {

    ctx.fillStyle = "#18254a";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    // ستاره‌ها
    for (let i = 0; i < 80; i++) {

        const x = (i * 113) % W;
        const y = (i * 67) % 300;

        ctx.fillStyle = "#fff";

        ctx.fillRect(
            x,
            y,
            3,
            3
        );
    }

    // زمین
    ctx.fillStyle = "#304d3b";

    ctx.fillRect(
        0,
        390,
        W,
        110
    );

    // قفس
    ctx.fillStyle = "#444";

    ctx.fillRect(
        560,
        230,
        180,
        160
    );

    // میله‌های قفس
    ctx.strokeStyle = "#bbb";

    ctx.lineWidth = 8;

    for (let x = 575; x < 740; x += 30) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            230
        );

        ctx.lineTo(
            x,
            390
        );

        ctx.stroke();
    }

    // پدر داخل قفس
    drawFather(
        650,
        300
    );

    // دختر
    drawEndingGirl(
        400,
        332
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "#fff";

    ctx.font = "bold 38px Arial";

    ctx.fillText(
        "🏆 پدر آزاد شد!",
        450,
        80
    );

    ctx.font = "22px Arial";

    ctx.fillText(
        "الینا توانست تمام ۴۰ مرحله را پشت سر بگذارد ❤️",
        450,
        120
    );

    ctx.font = "20px Arial";

    ctx.fillText(
        "✨ مأموریت با موفقیت تمام شد ✨",
        450,
        450
    );
}

// ======================================================
// پدر
// ======================================================

function drawFather(x, y) {

    // سر
    ctx.fillStyle = "#d8a27c";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 45,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // مو
    ctx.fillStyle = "#4a2a18";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 58,
        24,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();

    // بدن
    ctx.fillStyle = "#3767a8";

    ctx.fillRect(
        x - 28,
        y - 20,
        56,
        65
    );

    // پا
    ctx.fillStyle = "#252b38";

    ctx.fillRect(
        x - 20,
        y + 45,
        15,
        35
    );

    ctx.fillRect(
        x + 5,
        y + 45,
        15,
        35
    );
}

// ======================================================
// دختر در پایان
// ======================================================

function drawEndingGirl(x, y) {

    ctx.fillStyle = "#4b2412";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 50,
        28,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#ffd0a8";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 43,
        21,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#ff4f81";

    ctx.fillRect(
        x - 25,
        y - 20,
        50,
        70
    );

    ctx.fillStyle = "#273746";

    ctx.fillRect(
        x - 20,
        y + 50,
        15,
        40
    );

    ctx.fillRect(
        x + 5,
        y + 50,
        15,
        40
    );
}

// ======================================================
// رابط کاربری
// ======================================================

function updateUI() {

    setText("score", score);
    setText("coins", coins);
    setText("lives", lives);
    setText("ammo", ammo);
    setText("shield", shield);

    setText(
        "worldName",
        worlds[world].name
    );

    setText(
        "levelNumber",
        level
    );
}

function setText(id, value) {

    const el =
        document.getElementById(id);

    if (el) {
        el.textContent = value;
    }
}

// ======================================================
// پیام
// ======================================================

function showMessage(text) {

    const el =
        document.getElementById("message");

    if (el) {
        el.textContent = text;
    }
}

// ======================================================
// برخورد
// ======================================================

function collision(a, b) {

    return (

        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

// ======================================================
// فاصله
// ======================================================

function distance(
    x1,
    y1,
    x2,
    y2
) {

    return Math.sqrt(
        (x1 - x2) ** 2 +
        (y1 - y2) ** 2
    );
}

// ======================================================
// حلقه بازی
// ======================================================

function loop() {

    if (endingScene) {

        drawEnding();

        return;
    }

    if (!gameRunning) {

        draw();

        return;
    }

    update();

    draw();

    requestAnimationFrame(loop);
}

// ======================================================
// شروع اولیه
// ======================================================

loadLevel();

updateUI();

draw();
