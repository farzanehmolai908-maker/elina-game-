// ======================================================
// 🎮 بازی ماجراجویی الینا
// ======================================================

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");


let W =
    window.innerWidth;

let H =
    window.innerHeight;


canvas.width = W;
canvas.height = H;


// ======================================================
// وضعیت
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

let unlockedLevel = 1;


// ======================================================
// دنیاها
// ======================================================

const worlds = [

    {
        name: "جنگل",
        sky: "#72c9ee",
        ground: "#684329",
        top: "#42a854",
        enemies: [
            "snail",
            "turtle",
            "cabbage"
        ]
    },

    {
        name: "برفی",
        sky: "#b9e7fa",
        ground: "#b9d3df",
        top: "#ffffff",
        enemies: [
            "penguin",
            "sheep",
            "snowball"
        ]
    },

    {
        name: "آبی",
        sky: "#126da8",
        ground: "#154c70",
        top: "#31b9df",
        enemies: [
            "fish",
            "bubble"
        ]
    },

    {
        name: "آتشی",
        sky: "#641a12",
        ground: "#381816",
        top: "#ff6a00",
        enemies: [
            "fire",
            "lava"
        ]
    }

];


// ======================================================
// بازیکن
// ======================================================

const player = {

    x: 100,

    y: 200,

    w: 38,

    h: 70,

    vx: 0,

    vy: 0,

    speed: 4.5,

    jumpPower: 12,

    grounded: false,

    invincible: 0

};


// ======================================================
// داده‌های مرحله
// ======================================================

let levelWidth = 4000;

let platforms = [];

let coinItems = [];

let ammoItems = [];

let heartItems = [];

let enemies = [];

let bullets = [];

let boss = null;


const flag = {

    x: 3800,

    y: 300,

    w: 30,

    h: 130

};


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

    player.y = H - 300;

    player.vx = 0;

    player.vy = 0;


    levelWidth =
        4000 +
        (level - 1) * 180;


    // زمین

    platforms.push({

        x: 0,

        y: H - 80,

        w: levelWidth,

        h: 80

    });


    // سکوها

    for (
        let i = 0;
        i < 23;
        i++
    ) {

        const x =
            280 + i * 165;


        // هر چند مرحله چالش متفاوت

        let y;

        if (level <= 3) {

            y =
                H - 190 -
                (i % 3) * 55;

        } else if (level <= 6) {

            y =
                H - 180 -
                (i % 4) * 75;

        } else {

            y =
                H - 180 -
                (i % 5) * 85;
        }


        if (y < 130) {

            y = 130;
        }


        const width =
            level >= 8
                ? 90
                : 120;


        platforms.push({

            x: x,

            y: y,

            w: width,

            h: 25

        });


        // سکه

        coinItems.push({

            x:
                x + width / 2,

            y:
                y - 35,

            collected: false

        });


        // قلب

        if (i % 6 === 0) {

            heartItems.push({

                x:
                    x + 30,

                y:
                    y - 80,

                collected: false

            });

        }


        // مهمات

        if (i % 7 === 0) {

            ammoItems.push({

                x:
                    x + 70,

                y:
                    y - 65,

                collected: false

            });

        }


        // دشمن

        if (i > 1) {

            enemies.push({

                x:
                    x + 15,

                y:
                    y - 48,

                w: 45,

                h: 45,

                vx:
                    i % 2 === 0
                        ? 1
                        : -1,

                type:
                    worlds[world].enemies[
                        i %
                        worlds[world].enemies.length
                    ],

                alive: true,

                minX: x,

                maxX:
                    x + width - 20

            });

        }

    }


    // باس مرحله 10

    if (level === 10) {

        boss = {

            x:
                levelWidth - 600,

            y:
                H - 310,

            w: 150,

            h: 150,

            health: 15,

            maxHealth: 15,

            vx: 1.5,

            alive: true

        };

    }


    flag.x =
        levelWidth - 170;

    flag.y =
        H - 210;

}


// ======================================================
// تغییر اندازه
// ======================================================

window.addEventListener(
    "resize",
    () => {

        W =
            window.innerWidth;

        H =
            window.innerHeight;

        canvas.width = W;

        canvas.height = H;

    }
);


// ======================================================
// کیبورد
// ======================================================

const keys = {

    left: false,

    right: false

};


document.addEventListener(
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


document.addEventListener(
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


// ======================================================
// دکمه‌های داخل صفحه
// ======================================================

function setupHoldButton(
    id,
    key
) {

    const button =
        document.getElementById(id);

    if (!button) return;


    button.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            keys[key] = true;

            try {
                button.setPointerCapture(
                    e.pointerId
                );
            } catch (_) {}

        }
    );


    button.addEventListener(
        "pointerup",
        e => {

            e.preventDefault();

            keys[key] = false;

        }
    );


    button.addEventListener(
        "pointercancel",
        () => {

            keys[key] = false;

        }
    );


    button.addEventListener(
        "pointerleave",
        () => {

            keys[key] = false;

        }
    );

}


setupHoldButton(
    "left",
    "left"
);


setupHoldButton(
    "right",
    "right"
);


const jumpButton =
    document.getElementById(
        "jump"
    );


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
    document.getElementById(
        "shoot"
    );


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

        player.vy =
            -player.jumpPower;

        player.grounded =
            false;

    }

}


// ======================================================
// تیر
// ======================================================

function shoot() {

    if (!gameRunning) return;


    if (ammo <= 0) {

        showMessage(
            "🔫 تیرت تمام شده!"
        );

        return;
    }


    ammo--;


    bullets.push({

        x:
            player.x + player.w,

        y:
            player.y + 30,

        w: 18,

        h: 7,

        vx: 11

    });


    updateHUD();

}


// ======================================================
// بازیکن
// ======================================================

function updatePlayer() {

    if (!gameRunning) return;


    if (keys.left) {

        player.vx =
            -player.speed;

    } else if (keys.right) {

        player.vx =
            player.speed;

    } else {

        player.vx *= .82;

    }


    player.x +=
        player.vx;


    player.vy += .55;

    player.y +=
        player.vy;


    player.grounded =
        false;


    for (const p of platforms) {

        if (

            player.x + player.w >
                p.x &&

            player.x <
                p.x + p.w &&

            player.y + player.h >=
                p.y &&

            player.y + player.h <=
                p.y + p.h + 18 &&

            player.vy >= 0

        ) {

            player.y =
                p.y - player.h;

            player.vy = 0;

            player.grounded =
                true;

        }

    }


    if (player.x < 0) {

        player.x = 0;

    }


    if (
        player.x >
        levelWidth - player.w
    ) {

        player.x =
            levelWidth -
            player.w;

    }


    if (
        player.y >
        H + 200
    ) {

        loseLife();

    }


    if (
        player.invincible > 0
    ) {

        player.invincible--;

    }

}


// ======================================================
// دشمن
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


        if (

            player.x + player.w >
                e.x &&

            player.x <
                e.x + e.w &&

            player.y + player.h >
                e.y &&

            player.y <
                e.y + e.h

        ) {

            damagePlayer();

        }

    }

}


// ======================================================
// باس
// ======================================================

function updateBoss() {

    if (
        !boss ||
        !boss.alive
    ) return;


    boss.x +=
        boss.vx;


    if (
        boss.x <
        levelWidth - 950
    ) {

        boss.vx =
            Math.abs(
                boss.vx
            );

    }


    if (
        boss.x >
        levelWidth - 300
    ) {

        boss.vx =
            -Math.abs(
                boss.vx
            );

    }


    if (

        player.x + player.w >
            boss.x &&

        player.x <
            boss.x + boss.w &&

        player.y + player.h >
            boss.y &&

        player.y <
            boss.y + boss.h

    ) {

        damagePlayer();

    }

}


// ======================================================
// آسیب
// ======================================================

function damagePlayer() {

    if (
        player.invincible > 0
    ) return;


    if (shield > 0) {

        shield--;

        player.invincible =
            80;

        showMessage(
            "🛡️ سپر از تو محافظت کرد!"
        );

        updateHUD();

        return;

    }


    health--;

    player.invincible =
        100;

    player.vy =
        -7;


    player.x -=
        60;


    updateHUD();


    if (health <= 0) {

        gameOver();

    }

}


function loseLife() {

    health--;

    updateHUD();


    if (health <= 0) {

        gameOver();

        return;
    }


    player.x = 100;

    player.y = H - 300;

    player.vy = 0;

    player.invincible = 120;

}


// ======================================================
// آیتم‌ها
// ======================================================

function updateItems() {

    // سکه

    for (
        const c of coinItems
    ) {

        if (c.collected)
            continue;


        if (

            player.x + player.w >
                c.x - 16 &&

            player.x <
                c.x + 16 &&

            player.y + player.h >
                c.y - 16 &&

            player.y <
                c.y + 16

        ) {

            c.collected =
                true;

            coins++;


            if (
                coins % 60 === 0
            ) {

                diamonds++;

                showMessage(
                    "💎 یک الماس گرفتی!"
                );

            }


            updateHUD();

        }

    }


    // تیر

    for (
        const a of ammoItems
    ) {

        if (a.collected)
            continue;


        if (

            player.x + player.w >
                a.x &&

            player.x <
                a.x + 35 &&

            player.y + player.h >
                a.y &&

            player.y <
                a.y + 35

        ) {

            a.collected =
                true;


            ammo += 3;


            if (ammo > 7) {

                ammo = 7;

            }


            showMessage(
                "🔫 تیر گرفتی!"
            );


            updateHUD();

        }

    }


    // قلب

    for (
        const h of heartItems
    ) {

        if (h.collected)
            continue;


        if (

            player.x + player.w >
                h.x &&

            player.x <
                h.x + 40 &&

            player.y + player.h >
                h.y &&

            player.y <
                h.y + 50

        ) {

            h.collected =
                true;


            health++;


            if (health > 3) {

                health = 3;

            }


            showMessage(
                "❤️ جان گرفتی!"
            );


            updateHUD();

        }

    }

}


// ======================================================
// گلوله
// ======================================================

function updateBullets() {

    for (
        const b of bullets
    ) {

        b.x +=
            b.vx;

    }


    bullets =
        bullets.filter(
            b =>
                b.x <
                levelWidth + 500
        );


    for (
        const b of bullets
    ) {

        for (
            const e of enemies
        ) {

            if (!e.alive)
                continue;


            if (

                b.x + b.w >
                    e.x &&

                b.x <
                    e.x + e.w &&

                b.y + b.h >
                    e.y &&

                b.y <
                    e.y + e.h

            ) {

                e.alive =
                    false;

                b.x =
                    levelWidth + 100;

            }

        }


        if (

            boss &&
            boss.alive &&

            b.x + b.w >
                boss.x &&

            b.x <
                boss.x +
                boss.w &&

            b.y + b.h >
                boss.y &&

            b.y <
                boss.y +
                boss.h

        ) {

            boss.health--;

            b.x =
                levelWidth + 100;


            if (
                boss.health <= 0
            ) {

                boss.alive =
                    false;

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
        player.x -
        W * .38;


    camera +=
        (target - camera)
        * .08;


    if (camera < 0) {

        camera = 0;

    }


    const maxCamera =
        Math.max(
            0,
            levelWidth - W
        );


    if (
        camera >
        maxCamera
    ) {

        camera =
            maxCamera;

    }

}


// ======================================================
// پس‌زمینه
// ======================================================

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


    // کوه‌ها

    ctx.fillStyle =
        "rgba(30,70,80,.30)";


    for (
        let i = -2;
        i < 15;
        i++
    ) {

        const x =
            i * 330 -
            camera * .22;


        ctx.beginPath();

        ctx.moveTo(
            x,
            H - 80
        );

        ctx.lineTo(
            x + 165,
            H - 330
        );

        ctx.lineTo(
            x + 330,
            H - 80
        );

        ctx.closePath();

        ctx.fill();

    }


    // برف

    if (world === 1) {

        ctx.fillStyle =
            "rgba(255,255,255,.8)";


        for (
            let i = 0;
            i < 90;
            i++
        ) {

            let x =
                (
                    i * 137 -
                    camera * .15
                ) % W;


            if (x < 0)
                x += W;


            const y =
                (
                    i * 67
                ) % H;


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
            "rgba(255,255,255,.25)";

        ctx.lineWidth = 3;


        for (
            let y = 90;
            y < H;
            y += 65
        ) {

            ctx.beginPath();

            ctx.moveTo(
                0,
                y
            );

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

        for (
            let i = 0;
            i < 35;
            i++
        ) {

            const x =
                (
                    i * 93 -
                    camera * .1
                ) % W;


            const y =
                70 +
                (
                    i * 41
                ) % 350;


            ctx.fillStyle =
                "rgba(255,140,0,.22)";


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

}


// ======================================================
// سکو
// ======================================================

function drawPlatforms() {

    const wd =
        worlds[world];


    for (
        const p of platforms
    ) {

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

    ctx.fillStyle =
        "#4b2412";


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

    ctx.fillStyle =
        "#ffd0a8";


    ctx.beginPath();

    ctx.arc(
        x + 19,
        y + 22,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // مو روی پیشانی

    ctx.fillStyle =
        "#4b2412";


    ctx.fillRect(
        x + 4,
        y + 2,
        30,
        13
    );


    // چشم

    ctx.fillStyle =
        "#222";


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

    ctx.fillStyle =
        "#ef4f80";


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

    for (
        const c of coinItems
    ) {

        if (c.collected)
            continue;


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
            "#a87500";

        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.fillStyle =
            "#fff4a0";

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

    for (
        const a of ammoItems
    ) {

        if (a.collected)
            continue;


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

    for (
        const h of heartItems
    ) {

        if (h.collected)
            continue;


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


        // سکوی زیر قلب

        ctx.fillStyle =
            "#e0a52c";


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

    for (
        const e of enemies
    ) {

        if (!e.alive)
            continue;


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
            "#55a8dd";


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
            "#287b46";


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
            y + 23,
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
            "#7fcdf0";

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

    if (
        !boss ||
        !boss.alive
    ) return;


    const x =
        boss.x - camera;

    const y =
        boss.y;


    ctx.fillStyle =
        world === 3
            ? "#8f260d"
            : "#5b3c91";


    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        boss.w,
        boss.h,
        30
    );

    ctx.fill();


    // چشم

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
        y + 98,
        70,
        18
    );


    // نوار جان

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
        (
            boss.health /
            boss.maxHealth
        ),
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
        "#573925";


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
        x + 78,
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
// گلوله
// ======================================================

function drawBullets() {

    for (
        const b of bullets
    ) {

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
// رسم
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


    const globalLevel =
        world * 10 +
        level;


    if (
        globalLevel >=
        unlockedLevel
    ) {

        unlockedLevel =
            Math.min(
                40,
                globalLevel + 1
            );

    }


    updateHUD();


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


    showScreen("finish");

}


// ======================================================
// مرحله بعد
// ======================================================

function nextLevel() {

    if (level < 10) {

        level++;

    } else if (world < 3) {

        world++;

        level = 1;

    } else {

        showStoryEnd();

        return;

    }


    health = 3;

    shield = 0;

    ammo = 7;


    createLevel();

    gameRunning = true;

    hideAllScreens();

    updateHUD();

}


// ======================================================
// شروع مرحله
// ======================================================

function startLevel(
    selectedLevel
) {

    const globalLevel =
        world * 10 +
        selectedLevel;


    if (
        globalLevel >
        unlockedLevel
    ) {

        showMessage(
            "🔒 این مرحله هنوز باز نشده!"
        );

        return;

    }


    level =
        selectedLevel;


    health = 3;

    shield = 0;

    ammo = 7;


    createLevel();

    gameRunning = true;

    hideAllScreens();

    updateHUD();

}


// ======================================================
// پایان بازی
// ======================================================

function gameOver() {

    gameRunning = false;

    showScreen(
        "gameover"
    );

}


// ======================================================
// منو
// ======================================================

function showMenu() {

    gameRunning = false;

    hideAllScreens();

    const menu =
        document.getElementById(
            "menu"
        );


    menu.classList.remove(
        "hidden"
    );

}


// ======================================================
// پایان داستان
// ======================================================

function showStoryEnd() {

    gameRunning = false;

    hideAllScreens();


    document
        .getElementById(
            "storyEnd"
        )
        .classList.remove(
            "hidden"
        );

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
        .querySelectorAll(
            ".screen"
        )
        .forEach(
            screen => {

                screen.classList.add(
                    "hidden"
                );

            }
        );


    const hud =
        document.getElementById(
            "hud"
        );


    const controls =
        document.getElementById(
            "controls"
        );


    if (gameRunning) {

        hud.classList.remove(
            "hidden"
        );

        controls.classList.remove(
            "hidden"
        );

    } else {

        hud.classList.add(
            "hidden"
        );

        controls.classList.add(
            "hidden"
        );

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


function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ======================================================
// پیام
// ======================================================

let messageTimer;


function showMessage(
    text
) {

    const message =
        document.getElementById(
            "message"
        );


    if (!message) return;


    message.textContent =
        text;


    message.style.opacity =
        "1";


    clearTimeout(
        messageTimer
    );


    messageTimer =
        setTimeout(
            () => {

                message.style.opacity =
                    "0";

            },
            1800
        );

}


// ======================================================
// نقشه مراحل
// ======================================================

function buildLevelMap() {

    const grid =
        document.getElementById(
            "levelGrid"
        );


    if (!grid) return;


    grid.innerHTML = "";


    for (
        let i = 1;
        i <= 10;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        const globalLevel =
            world * 10 + i;


        button.className =
            "levelBtn";


        if (
            globalLevel >
            unlockedLevel
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
                () => {

                    startLevel(i);

                }
            );

        }


        grid.appendChild(
            button
        );

    }

}


// ======================================================
// تب دنیاها
// ======================================================

document
    .querySelectorAll(".tab")
    .forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".tab"
                        )
                        .forEach(
                            t =>
                                t.classList.remove(
                                    "active"
                                )
                        );


                    tab.classList.add(
                        "active"
                    );


                    world =
                        Number(
                            tab.dataset.world
                        );


                    buildLevelMap();

                }
            );

        }
    );


// ======================================================
// دکمه‌های منو
// ======================================================

document
    .getElementById("startBtn")
    .addEventListener(
        "click",
        () => {

            world = 0;

            startLevel(1);

        }
    );


document
    .getElementById("levelsBtn")
    .addEventListener(
        "click",
        () => {

            buildLevelMap();

            showScreen(
                "levels"
            );

        }
    );


document
    .getElementById("charactersBtn")
    .addEventListener(
        "click",
        () => {

            showScreen(
                "characters"
            );

        }
    );


document
    .getElementById("levelsBackBtn")
    .addEventListener(
        "click",
        showMenu
    );


document
    .getElementById(
        "charactersBackBtn"
    )
    .addEventListener(
        "click",
        showMenu
    );


document
    .getElementById(
        "nextLevelBtn"
    )
    .addEventListener(
        "click",
        nextLevel
    );


document
    .getElementById(
        "finishLevelsBtn"
    )
    .addEventListener(
        "click",
        () => {

            buildLevelMap();

            showScreen(
                "levels"
            );

        }
    );


document
    .getElementById(
        "retryBtn"
    )
    .addEventListener(
        "click",
        () => {

            health = 3;

            shield = 0;

            ammo = 7;

            createLevel();

            gameRunning = true;

            hideAllScreens();

            updateHUD();

        }
    );


document
    .getElementById(
        "gameoverLevelsBtn"
    )
    .addEventListener(
        "click",
        () => {

            buildLevelMap();

            showScreen(
                "levels"
            );

        }
    );


document
    .getElementById(
        "gameoverMenuBtn"
    )
    .addEventListener(
        "click",
        showMenu
    );


document
    .getElementById(
        "storyMenuBtn"
    )
    .addEventListener(
        "click",
        showMenu
    );


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

            player.x +
                player.w >
                flag.x &&

            player.x <
                flag.x +
                flag.w &&

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
// شروع
// ======================================================

createLevel();

buildLevelMap();

updateHUD();

showMenu();

gameLoop();

  
