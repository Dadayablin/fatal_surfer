const canvas = document.getElementById("gameCanvas");
canvas.width = 360;
canvas.height = 640;
const ctx = canvas.getContext("2d");
const score_doc = document.getElementById("score");
const coins_doc = document.getElementById("coins");

let coins_bonus = {};
let shield = {};
let skate = {};

coins_bonus.multiplicator = get_data("coins_multiplicator");
coins_bonus.isActive = false;

shield.isActive = false;
skate.multiplicator = get_data("skate_multiplicator");
skate.isActive = false;

coins_bonus.effectTime = get_data("coins_time");
coins_bonus.cooldownTime = 20;

shield.effectTime = get_data("shield_time");
shield.cooldownTime = 20;

skate.effectTime = get_data("skate_time");
skate.cooldownTime = 20;

skate.amount = 1;
coins_bonus.amount = 1;
shield.amount = 1;

let train_speed = 4;
let bull_num = get_data("selectedBull");
let bear_num = get_data("selectedBear");
let train_img = new Image();
train_img.src = "../img/train.png";
let coin_img = new Image();
coin_img.src = "../img/coin.png";
skate.amount = 1;
coins_bonus.amount = 1;
shield.amount = 1;

document.getElementById("shield_bonus").onclick = () => {
  if (shield.amount !== 0) {
    shield.isActive = true;
    shield.amount = 0;

    startCooldown("shield_bonus", shield.cooldownTime);

    setTimeout(() => {
      shield.isActive = false;
    }, shield.effectTime * 1000);

    setTimeout(() => {
      shield.amount = 1;
    }, shield.cooldownTime * 1000);
  }
};

document.getElementById("skate_bonus").onclick = () => {
  if (skate.amount !== 0) {
    skate.isActive = true;
    skate.amount = 0;

    startCooldown("skate_bonus", skate.cooldownTime);

    setTimeout(() => {
      skate.isActive = false;
    }, skate.effectTime * 1000);

    setTimeout(() => {
      skate.amount = 1;
    }, skate.cooldownTime * 1000);
  }
};

document.getElementById("coins_bonus").onclick = () => {
  if (coins_bonus.amount !== 0) {
    coins_bonus.isActive = true;
    coins_bonus.amount = 0;

    startCooldown("coins_bonus", coins_bonus.cooldownTime);

    setTimeout(() => {
      coins_bonus.isActive = false;
    }, coins_bonus.effectTime * 1000);

    setTimeout(() => {
      coins_bonus.amount = 1;
    }, coins_bonus.cooldownTime * 1000);
  }
};

const player = {
  x: 182,
  y: 420,
  width: 70,
  height: 10,
  jumpStrength: -10,
  lane: 1,
};

const police = {
  x: 182,
  y: 500,
  width: 70,
  height: 10,
  jumpStrength: -10,
  lane: 1,
};

const lanes = [62, 182, 302];

let obstacles = [];
let coins = [];

// --- Управление (клавиатура и свайпы) ---

function moveLeft() {
  if (player.lane > 0) {
    player.lane--;
    player.x = lanes[player.lane];
    setTimeout(() => {
      police.lane--;
      police.x = lanes[player.lane];
    }, 100);
  }
}

function moveRight() {
  if (player.lane < lanes.length - 1) {
    player.lane++;
    player.x = lanes[player.lane];
    setTimeout(() => {
      police.lane++;
      police.x = lanes[player.lane];
    }, 100);
  }
}

function jump() {
  // если нужна логика прыжка, добавь сюда
  // например: player.y -= 100;
  // или оставь пустым, если прыжок не нужен
}

// Клавиатура
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 65) { // A
    moveLeft();
  } else if (e.keyCode === 68) { // D
    moveRight();
  }
});

// Свайпы по canvas
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener('touchstart', function(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', function(e) {
  let touchEndX = e.changedTouches[0].clientX;
  let touchEndY = e.changedTouches[0].clientY;

  let dx = touchEndX - touchStartX;
  let dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) {
      moveRight();
    } else if (dx < -30) {
      moveLeft();
    }
  } else {
    if (dy < -30) {
      jump();
    }
  }
});

// Отключить скролл при свайпах по canvas
canvas.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });

// --- Конец блока управления ---

function spawnObstacle() {
  let rand = Math.floor(Math.random() * 100);
  if (rand > 30) {
    let rand2 = Math.floor(Math.random() * 3);
    for (let i = 0; i < rand2; i++) {
      let laneIndex = Math.floor(Math.random() * lanes.length);
      obstacles.push({
        x: lanes[laneIndex],
        y: -200,
        width: 40,
        height: 60,
        img: train_img,
        speedY: train_speed,
      });
    }
  } else {
    let laneIndex = Math.floor(Math.random() * lanes.length);
    obstacles.push({
      x: lanes[laneIndex],
      y: -200,
      width: 40,
      height: 60,
      img: train_img,
      speedY: train_speed,
    });
  }
}

function spawnCoin() {
  const laneIndex = Math.floor(Math.random() * lanes.length);
  if (
    obstacles.length > 0 &&
    obstacles[obstacles.length - 1].x !== lanes[laneIndex]
  ) {
    coins.push({
      x: lanes[laneIndex],
      y: -20,
      img: coin_img,
      radius: 10,
      speedY: 4,
    });
  }
}

function startCooldown(imgId, seconds) {
  const img = document.getElementById(imgId);

  const overlay = document.createElement("div");
  overlay.classList.add("cooldown-overlay");

  const fill = document.createElement("div");
  fill.classList.add("cooldown-fill");
  overlay.appendChild(fill);
  img.parentElement.appendChild(overlay);

  img.style.pointerEvents = "none";
  fill.style.transitionDuration = `${seconds}s`;
  setTimeout(() => (fill.style.transform = "translateY(0%)"), 10);

  setTimeout(() => {
    overlay.remove();
    img.style.pointerEvents = "auto";
  }, seconds * 1000);
}

let score = 0;
let interval = 2000;
setInterval(spawnObstacle, interval);
setInterval(spawnCoin, 1000);

let countCoins = 0;
let gameOver = false;
let score_minus = 1;
function gameLoop() {
  if (skate.isActive) {
    score += 0.3 * skate.multiplicator;
  } else {
    score += 0.3;
  }
  if (score % (1000 * score_minus) === 0) {
    score_minus += 1;
    interval = interval - 50;
    train_speed += 0.1;
  }
  score_doc.innerText = score.toFixed(0);
  if (gameOver) {
    if (!get_data("bestScore") || Number(get_data("bestScore") < score)) {
      set_data("bestScore", `${score.toFixed(0)}`, {
        secure: true,
        "max-age": 360000000,
      });
    }
    set_data("coins", `${Number(get_data("coins")) + countCoins}`, {
      secure: true,
      "max-age": 360000000,
    });
    document.getElementById("finalScore").textContent = score.toFixed(0);
    document.getElementById("finalCoins").textContent = countCoins.toFixed(0);
    document.getElementById("game-over-modal").style.display = "flex";
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.img = new Image();
  player.img.src = `../img/bull${bull_num}.png`;
  ctx.drawImage(player.img, player.x - 35, player.y, 70, 70);

  police.img = new Image();
  police.img.src = `../img/bear${bear_num}.png`;
  ctx.drawImage(police.img, police.x - 35, police.y, 70, 70);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.y += obs.speedY;

    if (obs.y > canvas.height) {
      obstacles.splice(i, 1);
      continue;
    }

    ctx.drawImage(obs.img, obs.x - 127, obs.y, 250, 250);

    if (
      ((Math.abs(player.x - obs.x) < (player.width + obs.width) / 2 &&
        Math.abs(player.y - obs.y - 200) < (player.height + obs.height) / 2) ||
        (Math.abs(player.x - obs.x) < (player.width + obs.width) / 2 &&
          Math.abs(player.y - obs.y) < player.height + obs.height)) / 2 &&
      !shield.isActive
    ) {
      gameOver = true;
    }
  }

  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    coin.y += coin.speedY;

    if (coin.y > canvas.height) {
      coins.splice(i, 1);
      continue;
    }

    ctx.drawImage(coin.img, coin.x - 34, coin.y, 65, 65);

    if (
      Math.abs(player.x - coin.x) < player.width / 2 + coin.radius &&
      Math.abs(player.y - coin.y) < player.height / 2 + coin.radius
    ) {
      coins.splice(i, 1);
      if (coins_bonus.isActive) {
        countCoins += 1 * coins_bonus.multiplicator;
      } else {
        countCoins += 1;
      }
      coins_doc.innerText = countCoins.toFixed(0);
    }
  }

  requestAnimationFrame(gameLoop);
}

function goToMenu() {
  window.location.href = "../menu/gameMenu.html";
}
gameLoop();