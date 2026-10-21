const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const cells = 26;
const tile = canvas.width / cells;
const tickMs = 115;

const directions = {
  ArrowUp: { x: 0, y: -1 },
  KeyW: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  KeyS: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  KeyA: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyD: { x: 1, y: 0 },
};

let snake;
let food;
let dir;
let nextDir;
let score;
let timer;
let running;
let paused;
let gameOver;

const bestKey = "snake-best-score";
let best = Number(localStorage.getItem(bestKey) || 0);
bestEl.textContent = best;

function reset() {
  snake = [
    { x: 12, y: 13 },
    { x: 11, y: 13 },
    { x: 10, y: 13 },
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  running = false;
  paused = false;
  gameOver = false;
  placeFood();
  updateScore();
  showOverlay("准备开始", "按空格键或点击开始");
  draw();
}

function start() {
  if (gameOver) reset();
  if (running && !paused) return;
  running = true;
  paused = false;
  hideOverlay();
  clearInterval(timer);
  timer = setInterval(step, tickMs);
}

function pause() {
  if (!running || gameOver) return;
  paused = !paused;
  if (paused) {
    clearInterval(timer);
    showOverlay("已暂停", "按空格键继续");
  } else {
    hideOverlay();
    timer = setInterval(step, tickMs);
  }
}

function restart() {
  clearInterval(timer);
  reset();
  start();
}

function step() {
  dir = nextDir;
  const head = snake[0];
  const nextHead = {
    x: head.x + dir.x,
    y: head.y + dir.y,
  };

  if (
    nextHead.x < 0 ||
    nextHead.x >= cells ||
    nextHead.y < 0 ||
    nextHead.y >= cells ||
    snake.some((part) => part.x === nextHead.x && part.y === nextHead.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(nextHead);

  if (nextHead.x === food.x && nextHead.y === food.y) {
    score += 10;
    updateScore();
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * cells),
      y: Math.floor(Math.random() * cells),
    };
  } while (snake && snake.some((part) => part.x === food.x && part.y === food.y));
}

function endGame() {
  clearInterval(timer);
  running = false;
  gameOver = true;
  if (score > best) {
    best = score;
    localStorage.setItem(bestKey, String(best));
    bestEl.textContent = best;
  }
  showOverlay("游戏结束", `最终得分 ${score}，按空格键重开`);
}

function updateScore() {
  scoreEl.textContent = score;
}

function setDirection(newDir) {
  if (newDir.x + dir.x === 0 && newDir.y + dir.y === 0) return;
  nextDir = newDir;
}

function draw() {
  drawBoard();
  drawFood();
  drawSnake();
}

function drawBoard() {
  ctx.fillStyle = "#0d1113";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;
  for (let i = 1; i < cells; i += 1) {
    const pos = i * tile;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function roundedCell(x, y, color, inset = 2) {
  const px = x * tile + inset;
  const py = y * tile + inset;
  const size = tile - inset * 2;
  const radius = 6;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(px, py, size, size, radius);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((part, index) => {
    roundedCell(part.x, part.y, index === 0 ? "#5dd39e" : "#35a874", 2);
  });
}

function drawFood() {
  const cx = food.x * tile + tile / 2;
  const cy = food.y * tile + tile / 2;
  ctx.fillStyle = "#ff6b5f";
  ctx.beginPath();
  ctx.arc(cx, cy, tile * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.arc(cx - tile * 0.1, cy - tile * 0.1, tile * 0.09, 0, Math.PI * 2);
  ctx.fill();
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

document.addEventListener("keydown", (event) => {
  if (directions[event.code]) {
    event.preventDefault();
    setDirection(directions[event.code]);
  }

  if (event.code === "Space") {
    event.preventDefault();
    if (!running || gameOver) {
      start();
    } else {
      pause();
    }
  }
});

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
restartBtn.addEventListener("click", restart);
document.querySelectorAll(".touch-pad button").forEach((button) => {
  button.addEventListener("click", () => {
    const map = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    setDirection(map[button.dataset.dir]);
  });
});

reset();
