const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = 900;
const H = 500;

let running = false;

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

let boss = null;
let flag = null;

const keys = {
    left: false,
    right: false
};

const player = {
    x: 100,
    y: 350,
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

const worlds = {
    1: {
        name: "🌲 جنگل",
        sky: "#78c86b",
        ground: "#70452b",
        top: "#3f9b4f"
    },

    2: {
        name: "❄️ سرزمین برفی",
        sky: "#a9e4ff",
        ground: "#cfdde2",
        top: "#ffffff"
    },

    3: {
        name: "🌊 دنیای آبی",
        sky: "#1594d0",
        ground: "#075b78",
        top: "#39c6df"
    },

    4: {
        name: "🔥 سرزمین آتش",
        sky: "#ed7049",
        ground: "#4d2020",
        top: "#a83b27"
    }
};


// =====================================================
// شروع بازی
// =====================================================

document.getElementById("startBtn").addEventListener("click", () => {

    score = 0;
    coins = 0;
    lives = 5;
    ammo = 30;
    shield = 3;

    world = 1;
    level = 1;

    running = true;

    resetPlayer();

    loadLevel();

    updateUI();

    showMessage("🌟 ماموریت نجات پدر شروع شد!");

    requestAnimationFrame(loop);
});


// =====================================================
// شروع هر مرحله از اول
// =====================================================

function resetPlayer() {

    // خیلی مهم:
    // بازیکن همیشه از ابتدای مرحله شروع می‌شود.

    player.x = 100;
    player.y = 330;

    player.vx = 0;
    player.vy = 0;

    player.direction = 1;

    player.ground = false;
    player.invincible = 0;

    camera = 0;
}


// =====================================================
// ساخت مرحله
// =====================================================

function loadLevel() {

    platforms = [];
    enemies = [];
    coinItems = [];
    ammoItems = [];
    heartItems = [];
    bullets = [];
    particles = [];

    boss = null;

    // طول هر مرحله
    levelWidth = 2700 + level * 70;

    // -------------------------------------------------
    // زمین اصلی
    // -------------------------------------------------

    platforms.push({
        x: 0,
        y: 450,
        w: levelWidth,
        h: 50
    });


    // -------------------------------------------------
    // سکوهای مسیر
    // -------------------------------------------------

    for (let i = 0; i < 22; i++) {

        platforms.push({
            x: 220 + i * 120,
            y: 300 + Math.sin(i * 1.3) * 55,
            w: 100,
            h: 20
        });
    }


    // -------------------------------------------------
    // سکه‌ها
    // -------------------------------------------------

    for (let i = 0; i < 35; i++) {

        coinItems.push({
            x: 180 + i * 75,
            y: 250 + Math.sin(i * 0.7) * 60,
            collected: false
        });
    }


    // -------------------------------------------------
    // جعبه‌های تیر
    // -------------------------------------------------

    for (let i = 0; i < 12; i++) {

        ammoItems.push({
            x: 350 + i * 220,
            y: 405,
            collected: false
        });
    }


    // -------------------------------------------------
    // سکوهای قلب
    // -------------------------------------------------

    for (let i = 0; i < 5; i++) {

        heartItems.push({
            x: 500 + i * 450,
            y: 250,
            collected: false
        });
    }


    // -------------------------------------------------
    // دشمن‌ها
    // -------------------------------------------------

    for (let i = 0; i < 14; i++) {

        let type;

        if (world === 1) {

            type = [
                "snail",
                "turtle",
                "cabbage"
            ][i % 3];

        } else if (world === 2) {

            type = [
                "penguin",
                "sheep",
                "snowball"
            ][i % 3];

        } else if (world === 3) {

            type = [
                "fish",
                "bubble"
            ][i % 2];

        } else {

            type = [
                "fire",
                "lava",
                "monster"
            ][i % 3];
        }


        enemies.push({

            x: 450 + i * 170,

            y: 406,

            w: 44,
            h: 44,

            type: type,

            alive: true,

            direction:
                i % 2 === 0 ? 1 : -1,

            speed:
                0.6 + Math.random() * 0.5
        });
    }


    // -------------------------------------------------
    // باس مرحله 10
    // -------------------------------------------------

    if (level === 10) {

        boss = {

            x: levelWidth - 500,

            y: 300,

            w: 140,
            h: 140,

            hp: 15,
            maxHp: 15,

            direction: -1,

            speed: 0.7
        };
    }


    // -------------------------------------------------
    // پرچم همیشه در آخر مرحله است
    // -------------------------------------------------

    flag = {

        x: levelWidth - 100,

        y: 350,

        active: level !== 10
    };


    // در مرحله 10:
    // اول باید باس شکست بخورد.

    if (level === 10) {
        flag.active = false;
    }


    resetPlayer();

    updateUI();
}


// =====================================================
// کنترل کیبورد
// =====================================================

document.addEventListener("keydown", e => {

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

    if (
        e.key.toLowerCase() === "z"
    ) {
        shoot();
    }
});


document.addEventListener("keyup", e => {

    if (e.key === "ArrowLeft") {
        keys.left = false;
    }

    if (e.key === "ArrowRight") {
        keys.right = false;
    }
});


// =====================================================
// دکمه‌های روی صفحه
// =====================================================

const leftBtn =
    document.getElementById("leftBtn");

const rightBtn =
    document.getElementById("rightBtn");

const jumpBtn =
    document.getElementById("jumpBtn");

const shootBtn =
    document.getElementById("shootBtn");


function buttonHold(button, start, end) {

    button.addEventListener(
        "touchstart",
        e => {

            e.preventDefault();

            start();
        }
    );

    button.addEventListener(
        "touchend",
        e => {

            e.preventDefault();

            end();
        }
    );

    button.addEventListener(
        "mousedown",
        start
    );

    button.addEventListener(
        "mouseup",
        end
    );

    button.addEventListener(
        "mouseleave",
        end
    );
}


buttonHold(
    leftBtn,
    () => keys.left = true,
    () => keys.left = false
);


buttonHold(
    rightBtn,
    () => keys.right = true,
    () => keys.right = false
);


jumpBtn.addEventListener(
    "click",
    jump
);


shootBtn.addEventListener(
    "click",
    shoot
);


// =====================================================
// پرش
// =====================================================

function jump() {

    if (!running) return;

    if (player.ground) {

        player.vy =
            -player.jumpPower;

        player.ground = false;
    }
}


// =====================================================
// تیراندازی
// =====================================================

function shoot() {

    if (!running) return;

    if (ammo <= 0) {

        showMessage(
            "🔫 تیر نداری! جعبه تیر پیدا کن."
        );

        return;
    }

    if (player.shootCooldown > 0) {
        return;
    }

    ammo--;

    bullets.push({

        x:
            player.x +
            player.w / 2,

        y:
            player.y + 25,

        w: 18,
        h: 7,

        vx:
            player.direction * 12
    });

    player.shootCooldown = 12;

    updateUI();
}


// =====================================================
// آپدیت بازی
// =====================================================

function update() {

    if (!running) return;


    // حرکت
    player.vx = 0;

    if (keys.left) {

        player.vx =
            -player.speed;

        player.direction = -1;
    }

    if (keys.right) {

        player.vx =
            player.speed;

        player.direction = 1;
    }


    player.x += player.vx;


    // جاذبه
    player.vy += 0.65;

    player.y += player.vy;

    player.ground = false;


    // برخورد با سکوها
    for (const p of platforms) {

        if (

            player.x < p.x + p.w &&

            player.x + player.w > p.x &&

            player.y + player.h <=
                p.y + 20 &&

            player.y + player.h +
                player.vy >= p.y

        ) {

            player.y =
                p.y - player.h;

            player.vy = 0;

            player.ground = true;
        }
    }


    // محدودیت چپ
    if (player.x < 0) {
        player.x = 0;
    }


    // محدودیت راست
    if (
        player.x >
        levelWidth - player.w
    ) {

        player.x =
            levelWidth - player.w;
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


    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }

    if (player.invincible > 0) {
        player.invincible--;
    }


    // دوربین
    camera =
        player.x - 330;

    if (camera < 0) {
        camera = 0;
    }

    if (
        camera >
        levelWidth - W
    ) {

        camera =
            levelWidth - W;
    }


    // بررسی پرچم
    checkFlag();
}


// =====================================================
// بررسی پرچم
// =====================================================

function checkFlag() {

    if (!flag) return;

    if (!flag.active) return;


    const touchingFlag =

        player.x + player.w >
            flag.x &&

        player.x <
            flag.x + 50 &&

        player.y + player.h >
            flag.y;


    if (touchingFlag) {

        finishLevel();
    }
}


// =====================================================
// تمام شدن مرحله
// =====================================================

function finishLevel() {

    running = false;

    showMessage(
        "🎉 مرحله " +
        level +
        " تمام شد!"
    );


    setTimeout(() => {

        level++;


        // -------------------------------------------------
        // رفتن از مرحله 10 به دنیای بعدی
        // -------------------------------------------------

        if (level > 10) {

            level = 1;

            world++;

            // تمام دنیاها تمام شده‌اند
            if (world > 4) {

                finishGame();

                return;
            }
        }


        // -------------------------------------------------
        // شروع مرحله جدید از ابتدا
        // -------------------------------------------------

        running = true;

        loadLevel();

        showMessage(

            worlds[world].name +
            " | مرحله " +
            level +
            " شروع شد!"

        );

        requestAnimationFrame(loop);

    }, 1200);
}


// =====================================================
// پایان کامل بازی
// =====================================================

function finishGame() {

    running = false;

    score += 10000;

    updateUI();

    showMessage(
        "🏆🎉 تبریک! پدر نجات پیدا کرد! ❤️"
    );

    document.getElementById(
        "startBtn"
    ).textContent =
        "🎮 بازی دوباره";
}


// =====================================================
// جمع کردن سکه
// =====================================================

function collectCoins() {

    for (const c of coinItems) {

        if (c.collected) continue;


        if (

            distance(

                player.x + player.w / 2,

                player.y + player.h / 2,

                c.x,

                c.y

            ) < 32

        ) {

            c.collected = true;

            coins++;

            score += 100;

            sparkle(
                c.x,
                c.y
            );

            updateUI();
        }
    }
}


// =====================================================
// جمع کردن تیر
// =====================================================

function collectAmmo() {

    for (const a of ammoItems) {

        if (a.collected) continue;


        if (

            player.x <
                a.x + 35 &&

            player.x +
                player.w >
                a.x &&

            player.y <
                a.y + 35 &&

            player.y +
                player.h >
                a.y

        ) {

            a.collected = true;

            ammo += 10;

            score += 50;

            showMessage(
                "🔫 ۱۰ تیر گرفتی!"
            );

            updateUI();
        }
    }
}


// =====================================================
// جمع کردن قلب
// =====================================================

function collectHearts() {

    for (const h of heartItems) {

        if (h.collected) continue;


        if (

            player.x <
                h.x + 45 &&

            player.x +
                player.w >
                h.x &&

            player.y <
                h.y + 45 &&

            player.y +
                player.h >
                h.y

        ) {

            h.collected = true;

            if (lives < 8) {
                lives++;
            }

            score += 200;

            showMessage(
                "❤️ یک جان اضافه گرفتی!"
            );

            sparkle(
                h.x,
                h.y
            );

            updateUI();
        }
    }
}


// =====================================================
// دشمن‌ها
// =====================================================

function updateEnemies() {

    for (const e of enemies) {

        if (!e.alive) continue;


        e.x +=
            e.direction *
            e.speed;


        if (e.x < 250) {
            e.direction = 1;
        }


        if (
            e.x >
            levelWidth - 200
        ) {
            e.direction = -1;
        }


        if (
            collision(player, e)
        ) {

            // پرش روی دشمن
            if (

                player.vy > 0 &&

                player.y +
                    player.h <
                    e.y + 25

            ) {

                e.alive = false;

                player.vy = -9;

                score += 200;

                sparkle(
                    e.x,
                    e.y
                );

                updateUI();

            } else {

                damagePlayer();
            }
        }
    }
}


// =====================================================
// گلوله‌ها
// =====================================================

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

                sparkle(
                    e.x,
                    e.y
                );

                updateUI();
            }
        }


        // برخورد تیر با باس
        if (
            boss &&
            collision(b, boss)
        ) {

            boss.hp--;

            b.x = -9999;

            score += 50;

            sparkle(
                boss.x +
                    boss.w / 2,

                boss.y +
                    boss.h / 2
            );

            updateUI();
        }
    }


    bullets =
        bullets.filter(
            b =>
                b.x >
                    camera - 200 &&

                b.x <
                    camera + W + 200
        );
}


// =====================================================
// باس
// =====================================================

function updateBoss() {

    if (!boss) return;


    boss.x +=
        boss.direction *
        boss.speed;


    if (
        boss.x <
        levelWidth - 700
    ) {
        boss.direction = 1;
    }


    if (
        boss.x >
        levelWidth - 220
    ) {
        boss.direction = -1;
    }


    if (
        collision(player, boss)
    ) {

        damagePlayer();
    }


    // باس شکست خورد
    if (boss.hp <= 0) {

        boss = null;

        score += 2000;

        sparkle(
            levelWidth - 450,
            350
        );


        // حالا پرچم مرحله 10 فعال می‌شود
        flag.active = true;


        showMessage(
            "👹 هیولا شکست خورد! حالا به 🚩 پرچم برو!"
        );

        updateUI();
    }
}


// =====================================================
// آسیب دیدن
// =====================================================

function damagePlayer() {

    if (
        player.invincible > 0
    ) {
        return;
    }


    player.invincible = 90;


    // اول سپر مصرف می‌شود
    if (shield > 0) {

        shield--;

        player.x -= 80;

        showMessage(
            "🛡️ سپر از تو محافظت کرد!"
        );

        updateUI();

        return;
    }


    loseLife();
}


// =====================================================
// کم شدن جان
// =====================================================

function loseLife() {

    lives--;

    updateUI();


    if (lives <= 0) {

        running = false;

        showMessage(
            "💥 بازی تمام شد! دوباره تلاش کن."
        );

        return;
    }


    // بازگشت به ابتدای همین مرحله
    resetPlayer();


    showMessage(
        "❤️ یک جان کم شد!"
    );
}


// =====================================================
// رسم بازی
// =====================================================

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


// =====================================================
// پس‌زمینه
// =====================================================

function drawBackground() {

    const wd =
        worlds[world];


    ctx.fillStyle =
        wd.sky;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    if (world === 1) {
        drawForest();
    }

    if (world === 2) {
        drawSnow();
    }

    if (world === 3) {
        drawWater();
    }

    if (world === 4) {
        drawFire();
    }
}


// =====================================================
// جنگل
// =====================================================

function drawForest() {

    for (
        let x = -100;
        x < W + 200;
        x += 130
    ) {

        const px =
            x -
            camera * 0.2;


        ctx.fillStyle =
            "#70452b";

        ctx.fillRect(
            px,
            260,
            25,
            190
        );


        ctx.fillStyle =
            "#31944b";


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


// =====================================================
// برف
// =====================================================

function drawSnow() {

    ctx.fillStyle =
        "rgba(255,255,255,0.9)";


    for (
        let i = 0;
        i < 100;
        i++
    ) {

        let x =
            (i * 137 -
                camera * 0.2) %
            W;


        if (x < 0) {
            x += W;
        }


        let y =
            (i * 67) %
            430;


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
}


// =====================================================
// آب
// =====================================================

function drawWater() {

    ctx.strokeStyle =
        "rgba(255,255,255,0.35)";

    ctx.lineWidth = 3;


    for (
        let y = 80;
        y < H;
        y += 70
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );


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


// =====================================================
// آتش
// =====================================================

function drawFire() {

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        let x =
            (i * 91 -
                camera * 0.15) %
            W;


        if (x < 0) {
            x += W;
        }


        let y =
            80 +
            (i * 43) %
            300;


        ctx.fillStyle =
            "rgba(255,190,0,0.35)";


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            17,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// =====================================================
// سکوها
// =====================================================

function drawPlatforms() {

    const wd =
        worlds[world];


    for (const p of platforms) {

        const x =
            p.x - camera;


        ctx.fillStyle =
            wd.ground;


        ctx.fillRect(
            x,
            p.y,
            p.w,
            p.h
        );


        ctx.fillStyle =
            wd.top;


        ctx.fillRect(
            x,
            p.y,
            p.w,
            8
        );
    }
}


// =====================================================
// شخصیت دختر
// =====================================================

function drawPlayer() {

    if (

        player.invincible > 0 &&

        Math.floor(
            player.invincible / 6
        ) % 2 === 0

    ) {
        return;
    }


    const x =
        player.x - camera;

    const y =
        player.y;


    // مو
    ctx.fillStyle =
        "#4b2412";


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
    ctx.fillStyle =
        "#ffd0a8";


    ctx.beginPath();

    ctx.arc(
        x + 19,
        y + 20,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // مو
    ctx.fillStyle =
        "#4b2412";

    ctx.fillRect(
        x + 4,
        y + 3,
        30,
        12
    );


    // چشم
    ctx.fillStyle =
        "#222";

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
    ctx.fillStyle =
        "#ff4f81";

    ctx.fillRect(
        x + 5,
        y + 35,
        29,
        23
    );


    // دست
    ctx.fillStyle =
        "#ffd0a8";

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
    ctx.fillStyle =
        "#273746";

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


// =====================================================
// سکه
// =====================================================

function drawCoins() {

    for (const c of coinItems) {

        if (c.collected) continue;


        const x =
            c.x - camera;


        ctx.fillStyle =
            "#ffd700";


        ctx.beginPath();

        ctx.arc(
            x,
            c.y,
            12,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle =
            "#b8860b";

        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.fillStyle =
            "#fff3a3";

        ctx.font =
            "bold 12px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "$",
            x,
            c.y + 4
        );
    }
}


// =====================================================
// تیر
// =====================================================

function drawAmmo() {

    for (const a of ammoItems) {

        if (a.collected) continue;


        const x =
            a.x - camera;


        ctx.fillStyle =
            "#704d32";

        ctx.fillRect(
            x,
            a.y,
            35,
            35
        );


        ctx.fillStyle =
            "#ffd700";

        ctx.font =
            "20px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "🔫",
            x + 17,
            a.y + 25
        );
    }
}


// =====================================================
// قلب
// =====================================================

function drawHearts() {

    for (const h of heartItems) {

        if (h.collected) continue;


        const x =
            h.x - camera;


        ctx.font =
            "34px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "❤️",
            x + 18,
            h.y + 30
        );


        // سکوی زیر قلب
        ctx.fillStyle =
            "#f4b942";

        ctx.fillRect(
            x - 18,
            h.y + 38,
            72,
            10
        );
    }
}


// =====================================================
// دشمن‌ها
// =====================================================

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


function drawEnemy(
    type,
    x,
    y
) {

    // حلزون
    if (type === "snail") {

        ctx.fillStyle =
            "#8e44ad";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 24,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#6c3483";

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

        ctx.fillStyle =
            "#267a45";

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


        ctx.fillStyle =
            "#4caf50";

        ctx.beginPath();

        ctx.arc(
            x + 43,
            y + 22,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

        return;
    }


    // کلم
    if (type === "cabbage") {

        ctx.fillStyle =
            "#27ae60";

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

        ctx.fillStyle =
            "#263238";

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


        ctx.fillStyle =
            "white";

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


        ctx.fillStyle =
            "#f39c12";

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

        ctx.fillStyle =
            "white";

        ctx.beginPath();

        ctx.arc(
            x + 21,
            y + 22,
            22,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#333";

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

        ctx.fillStyle =
            "white";

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


    // ماهی
    if (type === "fish") {

        ctx.fillStyle =
            "#ff7675";

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

        return;
    }


    // حباب
    if (type === "bubble") {

        ctx.strokeStyle =
            "white";

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

        ctx.fillStyle =
            "#ff3d00";

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

        return;
    }


    // گدازه
    if (type === "lava") {

        ctx.fillStyle =
            "#ff5722";

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
    ctx.fillStyle =
        "#6c5ce7";

    ctx.fillRect(
        x,
        y,
        44,
        43
    );

    ctx.fillStyle =
        "white";

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


// =====================================================
// باس بزرگ
// =====================================================

function drawBoss() {

    if (!boss) return;


    const x =
        boss.x - camera;

    const y =
        boss.y;


    ctx.fillStyle =
        world === 1
            ? "#7b241c"
            : world === 2
                ? "#34495e"
                : world === 3
                    ? "#145a86"
                    : "#641e16";


    ctx.beginPath();

    ctx.arc(
        x + 70,
        y + 70,
        65,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // چشم‌ها
    ctx.fillStyle =
        "white";

    ctx.fillRect(
        x + 35,
        y + 50,
        18,
        18
    );

    ctx.fillRect(
        x + 87,
        y + 50,
        18,
        18
    );


    ctx.fillStyle =
        "#111";

    ctx.fillRect(
        x + 40,
        y + 55,
        7,
        10
    );

    ctx.fillRect(
        x + 92,
        y + 55,
        7,
        10
    );


    // دهان
    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x + 35,
        y + 95,
        70,
        15
    );


    // نوار سلامتی
    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x,
        y - 25,
        140,
        15
    );


    ctx.fillStyle =
        "#e74c3c";

    ctx.fillRect(
        x,
        y - 25,
        140 *
        (boss.hp /
            boss.maxHp),
        15
    );
}


// =====================================================
// پرچم
// =====================================================

function drawFlag() {

    if (!flag) return;


    const x =
        flag.x - camera;


    // میله
    ctx.fillStyle =
        "#555";

    ctx.fillRect(
        x,
        350,
        7,
        100
    );


    // پرچم
    ctx.fillStyle =
        flag.active
            ? "#ff4757"
            : "#777";


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


// =====================================================
// ذرات
// =====================================================

function sparkle(
    x,
    y
) {

    for (
        let i = 0;
        i < 15;
        i++
    ) {

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


function updateParticles() {

    for (const p of particles) {

        p.x += p.vx;

        p.y += p.vy;

        p.vy += 0.15;

        p.life--;
    }


    particles =
        particles.filter(
            p => p.life > 0
        );
}


function drawParticles() {

    ctx.fillStyle =
        "#ffd700";


    for (const p of particles) {

        ctx.fillRect(
            p.x - camera,
            p.y,
            5,
            5
        );
    }
}


// =====================================================
// اطلاعات مرحله
// =====================================================

function drawStageInfo() {

    ctx.fillStyle =
        "rgba(0,0,0,0.55)";

    ctx.fillRect(
        15,
        15,
        250,
        55
    );


    ctx.fillStyle =
        "white";

    ctx.font =
        "bold 18px Arial";

    ctx.textAlign =
        "right";


    ctx.fillText(
        worlds[world].name,
        245,
        38
    );


    ctx.font =
        "15px Arial";


    ctx.fillText(
        "مرحله " +
        level +
        " از 10",
        245,
        60
    );
}


// =====================================================
// رابط کاربری
// =====================================================

function updateUI() {

    document.getElementById(
        "score"
    ).textContent = score;


    document.getElementById(
        "coins"
    ).textContent = coins;


    document.getElementById(
        "lives"
    ).textContent = lives;


    document.getElementById(
        "ammo"
    ).textContent = ammo;


    document.getElementById(
        "shield"
    ).textContent = shield;


    document.getElementById(
        "worldName"
    ).textContent =
        worlds[world].name;


    document.getElementById(
        "levelNumber"
    ).textContent =
        level;
}


// =====================================================
// پیام
// =====================================================

function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );

    message.textContent =
        text;
}


// =====================================================
// برخورد
// =====================================================

function collision(a, b) {

    return (

        a.x <
            b.x + b.w &&

        a.x + a.w >
            b.x &&

        a.y <
            b.y + b.h &&

        a.y + a.h >
            b.y
    );
}


// =====================================================
// فاصله
// =====================================================

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


// =====================================================
// حلقه اصلی
// =====================================================

function loop() {

    if (!running) {

        draw();

        return;
    }


    update();

    draw();


    requestAnimationFrame(
        loop
    );
}


// نمایش اولیه
loadLevel();

updateUI();

draw();

  
