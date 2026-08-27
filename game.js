const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const livesText = document.getElementById("lives");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");

let gameRunning = false;

let score = 0;
let coins = 0;
let lives = 3;

let world = 1;
let level = 1;

let cameraX = 0;
let levelWidth = 3000;

const keys = {
    left: false,
    right: false
};

let bullets = [];
let enemies = [];
let coinsList = [];
let platforms = [];
let particles = [];

let boss = null;
let bossActive = false;

const worlds = {
    1: {
        name: "جنگل",
        sky: "#74d680",
        ground: "#6b4423",
        platform: "#8b5a2b",
        enemy1: "snail",
        enemy2: "turtle",
        enemy3: "cabbage"
    },

    2: {
        name: "سرزمین برفی",
        sky: "#bfe9ff",
        ground: "#e9f7ff",
        platform: "#ffffff",
        enemy1: "penguin",
        enemy2: "sheep",
        enemy3: "snowball"
    },

    3: {
        name: "دنیای آبی",
        sky: "#1597d4",
        ground: "#116b8d",
        platform: "#3bc5d9",
        enemy1: "fish",
        enemy2: "fish2",
        enemy3: "bubble"
    },

    4: {
        name: "سرزمین آتش",
        sky: "#ef704d",
        ground: "#4b2020",
        platform: "#7d3025",
        enemy1: "fire",
        enemy2: "monster",
        enemy3: "lava"
    }
};

const player = {
    x: 100,
    y: 300,
    width: 38,
    height: 55,

    vx: 0,
    vy: 0,

    speed: 5,
    jumpPower: 13,

    onGround: false,
    facing: 1,

    shootCooldown: 0
};

const gravity = 0.65;


// ==========================
// شروع بازی
// ==========================

startBtn.addEventListener("click", startGame);

function startGame() {

    score = 0;
    coins = 0;
    lives = 3;

    world = 1;
    level = 1;

    cameraX = 0;

    player.x = 100;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;

    gameRunning = true;

    startBtn.textContent = "🔄 شروع دوباره";

    loadLevel();

    updateInfo();

    message.textContent =
        "🌲 ماجراجویی شروع شد! پدرت را نجات بده!";

    gameLoop();
}


// ==========================
// ساخت مرحله
// ==========================

function loadLevel() {

    platforms = [];
    enemies = [];
    coinsList = [];
    bullets = [];
    particles = [];

    boss = null;
    bossActive = false;

    cameraX = 0;

    player.x = 100;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;

    levelWidth = 3000 + level * 100;

    // زمین اصلی
    platforms.push({
        x: 0,
        y: 450,
        width: levelWidth,
        height: 50
    });

    // سکوها
    for (let i = 0; i < 18; i++) {

        let x = 250 + i * 155;

        let y =
            300 +
            Math.sin(i * 1.7) * 70;

        platforms.push({
            x: x,
            y: y,
            width: 110,
            height: 20
        });
    }

    // سکه‌ها
    for (let i = 0; i < 35; i++) {

        let x = 180 + i * 80;

        let y =
            240 +
            Math.sin(i * 0.8) * 100;

        coinsList.push({
            x: x,
            y: y,
            collected: false
        });
    }

    // دشمن‌ها
    for (let i = 0; i < 12; i++) {

        let type;

        if (i % 3 === 0) {
            type = worlds[world].enemy1;
        } else if (i % 3 === 1) {
            type = worlds[world].enemy2;
        } else {
            type = worlds[world].enemy3;
        }

        enemies.push({
            x: 400 + i * 210,
            y: 400,
            width: 42,
            height: 42,
            speed: 1 + Math.random() * 1.5,
            direction: i % 2 === 0 ? 1 : -1,
            type: type,
            alive: true
        });
    }

    // مرحله دهم = باس
    if (level === 10) {

        bossActive = true;

        boss = {
            x: levelWidth - 500,
            y: 330,
            width: 120,
            height: 120,

            hp: 25,
            maxHp: 25,

            vx: -1.5,
            vy: 0,

            attackTimer: 0
        };
    }
}


// ==========================
// کنترل کیبورد
// ==========================

document.addEventListener("keydown", function(e) {

    if (e.key === "ArrowLeft") {
        keys.left = true;
    }

    if (e.key === "ArrowRight") {
        keys.right = true;
    }

    if (e.code === "Space" || e.key === "ArrowUp") {

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


// ==========================
// کنترل موبایل
// ==========================

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");

leftBtn.addEventListener("touchstart", () => {
    keys.left = true;
});

leftBtn.addEventListener("touchend", () => {
    keys.left = false;
});

rightBtn.addEventListener("touchstart", () => {
    keys.right = true;
});

rightBtn.addEventListener("touchend", () => {
    keys.right = false;
});

jumpBtn.addEventListener("touchstart", () => {
    jump();
});


// شلیک با کلیک روی دکمه پرش دوگانه نیست؛
// برای موبایل می‌توانیم با لمس طولانی صفحه شلیک کنیم.
canvas.addEventListener("touchstart", function() {
    shoot();
});


// ==========================
// پرش
// ==========================

function jump() {

    if (!gameRunning) return;

    if (player.onGround) {

        player.vy = -player.jumpPower;

        player.onGround = false;
    }
}


// ==========================
// شلیک
// ==========================

function shoot() {

    if (!gameRunning) return;

    if (player.shootCooldown > 0) return;

    bullets.push({

        x: player.x + player.width / 2,

        y: player.y + 25,

        width: 14,
        height: 6,

        speed: 10 * player.facing
    });

    player.shootCooldown = 18;
}


// ==========================
// آپدیت بازی
// ==========================

function update() {

    if (!gameRunning) return;

    // حرکت
    player.vx = 0;

    if (keys.left) {

        player.vx = -player.speed;
        player.facing = -1;
    }

    if (keys.right) {

        player.vx = player.speed;
        player.facing = 1;
    }

    player.x += player.vx;

    // گرانش
    player.vy += gravity;
    player.y += player.vy;

    player.onGround = false;

    // برخورد با سکو
    platforms.forEach(platform => {

        if (

            player.x < platform.x + platform.width &&

            player.x + player.width > platform.x &&

            player.y + player.height <= platform.y + 15 &&

            player.y + player.height + player.vy >= platform.y

        ) {

            player.y =
                platform.y - player.height;

            player.vy = 0;

            player.onGround = true;
        }
    });

    // محدودیت
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x > levelWidth - player.width) {
        player.x = levelWidth - player.width;
    }

    // سقوط
    if (player.y > canvas.height + 100) {

        loseLife();

        return;
    }

    // سکه
    collectCoins();

    // دشمن‌ها
    updateEnemies();

    // گلوله‌ها
    updateBullets();

    // باس
    if (bossActive) {
        updateBoss();
    }

    // دوربین
    cameraX =
        player.x - canvas.width / 2;

    if (cameraX < 0) {
        cameraX = 0;
    }

    if (cameraX > levelWidth - canvas.width) {
        cameraX = levelWidth - canvas.width;
    }

    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }

    updateParticles();

    // رسیدن به انتهای مرحله
    if (
        player.x >
        levelWidth - 150 &&
        !bossActive
    ) {

        nextLevel();
    }

    // باس شکست خورد
    if (
        bossActive &&
        boss &&
        boss.hp <= 0
    ) {

        bossActive = false;

        score += 2000;

        nextLevel();
    }
}


// ==========================
// سکه
// ==========================

function collectCoins() {

    coinsList.forEach(coin => {

        if (coin.collected) return;

        let dx =
            player.x +
            player.width / 2 -
            coin.x;

        let dy =
            player.y +
            player.height / 2 -
            coin.y;

        let distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance < 35) {

            coin.collected = true;

            coins++;

            score += 100;

            createParticles(
                coin.x,
                coin.y,
                8
            );

            updateInfo();
        }
    });
}


// ==========================
// دشمن‌ها
// ==========================

function updateEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        enemy.x +=
            enemy.speed *
            enemy.direction;

        if (
            enemy.x < 250 ||
            enemy.x > levelWidth - 250
        ) {

            enemy.direction *= -1;
        }

        // برخورد با بازیکن
        if (collision(player, enemy)) {

            // پرش روی دشمن
            if (
                player.vy > 0 &&
                player.y + player.height <
                enemy.y + 20
            ) {

                enemy.alive = false;

                player.vy = -9;

                score += 250;

                createParticles(
                    enemy.x,
                    enemy.y,
                    15
                );

                updateInfo();

            } else {

                loseLife();
            }
        }
    });
}


// ==========================
// گلوله‌ها
// ==========================

function updateBullets() {

    bullets.forEach(bullet => {

        bullet.x += bullet.speed;

        // برخورد با دشمن
        enemies.forEach(enemy => {

            if (
                enemy.alive &&
                collision(bullet, enemy)
            ) {

                enemy.alive = false;

                bullet.x = -999;

                score += 300;

                createParticles(
                    enemy.x,
                    enemy.y,
                    12
                );

                updateInfo();
            }
        });

        // برخورد با باس
        if (
            bossActive &&
            boss &&
            collision(bullet, boss)
        ) {

            boss.hp--;

            bullet.x = -999;

            score += 50;

            createParticles(
                bullet.x,
                bullet.y,
                5
            );
        }
    });

    bullets =
        bullets.filter(
            bullet =>
                bullet.x > cameraX - 100 &&
                bullet.x < cameraX + canvas.width + 200
        );
}


// ==========================
// باس
// ==========================

function updateBoss() {

    if (!boss) return;

    boss.attackTimer++;

    boss.x += boss.vx;

    if (
        boss.x <
        levelWidth - 700
    ) {

        boss.vx = 1.5;
    }

    if (
        boss.x >
        levelWidth - 300
    ) {

        boss.vx = -1.5;
    }

    if (
        collision(player, boss)
    ) {

        loseLife();
    }
}


// ==========================
// مرحله بعد
// ==========================

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

    message.textContent =
        "🌟 دنیای " +
        world +
        " - مرحله " +
        level +
        " : " +
        worlds[world].name;

    loadLevel();
}


// ==========================
// پایان کل بازی
// ==========================

function finishGame() {

    gameRunning = false;

    score += 10000;

    updateInfo();

    message.textContent =
        "🏆 تبریک! پدر دختر نجات پیدا کرد! ❤️";

    startBtn.textContent =
        "🎮 بازی دوباره";

    createVictoryEffect();
}


// ==========================
// از دست دادن جان
// ==========================

function loseLife() {

    lives--;

    updateInfo();

    if (lives <= 0) {

        gameRunning = false;

        message.textContent =
            "💥 بازی تمام شد! دوباره تلاش کن.";

        return;
    }

    player.x =
        Math.max(
            100,
            player.x - 250
        );

    player.y = 250;

    player.vx = 0;
    player.vy = 0;

    message.textContent =
        "❤️ یک جان از دست رفت!";
}


// ==========================
// برخورد
// ==========================

function collision(a, b) {

    return (

        a.x <
        b.x + b.width &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.height &&

        a.y + a.height >
        b.y
    );
}


// ==========================
// اطلاعات
// ==========================

function updateInfo() {

    scoreText.textContent = score;
    coinsText.textContent = coins;
    livesText.textContent = lives;
}


// ==========================
// ذرات
// ==========================

function createParticles(x, y, amount) {

    for (let i = 0; i < amount; i++) {

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

    particles.forEach(p => {

        p.x += p.vx;
        p.y += p.vy;

        p.vy += 0.2;

        p.life--;
    });

    particles =
        particles.filter(
            p => p.life > 0
        );
}


// ==========================
// پس‌زمینه
// ==========================

function drawBackground() {

    let currentWorld =
        worlds[world];

    ctx.fillStyle =
        currentWorld.sky;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (world === 1) {
        drawForestBackground();
    }

    if (world === 2) {
        drawSnowBackground();
    }

    if (world === 3) {
        drawWaterBackground();
    }

    if (world === 4) {
        drawFireBackground();
    }
}


// ==========================
// جنگل
// ==========================

function drawForestBackground() {

    ctx.fillStyle = "#2e8b57";

    for (let x = -100; x < canvas.width + 200; x += 130) {

        let treeX =
            x - cameraX * 0.2;

        ctx.fillRect(
            treeX,
            260,
            25,
            190
        );

        ctx.beginPath();

        ctx.arc(
            treeX + 12,
            240,
            65,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// ==========================
// برف
// ==========================

function drawSnowBackground() {

    ctx.fillStyle = "white";

    for (let i = 0; i < 80; i++) {

        let x =
            (i * 137 -
            cameraX * 0.3) %
            canvas.width;

        if (x < 0) x += canvas.width;

        let y =
            (i * 71) %
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

    ctx.fillStyle = "#dff7ff";

    ctx.beginPath();

    ctx.moveTo(0, 330);

    for (
        let x = 0;
        x <= canvas.width;
        x += 80
    ) {

        ctx.lineTo(
            x,
            270 +
            Math.sin(x / 70) * 40
        );
    }

    ctx.lineTo(
        canvas.width,
        450
    );

    ctx.lineTo(0, 450);

    ctx.closePath();

    ctx.fill();
}


// ==========================
// آب
// ==========================

function drawWaterBackground() {

    ctx.fillStyle =
        "rgba(255,255,255,0.15)";

    for (let i = 0; i < 12; i++) {

        let x =
            (i * 190 -
            cameraX * 0.25) %
            canvas.width;

        ctx.beginPath();

        ctx.arc(
            x,
            150 + i * 20,
            35,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.strokeStyle =
        "rgba(255,255,255,0.3)";

    ctx.lineWidth = 3;

    for (let y = 100; y < 450; y += 70) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.quadraticCurveTo(
            200,
            y - 30,
            400,
            y
        );

        ctx.quadraticCurveTo(
            600,
            y + 30,
            900,
            y
        );

        ctx.stroke();
    }
}


// ==========================
// آتش
// ==========================

function drawFireBackground() {

    ctx.fillStyle =
        "rgba(255,180,0,0.4)";

    for (let i = 0; i < 20; i++) {

        let x =
            (i * 130 -
            cameraX * 0.2) %
            canvas.width;

        if (x < 0) x += canvas.width;

        let y =
            100 +
            (i * 47) % 250;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// ==========================
// سکوها
// ==========================

function drawPlatforms() {

    let currentWorld =
        worlds[world];

    platforms.forEach(platform => {

        let x =
            platform.x - cameraX;

        ctx.fillStyle =
            currentWorld.ground;

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );

        ctx.fillStyle =
            currentWorld.platform;

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            8
        );
    });
}


// ==========================
// دختر
// ==========================

function drawPlayer() {

    let x =
        player.x - cameraX;

    let y =
        player.y;

    ctx.save();

    // مو
    ctx.fillStyle = "#4b2412";

    ctx.beginPath();

    ctx.arc(
        x + 19,
        y + 12,
        18,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // صورت
    ctx.fillStyle = "#ffd0a8";

    ctx.fillRect(
        x + 7,
        y + 10,
        25,
        25
    );

    // چشم
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 13,
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
        world === 4
            ? "#8e44ad"
            : "#ff4f81";

    ctx.fillRect(
        x + 5,
        y + 34,
        29,
        21
    );

    // پاها
    ctx.fillStyle = "#263238";

    ctx.fillRect(
        x + 7,
        y + 53,
        9,
        12
    );

    ctx.fillRect(
        x + 23,
        y + 53,
        9,
        12
    );

    // دست
    ctx.fillStyle =
        "#ffd0a8";

    ctx.fillRect(
        x - 3,
        y + 37,
        10,
        8
    );

    ctx.fillRect(
        x + 31,
        y + 37,
        10,
        8
    );

    ctx.restore();
}


// ==========================
// سکه
// ==========================

function drawCoins() {

    coinsList.forEach(coin => {

        if (coin.collected) return;

        let x =
            coin.x - cameraX;

        ctx.beginPath();

        ctx.arc(
            x,
            coin.y,
            12,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffd700";

        ctx.fill();

        ctx.strokeStyle =
            "#d49b00";

        ctx.lineWidth = 3;

        ctx.stroke();

        ctx.fillStyle =
            "#8a6500";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "$",
            x,
            coin.y + 5
        );
    });
}


// ==========================
// دشمن‌ها
// ==========================

function drawEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        let x =
            enemy.x - cameraX;

        let y =
            enemy.y;

        drawEnemy(
            enemy.type,
            x,
            y
        );
    });
}


function drawEnemy(type, x, y) {

    ctx.save();

    // حلزون
    if (type === "snail") {

        ctx.fillStyle = "#8e44ad";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 24,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#6c3483";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 22,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    // لاک پشت
    else if (type === "turtle") {

        ctx.fillStyle = "#27ae60";

        ctx.beginPath();

        ctx.ellipse(
            x + 22,
            y + 24,
            23,
            17,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#145a32";

        ctx.beginPath();

        ctx.arc(
            x + 40,
            y + 23,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    // کلم
    else if (type === "cabbage") {

        ctx.fillStyle = "#2ecc71";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 22,
            22,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#fff";

        ctx.fillRect(
            x + 12,
            y + 18,
            5,
            5
        );

        ctx.fillRect(
            x + 27,
            y + 18,
            5,
            5
        );
    }

    // پنگوئن
    else if (type === "penguin") {

        ctx.fillStyle = "#263238";

        ctx.beginPath();

        ctx.ellipse(
            x + 22,
            y + 23,
            18,
            23,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.ellipse(
            x + 22,
            y + 27,
            11,
            16,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#f39c12";

        ctx.fillRect(
            x + 18,
            y + 27,
            9,
            5
        );
    }

    // گوسفند
    else if (type === "sheep") {

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 23,
            22,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#333";

        ctx.beginPath();

        ctx.arc(
            x + 39,
            y + 24,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    // گلوله برفی
    else if (type === "snowball") {

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 22,
            21,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle = "#a9dfff";

        ctx.stroke();
    }

    // ماهی
    else if (
        type === "fish" ||
        type === "fish2"
    ) {

        ctx.fillStyle =
            type === "fish"
                ? "#ff7675"
                : "#ffeaa7";

        ctx.beginPath();

        ctx.ellipse(
            x + 22,
            y + 22,
            23,
            14,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.moveTo(
            x,
            y + 22
        );

        ctx.lineTo(
            x - 15,
            y + 10
        );

        ctx.lineTo(
            x - 15,
            y + 34
        );

        ctx.closePath();

        ctx.fill();
    }

    // حباب
    else if (type === "bubble") {

        ctx.strokeStyle = "white";

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 22,
            18,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }

    // آتش
    else if (type === "fire") {

        ctx.fillStyle = "#ff3d00";

        ctx.beginPath();

        ctx.moveTo(
            x + 22,
            y
        );

        ctx.lineTo(
            x + 42,
            y + 42
        );

        ctx.lineTo(
            x,
            y + 42
        );

        ctx.closePath();

        ctx.fill();

        ctx.fillStyle = "#ffd600";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 28,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    // هیولای کوچک
    else if (type === "monster") {

        ctx.fillStyle = "#6c5ce7";

        ctx.fillRect(
            x,
            y,
            44,
            42
        );

        ctx.fillStyle = "white";

        ctx.fillRect(
            x + 8,
            y + 10,
            8,
            8
        );

        ctx.fillRect(
            x + 28,
            y + 10,
            8,
            8
        );
    }

    // گدازه
    else if (type === "lava") {

        ctx.fillStyle = "#ff5722";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 25,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.restore();
}


// ==========================
// باس
// ==========================

function drawBoss() {

    if (!bossActive || !boss) return;

    let x =
        boss.x - cameraX;

    let y =
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
        x + 60,
        y + 60,
        58,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // چشم‌ها
    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x + 30,
        y + 45,
        15,
        15
    );

    ctx.fillRect(
        x + 75,
        y + 45,
        15,
        15
    );

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 35,
        y + 50,
        7,
        8
    );

    ctx.fillRect(
        x + 80,
        y + 50,
        7,
        8
    );

    // دهان
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 35,
        y + 82,
        50,
        10
    );

    // نوار سلامتی
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y - 25,
        120,
        12
    );

    ctx.fillStyle = "#e74c3c";

    ctx.fillRect(
        x,
        y - 25,
        120 *
        (boss.hp / boss.maxHp),
        12
    );
}


// ==========================
// ذرات
// ==========================

function drawParticles() {

    particles.forEach(p => {

        ctx.fillStyle =
            "#ffd700";

        ctx.fillRect(
            p.x - cameraX,
            p.y,
            5,
            5
        );
    });
}


// ==========================
// متن مرحله
// ==========================

function drawLevelInfo() {

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.fillRect(
        15,
        15,
        230,
        55
    );

    ctx.fillStyle = "white";

    ctx.font =
        "bold 18px Arial";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "دنیای " +
        world +
        " - " +
        worlds[world].name,
        230,
        38
    );

    ctx.font =
        "15px Arial";

    ctx.fillText(
        "مرحله " +
        level +
        " از 10",
        230,
        60
    );
}


// ==========================
// پایان بازی
// ==========================

function createVictoryEffect() {

    for (let i = 0; i < 100; i++) {

        particles.push({

            x:
                canvas.width / 2,

            y:
                canvas.height / 2,

            vx:
                (Math.random() - 0.5) * 12,

            vy:
                (Math.random() - 0.5) * 12,

            life: 100
        });
    }
}


// ==========================
// رسم بازی
// ==========================

function draw() {

    drawBackground();

    drawPlatforms();

    drawCoins();

    drawEnemies();

    drawBoss();

    // گلوله‌ها
    bullets.forEach(bullet => {

        ctx.fillStyle =
            "#fff200";

        ctx.fillRect(
            bullet.x - cameraX,
            bullet.y,
            bullet.width,
            bullet.height
        );
    });

    drawParticles();

    drawPlayer();

    drawLevelInfo();
}


// ==========================
// حلقه بازی
// ==========================

function gameLoop() {

    if (!gameRunning) {

        draw();

        return;
    }

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );
}


// ==========================
// صفحه شروع
// ==========================

draw();
