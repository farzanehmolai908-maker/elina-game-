const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const livesText = document.getElementById("lives");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");

const ammoText = document.getElementById("ammo");
const shieldText = document.getElementById("shield");

let gameRunning = false;

let score = 0;
let coins = 0;
let lives = 5;
let ammo = 30;
let shield = 3;

let world = 1;
let level = 1;

let cameraX = 0;
let levelWidth = 3000;

let bullets = [];
let enemies = [];
let coinsList = [];
let ammoBoxes = [];
let platforms = [];
let particles = [];

let boss = null;

const keys = {
    left: false,
    right: false
};

const player = {
    x: 100,
    y: 350,
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


// =============================
// دنیاها
// =============================

const worlds = {

    1: {
        name: "جنگل",
        sky: "#79d66f",
        ground: "#684321",
        platform: "#9b632d"
    },

    2: {
        name: "سرزمین برفی",
        sky: "#bdefff",
        ground: "#eafaff",
        platform: "#ffffff"
    },

    3: {
        name: "دنیای آبی",
        sky: "#159bd3",
        ground: "#11657e",
        platform: "#42c8db"
    },

    4: {
        name: "سرزمین آتش",
        sky: "#ee7048",
        ground: "#542020",
        platform: "#8a3025"
    }
};


// =============================
// شروع بازی
// =============================

startBtn.addEventListener("click", startGame);

function startGame() {

    score = 0;
    coins = 0;
    lives = 5;
    ammo = 30;
    shield = 3;

    world = 1;
    level = 1;

    player.x = 100;
    player.y = 350;
    player.vx = 0;
    player.vy = 0;

    gameRunning = true;

    startBtn.textContent = "🔄 شروع دوباره";

    loadLevel();

    updateInfo();

    message.textContent =
        "🌲 نجات پدر شروع شد!";

    gameLoop();
}


// =============================
// ساخت مرحله
// =============================

function loadLevel() {

    platforms = [];
    enemies = [];
    coinsList = [];
    ammoBoxes = [];
    bullets = [];
    particles = [];

    boss = null;

    cameraX = 0;

    levelWidth = 2800 + level * 80;

    // زمین
    platforms.push({
        x: 0,
        y: 450,
        width: levelWidth,
        height: 50
    });

    // سکوها
    for (let i = 0; i < 18; i++) {

        const x = 230 + i * 145;

        const y =
            300 +
            Math.sin(i * 1.4) * 65;

        platforms.push({
            x: x,
            y: y,
            width: 115,
            height: 20
        });
    }

    // سکه‌ها
    for (let i = 0; i < 32; i++) {

        coinsList.push({
            x: 180 + i * 80,
            y: 250 + Math.sin(i) * 90,
            collected: false
        });
    }

    // جعبه تیر
    for (let i = 0; i < 10; i++) {

        ammoBoxes.push({
            x: 350 + i * 260,
            y: 405,
            collected: false
        });
    }

    // دشمن‌ها
    for (let i = 0; i < 12; i++) {

        let type;

        if (world === 1) {

            type =
                i % 3 === 0
                    ? "snail"
                    : i % 3 === 1
                        ? "turtle"
                        : "cabbage";

        } else if (world === 2) {

            type =
                i % 3 === 0
                    ? "penguin"
                    : i % 3 === 1
                        ? "sheep"
                        : "snowball";

        } else if (world === 3) {

            type =
                i % 2 === 0
                    ? "fish"
                    : "bubble";

        } else {

            type =
                i % 3 === 0
                    ? "fire"
                    : i % 3 === 1
                        ? "lava"
                        : "monster";
        }

        enemies.push({

            x: 400 + i * 190,

            y: 405,

            width: 42,
            height: 42,

            speed: 0.8,

            direction:
                i % 2 === 0
                    ? 1
                    : -1,

            type: type,

            alive: true
        });
    }

    // مرحله دهم = هیولا
    if (level === 10) {

        boss = {

            x: levelWidth - 500,

            y: 320,

            width: 130,
            height: 130,

            hp: 15,
            maxHp: 15,

            direction: -1
        };
    }
}


// =============================
// کیبورد
// =============================

document.addEventListener("keydown", function(e) {

    if (e.key === "ArrowLeft") {
        keys.left = true;
    }

    if (e.key === "ArrowRight") {
        keys.right = true;
    }

    if (
        e.code === "Space" ||
        e.key === "ArrowUp"
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

document.addEventListener("keyup", function(e) {

    if (e.key === "ArrowLeft") {
        keys.left = false;
    }

    if (e.key === "ArrowRight") {
        keys.right = false;
    }
});


// =============================
// دکمه‌های موبایل
// =============================

const leftBtn =
    document.getElementById("leftBtn");

const rightBtn =
    document.getElementById("rightBtn");

const shootBtn =
    document.getElementById("shootBtn");

const jumpBtn =
    document.getElementById("jumpBtn");

leftBtn.addEventListener(
    "touchstart",
    function(e) {
        e.preventDefault();
        keys.left = true;
    }
);

leftBtn.addEventListener(
    "touchend",
    function(e) {
        e.preventDefault();
        keys.left = false;
    }
);

rightBtn.addEventListener(
    "touchstart",
    function(e) {
        e.preventDefault();
        keys.right = true;
    }
);

rightBtn.addEventListener(
    "touchend",
    function(e) {
        e.preventDefault();
        keys.right = false;
    }
);

jumpBtn.addEventListener(
    "touchstart",
    function(e) {
        e.preventDefault();
        jump();
    }
);

shootBtn.addEventListener(
    "touchstart",
    function(e) {
        e.preventDefault();
        shoot();
    }
);


// برای کلیک معمولی
leftBtn.addEventListener(
    "mousedown",
    () => keys.left = true
);

leftBtn.addEventListener(
    "mouseup",
    () => keys.left = false
);

rightBtn.addEventListener(
    "mousedown",
    () => keys.right = true
);

rightBtn.addEventListener(
    "mouseup",
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


// =============================
// پرش
// =============================

function jump() {

    if (!gameRunning) return;

    if (player.onGround) {

        player.vy =
            -player.jumpPower;

        player.onGround = false;
    }
}


// =============================
// تیراندازی
// =============================

function shoot() {

    if (!gameRunning) return;

    if (ammo <= 0) {

        message.textContent =
            "🔫 تیر نداری! جعبه‌های تیر را جمع کن.";

        return;
    }

    if (player.shootCooldown > 0) {
        return;
    }

    ammo--;

    bullets.push({

        x:
            player.x +
            player.width / 2,

        y:
            player.y + 25,

        width: 18,
        height: 7,

        speed:
            12 * player.facing
    });

    player.shootCooldown = 12;

    updateInfo();
}


// =============================
// آپدیت اصلی
// =============================

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

            player.x <
            platform.x + platform.width &&

            player.x + player.width >
            platform.x &&

            player.y + player.height <=
            platform.y + 15 &&

            player.y +
            player.height +
            player.vy >=
            platform.y

        ) {

            player.y =
                platform.y -
                player.height;

            player.vy = 0;

            player.onGround = true;
        }
    });

    // محدوده
    if (player.x < 0) {
        player.x = 0;
    }

    if (
        player.x >
        levelWidth -
        player.width
    ) {

        player.x =
            levelWidth -
            player.width;
    }

    // افتادن
    if (
        player.y >
        canvas.height + 100
    ) {

        loseLife();

        return;
    }

    collectCoins();

    collectAmmo();

    updateEnemies();

    updateBullets();

    updateBoss();

    // دوربین
    cameraX =
        player.x -
        canvas.width / 2;

    if (cameraX < 0) {
        cameraX = 0;
    }

    if (
        cameraX >
        levelWidth -
        canvas.width
    ) {

        cameraX =
            levelWidth -
            canvas.width;
    }

    if (
        player.shootCooldown > 0
    ) {

        player.shootCooldown--;
    }

    updateParticles();

    // پایان مرحله
    if (
        player.x >
        levelWidth - 120 &&
        boss === null
    ) {

        nextLevel();
    }
}


// =============================
// جمع کردن سکه
// =============================

function collectCoins() {

    coinsList.forEach(coin => {

        if (coin.collected) return;

        const dx =
            player.x +
            player.width / 2 -
            coin.x;

        const dy =
            player.y +
            player.height / 2 -
            coin.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

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


// =============================
// جمع کردن تیر
// =============================

function collectAmmo() {

    ammoBoxes.forEach(box => {

        if (box.collected) return;

        if (

            player.x <
            box.x + 35 &&

            player.x + player.width >
            box.x &&

            player.y <
            box.y + 35 &&

            player.y +
            player.height >
            box.y

        ) {

            box.collected = true;

            ammo += 10;

            score += 50;

            message.textContent =
                "🔫 +10 تیر گرفتی!";

            updateInfo();
        }
    });
}


// =============================
// دشمن‌ها
// =============================

function updateEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        enemy.x +=
            enemy.speed *
            enemy.direction;

        if (
            enemy.x <
            250
        ) {

            enemy.direction = 1;
        }

        if (
            enemy.x >
            levelWidth - 200
        ) {

            enemy.direction = -1;
        }

        if (
            collision(
                player,
                enemy
            )
        ) {

            // پرش روی دشمن
            if (
                player.vy > 0 &&
                player.y +
                player.height <
                enemy.y + 22
            ) {

                enemy.alive = false;

                player.vy = -9;

                score += 200;

                createParticles(
                    enemy.x,
                    enemy.y,
                    12
                );

                updateInfo();

            } else {

                hitPlayer();
            }
        }
    });
}


// =============================
// گلوله‌ها
// =============================

function updateBullets() {

    bullets.forEach(bullet => {

        bullet.x += bullet.speed;

        // دشمن
        enemies.forEach(enemy => {

            if (
                enemy.alive &&
                collision(
                    bullet,
                    enemy
                )
            ) {

                enemy.alive = false;

                bullet.x = -9999;

                score += 250;

                createParticles(
                    enemy.x,
                    enemy.y,
                    12
                );

                updateInfo();
            }
        });

        // باس
        if (
            boss &&
            collision(
                bullet,
                boss
            )
        ) {

            boss.hp--;

            bullet.x = -9999;

            score += 50;

            createParticles(
                bullet.x,
                bullet.y,
                5
            );

            updateInfo();
        }
    });

    bullets =
        bullets.filter(
            bullet =>
                bullet.x >
                cameraX - 100 &&
                bullet.x <
                cameraX +
                canvas.width +
                200
        );
}


// =============================
// هیولای آخر
// =============================

function updateBoss() {

    if (!boss) return;

    boss.x +=
        boss.direction * 1;

    if (
        boss.x <
        levelWidth - 700
    ) {

        boss.direction = 1;
    }

    if (
        boss.x >
        levelWidth - 250
    ) {

        boss.direction = -1;
    }

    if (
        collision(
            player,
            boss
        )
    ) {

        hitPlayer();
    }

    if (boss.hp <= 0) {

        score += 2000;

        createParticles(
            boss.x,
            boss.y,
            40
        );

        boss = null;

        message.textContent =
            "🏆 هیولا شکست خورد!";
        
        updateInfo();
    }
}


// =============================
// برخورد بازیکن
// =============================

function hitPlayer() {

    if (shield > 0) {

        shield--;

        message.textContent =
            "🛡️ سپر از تو محافظت کرد!";

        player.x -= 80;

        updateInfo();

        return;
    }

    loseLife();
}


// =============================
// کم شدن جان
// =============================

function loseLife() {

    lives--;

    updateInfo();

    if (lives <= 0) {

        gameRunning = false;

        message.textContent =
            "💥 بازی تمام شد! دوباره امتحان کن.";

        return;
    }

    player.x =
        Math.max(
            100,
            player.x - 250
        );

    player.y = 300;

    player.vx = 0;
    player.vy = 0;

    message.textContent =
        "❤️ یک جان کم شد!";
}


// =============================
// مرحله بعد
// =============================

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
        "🌟 " +
        worlds[world].name +
        " - مرحله " +
        level;

    loadLevel();
}


// =============================
// پایان کل بازی
// =============================

function finishGame() {

    gameRunning = false;

    score += 10000;

    updateInfo();

    message.textContent =
        "🏆🎉 تبریک! پدر نجات پیدا کرد! ❤️";

    startBtn.textContent =
        "🎮 بازی دوباره";

    createVictoryEffect();
}


// =============================
// برخورد
// =============================

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


// =============================
// اطلاعات
// =============================

function updateInfo() {

    scoreText.textContent = score;

    coinsText.textContent = coins;

    livesText.textContent = lives;

    if (ammoText) {
        ammoText.textContent = ammo;
    }

    if (shieldText) {
        shieldText.textContent = shield;
    }
}


// =============================
// ذرات
// =============================

function createParticles(
    x,
    y,
    amount
) {

    for (
        let i = 0;
        i < amount;
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


// =============================
// پس‌زمینه
// =============================

function drawBackground() {

    ctx.fillStyle =
        worlds[world].sky;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
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
        drawFireWorld();
    }
}


// جنگل
function drawForest() {

    for (
        let x = -100;
        x < canvas.width + 200;
        x += 130
    ) {

        let tx =
            x -
            cameraX * 0.2;

        ctx.fillStyle =
            "#654321";

        ctx.fillRect(
            tx,
            270,
            25,
            180
        );

        ctx.fillStyle =
            "#238b45";

        ctx.beginPath();

        ctx.arc(
            tx + 12,
            245,
            65,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// برف
function drawSnow() {

    ctx.fillStyle =
        "white";

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        let x =
            (i * 137 -
                cameraX * 0.2)
            % canvas.width;

        if (x < 0) {
            x += canvas.width;
        }

        let y =
            (i * 71) % 430;

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
function drawWater() {

    ctx.strokeStyle =
        "rgba(255,255,255,0.3)";

    ctx.lineWidth = 3;

    for (
        let y = 100;
        y < 450;
        y += 70
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.quadraticCurveTo(
            250,
            y - 30,
            450,
            y
        );

        ctx.quadraticCurveTo(
            700,
            y + 30,
            900,
            y
        );

        ctx.stroke();
    }
}


// آتش
function drawFireWorld() {

    for (
        let i = 0;
        i < 25;
        i++
    ) {

        let x =
            (i * 100 -
                cameraX * 0.2)
            % canvas.width;

        if (x < 0) {
            x += canvas.width;
        }

        let y =
            80 +
            (i * 47) % 300;

        ctx.fillStyle =
            "rgba(255,190,0,0.35)";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// =============================
// سکوها
// =============================

function drawPlatforms() {

    platforms.forEach(platform => {

        let x =
            platform.x -
            cameraX;

        ctx.fillStyle =
            worlds[world].ground;

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );

        ctx.fillStyle =
            worlds[world].platform;

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            8
        );
    });
}


// =============================
// دختر
// =============================

function drawPlayer() {

    let x =
        player.x -
        cameraX;

    let y =
        player.y;

    // مو
    ctx.fillStyle =
        "#4b2412";

    ctx.beginPath();

    ctx.arc(
        x + 19,
        y + 13,
        19,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // صورت
    ctx.fillStyle =
        "#ffd0a8";

    ctx.fillRect(
        x + 7,
        y + 10,
        25,
        25
    );

    // چشم
    ctx.fillStyle =
        "#222";

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
        "#ff4f81";

    ctx.fillRect(
        x + 5,
        y + 34,
        29,
        21
    );

    // پاها
    ctx.fillStyle =
        "#263238";

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

    // سپر
    if (shield > 0) {

        ctx.strokeStyle =
            "rgba(0,180,255,0.7)";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.arc(
            x + 19,
            y + 32,
            34,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }
}


// =============================
// سکه‌ها
// =============================

function drawCoins() {

    coinsList.forEach(coin => {

        if (coin.collected) return;

        let x =
            coin.x -
            cameraX;

        ctx.fillStyle =
            "#ffd700";

        ctx.beginPath();

        ctx.arc(
            x,
            coin.y,
            12,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle =
            "#b8860b";

        ctx.lineWidth = 3;

        ctx.stroke();
    });
}


// =============================
// جعبه تیر
// =============================

function drawAmmoBoxes() {

    ammoBoxes.forEach(box => {

        if (box.collected) return;

        let x =
            box.x -
            cameraX;

        ctx.fillStyle =
            "#795548";

        ctx.fillRect(
            x,
            box.y,
            32,
            32
        );

        ctx.fillStyle =
            "#ffeb3b";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "🔫",
            x + 16,
            box.y + 23
        );
    });
}


// =============================
// دشمن‌ها
// =============================

function drawEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        drawEnemy(
            enemy.type,
            enemy.x - cameraX,
            enemy.y
        );
    });
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
            y + 23,
            19,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#6c3483";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 23,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "white";

        ctx.fillRect(
            x + 35,
            y + 5,
            4,
            18
        );

        ctx.fillRect(
            x + 43,
            y + 5,
            4,
            18
        );

        return;
    }

    // لاک‌پشت
    if (type === "turtle") {

        // لاک
        ctx.fillStyle =
            "#2e8b57";

        ctx.beginPath();

        ctx.ellipse(
            x + 21,
            y + 24,
            22,
            16,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // طرح لاک
        ctx.strokeStyle =
            "#145a32";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.arc(
            x + 21,
            y + 24,
            10,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        // سر
        ctx.fillStyle =
            "#4caf50";

        ctx.beginPath();

        ctx.arc(
            x + 42,
            y + 22,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // چشم
        ctx.fillStyle =
            "white";

        ctx.beginPath();

        ctx.arc(
            x + 45,
            y + 19,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#111";

        ctx.beginPath();

        ctx.arc(
            x + 45,
            y + 19,
            1.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // پاها
        ctx.fillStyle =
            "#4caf50";

        ctx.fillRect(
            x + 2,
            y + 32,
            10,
            8
        );

        ctx.fillRect(
            x + 30,
            y + 32,
            10,
            8
        );

        return;
    }

    // کلم
    if (type === "cabbage") {

        ctx.fillStyle =
            "#27ae60";

        ctx.beginPath();

        ctx.arc(
            x + 21,
            y + 22,
            21,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "white";

        ctx.fillRect(
            x + 12,
            y + 17,
            5,
            5
        );

        ctx.fillRect(
            x + 27,
            y + 17,
            5,
            5
        );

        return;
    }

    // پنگوئن
    if (type === "penguin") {

        ctx.fillStyle =
            "#263238";

        ctx.beginPath();

        ctx.ellipse(
            x + 21,
            y + 23,
            19,
            23,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "white";

        ctx.beginPath();

        ctx.ellipse(
            x + 21,
            y + 27,
            11,
            16,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#f39c12";

        ctx.fillRect(
            x + 17,
            y + 27,
            10,
            5
        );

        return;
    }

    // گوسفند
    if (type === "sheep") {

        ctx.fillStyle =
            "white";

        ctx.beginPath();

        ctx.arc(
            x + 20,
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
            x + 40,
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
            x + 21,
            y + 21,
            21,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle =
            "#9bdcff";

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
            x + 22,
            y + 22,
            23,
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

        return;
    }

    // حباب
    if (type === "bubble") {

        ctx.strokeStyle =
            "white";

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.arc(
            x + 21,
            y + 21,
            18,
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
            x + 21,
            y
        );

        ctx.lineTo(
            x + 43,
            y + 42
        );

        ctx.lineTo(
            x,
            y + 42
        );

        ctx.closePath();

        ctx.fill();

        ctx.fillStyle =
            "#ffd600";

        ctx.beginPath();

        ctx.arc(
            x + 21,
            y + 28,
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
            x + 21,
            y + 22,
            21,
            0,
            Math.PI * 2
        );

        ctx.fill();

        return;
    }

    // هیولای کوچک
    if (type === "monster") {

        ctx.fillStyle =
            "#6c5ce7";

        ctx.fillRect(
            x,
            y,
            43,
            42
        );

        ctx.fillStyle =
            "white";

        ctx.fillRect(
            x + 8,
            y + 9,
            8,
            8
        );

        ctx.fillRect(
            x + 27,
            y + 9,
            8,
            8
        );
    }
}


// =============================
// باس
// =============================

function drawBoss() {

    if (!boss) return;

    const x =
        boss.x -
        cameraX;

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
        x + 65,
        y + 65,
        62,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // چشم
    ctx.fillStyle =
        "white";

    ctx.fillRect(
        x + 32,
        y + 45,
        16,
        16
    );

    ctx.fillRect(
        x + 82,
        y + 45,
        16,
        16
    );

    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x + 37,
        y + 50,
        7,
        9
    );

    ctx.fillRect(
        x + 87,
        y + 50,
        7,
        9
    );

    // دهان
    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x + 35,
        y + 88,
        60,
        12
    );

    // نوار سلامتی
    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x,
        y - 25,
        130,
        14
    );

    ctx.fillStyle =
        "#e74c3c";

    ctx.fillRect(
        x,
        y - 25,
        130 *
        (boss.hp /
            boss.maxHp),
        14
    );
}


// =============================
// پرچم
// =============================

function drawFlag() {

    const flagX =
        levelWidth -
        100 -
        cameraX;

    const flagY = 360;

    ctx.fillStyle =
        "#555";

    ctx.fillRect(
        flagX,
        flagY,
        6,
        90
    );

    ctx.fillStyle =
        "#ff4757";

    ctx.beginPath();

    ctx.moveTo(
        flagX + 6,
        flagY
    );

    ctx.lineTo(
        flagX + 65,
        flagY + 20
    );

    ctx.lineTo(
        flagX + 6,
        flagY + 40
    );

    ctx.closePath();

    ctx.fill();
}


// =============================
// ذرات
// =============================

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


// =============================
// اطلاعات مرحله
// =============================

function drawLevelInfo() {

    ctx.fillStyle =
        "rgba(0,0,0,0.4)";

    ctx.fillRect(
        15,
        15,
        250,
        58
    );

    ctx.fillStyle =
        "white";

    ctx.font =
        "bold 18px Arial";

    ctx.textAlign =
        "right";

    ctx.fillText(
        "🌍 " +
        worlds[world].name,
        245,
        40
    );

    ctx.font =
        "15px Arial";

    ctx.fillText(
        "مرحله " +
        level +
        " از 10",
        245,
        62
    );
}


// =============================
// رسم همه چیز
// =============================

function draw() {

    drawBackground();

    drawPlatforms();

    drawCoins();

    drawAmmoBoxes();

    drawEnemies();

    drawBoss();

    drawFlag();

    // گلوله‌ها
    bullets.forEach(bullet => {

        ctx.fillStyle =
            "#fff200";

        ctx.fillRect(
            bullet.x -
            cameraX,

            bullet.y,

            bullet.width,

            bullet.height
        );
    });

    drawParticles();

    drawPlayer();

    drawLevelInfo();
}


// =============================
// حلقه بازی
// =============================

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


// شروع اولیه
updateInfo();

draw();
