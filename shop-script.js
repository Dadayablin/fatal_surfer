const icons = ['🍒', '🍋', '🔔', '⭐', '💎'];
const reels = [document.getElementById('col1'), document.getElementById('col2'), document.getElementById('col3')];
const itemHeight = 60;
const totalItems = 30;
const baseSpeed = 300; // px per second

const spinButton = document.getElementById('spinBtn');
const notification = document.getElementById('notification');

function generateReelContent(reel) {
  reel.innerHTML = '';
  for (let i = 0; i < totalItems; i++) {
    const item = document.createElement('div');
    item.classList.add('reel-item');
    item.textContent = icons[Math.floor(Math.random() * icons.length)];
    reel.appendChild(item);
  }
}

function getCenterIcon(reel, stopIndex) {
  return reel.children[stopIndex + 1].textContent;
}

function animateReel(reel, distanceMultiplier = 1) {
  return new Promise(resolve => {
    reel.style.transition = 'none';
    reel.style.transform = 'translateY(0)';
    void reel.offsetHeight;

    generateReelContent(reel);

    const steps = 10 + distanceMultiplier * 5;
    const stopIndex = steps;
    const offsetY = -(steps * itemHeight);
    const duration = Math.round((Math.abs(offsetY) / baseSpeed) * 1000);

    setTimeout(() => {
      reel.style.transition = `transform ${duration}ms linear`;
      reel.style.transform = `translateY(${offsetY}px)`;

      setTimeout(() => {
        reel.style.transition = 'none';
        const finalOffset = -(stopIndex * itemHeight);
        reel.style.transform = `translateY(${finalOffset}px)`;
        reel.dataset.stopIndex = stopIndex;
        resolve();
      }, duration);
    }, 20);
  });
}

function showNotification(text, isWin = false) {
  notification.textContent = isWin ? `🎉 ${text}` : `😔 ${text}`;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2500);
}

document.getElementById('spinBtn').addEventListener('click', async () => {
  spinButton.disabled = true;

  const durations = [1, 2, 3];

  await Promise.all([
    animateReel(reels[0], durations[0]),
    animateReel(reels[1], durations[1]),
    animateReel(reels[2], durations[2])
  ]);

  // Получаем центральные смайлики
  const iconsInCenter = reels.map(reel => {
    const index = parseInt(reel.dataset.stopIndex);
    return getCenterIcon(reel, index);
  });

  const [a, b, c] = iconsInCenter;
  const win = a === b && b === c;

  showNotification(win ? 'Ура! Ты выиграл!' : 'Не расстраивайся, повезёт в следующий раз!', win);

  spinButton.disabled = false;
});

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

let coins = 500;
const coinDisplay = document.getElementById('coinCount');

function updateBalance(amount) {
  coins += amount;
  coinDisplay.textContent = coins;
}

// Заполняем слоты при загрузке
window.onload = () => {
  reels.forEach(generateReelContent);
};

function goBack() {
  window.location.href = 'gameMenu.html';
}