// ======================================================
// 🎮 ماجراجویی الینا
// game.js
// ======================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;

// ======================================================
// وضعیت بازی
// ======================================================

let gameRunning = false;

let world = 0;
let level = 1;

let camera = 0;

let coins = 0;
let diamonds = 0;
let health = 3;
let shield = 0;
let ammo = 7;

let maxHealth = 3;

let unlockedLevel = 1;

let keys = {
    left: false,
    right: false
};

// ======================================================
// دنیاها
// ======================================================

const worlds = [
    {
        name: "جنگل",
        sky: "#7ed6ff",
        ground: "#6b4328",
        top: "#3e9b45",
        enemy: ["snail", "turtle", "cabbage"]
    },
    {
        name: "برفی",
        sky: "#bdeaff",
        ground: "#d8edf5",
        top: "#ffffff",
        enemy: ["penguin", "sheep", "snowball"]
    },
    {
        name: "آبی",
        sky: "#1676b8",
        ground: "#12527d",
        top: "#37bde8",
        enemy: ["fish", "bubble"]
    },
    {
        name: "آتشی",
        sky: "#6b1710",
        ground: "#3b1712",
        top: "#ff6a00",
        enemy: ["fire", "lava"]
    }
];

// ======================================================
// بازیکن
// ======================================================

const player = {
    x: 100,
    y: 300,

    w: 38,
    h: 70,

    vx: 0,
    vy: 0,

    speed: 4.5,
    jump: 12,

    grounded: false,

    invincible: 0
};

// ======================================================
// مرحله
// ======================================================

let levelWidth = 4200;

let platforms = [];
let coinItems = [];
let ammoItems = [];
let heartItems = [];
let enemies = [];
let bullets = [];

let flag = {
    x: levelWidth - 180,
    y: 300,
    w: 25,
    h: 120
};

let boss = null;

// ======================================================
// ساخت مرحله
// ======================================================

function createLevel() {

    platforms = [];
    coinItems = [];
    ammoItems = [];
    heartItems = [];
    enemies = [];
    bullets = [];

    boss = null;

    camera = 0;

    player.x = 100;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;

    levelWidth = 4200 + (level - 1) * 250;

    // زمین اصلی
    platforms.push({
        x: 0,
        y: H - 80,
        w: levelWidth,
        h: 80
    });

    // سکوهای مختلف
    for (let i = 0; i < 22; i++) {

        let x = 300 + i * 175;

        let heightVariation =
            Math.sin(i * 1.7) * 100;

        let y =
            H - 180 -
            heightVariation;

        if (y < 170) y = 170;

        platforms.push({
            x: x,
            y: y,
            w: 110 + (i % 3) * 30,
            h: 25
        });

        // سکه
        coinItems.push({
            x: x + 45,
            y: y - 35,
            collected: false
        });

        // بعضی سکوها قلب دارند
        if (i % 6 === 0) {

            heartItems.push({
                x: x + 35,
                y: y - 85,
                collected: false
            });
        }

        // مهمات
        if (i % 7 === 0) {

            ammoItems.push({
                x: x + 70,
                y: y - 70,
                collected: false
            });
        }

        // دشمن
        if (i > 1) {

            enemies.push({
                x: x + 20,
                y: y - 50,

                w: 45,
                h: 45,

                vx:
                    i % 2 === 0
                        ? 1
                        : -1,

                type:
                    worlds[world].enemy[
                        i %
                        worlds[world].enemy.length
                    ],

                alive: true,

                minX: x,
                maxX: x + 90
            });
        }
    }

    // پرش‌های بلند در مراحل بالاتر
    if (level >= 5) {

        for (let i = 0; i < 5; i++) {

            platforms.push({
                x: 700 + i * 600,
                y: 230 - (i % 2) * 70,
                w: 130,
                h: 25
            });
        }
    }

    // باس در مرحله 10 هر دنیا
    if (level === 10) {

        boss = {
            x: levelWidth - 600,
            y: H - 300,

            w: 150,
            h: 150,

            health: 15,

            vx: 1.5,

            alive: true
        };
    }

    flag.x = levelWidth - 180;
    flag.y = H - 200;
}

// ======================================================
// تغییر اندازه
// ======================================================

window.addEventListener("resize", () => {

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;
});

// ======================================================
// کنترل کیبورد
// ======================================================

document.addEventListener("keydown", e => {

    if (e.key === "ArrowLeft" || e.key === "a") {
        keys.left = true;
    }

    if (e.key === "ArrowRight" || e.key === "d") {
        keys.right = true;
    }

    if (
        e.key === "ArrowUp" ||
        e.key === "w" ||
        e.key === " "
    ) {
        jump();
    }

    if (e.key === "f") {
        shoot();
    }
});

document.addEventListener("keyup", e => {

    if (e.key === "ArrowLeft" || e.key === "a") {
        keys.left = false;
    }

    if (e.key === "ArrowRight" || e.key === "d") {
        keys.right = false;
    }
});

// ======================================================
// کنترل لمسی
// ======================================================

function holdButton(id, property) {

    const button = document.getElementById(id);

    if (!button) return;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[property] = true;
    });

    button.addEventListener("pointerup", e => {

        e.preventDefault();

        keys[property] = false;
    });

    button.addEventListener("pointercancel", () => {
        keys[property] = false;
    });

    button.addEventListener("pointerleave", () => {
        keys[property] = false;
    });
}

holdButton("left", "left");
holdButton("right", "right");

const jumpButton =
    document.getElementById("jump");

if (jumpButton) {

    jumpButton.addEventListener(
        "pointerdown",
        e => {
            e.preventDefault();
            jump();
        }
    );
}

const shootButton =
    document.getElementById("shoot");

if (shootButton) {

    shootButton.addEventListener(
        "pointerdown",
        e => {
            e.preventDefault();
            shoot();
        }
    );
}

// ======================================================
// پرش
// ======================================================

function jump() {

    if (!gameRunning) return;

    if (player.grounded) {

        player.vy = -player.jump;

        player.grounded = false;
    }
}

// ======================================================
// تیراندازی
// ======================================================

function shoot() {

    if (!gameRunning) return;

    if (ammo <= 0) {

        showMessage("🔫 تیر نداری!");

        return;
    }

    ammo--;

    bullets.push({

        x: player.x + player.w,

        y: player.y + 30,

        vx: 10,

        w: 16,

        h: 6
    });

    updateHUD();
}

// ======================================================
// آپدیت بازیکن
// ======================================================

function updatePlayer() {

    if (keys.left) {

        player.vx = -player.speed;

    } else if (keys.right) {

        player.vx = player.speed;

    } else {

        player.vx *= .8;
    }

    player.x += player.vx;

    player.vy += .55;

    player.y += player.vy;

    player.grounded = false;

    // برخورد با سکوها
    for (const p of platforms) {

        if (

            player.x + player.w > p.x &&
            player.x < p.x + p.w &&
            player.y + player.h >= p.y &&
            player.y + player.h <=
                p.y + p.h + 15 &&
            player.vy >= 0

        ) {

            player.y =
                p.y - player.h;

            player.vy = 0;

            player.grounded = true;
        }
    }

    // محدودیت چپ
    if (player.x < 0) {
        player.x = 0;
    }

    // سقوط
    if (player.y > H + 150) {

        loseLife();
    }

    // بی‌حسی بعد از ضربه
    if (player.invincible > 0) {
        player.invincible--;
    }
}

// ======================================================
// آپدیت دشمن
// ======================================================

function updateEnemies() {

    for (const e of enemies) {

        if (!e.alive) continue;

        e.x += e.vx;

        if (
            e.x < e.minX ||
            e.x > e.maxX
        ) {

            e.vx *= -1;
        }

        // برخورد با بازیکن
        if (

            player.x + player.w > e.x &&
            player.x < e.x + e.w &&
            player.y + player.h > e.y &&
            player.y < e.y + e.h

        ) {

            damagePlayer(e);
        }
    }
}

// ======================================================
// باس
// ======================================================

function updateBoss() {

    if (!boss || !boss.alive) return;

    boss.x += boss.vx;

    if (
        boss.x < levelWidth - 900 ||
        boss.x > levelWidth - 300
    ) {

        boss.vx *= -1;
    }

    if (

        player.x + player.w > boss.x &&
        player.x < boss.x + boss.w &&
        player.y + player.h > boss.y &&
        player.y < boss.y + boss.h

    ) {

        damagePlayer(boss);
    }
}

// ======================================================
// آسیب
// ======================================================

function damagePlayer(enemy) {

    if (player.invincible > 0) return;

    if (shield > 0) {

        shield--;

        player.invincible = 70;

        showMessage("🛡️ سپر از تو محافظت کرد!");

        updateHUD();

        return;
    }

    health--;

    player.invincible = 100;

    player.vy = -7;

    player.x -= 60;

    updateHUD();

    if (health <= 0) {

        gameOver();
    }
}

// ======================================================
// آیتم‌ها
// ======================================================

function updateItems() {

    // سکه
    for (const c of coinItems) {

        if (c.collected) continue;

        if (

            player.x + player.w > c.x - 15 &&
            player.x < c.x + 15 &&
            player.y + player.h > c.y - 15 &&
            player.y < c.y + 15

        ) {

            c.collected = true;

            coins++;

            // هر 60 سکه = یک الماس
            if (coins % 60 === 0) {

                diamonds++;

                showMessage(
                    "💎 یک الماس گرفتی!"
                );
            }

            updateHUD();
        }
    }

    // مهمات
    for (const a of ammoItems) {

        if (a.collected) continue;

        if (

            player.x + player.w > a.x &&
            player.x < a.x + 35 &&
            player.y + player.h > a.y &&
            player.y < a.y + 35

        ) {

            a.collected = true;

            ammo += 3;

            if (ammo > 7) {
                ammo = 7;
            }

            showMessage("🔫 تیر گرفتی!");

            updateHUD();
        }
    }

    // قلب
    for (const h of heartItems) {

        if (h.collected) continue;

        if (

            player.x + player.w > h.x &&
            player.x < h.x + 40 &&
            player.y + player.h > h.y &&
            player.y < h.y + 50

        ) {

            h.collected = true;

            health++;

            if (health > maxHealth) {
                health = maxHealth;
            }

            showMessage("❤️ جان گرفتی!");

            updateHUD();
        }
    }
}

// ======================================================
// گلوله‌ها
// ======================================================

function updateBullets() {

    for (const b of bullets) {

        b.x += b.vx;
    }

    bullets =
        bullets.filter(
            b => b.x < levelWidth + 500
        );

    // دشمن‌ها
    for (const b of bullets) {

        for (const e of enemies) {

            if (!e.alive) continue;

            if (

                b.x + b.w > e.x &&
                b.x < e.x + e.w &&
                b.y + b.h > e.y &&
                b.y < e.y + e.h

            ) {

                e.alive = false;

                b.x = levelWidth + 100;

                coins++;

                updateHUD();
            }
        }

        // باس
        if (
            boss &&
            boss.alive &&
            b.x + b.w > boss.x &&
            b.x < boss.x + boss.w &&
            b.y + b.h > boss.y &&
            b.y < boss.y + boss.h
        ) {

            boss.health--;

            b.x = levelWidth + 100;

            if (boss.health <= 0) {

                boss.alive = false;

                showMessage(
                    "🏆 هیولا شکست خورد!"
                );
            }
        }
    }
}

// ======================================================
// دوربین
// ======================================================

function updateCamera() {

    const target =
        player.x - W * .4;

    camera +=
        (target - camera) * .08;

    if (camera < 0) {
        camera = 0;
    }

    if (
        camera >
        levelWidth - W
    ) {

        camera =
            Math.max(
                0,
                levelWidth - W
            );
    }
}

// ======================================================
// پس‌زمینه
// ======================================================

function drawBackground() {

    const wd = worlds[world];

    ctx.fillStyle = wd.sky;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    // کوه‌ها
    ctx.fillStyle =
        world === 3
            ? "#35100d"
            : "rgba(30,80,100,.35)";

    for (let i = -2; i < 12; i++) {

        const x =
            i * 350 -
            camera * .25;

        ctx.beginPath();

        ctx.moveTo(
            x,
            H - 80
        );

        ctx.lineTo(
            x + 170,
            H - 330
        );

        ctx.lineTo(
            x + 350,
            H - 80
        );

        ctx.closePath();

        ctx.fill();
    }

    // برف
    if (world === 1) {

        ctx.fillStyle =
            "rgba(255,255,255,.8)";

        for (let i = 0; i < 80; i++) {

            let x =
                (i * 137 -
                    camera * .15) %
                W;

            if (x < 0) x += W;

            let y =
                (i * 67) %
                (H - 100);

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

    // آب
    if (world === 2) {

        ctx.strokeStyle =
            "rgba(255,255,255,.3)";

        ctx.lineWidth = 3;

        for (
            let y = 100;
            y < H;
            y += 65
        ) {

            ctx.beginPath();

            ctx.moveTo(0, y);

            ctx.quadraticCurveTo(
                W / 2,
                y - 25,
                W,
                y
            );

            ctx.stroke();
        }
    }

    // آتش
    if (world === 3) {

        for (let i = 0; i < 25; i++) {

            let x =
                (i * 111 -
                    camera * .1) %
                W;

            if (x < 0) x += W;

            let y =
                80 +
                (i * 47) % 300;

            ctx.fillStyle =
                "rgba(255,150,0,.25)";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                15,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}

// ======================================================
// سکوها
// ======================================================

function drawPlatforms() {

    const wd = worlds[world];

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

// ======================================================
// بازیکن
// ======================================================

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
    ctx.fillStyle = "#4a2515";

    ctx.beginPath();

    ctx.arc(
        x + 19,
        y + 17,
        21,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // صورت
    ctx.fillStyle = "#ffd0a8";

    ctx.beginPath();

    ctx.arc(
        x + 19,
        y + 21,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // مو
    ctx.fillStyle = "#4a2515";

    ctx.fillRect(
        x + 4,
        y + 2,
        30,
        12
    );

    // چشم
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 11,
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
    ctx.fillStyle = "#ef4f80";

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
        y + 57,
        9,
        15
    );

    ctx.fillRect(
        x + 23,
        y + 57,
        9,
        15
    );

    // سپر
    if (shield > 0) {

        ctx.strokeStyle =
            "rgba(0,200,255,.75)";

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.arc(
            x + 19,
            y + 35,
            40,
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

// ======================================================
// مهمات
// ======================================================

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

// ======================================================
// قلب
// ======================================================

function drawHearts() {

    for (const h of heartItems) {

        if (h.collected) continue;

        const x =
            h.x - camera;

        ctx.font =
            "32px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "❤️",
            x + 18,
            h.y + 30
        );

        // سکوی کوچک زیر قلب
        ctx.fillStyle =
            "#e4a82f";

        ctx.fillRect(
            x - 18,
            h.y + 38,
            72,
            9
        );
    }
}

// ======================================================
// دشمن‌ها
// ======================================================

function drawEnemies() {

    for (const e of enemies) {

        if (!e.alive) continue;

        const x =
            e.x - camera;

        const y =
            e.y;

        drawEnemy(
            e.type,
            x,
            y
        );
    }
}

function drawEnemy(type, x, y) {

    // حلزون
    if (type === "snail") {

        ctx.fillStyle =
            "#9b59b6";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 25,
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
            y + 25,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#4aa3df";

        ctx.fillRect(
            x + 35,
            y + 5,
            4,
            18
        );

        ctx.fillRect(
            x + 44,
            y + 5,
            4,
            18
        );

        return;
    }

    // لاک‌پشت
    if (type === "turtle") {

        ctx.fillStyle =
            "#277a45";

        ctx.beginPath();

        ctx.ellipse(
            x + 22,
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

        ctx.fillStyle =
            "#111";

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

        ctx.fillStyle =
            "#2ecc71";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 22,
            22,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle =
            "#176b3a";

        ctx.lineWidth = 3;

        ctx.stroke();

        return;
    }

    // پنگوئن
    if (type === "penguin") {

        ctx.fillStyle =
            "#263238";

        ctx.beginPath();

        ctx.ellipse(
            x + 22,
            y + 25,
            20,
            27,
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
            y + 30,
            12,
            18,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#f39c12";

        ctx.fillRect(
            x + 16,
            y + 24,
            13,
            7
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
            x + 42,
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

        ctx.strokeStyle =
            "#8bd8ff";

        ctx.lineWidth = 3;

        ctx.stroke();

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

        ctx.fillStyle =
            "#ff5252";

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

        ctx.fillStyle =
            "#ffd600";

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
}

// ======================================================
// باس
// ======================================================

function drawBoss() {

    if (!boss || !boss.alive) return;

    const x =
        boss.x - camera;

    const y =
        boss.y;

    // بدن
    ctx.fillStyle =
        world === 3
            ? "#8e2409"
            : "#56368c";

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        boss.w,
        boss.h,
        30
    );

    ctx.fill();

    // چشم‌ها
    ctx.fillStyle =
        "white";

    ctx.fillRect(
        x + 25,
        y + 30,
        30,
        30
    );

    ctx.fillRect(
        x + 95,
        y + 30,
        30,
        30
    );

    ctx.fillStyle =
        "#111";

    ctx.beginPath();

    ctx.arc(
        x + 40,
        y + 45,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        x + 110,
        y + 45,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // دهان
    ctx.fillStyle =
        "#111";

    ctx.fillRect(
        x + 40,
        y + 95,
        70,
        18
    );

    // نوار سلامتی
    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x,
        y - 25,
        boss.w,
        12
    );

    ctx.fillStyle =
        "#e74c3c";

    ctx.fillRect(
        x,
        y - 25,
        boss.w *
            (boss.health / 15),
        12
    );
}

// ======================================================
// پرچم
// ======================================================

function drawFlag() {

    const x =
        flag.x - camera;

    ctx.fillStyle =
        "#5b3a29";

    ctx.fillRect(
        x,
        flag.y,
        8,
        120
    );

    ctx.fillStyle =
        "#ff4757";

    ctx.beginPath();

    ctx.moveTo(
        x + 8,
        flag.y
    );

    ctx.lineTo(
        x + 75,
        flag.y + 25
    );

    ctx.lineTo(
        x + 8,
        flag.y + 50
    );

    ctx.closePath();

    ctx.fill();
}

// ======================================================
// گلوله‌ها
// ======================================================

function drawBullets() {

    for (const b of bullets) {

        ctx.fillStyle =
            "#ffe066";

        ctx.fillRect(
            b.x - camera,
            b.y,
            b.w,
            b.h
        );
    }
}

// ======================================================
// رسم کل بازی
// ======================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    drawBackground();

    drawPlatforms();

    drawCoins();

    drawAmmo();

    drawHearts();

    drawEnemies();

    drawBoss();

    drawFlag();

    drawBullets();

    drawPlayer();
}

// ======================================================
// پایان مرحله
// ======================================================

function finishLevel() {

    gameRunning = false;

    // مرحله بعد باز شود
    const globalLevel =
        world * 10 + level;

    if (
        globalLevel >= unlockedLevel
    ) {

        unlockedLevel =
            Math.min(
                40,
                globalLevel + 1
            );
    }

    updateHUD();

    showScreen("finish");

    const finishCoins =
        document.getElementById(
            "finishCoins"
        );

    const finishDiamonds =
        document.getElementById(
            "finishDiamonds"
        );

    if (finishCoins) {
        finishCoins.textContent =
            coins;
    }

    if (finishDiamonds) {
        finishDiamonds.textContent =
            diamonds;
    }
}

// ======================================================
// مرحله بعد
// ======================================================

function nextLevel() {

    if (level < 10) {

        level++;

    } else {

        if (world < 3) {

            world++;

            level = 1;

        } else {

            showStoryEnd();

            return;
        }
    }

    hideAllScreens();

    createLevel();

    gameRunning = true;

    updateHUD();
}

// ======================================================
// بازی از مرحله انتخاب‌شده
// ======================================================

function startLevel(selectedLevel) {

    const globalLevel =
        world * 10 + selectedLevel;

    if (
        globalLevel > unlockedLevel
    ) {

        showMessage(
            "🔒 این مرحله هنوز باز نشده!"
        );

        return;
    }

    level = selectedLevel;

    hideAllScreens();

    createLevel();

    gameRunning = true;

    health = 3;
    shield = 0;
    ammo = 7;

    updateHUD();
}

// ======================================================
// باخت
// ======================================================

function gameOver() {

    gameRunning = false;

    showScreen("gameover");
}

// ======================================================
// منوی اصلی
// ======================================================

function showMenu() {

    gameRunning = false;

    hideAllScreens();

    const menu =
        document.getElementById("menu");

    if (menu) {
        menu.classList.remove("hidden");
    }
}

// ======================================================
// پایان داستان
// ======================================================

function showStoryEnd() {

    gameRunning = false;

    hideAllScreens();

    const screen =
        document.getElementById(
            "storyEnd"
        );

    if (screen) {
        screen.classList.remove("hidden");
    }
}

// ======================================================
// نمایش صفحه
// ======================================================

function showScreen(id) {

    hideAllScreens();

    const element =
        document.getElementById(id);

    if (element) {

        element.classList.remove(
            "hidden"
        );
    }
}

// ======================================================
// مخفی کردن صفحات
// ======================================================

function hideAllScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add(
                "hidden"
            );
        });

    const hud =
        document.getElementById("hud");

    const controls =
        document.getElementById(
            "controls"
        );

    if (gameRunning) {

        if (hud) {
            hud.classList.remove(
                "hidden"
            );
        }

        if (controls) {
            controls.classList.remove(
                "hidden"
            );
        }

    } else {

        if (hud) {
            hud.classList.add(
                "hidden"
            );
        }

        if (controls) {
            controls.classList.add(
                "hidden"
            );
        }
    }
}

// ======================================================
// HUD
// ======================================================

function updateHUD() {

    setText(
        "health",
        health
    );

    setText(
        "shield",
        shield
    );

    setText(
        "coins",
        coins
    );

    setText(
        "diamonds",
        diamonds
    );

    setText(
        "ammo",
        ammo
    );

    setText(
        "currentLevel",
        world * 10 + level
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

let messageTimer = null;

function showMessage(text) {

    const msg =
        document.getElementById(
            "message"
        );

    if (!msg) return;

    msg.textContent = text;

    msg.style.opacity = "1";

    clearTimeout(messageTimer);

    messageTimer =
        setTimeout(() => {

            msg.style.opacity =
                "0";

        }, 1800);
}

// ======================================================
// ساخت نقشه مراحل
// ======================================================

function buildLevelMap() {

    const grid =
        document.getElementById(
            "levelGrid"
        );

    if (!grid) return;

    grid.innerHTML = "";

    for (let i = 1; i <= 10; i++) {

        const button =
            document.createElement(
                "button"
            );

        const global =
            world * 10 + i;

        button.className =
            "levelBtn";

        if (
            global > unlockedLevel
        ) {

            button.classList.add(
                "locked"
            );

            button.textContent =
                "🔒 مرحله " + i;

        } else {

            button.textContent =
                "🎮 مرحله " + i;

            button.addEventListener(
                "click",
                () => startLevel(i)
            );
        }

        grid.appendChild(button);
    }
}

// ======================================================
// تب دنیاها
// ======================================================

document
    .querySelectorAll(".tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                world =
                    Number(
                        tab.dataset.world
                    );

                buildLevelMap();
            }
        );
    });

// ======================================================
// دکمه‌ها
// ======================================================

const startBtn =
    document.getElementById(
        "startBtn"
    );

if (startBtn) {

    startBtn.addEventListener(
        "click",
        () => startLevel(1)
    );
}

const levelsBtn =
    document.getElementById(
        "levelsBtn"
    );

if (levelsBtn) {

    levelsBtn.addEventListener(
        "click",
        () => {

            buildLevelMap();

            showScreen("levels");
        }
    );
}

const charactersBtn =
    document.getElementById(
        "charactersBtn"
    );

if (charactersBtn) {

    charactersBtn.addEventListener(
        "click",
        () => showScreen(
            "characters"
        )
    );
}

const levelsBackBtn =
    document.getElementById(
        "levelsBackBtn"
    );

if (levelsBackBtn) {

    levelsBackBtn.addEventListener(
        "click",
        showMenu
    );
}

const charactersBackBtn =
    document.getElementById(
        "charactersBackBtn"
    );

if (charactersBackBtn) {

    charactersBackBtn.addEventListener(
        "click",
        showMenu
    );
}

const nextLevelBtn =
    document.getElementById(
        "nextLevelBtn"
    );

if (nextLevelBtn) {

    nextLevelBtn.addEventListener(
        "click",
        nextLevel
    );
}

const finishLevelsBtn =
    document.getElementById(
        "finishLevelsBtn"
    );

if (finishLevelsBtn) {

    finishLevelsBtn.addEventListener(
        "click",
        () => {

            buildLevelMap();

            showScreen("levels");
        }
    );
}

const retryBtn =
    document.getElementById(
        "retryBtn"
    );

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        () => {

            health = 3;
            shield = 0;
            ammo = 7;

            createLevel();

            gameRunning = true;

            updateHUD();
        }
    );
}

const gameoverLevelsBtn =
    document.getElementById(
        "gameoverLevelsBtn"
    );

if (gameoverLevelsBtn) {

    gameoverLevelsBtn.addEventListener(
        "click",
        () => {

            buildLevelMap();

            showScreen("levels");
        }
    );
}

const gameoverMenuBtn =
    document.getElementById(
        "gameoverMenuBtn"
    );

if (gameoverMenuBtn) {

    gameoverMenuBtn.addEventListener(
        "click",
        showMenu
    );
}

const storyMenuBtn =
    document.getElementById(
        "storyMenuBtn"
    );

if (storyMenuBtn) {

    storyMenuBtn.addEventListener(
        "click",
        showMenu
    );
}

// ======================================================
// حلقه بازی
// ======================================================

function gameLoop() {

    if (gameRunning) {

        updatePlayer();

        updateEnemies();

        updateBoss();

        updateItems();

        updateBullets();

        updateCamera();

        // رسیدن به پرچم
        if (

            player.x + player.w >
                flag.x &&
            player.x <
                flag.x + flag.w &&
            Math.abs(
                player.y -
                flag.y
            ) < 180

        ) {

            if (
                level === 10 &&
                boss &&
                boss.alive
            ) {

                showMessage(
                    "👹 اول هیولا را شکست بده!"
                );

            } else {

                finishLevel();
            }
        }
    }

    draw();

    requestAnimationFrame(
        gameLoop
    );
}

// ======================================================
// شروع اولیه
// ======================================================

health = 3;
shield = 0;
ammo = 7;

buildLevelMap();

createLevel();

updateHUD();

showMenu();

gameLoop();

  
