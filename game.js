const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W = innerWidth;
let H = innerHeight;
let dpr = Math.min(devicePixelRatio || 1, 2);

function resize() {
    W = innerWidth;
    H = innerHeight;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

addEventListener("resize", resize);
resize();

/* =========================
   دنیاهای بازی
========================= */

const worlds = [
    {
        name: "جنگل",
        sky1: "#72c8ef",
        sky2: "#dff7ff",
        ground: "#684b32",
        top: "#72b83f",
        enemies: ["snail", "turtle", "cabbage"]
    },
    {
        name: "برفی",
        sky1: "#6aa9d8",
        sky2: "#eefaff",
        ground: "#718696",
        top: "#ffffff",
        enemies: ["penguin", "sheep", "snowball"]
    },
    {
        name: "آبی",
        sky1: "#0877a8",
        sky2: "#7de8f4",
        ground: "#397d83",
        top: "#70ddd7",
        enemies: ["fish", "bubble", "crab"]
    },
    {
        name: "آتشی",
        sky1: "#35121a",
        sky2: "#f15a24",
        ground: "#55302a",
        top: "#ff9a30",
        enemies: ["fire", "lava", "bomb"]
    }
];

/* =========================
   ذخیره بازی
========================= */

let save = JSON.parse(
    localStorage.getItem("elinaGameSave") ||
    '{"coins":0,"gems":0,"lives":3,"unlocked":1,"char":0,"owned":[0]}'
);

function saveGame() {
    localStorage.setItem(
        "elinaGameSave",
        JSON.stringify(save)
    );
}

/* =========================
   متغیرهای بازی
========================= */

let world = 0;
let level = 1;

let camera = 0;
let running = false;
let treasureMode = false;

let player;
let platforms = [];
let coins = [];
let ammoItems = [];
let hearts = [];
let enemies = [];
let shots = [];

let goalX = 0;

const keys = {
    left: false,
    right: false
};

/* =========================
   ابزارها
========================= */

function get(id) {
    return document.getElementById(id);
}

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.add("hidden");
        });

    if (id) {
        get(id).classList.remove("hidden");
    }
}

function updateHUD() {

    get("lives").textContent = save.lives;
    get("coins").textContent = save.coins;
    get("gems").textContent = save.gems;

    if (player) {
        get("ammo").textContent = player.ammo;
    }

    get("stage").textContent =
        `${world + 1}-${level}`;
}

function message(text) {

    const box = get("message");

    box.textContent = text;
    box.style.opacity = "1";

    clearTimeout(message.timer);

    message.timer = setTimeout(() => {
        box.style.opacity = "0";
    }, 1500);
}

/* =========================
   تبدیل سکه به الماس
========================= */

function checkGems() {

    while (save.coins >= 60) {

        save.coins -= 60;
        save.gems++;

        message("💎 یک الماس گرفتی!");
    }

    saveGame();
}

/* =========================
   ساخت مرحله
========================= */

function createLevel() {

    platforms = [];
    coins = [];
    ammoItems = [];
    hearts = [];
    enemies = [];
    shots = [];

    const length =
        3500 +
        level * 230 +
        world * 400;

    goalX = length - 180;

    /* زمین شروع */

    platforms.push({
        x: 0,
        y: H - 120,
        w: 650,
        h: 120
    });

    let x = 600;

    while (x < length - 300) {

        const gap =
            80 +
            Math.random() * 120;

        const width =
            150 +
            Math.random() * 220;

        let y =
            H -
            180 -
            Math.random() * 170;

        if (level >= 5) {
            y -= Math.random() * 100;
        }

        y = Math.max(
            180,
            Math.min(H - 140, y)
        );

        const platform = {
            x: x + gap,
            y: y,
            w: width,
            h: 32
        };

        platforms.push(platform);

        /* سکه */

        if (Math.random() < 0.75) {

            coins.push({
                x: platform.x + platform.w / 2,
                y: platform.y - 50,
                got: false
            });
        }

        /* جان */

        if (Math.random() < 0.20) {

            hearts.push({
                x: platform.x + platform.w * 0.7,
                y: platform.y - 75,
                got: false
            });
        }

        /* تیر */

        if (Math.random() < 0.30) {

            ammoItems.push({
                x: platform.x + platform.w * 0.25,
                y: platform.y - 45,
                got: false
            });
        }

        /* دشمن */

        if (Math.random() < 0.65) {

            enemies.push({
                x: platform.x + platform.w * 0.65,
                y: platform.y - 48,

                type:
                    worlds[world].enemies[
                        Math.floor(
                            Math.random() *
                            worlds[world].enemies.length
                        )
                    ],

                alive: true,

                vx:
                    (Math.random() < 0.5 ? -1 : 1) *
                    (0.5 + level * 0.04)
            });
        }

        x += gap + width;
    }

    /* زمین پایان */

    platforms.push({
        x: length - 280,
        y: H - 120,
        w: 280,
        h: 120
    });

    /* چند سکه نزدیک پرچم */

    for (let i = 0; i < 8; i++) {

        coins.push({
            x: length - 250 + i * 28,
            y: H - 210 - (i % 2) * 35,
            got: false
        });
    }

    /* بازیکن */

    player = {

        x: 70,
        y: H - 210,

        w: 42,
        h: 66,

        vx: 0,
        vy: 0,

        dir: 1,

        onGround: false,

        invincible: 0,

        ammo: 7
    };

    camera = 0;

    updateHUD();
}

/* =========================
   کنترل‌ها
========================= */

function holdButton(id, property) {

    const button = get(id);

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            keys[property] = true;
        }
    );

    ["pointerup", "pointercancel", "pointerleave"]
        .forEach(type => {

            button.addEventListener(
                type,
                event => {

                    event.preventDefault();

                    keys[property] = false;
                }
            );
        });
}

holdButton("left", "left");
holdButton("right", "right");

/* پرش */

function jump() {

    if (!running) return;

    if (player.onGround) {

        player.vy = -13;

        player.onGround = false;
    }
}

get("jump").addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        jump();
    }
);

/* تیر */

function shoot() {

    if (!running) return;

    /* حداکثر ۷ تیر */

    if (player.ammo <= 0) {

        message("🔫 تیر نداری!");

        return;
    }

    player.ammo--;

    shots.push({

        x:
            player.x +
            (player.dir > 0 ? 42 : -8),

        y:
            player.y + 30,

        vx:
            player.dir * 13,

        life: 80
    });

    updateHUD();
}

get("shoot").addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        shoot();
    }
);

/* کیبورد */

addEventListener("keydown", event => {

    if (
        event.key === "ArrowLeft" ||
        event.key === "a"
    ) {
        keys.left = true;
    }

    if (
        event.key === "ArrowRight" ||
        event.key === "d"
    ) {
        keys.right = true;
    }

    if (
        event.key === "ArrowUp" ||
        event.key === "w" ||
        event.code === "Space"
    ) {
        jump();
    }

    if (
        event.key === "f" ||
        event.key === "Enter"
    ) {
        shoot();
    }
});

addEventListener("keyup", event => {

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

/* =========================
   برخورد
========================= */

function collision(a, b) {

    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

/* =========================
   آسیب دیدن
========================= */

function playerHurt() {

    if (player.invincible > 0) return;

    save.lives--;

    saveGame();

    if (save.lives <= 0) {

        running = false;

        showScreen("gameover");

        return;
    }

    player.x -= 200;
    player.y = 100;

    player.vy = 0;

    player.invincible = 110;

    updateHUD();

    message("❤️ یک جان کم شد!");
}

/* =========================
   آپدیت بازی
========================= */

function update() {

    if (!running) return;

    const speed =
        world === 3 ? 4.7 : 4.2;

    /* حرکت */

    player.vx = 0;

    if (keys.left) {
        player.vx = -speed;
        player.dir = -1;
    }

    if (keys.right) {
        player.vx = speed;
        player.dir = 1;
    }

    player.vy += 0.62;

    player.x += player.vx;
    player.y += player.vy;

    player.onGround = false;

    /* برخورد با سکوها */

    for (const p of platforms) {

        if (
            player.vy >= 0 &&
            player.x + player.w > p.x &&
            player.x < p.x + p.w &&
            player.y + player.h <= p.y + 18 &&
            player.y + player.h + player.vy >= p.y
        ) {

            player.y =
                p.y - player.h;

            player.vy = 0;

            player.onGround = true;
        }
    }

    /* افتادن */

    if (player.y > H + 100) {

        playerHurt();

        player.y = 100;
    }

    /* سکه */

    for (const c of coins) {

        if (c.got) continue;

        const distance =
            Math.hypot(
                player.x + 20 - c.x,
                player.y + 25 - c.y
            );

        if (distance < 35) {

            c.got = true;

            save.coins++;

            checkGems();
        }
    }

    /* جان */

    for (const h of hearts) {

        if (h.got) continue;

        if (
            Math.hypot(
                player.x + 20 - h.x,
                player.y + 25 - h.y
            ) < 40
        ) {

            h.got = true;

            save.lives =
                Math.min(
                    5,
                    save.lives + 1
                );

            saveGame();

            message("❤️ جان اضافه شد!");

            updateHUD();
        }
    }

    /* تیر */

    for (const a of ammoItems) {

        if (a.got) continue;

        if (
            Math.hypot(
                player.x + 20 - a.x,
                player.y + 25 - a.y
            ) < 40
        ) {

            a.got = true;

            player.ammo =
                Math.min(
                    7,
                    player.ammo + 1
                );

            message("🔫 یک تیر گرفتی!");

            updateHUD();
        }
    }

    /* دشمن‌ها */

    for (const enemy of enemies) {

        if (!enemy.alive) continue;

        enemy.x += enemy.vx;

        const enemyBox = {
            x: enemy.x,
            y: enemy.y,
            w: 45,
            h: 45
        };

        if (
            Math.abs(enemy.x - player.x) < 500 &&
            collision(player, enemyBox)
        ) {

            playerHurt();
        }
    }

    /* گلوله‌ها */

    for (const shot of shots) {

        shot.x += shot.vx;

        shot.life--;

        for (const enemy of enemies) {

            if (!enemy.alive) continue;

            if (
                Math.abs(
                    shot.x - enemy.x
                ) < 40 &&
                Math.abs(
                    shot.y - enemy.y
                ) < 55
            ) {

                enemy.alive = false;

                shot.life = 0;
            }
        }
    }

    shots =
        shots.filter(
            shot => shot.life > 0
        );

    /* آسیب‌پذیری */

    if (player.invincible > 0) {
        player.invincible--;
    }

    /* دوربین */

    camera +=
        (
            player.x -
            camera -
            W * 0.35
        ) * 0.1;

    camera =
        Math.max(
            0,
            Math.min(
                goalX - W * 0.55,
                camera
            )
        );

    /* پایان */

    if (player.x > goalX) {

        finishLevel();
    }

    updateHUD();
}

/* =========================
   پس‌زمینه
========================= */

function drawBackground() {

    const wd = worlds[world];

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        wd.sky1
    );

    gradient.addColorStop(
        1,
        wd.sky2
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /* جنگل */

    if (world === 0) {

        for (let i = 0; i < 10; i++) {

            const x =
                (
                    i * 280 -
                    camera * 0.25
                ) % W;

            ctx.fillStyle =
                "#315d32";

            ctx.fillRect(
                x,
                H - 280,
                38,
                160
            );

            ctx.beginPath();

            ctx.arc(
                x + 19,
                H - 285,
                85,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }

    /* برف */

    if (world === 1) {

        ctx.fillStyle =
            "rgba(255,255,255,.85)";

        for (let i = 0; i < 90; i++) {

            let x =
                (
                    i * 103 -
                    camera * 0.1
                ) % W;

            if (x < 0) x += W;

            const y =
                (i * 57) %
                Math.max(1, H - 150);

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                2 + (i % 3),
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }

    /* آب */

    if (world === 2) {

        ctx.strokeStyle =
            "rgba(255,255,255,.28)";

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
                y - 30,
                W,
                y
            );

            ctx.stroke();
        }
    }

    /* آتش */

    if (world === 3) {

        ctx.fillStyle =
            "rgba(255,180,20,.25)";

        for (let i = 0; i < 35; i++) {

            const x =
                (
                    i * 97 -
                    camera * 0.15
                ) % W;

            const y =
                70 +
                (i * 43) % 350;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                10 + i % 5 * 3,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}

/* =========================
   سکوها
========================= */

function drawPlatforms() {

    const wd = worlds[world];

    for (const p of platforms) {

        const x =
            p.x - camera;

        if (
            x + p.w < 0 ||
            x > W
        ) continue;

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
            10
        );

        ctx.strokeStyle =
            "rgba(0,0,0,.25)";

        ctx.strokeRect(
            x,
            p.y,
            p.w,
            p.h
        );
    }
}

/* =========================
   شخصیت دختر
========================= */

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

    /* سایه */

    ctx.fillStyle =
        "rgba(0,0,0,.25)";

    ctx.beginPath();

    ctx.ellipse(
        x + 21,
        y + 69,
        25,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* مو */

    ctx.fillStyle =
        "#3b2118";

    ctx.beginPath();

    ctx.arc(
        x + 21,
        y + 17,
        20,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* صورت */

    ctx.fillStyle =
        "#f1b78e";

    ctx.beginPath();

    ctx.arc(
        x + 21,
        y + 22,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* مو */

    ctx.fillStyle =
        "#3b2118";

    ctx.fillRect(
        x + 6,
        y + 5,
        30,
        11
    );

    /* چشم‌ها */

    ctx.fillStyle =
        "#222";

    ctx.beginPath();

    ctx.arc(
        x + 16,
        y + 22,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 27,
        y + 22,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* لباس */

    const clothes = [
        "#e64d75",
        "#4c78d8",
        "#28a55b",
        "#e86529",
        "#8057c7"
    ];

    ctx.fillStyle =
        clothes[
            save.char %
            clothes.length
        ];

    ctx.fillRect(
        x + 7,
        y + 35,
        30,
        24
    );

    /* دست */

    ctx.fillStyle =
        "#f1b78e";

    ctx.fillRect(
        x + 1,
        y + 39,
        8,
        17
    );

    ctx.fillRect(
        x + 35,
        y + 39,
        8,
        17
    );

    /* پا */

    ctx.fillStyle =
        "#252c43";

    ctx.fillRect(
        x + 9,
        y + 58,
        9,
        12
    );

    ctx.fillRect(
        x + 26,
        y + 58,
        9,
        12
    );

    /* محافظ */

    if (player.invincible > 40) {

        ctx.strokeStyle =
            "rgba(70,210,255,.8)";

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.arc(
            x + 21,
            y + 35,
            40,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }
}

/* =========================
   سکه، جان و تیر
========================= */

function drawItems() {

    /* سکه */

    for (const c of coins) {

        if (c.got) continue;

        const x =
            c.x - camera;

        ctx.fillStyle =
            "#ffd12a";

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

        ctx.beginPath();

        ctx.arc(
            x - 3,
            c.y - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    /* قلب */

    for (const h of hearts) {

        if (h.got) continue;

        ctx.font =
            "30px Arial";

        ctx.fillText(
            "❤️",
            h.x - camera - 15,
            h.y + 10
        );
    }

    /* تیر */

    for (const a of ammoItems) {

        if (a.got) continue;

        ctx.font =
            "28px Arial";

        ctx.fillText(
            "🔫",
            a.x - camera - 14,
            a.y + 10
        );
    }
}

/* =========================
   دشمن‌ها
========================= */

function drawEnemy(enemy) {

    const x =
        enemy.x - camera;

    const y =
        enemy.y;

    ctx.save();

    if (enemy.type === "snail") {

        ctx.fillStyle =
            "#8050a8";

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
            "#5e367e";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 25,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

    } else if (enemy.type === "turtle") {

        ctx.fillStyle =
            "#29834b";

        ctx.beginPath();

        ctx.ellipse(
            x + 22,
            y + 27,
            25,
            18,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#63b95d";

        ctx.beginPath();

        ctx.arc(
            x + 46,
            y + 25,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

    } else if (enemy.type === "cabbage") {

        ctx.fillStyle =
            "#39a653";

        for (let i = 0; i < 7; i++) {

            ctx.beginPath();

            ctx.arc(
                x + 22 +
                Math.cos(i) * 13,
                y + 24 +
                Math.sin(i) * 10,
                15,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

    } else if (enemy.type === "penguin") {

        ctx.fillStyle =
            "#263746";

        ctx.beginPath();

        ctx.ellipse(
            x + 22,
            y + 25,
            20,
            28,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#fff";

        ctx.beginPath();

        ctx.ellipse(
            x + 22,
            y + 31,
            12,
            17,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#f2a51b";

        ctx.fillRect(
            x + 16,
            y + 25,
            13,
            6
        );

    } else if (enemy.type === "sheep") {

        ctx.fillStyle =
            "#f5f5f5";

        ctx.beginPath();

        ctx.arc(
            x + 15,
            y + 25,
            15,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 30,
            y + 20,
            16,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 42,
            y + 28,
            13,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#333";

        ctx.beginPath();

        ctx.arc(
            x + 45,
            y + 25,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

    } else if (enemy.type === "snowball") {

        ctx.fillStyle =
            "#fff";

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
            "#9bdcff";

        ctx.lineWidth = 3;

        ctx.stroke();

    } else if (enemy.type === "fish") {

        ctx.fillStyle =
            "#ff6b73";

        ctx.beginPath();

        ctx.ellipse(
            x + 25,
            y + 25,
            24,
            14,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.moveTo(
            x + 4,
            y + 25
        );

        ctx.lineTo(
            x - 14,
            y + 10
        );

        ctx.lineTo(
            x - 14,
            y + 40
        );

        ctx.closePath();

        ctx.fill();

    } else if (enemy.type === "bubble") {

        ctx.strokeStyle =
            "#dfffff";

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 22,
            19,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    } else if (enemy.type === "crab") {

        ctx.fillStyle =
            "#ef5350";

        ctx.beginPath();

        ctx.arc(
            x + 23,
            y + 25,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillRect(
            x,
            y + 20,
            12,
            8
        );

        ctx.fillRect(
            x + 36,
            y + 20,
            12,
            8
        );

    } else if (enemy.type === "fire") {

        ctx.fillStyle =
            "#ff3d00";

        ctx.beginPath();

        ctx.moveTo(
            x + 22,
            y
        );

        ctx.lineTo(
            x + 45,
            y + 45
        );

        ctx.lineTo(
            x,
            y + 45
        );

        ctx.closePath();

        ctx.fill();

        ctx.fillStyle =
            "#ffd600";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 30,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

    } else if (enemy.type === "lava") {

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

        ctx.fillStyle =
            "#ffd000";

        ctx.beginPath();

        ctx.arc(
            x + 14,
            y + 14,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    } else {

        /* بمب */

        ctx.fillStyle =
            "#25252b";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 22,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#ff8b00";

        ctx.fillRect(
            x + 8,
            y + 9,
            28,
            8
        );

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "!",
            x + 19,
            y + 34
        );
    }

    ctx.restore();
}

/* =========================
   پرچم
========================= */

function drawFlag() {

    const x =
        goalX - camera;

    ctx.fillStyle =
        "#eee";

    ctx.fillRect(
        x,
        H - 270,
        8,
        150
    );

    ctx.fillStyle =
        "#e53935";

    ctx.beginPath();

    ctx.moveTo(
        x + 8,
        H - 265
    );

    ctx.lineTo(
        x + 90,
        H - 238
    );

    ctx.lineTo(
        x + 8,
        H - 212
    );

    ctx.closePath();

    ctx.fill();
}

/* =========================
   رسم بازی
========================= */

function draw() {

    drawBackground();

    drawPlatforms();

    drawItems();

    for (const enemy of enemies) {

        if (enemy.alive) {
            drawEnemy(enemy);
        }
    }

    /* گلوله‌ها */

    for (const shot of shots) {

        ctx.fillStyle =
            "#fff";

        ctx.beginPath();

        ctx.arc(
            shot.x - camera,
            shot.y,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#ffc928";

        ctx.beginPath();

        ctx.arc(
            shot.x -
            camera -
            shot.vx / 4,
            shot.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    drawFlag();

    drawPlayer();
}

/* =========================
   حلقه بازی
========================= */

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );
}

gameLoop();

/* =========================
   شروع مرحله
========================= */

function startGame(
    selectedWorld = world,
    selectedLevel = level
) {

    world = selectedWorld;

    level = selectedLevel;

    treasureMode = false;

    showScreen(null);

    running = true;

    createLevel();

    message(
        `دنیای ${worlds[world].name} - مرحله ${level}`
    );
}

/* =========================
   پایان مرحله
========================= */

function finishLevel() {

    running = false;

    const completed =
        world * 10 + level;

    if (
        completed >=
        save.unlocked
    ) {

        save.unlocked =
            Math.min(
                40,
                completed + 1
            );
    }

    saveGame();

    get("finishStats").textContent =
        `🪙 سکه: ${save.coins}   💎 الماس: ${save.gems}`;

    /*
       اگر مرحله دهم دنیا باشد،
       اول مرحله گنج نمایش داده می‌شود.
    */

    if (
        level === 10 &&
        world < 3
    ) {

        showScreen("treasure");

    } else {

        showScreen("finish");
    }
}

/* =========================
   دکمه مرحله بعد
========================= */

get("nextBtn").onclick = function () {

    if (level < 10) {

        startGame(
            world,
            level + 1
        );

        return;
    }

    if (world < 3) {

        world++;

        level = 1;

        startGame(
            world,
            level
        );

        return;
    }

    /* پایان کل بازی */

    showFinalEnding();
};

/* =========================
   پایان داستان
========================= */

function showFinalEnding() {

    running = false;

    showScreen("finish");

    get("finish").innerHTML = `

        <h2>🎉 پایان ماجراجویی 🎉</h2>

        <div style="
            font-size:100px;
            margin:20px;
        ">
            👧 ❤️ 👨
        </div>

        <p>
            الینا بالاخره به آخرین مرحله رسید!
        </p>

        <p>
            پدرش که مدت‌ها در قفس گرفتار بود،
            آزاد شد.
        </p>

        <p style="font-size:30px">
            👨‍👧 «ما دوباره کنار هم هستیم!» ❤️
        </p>

        <button onclick="location.reload()">
            🔄 بازی دوباره
        </button>
    `;
}

/* =========================
   مرحله گنج
========================= */

get("treasureBtn").onclick =
function () {

    treasureMode = true;

    showScreen(null);

    running = true;

    createLevel();

    goalX =
        player.x + 2500;

    coins = [];

    for (let i = 0; i < 30; i++) {

        coins.push({

            x:
                player.x +
                250 +
                i * 75,

            y:
                H -
                220 -
                (i % 3) * 70,

            got: false
        });
    }

    message(
        "💰 مرحله گنج! همه سکه‌ها را جمع کن!"
    );
};

/* =========================
   تلاش دوباره
========================= */

get("retryBtn").onclick =
function () {

    save.lives = 3;

    saveGame();

    startGame(
        world,
        level
    );
};

/* =========================
   نقشه مراحل
========================= */

function openLevels() {

    showScreen("levels");

    const tabs =
        get("worldTabs");

    tabs.innerHTML = "";

    worlds.forEach(
        (wd, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "tab";

            button.textContent =
                `${index + 1}. ${wd.name}`;

            button.onclick =
                function () {

                    renderLevels(index);
                };

            tabs.appendChild(
                button
            );
        }
    );

    renderLevels(0);
}

function renderLevels(selectedWorld) {

    world = selectedWorld;

    const grid =
        get("levelGrid");

    grid.innerHTML = "";

    for (
        let i = 1;
        i <= 10;
        i++
    ) {

        const number =
            selectedWorld * 10 + i;

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "levelBtn";

        const unlocked =
            number <= save.unlocked;

        button.textContent =
            unlocked
                ? `${selectedWorld + 1}-${i} ⭐`
                : `${selectedWorld + 1}-${i} 🔒`;

        if (!unlocked) {

            button.classList.add(
                "locked"
            );

        } else {

            button.onclick =
                function () {

                    startGame(
                        selectedWorld,
                        i
                    );
                };
        }

        grid.appendChild(
            button
        );
    }
}

get("levelsBtn").onclick =
openLevels;

get("mapBtn").onclick =
openLevels;

get("gameMapBtn").onclick =
openLevels;

/* =========================
   شخصیت‌ها
========================= */

const characters = [

    {
        name: "الینا",
        icon: "👧",
        cost: 0
    },

    {
        name: "جنگجو",
        icon: "🧝‍♀️",
        cost: 1
    },

    {
        name: "ماجراجو",
        icon: "🧑‍🚀",
        cost: 2
    },

    {
        name: "قهرمان",
        icon: "🦸‍♀️",
        cost: 4
    },

    {
        name: "نینجا",
        icon: "🥷",
        cost: 6
    }
];

function openCharacters() {

    showScreen("characters");

    const grid =
        get("characterGrid");

    grid.innerHTML = "";

    characters.forEach(
        (character, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "charCard";

            const owned =
                save.owned.includes(
                    index
                );

            card.innerHTML = `

                <div class="charIcon">
                    ${character.icon}
                </div>

                <b>
                    ${character.name}
                </b>

                <small>
                    ${
                        index === 0
                        ? "رایگان"
                        : character.cost + " 💎"
                    }
                </small>

                <button>
                    ${
                        owned
                        ? "انتخاب"
                        : "خرید"
                    }
                </button>
            `;

            card
                .querySelector("button")
                .onclick =
                function () {

                    if (owned) {

                        save.char =
                            index;

                        saveGame();

                        message(
                            "👧 شخصیت انتخاب شد!"
                        );

                        openCharacters();

                        return;
                    }

                    if (
                        save.gems >=
                        character.cost
                    ) {

                        save.gems -=
                            character.cost;

                        save.owned.push(
                            index
                        );

                        save.char =
                            index;

                        saveGame();

                        message(
                            "🎉 شخصیت خریداری شد!"
                        );

                        openCharacters();

                    } else {

                        message(
                            "💎 الماس کافی نداری!"
                        );
                    }
                };

            grid.appendChild(card);
        }
    );
}

get("charsBtn").onclick =
openCharacters;

/* =========================
   دکمه بازگشت
========================= */

document
    .querySelectorAll(".backBtn")
    .forEach(button => {

        button.onclick =
        function () {

            showScreen("menu");
        };
    });

/* =========================
   شروع اولیه
========================= */

showScreen("menu");

updateHUD();
