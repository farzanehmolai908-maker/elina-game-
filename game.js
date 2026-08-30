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
// صفحات
// =========================================

const screens = document.querySelectorAll(".screen");

function showScreen(id) {
    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(id);

    if (target) {
        target.classList.add("active");
    }
}


// =========================================
// وضعیت بازی
// =========================================

let currentWorld = 1;
let currentLevel = 1;

let lives = 3;
let coins = 0;
let score = 0;

let gameRunning = false;
let paused = false;

let animationId;


// =========================================
// باز کردن صفحه انتخاب جهان
// =========================================

document.getElementById("worldBtn").addEventListener("click", () => {
    showScreen("worldMenu");
});


// =========================================
// راهنما
// =========================================

document.getElementById("guideBtn").addEventListener("click", () => {
    showScreen("guideMenu");
});


// =========================================
// بازگشت‌ها
// =========================================

document.querySelectorAll("[data-back]").forEach(button => {

    button.addEventListener("click", () => {

        const target = button.dataset.back;

        showScreen(target);

        if (target !== "gameScreen") {
            gameRunning = false;
        }
    });

});


// =========================================
// انتخاب جهان
// =========================================

document.querySelectorAll(".worldCard").forEach(card => {

    card.addEventListener("click", () => {

        const world = Number(card.dataset.world);

        if (world !== 1) {
            alert("🔒 این جهان هنوز قفل است!");
            return;
        }

        currentWorld = world;

        createLevelButtons();

        showScreen("levelMenu");
    });

});


// =========================================
// ساخت مراحل
// =========================================

function createLevelButtons() {

    const levelGrid = document.getElementById("levelGrid");

    levelGrid.innerHTML = "";

    for (let i = 1; i <= 10; i++) {

        const button = document.createElement("button");

        button.className = "levelButton";

        button.textContent = i;

        if (i > 1) {
            button.classList.add("locked");
        }

        button.addEventListener("click", () => {

            if (i > 1) {
                alert("🔒 ابتدا مرحله قبلی را کامل کن!");
                return;
            }

            currentLevel = i;

            startGame();

        });

        levelGrid.appendChild(button);
    }
}


// =========================================
// شروع بازی
// =========================================

document.getElementById("startBtn").addEventListener("click", () => {

    currentWorld = 1;
    currentLevel = 1;

    startGame();

});


function startGame() {

    lives = 3;
    coins = 0;
    score = 0;

    paused = false;
    gameRunning = true;

    updateHUD();

    showScreen("gameScreen");

    createLevel();

    cancelAnimationFrame(animationId);

    gameLoop();
}


// =========================================
// بازیکن
// =========================================

const player = {

    x: 100,
    y: 100,

    width: 42,
    height: 55,

    vx: 0,
    vy: 0,

    speed: 5,
    jumpPower: 14,

    grounded: false,

    direction: 1,

    shooting: false
};


// =========================================
// دنیای بازی
// =========================================

const world = {

    ground: 0,

    gravity: 0.65,

    width: 5000
};


// =========================================
// دوربین
// =========================================

let cameraX = 0;


// =========================================
// سکوها
// =========================================

let platforms = [];


// =========================================
// سکه‌ها
// =========================================

let coinItems = [];


// =========================================
// دشمن‌ها
// =========================================

let enemies = [];


// =========================================
// گلوله‌ها
// =========================================

let bullets = [];


// =========================================
// پرچم
// =========================================

let flag = {

    x: 4500,

    y: 0,

    width: 40,

    height: 80
};


// =========================================
// ساخت مرحله
// =========================================

function createLevel() {

    platforms = [];
    coinItems = [];
    enemies = [];
    bullets = [];

    player.x = 100;
    player.y = 300;

    player.vx = 0;
    player.vy = 0;

    cameraX = 0;


    // زمین اصلی

    platforms.push({
        x: 0,
        y: 500,
        width: 5000,
        height: 100
    });


    // سکوها

    platforms.push({
        x: 500,
        y: 410,
        width: 220,
        height: 30
    });

    platforms.push({
        x: 900,
        y: 350,
        width: 200,
        height: 30
    });

    platforms.push({
        x: 1300,
        y: 420,
        width: 250,
        height: 30
    });

    platforms.push({
        x: 1800,
        y: 360,
        width: 200,
        height: 30
    });

    platforms.push({
        x: 2300,
        y: 410,
        width: 250,
        height: 30
    });

    platforms.push({
        x: 3000,
        y: 350,
        width: 250,
        height: 30
    });


    // سکه‌ها

    for (let i = 0; i < 20; i++) {

        coinItems.push({

            x: 300 + i * 200,

            y: 330 - (i % 2) * 50,

            radius: 10,

            collected: false

        });

    }


    // دشمن‌ها

    enemies.push({
        x: 700,
        y: 455,
        width: 40,
        height: 40,
        vx: 1.5,
        alive: true
    });

    enemies.push({
        x: 1200,
        y: 455,
        width: 40,
        height: 40,
        vx: -1.5,
        alive: true
    });

    enemies.push({
        x: 2000,
        y: 455,
        width: 40,
        height: 40,
        vx: 1.5,
        alive: true
    });

    enemies.push({
        x: 2800,
        y: 455,
        width: 40,
        height: 40,
        vx: -1.5,
        alive: true
    });


    flag.x = 4500;
    flag.y = 420;
}


// =========================================
// کنترل‌ها
// =========================================

let keys = {

    left: false,
    right: false

};


// =========================================
// کیبورد
// =========================================

document.addEventListener("keydown", event => {

    if (event.key === "ArrowLeft") {
        keys.left = true;
    }

    if (event.key === "ArrowRight") {
        keys.right = true;
    }

    if (
        event.key === "ArrowUp" ||
        event.key === " "
    ) {
        jump();
    }

    if (event.key === "z" || event.key === "Z") {
        shoot();
    }

});


document.addEventListener("keyup", event => {

    if (event.key === "ArrowLeft") {
        keys.left = false;
    }

    if (event.key === "ArrowRight") {
        keys.right = false;
    }

});


// =========================================
// دکمه‌های لمسی
// =========================================

function holdButton(button, start, end) {

    button.addEventListener("pointerdown", event => {

        event.preventDefault();

        start();

    });

    button.addEventListener("pointerup", event => {

        event.preventDefault();

        end();

    });

    button.addEventListener("pointercancel", end);
    button.addEventListener("pointerleave", end);
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


document.getElementById("jumpBtn")
    .addEventListener("pointerdown", event => {

        event.preventDefault();

        jump();

    });


document.getElementById("shootBtn")
    .addEventListener("pointerdown", event => {

        event.preventDefault();

        shoot();

    });


// =========================================
// پرش
// =========================================

function jump() {

    if (!gameRunning || paused) {
        return;
    }

    if (player.grounded) {

        player.vy = -player.jumpPower;

        player.grounded = false;
    }

}


// =========================================
// شلیک
// =========================================

function shoot() {

    if (!gameRunning || paused) {
        return;
    }

    bullets.push({

        x:
            player.direction === 1
                ? player.x + player.width
                : player.x,

        y: player.y + 25,

        width: 16,
        height: 8,

        vx:
            player.direction * 9

    });

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

    player.vy += world.gravity;

    player.y += player.vy;


    player.grounded = false;


    // برخورد با سکوها

    platforms.forEach(platform => {

        if (

            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + 30 &&
            player.vy >= 0

        ) {

            player.y =
                platform.y - player.height;

            player.vy = 0;

            player.grounded = true;

        }

    });


    if (player.x < 0) {
        player.x = 0;
    }

}


// =========================================
// حرکت دشمن‌ها
// =========================================

function updateEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) {
            return;
        }

        enemy.x += enemy.vx;

        if (enemy.x < 500 || enemy.x > 4400) {
            enemy.vx *= -1;
        }

    });

}


// =========================================
// گلوله‌ها
// =========================================

function updateBullets() {

    bullets.forEach(bullet => {

        bullet.x += bullet.vx;

    });


    bullets = bullets.filter(
        bullet =>
            bullet.x > cameraX - 100 &&
            bullet.x < cameraX + canvas.width + 100
    );


    // برخورد گلوله با دشمن

    bullets.forEach(bullet => {

        enemies.forEach(enemy => {

            if (
                enemy.alive &&
                collision(bullet, enemy)
            ) {

                enemy.alive = false;

                score += 100;

            }

        });

    });

}


// =========================================
// سکه‌ها
// =========================================

function updateCoins() {

    coinItems.forEach(coin => {

        if (coin.collected) {
            return;
        }

        const dx =
            player.x +
            player.width / 2 -
            coin.x;

        const dy =
            player.y +
            player.height / 2 -
            coin.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);


        if (distance < 35) {

            coin.collected = true;

            coins++;

            score += 10;

            updateHUD();

        }

    });

}


// =========================================
// برخورد بازیکن و دشمن
// =========================================

function checkEnemyCollision() {

    enemies.forEach(enemy => {

        if (
            enemy.alive &&
            collision(player, enemy)
        ) {

            // اگر از بالا روی دشمن فرود آمده باشد

            if (
                player.vy > 0 &&
                player.y + player.height - 10 <
                enemy.y + 15
            ) {

                enemy.alive = false;

                player.vy = -8;

                score += 100;

            } else {

                loseLife();

            }

        }

    });

}


// =========================================
// برخورد عمومی
// =========================================

function collision(a, b) {

    return (

        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y

    );

}


// =========================================
// کم شدن جان
// =========================================

function loseLife() {

    lives--;

    updateHUD();

    if (lives <= 0) {

        gameOver();

        return;

    }

    player.x = 100;
    player.y = 300;

    player.vx = 0;
    player.vy = 0;

    cameraX = 0;

}


// =========================================
// پرچم
// =========================================

function checkFlag() {

    const flagBox = {

        x: flag.x,

        y: flag.y,

        width: flag.width,

        height: flag.height

    };


    if (collision(player, flagBox)) {

        completeLevel();

    }

}


// =========================================
// پایان مرحله
// =========================================

function completeLevel() {

    gameRunning = false;

    document.getElementById("completeScore")
        .textContent = score;

    document.getElementById("completeCoins")
        .textContent = coins;

    showScreen("levelCompleteMenu");

}


// =========================================
// Game Over
// =========================================

function gameOver() {

    gameRunning = false;

    document.getElementById("finalScore")
        .textContent = score;

    showScreen("gameOverMenu");

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

    document.getElementById("hudWorld")
        .textContent = currentWorld;

    document.getElementById("hudLevel")
        .textContent = currentLevel;

}


// =========================================
// دوربین
// =========================================

function updateCamera() {

    cameraX =
        player.x -
        canvas.width * 0.35;


    if (cameraX < 0) {
        cameraX = 0;
    }

    if (
        cameraX >
        world.width - canvas.width
    ) {

        cameraX =
            world.width - canvas.width;

    }

}


// =========================================
// رسم پس‌زمینه
// =========================================

function drawBackground() {

    // آسمان

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        "#55c9f5"
    );

    gradient.addColorStop(
        1,
        "#b5ec91"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ابرها

    ctx.font = "60px Arial";

    ctx.fillText(
        "☁️",
        100 - cameraX * 0.15,
        130
    );

    ctx.fillText(
        "☁️",
        500 - cameraX * 0.12,
        180
    );

    ctx.fillText(
        "☁️",
        1000 - cameraX * 0.1,
        120
    );


    // کوه‌ها

    ctx.fillStyle = "#6caf62";

    ctx.beginPath();

    ctx.moveTo(
        0,
        500
    );

    ctx.lineTo(
        250 - cameraX * 0.2,
        300
    );

    ctx.lineTo(
        500 - cameraX * 0.2,
        500
    );

    ctx.lineTo(
        750 - cameraX * 0.2,
        320
    );

    ctx.lineTo(
        1000 - cameraX * 0.2,
        500
    );

    ctx.lineTo(
        canvas.width,
        500
    );

    ctx.closePath();

    ctx.fill();

}


// =========================================
// رسم سکوها
// =========================================

function drawPlatforms() {

    platforms.forEach(platform => {

        const x =
            platform.x - cameraX;

        ctx.fillStyle = "#79502f";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );


        ctx.fillStyle = "#45a843";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            9
        );

    });

}


// =========================================
// رسم سکه‌ها
// =========================================

function drawCoins() {

    coinItems.forEach(coin => {

        if (coin.collected) {
            return;
        }

        const x =
            coin.x - cameraX;

        ctx.beginPath();

        ctx.arc(
            x,
            coin.y,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffd92e";

        ctx.fill();

        ctx.strokeStyle = "#d99a00";

        ctx.lineWidth = 3;

        ctx.stroke();

    });

}


// =========================================
// رسم دشمن‌ها
// =========================================

function drawEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) {
            return;
        }

        const x =
            enemy.x - cameraX;


        // بدن

        ctx.fillStyle = "#7c49c9";

        ctx.beginPath();

        ctx.arc(
            x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // چشم‌ها

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
            x + 13,
            enemy.y + 15,
            5,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 27,
            enemy.y + 15,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

}


// =========================================
// رسم گلوله
// =========================================

function drawBullets() {

    bullets.forEach(bullet => {

        ctx.fillStyle = "#ff5722";

        ctx.beginPath();

        ctx.arc(
            bullet.x - cameraX,
            bullet.y,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

}


// =========================================
// رسم پرچم
// =========================================

function drawFlag() {

    const x =
        flag.x - cameraX;


    ctx.fillStyle = "#5b351e";

    ctx.fillRect(
        x,
        flag.y,
        7,
        flag.height
    );


    ctx.fillStyle = "#e63946";

    ctx.beginPath();

    ctx.moveTo(
        x + 7,
        flag.y
    );

    ctx.lineTo(
        x + 55,
        flag.y + 20
    );

    ctx.lineTo(
        x + 7,
        flag.y + 40
    );

    ctx.closePath();

    ctx.fill();

}


// =========================================
// رسم بازیکن
// =========================================

function drawPlayer() {

    const x =
        player.x - cameraX;

    const y =
        player.y;


    // بدن

    ctx.fillStyle = "#ff6fa8";

    ctx.fillRect(
        x + 8,
        y + 18,
        26,
        32
    );


    // سر

    ctx.fillStyle = "#ffd0a8";

    ctx.beginPath();

    ctx.arc(
        x + 21,
        y + 13,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // مو

    ctx.fillStyle = "#542d20";

    ctx.beginPath();

    ctx.arc(
        x + 21,
        y + 7,
        14,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // پاها

    ctx.fillStyle = "#304f9e";

    ctx.fillRect(
        x + 7,
        y + 46,
        11,
        9
    );

    ctx.fillRect(
        x + 24,
        y + 46,
        11,
        9
    );


    // چشم

    ctx.fillStyle = "#222";

    ctx.beginPath();

    ctx.arc(
        x + 26,
        y + 13,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// =========================================
// حلقه اصلی بازی
// =========================================

function gameLoop() {

    if (!gameRunning) {
        return;
    }


    if (!paused) {

        updatePlayer();

        updateEnemies();

        updateBullets();

        updateCoins();

        checkEnemyCollision();

        checkFlag();

        updateCamera();

    }


    // رسم

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBackground();

    drawPlatforms();

    drawCoins();

    drawEnemies();

    drawBullets();

    drawFlag();

    drawPlayer();


    animationId =
        requestAnimationFrame(gameLoop);

}


// =========================================
// توقف بازی
// =========================================

document.getElementById("pauseBtn")
    .addEventListener("click", () => {

        if (!gameRunning) {
            return;
        }

        paused = true;

        showScreen("pauseMenu");

    });


// =========================================
// ادامه بازی
// =========================================

document.getElementById("resumeBtn")
    .addEventListener("click", () => {

        paused = false;

        showScreen("gameScreen");

        gameLoop();

    });


// =========================================
// شروع دوباره
// =========================================

document.getElementById("restartBtn")
    .addEventListener("click", () => {

        startGame();

    });


document.getElementById("retryBtn")
    .addEventListener("click", () => {

        startGame();

    });


// =========================================
// مرحله بعد
// =========================================

document.getElementById("nextLevelBtn")
    .addEventListener("click", () => {

        if (currentLevel < 10) {

            currentLevel++;

            startGame();

        } else {

            showScreen("worldCompleteMenu");

        }

    });


// =========================================
// جهان بعدی
// =========================================

document.getElementById("nextWorldBtn")
    .addEventListener("click", () => {

        if (currentWorld < 4) {

            currentWorld++;

            currentLevel = 1;

            createLevelButtons();

            showScreen("levelMenu");

        }

    });


// =========================================
// جلوگیری از اسکرول هنگام لمس بازی
// =========================================

document.addEventListener(
    "touchmove",
    event => {

        if (
            event.target.closest(
                "#gameControls"
            )
        ) {

            event.preventDefault();

        }

    },
    {
        passive: false
    }
);


// =========================================
// شروع اولیه
// =========================================

createLevelButtons();

updateHUD();

showScreen("mainMenu");
  
