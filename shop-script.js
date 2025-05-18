const icons = ['🍒', '🍋', '🔔', '⭐', '💎'];
const reels = [document.getElementById('col1'), document.getElementById('col2'), document.getElementById('col3')];
const itemHeight = 60;
const totalItems = 50;
const baseSpeed = 300;

const spinButton = document.getElementById('spinBtn');
const notification = document.getElementById('notification');
const coinDisplay = document.getElementById('coinCount');
let coins = 500;

function generateReelContent(reel) {
  reel.innerHTML = '';
  for (let i = 0; i < totalItems; i++) {
    const item = document.createElement('div');
    item.classList.add('reel-item');
    item.textContent = icons[Math.floor(Math.random() * icons.length)];
    reel.appendChild(item);
  }
}
function animateReel(reel, distanceMultiplier = 1) {
  return new Promise(resolve => {
    // Генерируем контент
    generateReelContent(reel);

    const steps = 10 + distanceMultiplier * 5;
    const stopIndex = steps;

    const offsetY = stopIndex * itemHeight;
    const duration = Math.round(offsetY / baseSpeed * 1000);

    // Ставим начальное положение ПОВЫШЕ, чтобы начать «сверху»
    reel.style.transition = 'none';
    reel.style.transform = `translateY(-${offsetY}px)`;
    void reel.offsetHeight;

    // Анимируем ВНИЗ — в позицию 0
    setTimeout(() => {
      reel.style.transition = `transform ${duration}ms linear`;
      reel.style.transform = `translateY(0)`;

      setTimeout(() => {
        // После остановки фиксируем stopIndex
        reel.style.transition = 'none';
        reel.style.transform = `translateY(0)`; // остановились на центре
        reel.dataset.stopIndex = stopIndex;
        resolve();
      }, duration);
    }, 20);
  });
}

function getCenterIcon(reel) {
  const index = parseInt(reel.dataset.stopIndex);
  return reel.children[index].textContent;
}

function showNotification(text, isWin = false) {
  notification.textContent = isWin ? `🎉 ${text}` : `😔 ${text}`;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2500);
}

function updateBalance(amount) {
  coins += amount;
  coinDisplay.textContent = coins;
}

function buyItem(name) {
  const priceMap = {
    'Cool Hat': 100,
    'Green Shades': 200,
    'Dark Blade': 300
  };

  const price = priceMap[name];
  if (coins >= price) {
    updateBalance(-price);
    showNotification(`✅ Куплено!`, true);
  } else {
    showNotification(`💸 Недостаточно`, false);
  }
}

document.getElementById('spinBtn').addEventListener('click', async () => {
  spinButton.disabled = true;

  const durations = [1, 2, 3];

  await Promise.all([
    animateReel(reels[0], durations[0]),
    animateReel(reels[1], durations[1]),
    animateReel(reels[2], durations[2])
  ]);

  const centerIcons = reels.map(getCenterIcon);
  const [a, b, c] = centerIcons;
  const win = a === b && b === c && a ===c;

  if (win) updateBalance(+100);
  showNotification(win ? 'WIN!' : 'Try again', win);

  spinButton.disabled = false;
});

// Инициализация при загрузке
window.onload = () => {
  reels.forEach(generateReelContent);
  coinDisplay.textContent = coins;
};

function goBack() {
  window.location.href = 'gameMenu.html';
}
