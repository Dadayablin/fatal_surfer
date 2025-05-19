// Получаем канвас и контекст
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Игрок
const player = {
  x: 200,
  y: 230,
  width: 70,
  height: 10,
  jumpStrength: -10,
  lane: 1, // для переключения между тремя дорожками
};

const police = {
  x: 200,
  y: 300,
  width: 70,
  height: 10,
  jumpStrength: -10,
  lane: 1, // для переключения между тремя дорожками
};

// Три дорожки (x координаты)
const lanes = [100, 200, 300];

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
        y: -60,
        width: 40,
        height: 60,
        color: "red",
        speedY: 4,
      });
    }
  } else {
    let laneIndex = Math.floor(Math.random() * lanes.length);
    obstacles.push({
      x: lanes[laneIndex],
      y: -60,
      width: 40,
      height: 60,
      color: "red",
      speedY: 4,
    });
  }
}

function spawnCoin() {
  const laneIndex = Math.floor(Math.random() * lanes.length);
  coins.push({
    x: lanes[laneIndex],
    y: -20,
    radius: 10,
    color: "gold",
    speedY: 4,
  });
}

// Спавн каждые несколько секунд
setInterval(spawnObstacle, 2000);
setInterval(spawnCoin, 1500);

// Основной цикл игры
let score = 0;
let countCoins = 0;
let gameOver = false;

function gameLoop() {
  score += 1
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Игра окончена", 200, 200);
    ctx.font = "20px Arial";
    ctx.fillText("Очки:" + score, 250, 240);
    ctx.fillText("Монетки:" + countCoins, 300, 300);
    return;
  }

  // Очистка
  ctx.clearRect(0, 0, canvas.width, canvas.height);


  // Рисуем игрока
  player.img = new Image();
  player.img.src = "./img/bull1.png";
  ctx.drawImage(player.img, player.x - 35, player.y, 70, 70);

  police.img = new Image();
  police.img.src = "./img/bear1.png";
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
    ctx.fillStyle = obs.color;
    ctx.fillRect(
      obs.x - obs.width / 2,
      obs.y - obs.height / 2,
      obs.width,
      obs.height
    );

    // Проверка коллизии с игроком
    if (
      Math.abs(player.x - obs.x) < (player.width + obs.width) / 2 &&
      Math.abs(player.y - obs.y) < (player.height + obs.height) / 2
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

    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fillStyle = coin.color;
    ctx.fill();

    // Проверка сбора монеты
    if (
      Math.abs(player.x - coin.x) < player.width / 2 + coin.radius &&
      Math.abs(player.y - coin.y) < player.height / 2 + coin.radius
    ) {
      coins.splice(i, 1);
      countCoins++;
    }
  }

  requestAnimationFrame(gameLoop);
}

// Запуск игры
gameLoop();
