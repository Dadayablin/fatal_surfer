// Получаем канвас и контекст
const canvas = document.getElementById("gameCanvas");
canvas.width = 360;
canvas.height = 640;
const ctx = canvas.getContext("2d");
const score_doc = document.getElementById("score");
const coins_doc = document.getElementById("coins");
let coins_bonus = {};
coins_bonus.multiplicator = get_data("coins_multiplicator");
coins_bonus.isActive = false;
coins_bonus.time = get_data("coins_time");
let shield = {};
shield.time = get_data("shield_time");
shield.isActive = false;
let skate = {};
skate.multiplicator = get_data("skate_multiplicator");
skate.isActive = false;
skate.time = get_data("skate_time");
let bull_num = localStorage.getItem("selectedBull");
let bear_num = localStorage.getItem("selectedBear");
let train_img = new Image();
train_img.src = "../img/train.png";
let coin_img = new Image();
coin_img.src = "../img/coin.png";

document.getElementById("shield_bonus").onclick = () => {
  shield.isActive = true;
  console.log("shield bonus active");
  setTimeout(() => {
    console.log("shield bonus deactive");
    shield.isActive = false;
  }, shield.time * 1000);
};
document.getElementById("skate_bonus").onclick = () => {
  skate.isActive = true;
  console.log("skate bonus active");
  setTimeout(() => {
    console.log("skate bonus deactive");
    skate.isActive = false;
  }, skate.time * 1000);
};

document.getElementById("coins_bonus").onclick = () => {
  coins_bonus.isActive = true;
  console.log("coin bonus active");
  setTimeout(() => {
    console.log("coin bonus deactive");
    coins_bonus.isActive = false;
  }, coins_bonus.time * 1000);
};

// Игрок
const player = {
  x: 182,
  y: 420,
  width: 70,
  height: 10,
  jumpStrength: -10,
  lane: 1, // для переключения между тремя дорожками
};

const police = {
  x: 182,
  y: 500,
  width: 70,
  height: 10,
  jumpStrength: -10,
  lane: 1, // для переключения между тремя дорожками
};

// Три дорожки (x координаты)
const lanes = [62, 182, 302];

// Объекты (препятствия и монеты)
let obstacles = [];
let coins = [];

// Управление
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 65) {
    if (player.lane > 0) {
      player.lane--;
      player.x = lanes[player.lane];
      setTimeout(() => {
        police.lane--;
        police.x = lanes[player.lane];
      }, 100);
    }
  } else if (e.keyCode === 68) {
    if (player.lane < lanes.length - 1) {
      player.lane++;
      player.x = lanes[player.lane];
      setTimeout(() => {
        police.lane--;
        police.x = lanes[player.lane];
      }, 100);
    }
  }
});

// Создаем препятствия и монеты
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
        speedY: 4,
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
      speedY: 4,
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

// Спавн каждые несколько секунд
let score = 0;
let interval = 2000;
setInterval(spawnObstacle, interval);
setInterval(spawnCoin, 1000);

// Основной цикл игры
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
    interval = interval - 100;
  }
  score_doc.innerText = score.toFixed(0);
  if (gameOver) {
    if (!get_data("bestScore") || Number(get_data("bestScore") < score)) {
      set_data("bestScore", `${score.toFixed(0)}`, { secure: true, "max-age": 360000000 });
    }
    set_data("coins", `${Number(get_data("coins")) + countCoins}`, {
      secure: true,
      "max-age": 360000000,
    });
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Игра окончена", 200, 200);
    ctx.font = "20px Arial";
    ctx.fillText("Очки:" + score.toFixed(0), 250, 240);
    ctx.fillText("Монетки:" + countCoins, 300, 300);
    return;
  }

  // Очистка
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Рисуем игрока
  player.img = new Image();
  player.img.src = `../img/bull${bull_num}.png`;
  ctx.drawImage(player.img, player.x - 35, player.y, 70, 70);

  police.img = new Image();
  police.img.src = `../img/bear${bear_num}.png`;
  ctx.drawImage(police.img, police.x - 35, police.y, 70, 70);

  // Обработка препятствий
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.y += obs.speedY;

    // Удаление за пределами экрана
    if (obs.y > canvas.height) {
      obstacles.splice(i, 1);
      continue;
    }

    // Рисуем препятствие
    ctx.drawImage(obs.img, obs.x - 127, obs.y, 250, 250);

    // Проверка коллизии с игроком
    if (
      Math.abs(player.x - obs.x) < (player.width + obs.width) / 2 &&
      Math.abs(player.y - obs.y - 200) < (player.height + obs.height) / 2 &&
      !shield.isActive
    ) {
      gameOver = true;
    }
  }

  // Обработка монет
  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    coin.y += coin.speedY;

    if (coin.y > canvas.height) {
      coins.splice(i, 1);
      continue;
    }

    ctx.drawImage(coin.img, coin.x - 34, coin.y, 65, 65);

    // Проверка сбора монеты
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

// Запуск игры
gameLoop();
