const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");

const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const finalScoreText = document.getElementById("final-score");

let score = 0;
let time = 60;
let gameRunning = false;

let gameTimer;
let gooseTimer;


/* شروع بازی */

function startGame() {

  score = 0;
  time = 60;
  gameRunning = true;

  scoreText.textContent = score;
  timeText.textContent = time;

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  removeAllGeese();

  gameTimer = setInterval(() => {

    time--;

    timeText.textContent = time;

    if (time <= 0) {
      endGame();
    }

  }, 1000);


  gooseTimer = setInterval(() => {

    if (gameRunning) {
      createGoose();
    }

  }, 900);

}


/* ساخت قازچ */

function createGoose() {

  const goose = document.createElement("div");

  goose.className = "goose";
  goose.textContent = "🪿";

  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  const maxX = Math.max(10, areaWidth - 70);
  const maxY = Math.max(10, areaHeight - 100);

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  goose.style.left = `${x}px`;
  goose.style.top = `${y}px`;

  goose.addEventListener("click", () => {

    if (!gameRunning) return;

    score++;
    scoreText.textContent = score;

    goose.remove();

  });


  gameArea.appendChild(goose);


  /* قازچ بعد از چند ثانیه خودش ناپدید می‌شود */

  setTimeout(() => {

    if (goose.parentNode) {
      goose.remove();
    }

  }, 2500);

}


/* پایان بازی */

function endGame() {

  gameRunning = false;

  clearInterval(gameTimer);
  clearInterval(gooseTimer);

  removeAllGeese();

  finalScoreText.textContent = score;

  gameScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");

}


/* حذف قازچ‌ها */

function removeAllGeese() {

  const geese = document.querySelectorAll(".goose");

  geese.forEach((goose) => {
    goose.remove();
  });

}


/* شروع */

startBtn.addEventListener("click", startGame);


/* شروع دوباره */

restartBtn.addEventListener("click", startGame);


/* حرکت بازیکن با لمس و موس */

gameArea.addEventListener("pointermove", (event) => {

  if (!gameRunning) return;

  const rect = gameArea.getBoundingClientRect();

  let x = event.clientX - rect.left;

  const playerWidth = player.offsetWidth;

  x = Math.max(
    playerWidth / 2,
    Math.min(x, rect.width - playerWidth / 2)
  );

  player.style.left = `${x}px`;

});


/* حرکت با کیبورد */

document.addEventListener("keydown", (event) => {

  if (!gameRunning) return;

  const currentLeft = parseFloat(player.style.left) || gameArea.clientWidth / 2;

  if (event.key === "ArrowLeft") {

    player.style.left =
      `${Math.max(40, currentLeft - 35)}px`;

  }

  if (event.key === "ArrowRight") {

    player.style.left =
      `${Math.min(gameArea.clientWidth - 40, currentLeft + 35)}px`;

  }

});
