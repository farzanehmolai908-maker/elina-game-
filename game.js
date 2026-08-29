/* =========================================================
   🍄 قارچ‌خور - ماجراجویی نجات پدر
   نسخه پایه کامل
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =========================================================
   تنظیمات بازی
========================================================= */

const WORLD_NAMES = [
    "🌳 جهان جنگل",
    "❄️ جهان برفی",
    "🌊 جهان آبی",
    "🔥 جهان آتش"
];

const WORLD_EMOJIS = ["🌳", "❄️", "🌊", "🔥"];

let currentWorld = 1;
let currentLevel = 1;

let lives = 3;
let coins = 0;
let score = 0;

let gameRunning = false;
let gamePaused = false;

let animationId = null;

/* =========================================================
   وضعیت مراحل
========================================================= */

let unlockedWorld = Number(
    localStorage.getItem("mushroomUnlockedWorld") || 1
);

let unlockedLevels = JSON.parse(
    localStorage.getItem("mushroomUnlockedLevels") ||
    '{"1":1,"2":0,"3":0,"4":0}'
);

/* =========================================================
   اندازه Canvas
========================================================= */

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height =
        Math.max(300, window.innerHeight - 70);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* =========================================================
   شخصیت
========================================================= */

const player = {
    x: 100,
    y: 100,

    width: 42,
    height: 58,

    vx: 0,
    vy: 0,

    speed: 5,
    jumpPower: 13,

    onGround: false,

    direction: 1,

    shootCooldown: 0,

    invincible: false,
    invincibleTimer: 0
};


/* =========================================================
   کنترل‌ها
========================================================= */

const keys = {
    left: false,
    right: false
};


/* =========================================================
   دنیای بازی
========================================================= */

let platforms = [];
let enemies = [];
let bullets = [];
let coinsObjects = [];

let flag = null;
let boss = null;


/* =========================================================
   تنظیمات جهان
========================================================= */

function getWorldSettings() {

    switch (currentWorld) {

        case 1:
            return {
                sky: "#8bd8ff",
                ground: "#5caf4d",
                platform: "#8b5a2b",
                enemy: "🐌",
                boss: "🐢"
            };

        case 2:
            return {
                sky: "#dff6ff",
                ground: "#d9eef7",
                platform: "#b9dce8",
                enemy: "🐧",
                boss: "🐑"
            };

        case 3:
            return {
                sky: "#43b8d8",
                ground: "#217fa0",
                platform: "#12627e",
                enemy: "🐟",
                boss: "🦈"
            };

        case 4:
            return {
                sky: "#ff704d",
                ground: "#7c2d12",
                platform: "#4b1d0d",
                enemy: "💣",
                boss: "👹"
            };

        default:
            return {
                sky: "#8bd8ff",
                ground: "#5caf4d",
                platform: "#8b5a2b",
                enemy: "🐌",
                boss: "🐢"
            };
    }
}


/* =========================================================
   ساخت مرحله
========================================================= */

function createLevel() {

    platforms = [];
    enemies = [];
    bullets = [];
    coinsObjects = [];

    flag = null;
    boss = null;

    player.x = 100;
    player.y = canvas.height - 200;

    player.vx = 0;
    player.vy = 0;

    player.invincible = false;

    /*
       زمین اصلی
    */

    platforms.push({
        x: 0,
        y: canvas.height - 70,
        width: canvas.width,
        height: 70
    });

    /*
       سکوهای مرحله
    */

    const baseY = canvas.height - 180;

    platforms.push({
        x: 180,
        y: baseY,
        width: 150,
        height: 25
    });

    platforms.push({
        x: 420,
        y: baseY - 70,
        width: 150,
        height: 25
    });

    platforms.push({
        x: 680,
        y: baseY,
        width: 160,
        height: 25
    });

    platforms.push({
        x: 930,
        y: baseY - 80,
        width: 150,
        height: 25
    });

    platforms.push({
        x: 1200,
        y: baseY,
        width: 170,
        height: 25
    });


    /*
       سکه‌ها
    */

    const coinPositions = [
        [220, baseY - 55],
        [270, baseY - 55],
        [470, baseY - 125],
        [730, baseY - 55],
        [980, baseY - 135],
        [1260, baseY - 55]
    ];

    coinPositions.forEach(pos => {

        coinsObjects.push({
            x: pos[0],
            y: pos[1],
            size: 18,
            collected: false
        });

    });


    /*
       دشمن‌ها
    */

    const enemyPositions = [
        [350, canvas.height - 125],
        [610, canvas.height - 125],
        [850, canvas.height - 125],
        [1100, canvas.height - 125]
    ];

    enemyPositions.forEach(pos => {

        enemies.push({
            x: pos[0],
            y: pos[1],
            width: 40,
            height: 40,

            vx: 1.2,

            alive: true
        });

    });


    /*
       پرچم پایان
    */

    flag = {
        x: 1450,
        y: canvas.height - 250,
        width: 45,
        height: 180
    };


    /*
       باس مرحله دهم
    */

    if (currentLevel === 10) {

        boss = {
            x: 1550,
            y: canvas.height - 160,

            width: 90,
            height: 90,

            health: 5,
            maxHealth: 5,

            vx: 1.5,

            alive: true
        };

    }

}


/* =========================================================
   شروع مرحله
========================================================= */

function startLevel(world, level) {

    currentWorld = world;
    currentLevel = level;

    lives = 3;
    coins = 0;

    /*
       امتیاز از مرحله قبلی حفظ می‌شود.
    */

    createLevel();

    updateHUD();

    showScreen("gameScreen");

    gameRunning = true;
    gamePaused = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    gameLoop();
}


/* =========================================================
   منوی صفحه‌ها
========================================================= */

function showScreen(id) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(id);

    if (target) {
        target.classList.add("active");
    }
}


/* =========================================================
   صفحه انتخاب مرحله
========================================================= */

function openLevelMenu(world) {

    currentWorld = world;

    document.getElementById("levelTitle").textContent =
        `${WORLD_EMOJIS[world - 1]} مراحل ${WORLD_NAMES[world - 1].replace(WORLD_EMOJIS[world - 1], "")}`;

    const grid = document.getElementById("levelGrid");

    grid.innerHTML = "";

    const unlocked = Number(unlockedLevels[world] || 0);

    for (let i = 1; i <= 10; i++) {

        const button = document.createElement("button");

        button.className = "level-button";

        if (i <= unlocked) {

            button.textContent = i;

            button.addEventListener("click", () => {

                startLevel(world, i);

            });

        } else {

            button.textContent = "🔒";

            button.classList.add("locked");

        }

        grid.appendChild(button);
    }

    showScreen("levelMenu");
}


/* =========================================================
   انتخاب جهان
========================================================= */

document.querySelectorAll(".world-card").forEach(card => {

    card.addEventListener("click", () => {

        const world = Number(card.dataset.world);

        if (world > unlockedWorld) {

            alert("🔒 این جهان هنوز باز نشده است!");

            return;
        }

        openLevelMenu(world);

    });

});


/* =========================================================
   دکمه شروع بازی
========================================================= */

document
    .getElementById("startGameBtn")
    .addEventListener("click", () => {

        const level =
            Number(unlockedLevels[unlockedWorld] || 1);

        startLevel(
            unlockedWorld,
            level
        );

    });


/* =========================================================
   انتخاب جهان
========================================================= */

document
    .getElementById("worldSelectBtn")
    .addEventListener("click", () => {

        showScreen("worldMenu");

    });


/* =========================================================
   راهنما
========================================================= */

document
    .getElementById("guideBtn")
    .addEventListener("click", () => {

        showScreen("guideMenu");

    });


/* =========================================================
   دکمه‌های بازگشت
========================================================= */

document.querySelectorAll("[data-back]").forEach(button => {

    button.addEventListener("click", () => {

        const target = button.dataset.back;

        /*
           اگر از منوی توقف برگشتیم،
           بازی متوقف می‌ماند.
        */

        if (target === "mainMenu") {

            gameRunning = false;
            gamePaused = false;

        }

        showScreen(target);

    });

});


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    document.getElementById("lives").textContent = lives;

    document.getElementById("coins").textContent = coins;

    document.getElementById("score").textContent = score;

    document.getElementById("currentWorld").textContent =
        currentWorld;

    document.getElementById("currentLevel").textContent =
        currentLevel;

}


/* =========================================================
   حرکت بازیکن
========================================================= */

function updatePlayer() {

    if (keys.left) {

        player.vx = -player.speed;

        player.direction = -1;

    } else if (keys.right) {

        player.vx = player.speed;

        player.direction = 1;

    } else {

        player.vx *= 0.8;

    }

    player.x += player.vx;


    /*
       گرانش
    */

    player.vy += 0.6;

    player.y += player.vy;

    player.onGround = false;


    /*
       برخورد با سکوها
    */

    platforms.forEach(platform => {

        if (

            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <=
                platform.y + platform.height + 15 &&
            player.vy >= 0

        ) {

            player.y =
                platform.y - player.height;

            player.vy = 0;

            player.onGround = true;

        }

    });


    /*
       افتادن از پایین صفحه
    */

    if (player.y > canvas.height + 100) {

        loseLife();

    }


    /*
       محدود کردن سمت چپ
    */

    if (player.x < 0) {

        player.x = 0;

    }


    /*
       کاهش زمان آسیب‌ناپذیری
    */

    if (player.invincible) {

        player.invincibleTimer--;

        if (player.invincibleTimer <= 0) {

            player.invincible = false;

        }

    }


    if (player.shootCooldown > 0) {

        player.shootCooldown--;

    }

}


/* =========================================================
   پرش
========================================================= */

function jump() {

    if (!gameRunning || gamePaused) {
        return;
    }

    if (player.onGround) {

        player.vy = -player.jumpPower;

    }

}


/* =========================================================
   شلیک
========================================================= */

function shoot() {

    if (!gameRunning || gamePaused) {
        return;
    }

    if (player.shootCooldown > 0) {
        return;
    }

    bullets.push({

        x:
            player.direction === 1
                ? player.x + player.width
                : player.x,

        y:
            player.y + player.height / 2,

        width: 16,
        height: 8,

        vx:
            player.direction * 9

    });

    player.shootCooldown = 15;

}


/* =========================================================
   گلوله‌ها
========================================================= */

function updateBullets() {

    bullets.forEach(bullet => {

        bullet.x += bullet.vx;

    });


    /*
       برخورد گلوله با دشمن
    */

    bullets.forEach(bullet => {

        enemies.forEach(enemy => {

            if (!enemy.alive) {
                return;
            }

            if (isColliding(bullet, enemy)) {

                enemy.alive = false;

                score += 100;

            }

        });


        /*
           برخورد گلوله با باس
        */

        if (
            boss &&
            boss.alive &&
            isColliding(bullet, boss)
        ) {

            boss.health--;

            score += 50;

            if (boss.health <= 0) {

                boss.alive = false;

                score += 1000;

            }

        }

    });


    bullets = bullets.filter(
        bullet =>
            bullet.x > -100 &&
            bullet.x < 2500
    );

}


/* =========================================================
   دشمن‌ها
========================================================= */

function updateEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) {
            return;
        }

        enemy.x += enemy.vx;

        /*
           رفت و برگشت دشمن
        */

        if (
            enemy.x < 50 ||
            enemy.x > 1400
        ) {

            enemy.vx *= -1;

        }


        /*
           برخورد دشمن با بازیکن
        */

        if (
            isColliding(player, enemy) &&
            !player.invincible
        ) {

            loseLife();

        }

    });


    /*
       باس
    */

    if (boss && boss.alive) {

        boss.x += boss.vx;

        if (
            boss.x < 1350 ||
            boss.x > 1700
        ) {

            boss.vx *= -1;

        }


        if (
            isColliding(player, boss) &&
            !player.invincible
        ) {

            loseLife();

        }

    }

}


/* =========================================================
   سکه‌ها
========================================================= */

function updateCoins() {

    coinsObjects.forEach(coin => {

        if (coin.collected) {
            return;
        }

        const coinBox = {

            x: coin.x,
            y: coin.y,

            width: coin.size,
            height: coin.size

        };

        if (
            isColliding(player, coinBox)
        ) {

            coin.collected = true;

            coins++;

            score += 50;

            updateHUD();

        }

    });

}


/* =========================================================
   برخورد
========================================================= */

function isColliding(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );

}


/* =========================================================
   جان کم کردن
========================================================= */

function loseLife() {

    if (player.invincible) {
        return;
    }

    lives--;

    updateHUD();

    if (lives <= 0) {

        gameOver();

        return;

    }

    /*
       بازگرداندن بازیکن به ابتدای مرحله
    */

    player.x = 100;

    player.y = canvas.height - 200;

    player.vx = 0;
    player.vy = 0;

    player.invincible = true;

    player.invincibleTimer = 120;

}


/* =========================================================
   بررسی پایان مرحله
========================================================= */

function checkLevelComplete() {

    if (!flag) {
        return;
    }


    /*
       مرحله دهم:
       اول باید باس شکست بخورد.
    */

    if (currentLevel === 10) {

        if (!boss || boss.alive) {
            return;
        }

    }


    if (
        player.x + player.width >
        flag.x
    ) {

        completeLevel();

    }

}


/* =========================================================
   پایان مرحله
========================================================= */

function completeLevel() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    score += 500;

    updateHUD();

    /*
       باز کردن مرحله بعد
    */

    if (currentLevel < 10) {

        if (
            Number(unlockedLevels[currentWorld] || 0)
            < currentLevel + 1
        ) {

            unlockedLevels[currentWorld] =
                currentLevel + 1;

        }

    } else {

        /*
           پایان جهان
        */

        if (currentWorld < 4) {

            unlockedWorld =
                Math.max(
                    unlockedWorld,
                    currentWorld + 1
                );

            unlockedLevels[currentWorld + 1] = 1;

        }

    }


    saveProgress();


    /*
       نمایش صفحه مناسب
    */

    if (currentLevel === 10) {

        document.getElementById(
            "completeScore"
        ).textContent = score;

        document.getElementById(
            "completeCoins"
        ).textContent = coins;

        showScreen("worldCompleteMenu");

    } else {

        document.getElementById(
            "completeScore"
        ).textContent = score;

        document.getElementById(
            "completeCoins"
        ).textContent = coins;

        showScreen("levelCompleteMenu");

    }

}


/* =========================================================
   ذخیره پیشرفت
========================================================= */

function saveProgress() {

    localStorage.setItem(
        "mushroomUnlockedWorld",
        unlockedWorld
    );

    localStorage.setItem(
        "mushroomUnlockedLevels",
        JSON.stringify(unlockedLevels)
    );

}


/* =========================================================
   مرحله بعد
========================================================= */

document
    .getElementById("nextLevelBtn")
    .addEventListener("click", () => {

        startLevel(
            currentWorld,
            currentLevel + 1
        );

    });


/* =========================================================
   جهان بعدی
========================================================= */

document
    .getElementById("nextWorldBtn")
    .addEventListener("click", () => {

        if (currentWorld < 4) {

            currentWorld++;

            openLevelMenu(currentWorld);

        } else {

            showScreen("mainMenu");

        }

    });


/* =========================================================
   Game Over
========================================================= */

function gameOver() {

    gameRunning = false;

    document.getElementById(
        "finalScore"
    ).textContent = score;

    showScreen("gameOverMenu");

}


/* =========================================================
   دوباره بازی کردن
========================================================= */

document
    .getElementById("retryBtn")
    .addEventListener("click", () => {

        startLevel(
            currentWorld,
            currentLevel
        );

    });


/* =========================================================
   توقف بازی
========================================================= */

document
    .getElementById("pauseBtn")
    .addEventListener("click", () => {

        if (!gameRunning) {
            return;
        }

        gamePaused = true;

        showScreen("pauseMenu");

    });


/* =========================================================
   ادامه بازی
========================================================= */

document
    .getElementById("resumeBtn")
    .addEventListener("click", () => {

        gamePaused = false;

        showScreen("gameScreen");

        gameLoop();

    });


/* =========================================================
   شروع دوباره
========================================================= */

document
    .getElementById("restartBtn")
    .addEventListener("click", () => {

        startLevel(
            currentWorld,
            currentLevel
        );

    });


/* =========================================================
   کنترل کیبورد
========================================================= */

window.addEventListener("keydown", event => {

    if (event.key === "ArrowLeft" || event.key === "a") {

        keys.left = true;

    }

    if (event.key === "ArrowRight" || event.key === "d") {

        keys.right = true;

    }

    if (
        event.key === "ArrowUp" ||
        event.key === " " ||
        event.key === "w"
    ) {

        jump();

    }

    if (event.key === "f") {

        shoot();

    }

});


window.addEventListener("keyup", event => {

    if (
        event.key === "ArrowLeft" ||
        event.key === "a"
    ) {

        keys.left = false;

    }

    if (
        event.key === "ArrowRight" ||
        event.key === "d"
    ) {

        keys.right = false;

    }

});


/* =========================================================
   کنترل لمسی
========================================================= */

function setupTouchButton(
    elementId,
    onStart,
    onEnd
) {

    const button =
        document.getElementById(elementId);

    if (!button) {
        return;
    }


    button.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            onStart();

        },
        { passive: false }
    );


    button.addEventListener(
        "touchend",
        event => {

            event.preventDefault();

            onEnd();

        },
        { passive: false }
    );


    /*
       برای تست روی بعضی مرورگرها
    */

    button.addEventListener(
        "mousedown",
        event => {

            event.preventDefault();

            onStart();

        }
    );


    button.addEventListener(
        "mouseup",
        event => {

            event.preventDefault();

            onEnd();

        }
    );

}


setupTouchButton(
    "leftBtn",

    () => {
        keys.left = true;
    },

    () => {
        keys.left = false;
    }
);


setupTouchButton(
    "rightBtn",

    () => {
        keys.right = true;
    },

    () => {
        keys.right = false;
    }
);


setupTouchButton(
    "jumpBtn",

    () => {
        jump();
    },

    () => {}
);


setupTouchButton(
    "shootBtn",

    () => {
        shoot();
    },

    () => {}
);


/* =========================================================
   دوربین
========================================================= */

let cameraX = 0;

function updateCamera() {

    cameraX =
        player.x -
        canvas.width * 0.35;

    if (cameraX < 0) {
        cameraX = 0;
    }

}


/* =========================================================
   رسم پس‌زمینه
========================================================= */

function drawBackground() {

    const settings =
        getWorldSettings();

    ctx.fillStyle = settings.sky;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       خورشید
    */

    if (currentWorld !== 4) {

        ctx.font = "70px Arial";

        ctx.fillText(
            "☀️",
            40,
            100
        );

    }


    /*
       ابرها
    */

    ctx.font = "55px Arial";

    ctx.fillText(
        "☁️",
        250 - cameraX * 0.2,
        110
    );

    ctx.fillText(
        "☁️",
        650 - cameraX * 0.2,
        160
    );

    ctx.fillText(
        "☁️",
        1050 - cameraX * 0.2,
        90
    );


    /*
       زمین
    */

    ctx.fillStyle =
        settings.ground;

    ctx.fillRect(
        -cameraX,
        canvas.height - 70,
        2500,
        70
    );

}


/* =========================================================
   رسم سکوها
========================================================= */

function drawPlatforms() {

    const settings =
        getWorldSettings();

    platforms.forEach(platform => {

        ctx.fillStyle =
            settings.platform;

        ctx.fillRect(
            platform.x - cameraX,
            platform.y,
            platform.width,
            platform.height
        );

        /*
           علف روی سکو
        */

        ctx.fillStyle =
            settings.ground;

        ctx.fillRect(
            platform.x - cameraX,
            platform.y - 6,
            platform.width,
            7
        );

    });

}


/* =========================================================
   رسم بازیکن
========================================================= */

function drawPlayer() {

    /*
       چشمک هنگام آسیب‌ناپذیری
    */

    if (
        player.invincible &&
        Math.floor(
            player.invincibleTimer / 8
        ) % 2 === 0
    ) {

        return;

    }


    const x =
        player.x - cameraX;

    const y =
        player.y;


    /*
       بدن
    */

    ctx.font = "50px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "👧",
        x + player.width / 2,
        y + 48
    );


    ctx.textAlign = "start";

}


/* =========================================================
   رسم دشمن‌ها
========================================================= */

function drawEnemies() {

    const settings =
        getWorldSettings();

    enemies.forEach(enemy => {

        if (!enemy.alive) {
            return;
        }

        ctx.font = "42px Arial";

        ctx.fillText(
            settings.enemy,
            enemy.x - cameraX,
            enemy.y + 38
        );

    });

}


/* =========================================================
   رسم سکه‌ها
========================================================= */

function drawCoins() {

    coinsObjects.forEach(coin => {

        if (coin.collected) {
            return;
        }

        ctx.font = "25px Arial";

        ctx.fillText(
            "🪙",
            coin.x - cameraX,
            coin.y + 25
        );

    });

}


/* =========================================================
   رسم گلوله‌ها
========================================================= */

function drawBullets() {

    bullets.forEach(bullet => {

        ctx.fillStyle = "#ffdd00";

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


/* =========================================================
   رسم پرچم
========================================================= */

function drawFlag() {

    if (!flag) {
        return;
    }

    const x =
        flag.x - cameraX;


    /*
       میله
    */

    ctx.fillStyle = "#555";

    ctx.fillRect(
        x,
        flag.y,
        7,
        flag.height
    );


    /*
       پرچم
    */

    ctx.font = "45px Arial";

    ctx.fillText(
        "🚩",
        x - 5,
        flag.y + 40
    );

}


/* =========================================================
   رسم باس
========================================================= */

function drawBoss() {

    if (!boss || !boss.alive) {
        return;
    }

    const settings =
        getWorldSettings();

    ctx.font = "85px Arial";

    ctx.fillText(
        settings.boss,
        boss.x - cameraX,
        boss.y + 75
    );


    /*
       نوار سلامتی باس
    */

    const barWidth = 100;

    const healthPercent =
        boss.health /
        boss.maxHealth;

    ctx.fillStyle = "#222";

    ctx.fillRect(
        boss.x - cameraX,
        boss.y - 20,
        barWidth,
        10
    );

    ctx.fillStyle = "#e53935";

    ctx.fillRect(
        boss.x - cameraX,
        boss.y - 20,
        barWidth * healthPercent,
        10
    );

}


/* =========================================================
   حلقه اصلی بازی
========================================================= */

function gameLoop() {

    if (!gameRunning || gamePaused) {
        return;
    }


    updatePlayer();

    updateBullets();

    updateEnemies();

    updateCoins();

    checkLevelComplete();

    updateCamera();


    /*
       پاک کردن صفحه
    */

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       رسم
    */

    drawBackground();

    drawPlatforms();

    drawCoins();

    drawEnemies();

    drawBullets();

    drawFlag();

    drawBoss();

    drawPlayer();


    updateHUD();


    animationId =
        requestAnimationFrame(gameLoop);

}


/* =========================================================
   شروع اولیه
========================================================= */

showScreen("mainMenu");

updateHUD();
  
