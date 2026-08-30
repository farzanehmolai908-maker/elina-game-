/* =========================================
   🍄 قارچ‌خور
   game.js
========================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// =========================================
// تنظیم Canvas
// =========================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// =========================================
// وضعیت بازی
// =========================================

let world = 1;
let level = 1;

let score = 0;
let coins = 0;
let lives = 3;

let cameraX = 0;

let keys = {
    left: false,
    right: false
};

let bullets = [];

let levelFinished = false;


// =========================================
// بازیکن
// =========================================

const player = {

    x: 100,
    y: 300,

    width: 42,
    height: 68,

    vx: 0,
    vy: 0,

    speed: 5.2,
    jumpPower: 14,

    onGround: false,

    direction: 1,

    frame: 0
};


// =========================================
// فیزیک
// =========================================

const gravity = 0.65;


// =========================================
// مرحله
// =========================================

let platforms = [];
let enemies = [];
let coinsList = [];
let goal = null;


// =========================================
// ساخت مرحله
// =========================================

function createLevel() {

    platforms = [];
    enemies = [];
    coinsList = [];
    bullets = [];

    levelFinished = false;

    player.x = 100;
    player.y = 250;

    player.vx = 0;
    player.vy = 0;

    cameraX = 0;

    /*
       هر مرحله طول متفاوت دارد
    */

    const levelLength =
        3000 +
        (level - 1) * 220;

    // زمین اصلی
    platforms.push({
        x: 0,
        y: canvas.height - 95,
        width: levelLength,
        height: 95
    });


    // ساخت سکوهای متفاوت
    const platformCount =
        8 + level + world;

    for (let i = 0; i < platformCount; i++) {

        const x =
            350 +
            i * (220 + ((i * 37) % 100));

        const y =
            canvas.height -
            180 -
            ((i * 73 + level * 29) % 180);

        const width =
            120 +
            ((i * 41) % 130);

        platforms.push({
            x,
            y,
            width,
            height: 28
        });


        // سکه روی بعضی سکوها
        if (i % 2 === 0) {

            coinsList.push({
                x: x + width / 2,
                y: y - 35,
                radius: 12,
                collected: false
            });
        }


        // دشمن
        if (i % 3 === 1) {

            enemies.push({
                x: x + 25,
                y: y - 42,
                width: 38,
                height: 42,

                vx: 1.2 + world * 0.15,

                minX: x,
                maxX: x + width - 40,

                alive: true
            });
        }
    }


    // چند سکه روی زمین
    for (let i = 0; i < 12; i++) {

        coinsList.push({
            x: 180 + i * 210,
            y: canvas.height - 135,
            radius: 12,
            collected: false
        });
    }


    // دشمن‌های زمینی
    for (let i = 0; i < 5 + world; i++) {

        const x = 600 + i * 420;

        enemies.push({
            x,
            y: canvas.height - 137,

            width: 40,
            height: 42,

            vx: 1 + world * 0.2,

            minX: x - 100,
            maxX: x + 100,

            alive: true
        });
    }


    // پرچم پایان
    goal = {

        x: levelLength - 180,

        y: canvas.height - 250,

        width: 70,
        height: 160
    };


    updateHUD();
}


// =========================================
// نوع محیط
// =========================================

function getWorldTheme() {

    if (world === 1) {

        return {
            sky: "#75d6ff",
            ground: "#38a83e",
            groundTop: "#83df45",
            platform: "#8b5a32"
        };

    }

    if (world === 2) {

        return {
            sky: "#bdeeff",
            ground: "#dff8ff",
            groundTop: "#ffffff",
            platform: "#9bd4ed"
        };

    }

    if (world === 3) {

        return {
            sky: "#168fd0",
            ground: "#176e86",
            groundTop: "#34c2c8",
            platform: "#7c9d8e"
        };

    }

    return {
        sky: "#4b2020",
        ground: "#6e2720",
        groundTop: "#ff6b25",
        platform: "#77463c"
    };
}


// =========================================
// پس‌زمینه
// =========================================

function drawBackground() {

    const theme = getWorldTheme();

    ctx.fillStyle = theme.sky;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // کوه‌ها
    ctx.fillStyle =
        world === 4
            ? "#291313"
            : "rgba(50,100,100,0.35)";

    for (let i = 0; i < 10; i++) {

        const x =
            i * 400 -
            (cameraX * 0.25 % 400);

        ctx.beginPath();

        ctx.moveTo(x, canvas.height - 95);

        ctx.lineTo(
            x + 200,
            canvas.height - 360
        );

        ctx.lineTo(
            x + 400,
            canvas.height - 95
        );

        ctx.closePath();

        ctx.fill();
    }


    // درخت‌های دنیای اول
    if (world === 1) {

        for (let i = 0; i < 12; i++) {

            const x =
                i * 330 -
                (cameraX * 0.4 % 330);

            drawTree(
                x,
                canvas.height - 95
            );
        }
    }


    // برف
    if (world === 2) {

        for (let i = 0; i < 60; i++) {

            const x =
                (i * 137) %
                canvas.width;

            const y =
                (i * 83) %
                (canvas.height - 120);

            ctx.fillStyle = "rgba(255,255,255,0.8)";

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


    // حباب‌های آب
    if (world === 3) {

        for (let i = 0; i < 25; i++) {

            const x =
                (i * 173) %
                canvas.width;

            const y =
                (i * 97) %
                (canvas.height - 150);

            ctx.strokeStyle =
                "rgba(255,255,255,0.4)";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                5 + (i % 8),
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }
    }


    // آتش
    if (world === 4) {

        for (let i = 0; i < 15; i++) {

            const x =
                (i * 250) -
                (cameraX * 0.2 % 250);

            drawFlame(
                x,
                canvas.height - 105
            );
        }
    }
}


// =========================================
// درخت
// =========================================

function drawTree(x, y) {

    ctx.fillStyle = "#75452b";

    ctx.fillRect(
        x - 12,
        y - 130,
        24,
        130
    );

    ctx.fillStyle = "#197a35";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 145,
        55,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        x - 35,
        y - 115,
        38,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        x + 35,
        y - 115,
        38,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// =========================================
// آتش
// =========================================

function drawFlame(x, y) {

    ctx.fillStyle = "#ffae00";

    ctx.beginPath();

    ctx.moveTo(x, y);
    ctx.lineTo(x + 15, y - 50);
    ctx.lineTo(x + 28, y);
    ctx.closePath();

    ctx.fill();

    ctx.fillStyle = "#ff3b18";

    ctx.beginPath();

    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 20, y - 30);
    ctx.lineTo(x + 32, y);
    ctx.closePath();

    ctx.fill();
}


// =========================================
// زمین و سکوها
// =========================================

function drawPlatforms() {

    const theme = getWorldTheme();

    for (const p of platforms) {

        const x = p.x - cameraX;

        if (
            x + p.width < 0 ||
            x > canvas.width
        ) {
            continue;
        }


        // بدنه
        ctx.fillStyle = theme.platform;

        ctx.fillRect(
            x,
            p.y,
            p.width,
            p.height
        );


        // قسمت بالایی زمین
        ctx.fillStyle = theme.groundTop;

        ctx.fillRect(
            x,
            p.y,
            p.width,
            10
        );


        // خط‌های سنگ/آجر
        ctx.strokeStyle =
            "rgba(0,0,0,0.25)";

        ctx.lineWidth = 2;

        for (
            let brick = x;
            brick < x + p.width;
            brick += 45
        ) {

            ctx.beginPath();

            ctx.moveTo(
                brick,
                p.y + 10
            );

            ctx.lineTo(
                brick,
                p.y + p.height
            );

            ctx.stroke();
        }
    }
}


// =========================================
// دختر
// =========================================

function drawPlayer() {

    const x = player.x - cameraX;
    const y = player.y;

    ctx.save();

    if (player.direction === -1) {

        ctx.translate(
            x + player.width,
            0
        );

        ctx.scale(-1, 1);

    } else {

        ctx.translate(x, 0);
    }


    /*
       پاها
    */

    ctx.fillStyle = "#3a2a70";

    ctx.fillRect(
        12,
        y + 48,
        8,
        19
    );

    ctx.fillRect(
        27,
        y + 48,
        8,
        19
    );


    // کفش
    ctx.fillStyle = "#33201d";

    ctx.fillRect(
        8,
        y + 63,
        14,
        6
    );

    ctx.fillRect(
        26,
        y + 63,
        14,
        6
    );


    /*
       بدن
    */

    ctx.fillStyle = "#e83c55";

    ctx.beginPath();

    ctx.roundRect(
        8,
        y + 28,
        28,
        28,
        7
    );

    ctx.fill();


    /*
       لباس
    */

    ctx.fillStyle = "#4d8fe8";

    ctx.fillRect(
        9,
        y + 40,
        26,
        15
    );


    /*
       دست‌ها
    */

    ctx.fillStyle = "#ffd0aa";

    ctx.fillRect(
        2,
        y + 31,
        8,
        22
    );

    ctx.fillRect(
        34,
        y + 31,
        8,
        22
    );


    /*
       گردن
    */

    ctx.fillStyle = "#f2b58d";

    ctx.fillRect(
        17,
        y + 22,
        9,
        10
    );


    /*
       سر
    */

    ctx.fillStyle = "#ffd0aa";

    ctx.beginPath();

    ctx.arc(
        21,
        y + 17,
        16,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       مو
    */

    ctx.fillStyle = "#5b2b20";

    ctx.beginPath();

    ctx.arc(
        21,
        y + 10,
        17,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // موهای کنار صورت
    ctx.fillRect(
        4,
        y + 10,
        7,
        20
    );

    ctx.fillRect(
        31,
        y + 10,
        7,
        20
    );


    /*
       چشم
    */

    ctx.fillStyle = "#222";

    ctx.beginPath();

    ctx.arc(
        16,
        y + 17,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        27,
        y + 17,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       لبخند
    */

    ctx.strokeStyle = "#a64a4a";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        21,
        y + 20,
        5,
        0,
        Math.PI
    );

    ctx.stroke();


    ctx.restore();
}


// =========================================
// سکه‌ها
// =========================================

function drawCoins() {

    for (const c of coinsList) {

        if (c.collected) continue;

        const x = c.x - cameraX;

        if (
            x < -30 ||
            x > canvas.width + 30
        ) {
            continue;
        }

        ctx.fillStyle = "#ffd72f";

        ctx.beginPath();

        ctx.arc(
            x,
            c.y,
            c.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle = "#c98d00";

        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.fillStyle = "#fff3a0";

        ctx.font = "bold 13px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "$",
            x,
            c.y + 5
        );
    }
}


// =========================================
// دشمن
// =========================================

function drawEnemies() {

    for (const e of enemies) {

        if (!e.alive) continue;

        const x = e.x - cameraX;
        const y = e.y;


        // بدن
        ctx.fillStyle =
            world === 2
                ? "#ffffff"
                : world === 4
                    ? "#d94126"
                    : "#6a3f22";

        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            e.width,
            e.height,
            12
        );

        ctx.fill();


        // چشم
        ctx.fillStyle = "#fff";

        ctx.beginPath();

        ctx.arc(
            x + 12,
            y + 13,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.arc(
            x + 27,
            y + 13,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle = "#222";

        ctx.beginPath();

        ctx.arc(
            x + 12,
            y + 13,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.arc(
            x + 27,
            y + 13,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// =========================================
// گلوله
// =========================================

function drawBullets() {

    ctx.fillStyle = "#fff36b";

    for (const b of bullets) {

        ctx.beginPath();

        ctx.arc(
            b.x - cameraX,
            b.y,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// =========================================
// پرچم پایان
// =========================================

function drawGoal() {

    const x = goal.x - cameraX;

    /*
       پایه
    */

    ctx.fillStyle = "#555";

    ctx.fillRect(
        x + 25,
        goal.y,
        8,
        goal.height
    );


    /*
       پایه پایین
    */

    ctx.fillStyle = "#333";

    ctx.fillRect(
        x + 5,
        goal.y + goal.height - 8,
        50,
        10
    );


    /*
       توپ بالای میله
    */

    ctx.fillStyle = "#ffd52e";

    ctx.beginPath();

    ctx.arc(
        x + 29,
        goal.y,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       پرچم
    */

    ctx.fillStyle =
        world === 4
            ? "#ff452f"
            : "#27b94b";

    ctx.beginPath();

    ctx.moveTo(
        x + 33,
        goal.y + 12
    );

    ctx.lineTo(
        x + 88,
        goal.y + 35
    );

    ctx.lineTo(
        x + 33,
        goal.y + 60
    );

    ctx.closePath();

    ctx.fill();


    /*
       ستاره روی پرچم
    */

    ctx.fillStyle = "#fff";

    ctx.font = "24px Arial";

    ctx.fillText(
        "★",
        x + 47,
        goal.y + 46
    );
}


// =========================================
// حرکت بازیکن
// =========================================

function updatePlayer() {

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


    // محدودیت چپ
    if (player.x < 0) {

        player.x = 0;
    }


    // جاذبه
    player.vy += gravity;

    player.y += player.vy;

    player.onGround = false;


    // برخورد با سکوها
    for (const p of platforms) {

        if (

            player.x + player.width > p.x &&

            player.x < p.x + p.width &&

            player.y + player.height >= p.y &&

            player.y + player.height <=
                p.y + p.height + 15 &&

            player.vy >= 0

        ) {

            player.y =
                p.y - player.height;

            player.vy = 0;

            player.onGround = true;
        }
    }


    // اگر افتاد
    if (player.y > canvas.height + 200) {

        loseLife();
    }


    // دوربین
    const targetCamera =
        player.x - canvas.width * 0.38;

    cameraX +=
        (targetCamera - cameraX) * 0.1;

    if (cameraX < 0) {
        cameraX = 0;
    }
}


// =========================================
// پرش
// =========================================

function jump() {

    if (player.onGround) {

        player.vy =
            -player.jumpPower;
    }
}


// =========================================
// تیراندازی
// =========================================

function shoot() {

    bullets.push({

        x:
            player.x +
            (player.direction === 1
                ? player.width
                : 0),

        y:
            player.y + 30,

        vx:
            player.direction * 9
    });
}


// =========================================
// گلوله‌ها
// =========================================

function updateBullets() {

    for (const b of bullets) {

        b.x += b.vx;
    }


    bullets =
        bullets.filter(
            b =>
                b.x > cameraX - 200 &&
                b.x <
                    cameraX +
                    canvas.width +
                    200
        );


    // برخورد گلوله با دشمن
    for (const b of bullets) {

        for (const e of enemies) {

            if (!e.alive) continue;

            if (

                b.x > e.x &&
                b.x < e.x + e.width &&
                b.y > e.y &&
                b.y < e.y + e.height

            ) {

                e.alive = false;

                score += 100;
            }
        }
    }
}


// =========================================
// دشمن‌ها
// =========================================

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

            player.x <
                e.x + e.width &&

            player.x +
                player.width >
                e.x &&

            player.y <
                e.y + e.height &&

            player.y +
                player.height >
                e.y

        ) {

            if (player.vy > 2) {

                e.alive = false;

                player.vy = -9;

                score += 150;

            } else {

                loseLife();
            }
        }
    }
}


// =========================================
// جمع کردن سکه
// =========================================

function updateCoins() {

    for (const c of coinsList) {

        if (c.collected) continue;

        const dx =
            player.x +
            player.width / 2 -
            c.x;

        const dy =
            player.y +
            player.height / 2 -
            c.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance < 35) {

            c.collected = true;

            coins++;

            score += 50;
        }
    }
}


// =========================================
// پرچم
// =========================================

function checkGoal() {

    if (
        player.x + player.width >
            goal.x &&

        player.x <
            goal.x + goal.width
    ) {

        finishLevel();
    }
}


// =========================================
// پایان مرحله
// =========================================

function finishLevel() {

    if (levelFinished) return;

    levelFinished = true;

    document
        .getElementById("completeText")
        .textContent =
        `دنیا ${world} - مرحله ${level} را با موفقیت تمام کردی!`;

    document
        .getElementById("levelComplete")
        .classList.remove("hidden");
}


// =========================================
// مرحله بعد
// =========================================

document
    .getElementById("nextLevelBtn")
    .addEventListener(
        "click",
        () => {

            level++;

            if (level > 10) {

                level = 1;

                world++;

                if (world > 4) {

                    world = 1;

                    alert(
                        "🎉 همه دنیاها را تمام کردی!"
                    );
                }
            }

            document
                .getElementById("levelComplete")
                .classList.add("hidden");

            createLevel();
        }
    );


// =========================================
// کم شدن جان
// =========================================

function loseLife() {

    lives--;

    updateHUD();

    if (lives <= 0) {

        lives = 3;

        score = 0;

        coins = 0;

        createLevel();

        return;
    }

    player.x = 100;

    player.y = 200;

    player.vx = 0;

    player.vy = 0;

    cameraX = 0;
}


// =========================================
// HUD
// =========================================

function updateHUD() {

    document.getElementById("lives")
        .textContent = lives;

    document.getElementById("coins")
        .textContent = coins;

    document.getElementById("score")
        .textContent = score;

    document.getElementById("worldNumber")
        .textContent = world;

    document.getElementById("levelNumber")
        .textContent = level;
}


// =========================================
// کنترل‌های کیبورد
// =========================================

window.addEventListener(
    "keydown",
    e => {

        if (
            e.key === "ArrowLeft" ||
            e.key.toLowerCase() === "a"
        ) {

            keys.left = true;
        }

        if (
            e.key === "ArrowRight" ||
            e.key.toLowerCase() === "d"
        ) {

            keys.right = true;
        }

        if (
            e.key === "ArrowUp" ||
            e.key === " "
        ) {

            jump();
        }

        if (
            e.key.toLowerCase() === "f"
        ) {

            shoot();
        }
    }
);


window.addEventListener(
    "keyup",
    e => {

        if (
            e.key === "ArrowLeft" ||
            e.key.toLowerCase() === "a"
        ) {

            keys.left = false;
        }

        if (
            e.key === "ArrowRight" ||
            e.key.toLowerCase() === "d"
        ) {

            keys.right = false;
        }
    }
);


// =========================================
// کنترل لمسی
// =========================================

function holdButton(button, down, up) {

    button.addEventListener(
        "touchstart",
        e => {

            e.preventDefault();

            button.classList.add("pressed");

            down();
        },
        { passive: false }
    );

    button.addEventListener(
        "touchend",
        e => {

            e.preventDefault();

            button.classList.remove("pressed");

            up();
        },
        { passive: false }
    );

    button.addEventListener(
        "mousedown",
        e => {

            e.preventDefault();

            button.classList.add("pressed");

            down();
        }
    );

    button.addEventListener(
        "mouseup",
        () => {

            button.classList.remove("pressed");

            up();
        }
    );
}


holdButton(
    document.getElementById("leftBtn"),

    () => {
        keys.left = true;
    },

    () => {
        keys.left = false;
    }
);


holdButton(
    document.getElementById("rightBtn"),

    () => {
        keys.right = true;
    },

    () => {
        keys.right = false;
    }
);


document
    .getElementById("jumpBtn")
    .addEventListener(
        "touchstart",
        e => {

            e.preventDefault();

            jump();
        },
        { passive: false }
    );


document
    .getElementById("jumpBtn")
    .addEventListener(
        "mousedown",
        jump
    );


document
    .getElementById("shootBtn")
    .addEventListener(
        "touchstart",
        e => {

            e.preventDefault();

            shoot();
        },
        { passive: false }
    );


document
    .getElementById("shootBtn")
    .addEventListener(
        "mousedown",
        shoot
    );


// =========================================
// حلقه بازی
// =========================================

function gameLoop() {

    updatePlayer();

    updateEnemies();

    updateBullets();

    updateCoins();

    checkGoal();


    // رسم
    drawBackground();

    drawPlatforms();

    drawCoins();

    drawEnemies();

    drawGoal();

    drawBullets();

    drawPlayer();


    requestAnimationFrame(
        gameLoop
    );
}


// =========================================
// شروع بازی
// =========================================

createLevel();

gameLoop();
  
