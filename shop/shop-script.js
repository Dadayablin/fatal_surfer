const icons = ['🍒', '⭐', '💎', '🧨'];
const iconToSkin = {
  '🍒': 'Bull 2',
  '⭐': 'Bull 3',
  '💎': 'Bear 2',
  '🧨': 'Bear 3'
};
const reels = [document.getElementById('col1'), document.getElementById('col2'), document.getElementById('col3')];
const itemHeight = 60;
const totalItems = 50;
const baseSpeed = 300;

const spinButton = document.getElementById('spinBtn');
const notification = document.getElementById('notification');
const coinDisplay = document.getElementById('coinCount');
let coins = Number(get_data("coins"));

function disableSpinButton() {
  spinButton.disabled = true;
  spinButton.textContent = 'SOON';
  spinButton.style.background = '#2e2e2e';
  spinButton.style.color = '#888';
  spinButton.style.cursor = 'not-allowed';
}

function generateReelContent(reel) {
  const iconMap = {
    '🍒': '../img/bull2.png',
    '⭐': '../img/bull3.png',
    '💎': '../img/bear2.png',
    '🧨': '../img/bear3.png',
  };

  const unlockedSkins = JSON.parse(get_data("unlockedSkins") || '[]');
  const availableIcons = icons.filter(icon => {
    const skinName = iconToSkin[icon];
    return !unlockedSkins.includes(skinName);
  });

  // Если скинов больше нет — оставляем пустую рулетку
  if (availableIcons.length === 0) {
    reel.innerHTML = ''; // чистим
    disableSpinButton();
    return;
  }

  reel.innerHTML = '';
  for (let i = 0; i < totalItems; i++) {
    const icon = availableIcons[Math.floor(Math.random() * availableIcons.length)];
    const item = document.createElement('div');
    item.classList.add('reel-item');
    item.innerHTML = `<img src="${iconMap[icon]}" alt="${icon}" class="icon-img">`;
    reel.appendChild(item);
  }
}

function animateReel(reel, distanceMultiplier = 1) {
  return new Promise(resolve => {
    generateReelContent(reel);

    const steps = 10 + distanceMultiplier * 5;
    const stopIndex = steps;

    const offsetY = stopIndex * itemHeight;
    const duration = Math.round(offsetY / baseSpeed * 1000);

    reel.style.transition = 'none';
    reel.style.transform = `translateY(-${offsetY}px)`;
    void reel.offsetHeight;

    // Анимируем ВНИЗ — в позицию 0
    setTimeout(() => {
      reel.style.transition = `transform ${duration}ms linear`;
      reel.style.transform = `translateY(0)`;

      setTimeout(() => {
        reel.style.transition = 'none';
        reel.style.transform = `translateY(0)`; 
        reel.dataset.stopIndex = stopIndex;
        resolve();
      }, duration);
    }, 20);
  });
}

function unlockSkin(skinName) {
  const unlockedSkins = JSON.parse(get_data("unlockedSkins") || '[]');

  if (!unlockedSkins.includes(skinName)) {
    unlockedSkins.push(skinName);
    set_data('unlockedSkins', JSON.stringify(unlockedSkins), {secure: true, 'max-age': 360000000});
    showNotification(`New skin is unlocked!`, true);
  }
}

function getCenterIcon(reel) {
  const transformY = getComputedStyle(reel).transform;
  const matrix = new DOMMatrixReadOnly(transformY);
  const offsetY = matrix.m42;

  const centerIndex = Math.round(-offsetY / itemHeight);
  const img = reel.children[centerIndex]?.querySelector('img');
  return img?.alt || '❓';
}

function showNotification(text, isWin = false) {
  notification.textContent = isWin ? `${text}` : `${text}`;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2500);
}

function updateBalance(amount) {
  const start = coins;
  const end = coins + amount;

  // Обновляем баланс
  coins = end;

  if (amount < 0) {
    animateCounter(coinDisplay, start, end, 500);
  } else {
    coinDisplay.textContent = coins;
  }
}

function animateCounter(element, from, to, duration) {
  const steps = Math.min(20, Math.abs(from - to)); 
  const stepTime = Math.max(20, duration / steps);
  let current = from;
  const delta = (from - to) / steps;

  const interval = setInterval(() => {
    current -= delta;
    if ((delta > 0 && current <= to) || (delta < 0 && current >= to)) {
      current = to;
      clearInterval(interval);
    }
    element.textContent = Math.round(current);
  }, stepTime);
}

function buyItem(name) {
  const priceMap = {
    'Shield': 100,
    'Skate': 200,
    'Coins': 300
  };

  const price = priceMap[name];
  if (coins >= price) {
    updateBalance(-price);
    switch(name){
      case "Shield":{
        set_data('shield_time', `${Number(get_data("shield_time")) + 0.5}`, {secure: true, 'max-age': 360000000});
        set_data('coins', `${Number(get_data("coins")) - 100}`, {secure: true, 'max-age': 360000000});
        break;
      }
      case "Skate":{
        set_data('skate_multiplicator', `${Number(get_data("skate_multiplicator")) + 1}`, {secure: true, 'max-age': 360000000});
        set_data('skate_time', `${Number(get_data("skate_time")) + 0.5}`, {secure: true, 'max-age': 360000000});
        set_data('coins', `${Number(get_data("coins")) - 200}`, {secure: true, 'max-age': 360000000});
        break;
      }
      case "Coins":{
        set_data('coins_multiplicator', `${Number(get_data("coins_multiplicator")) + 1}`, {secure: true, 'max-age': 360000000});
        set_data('coins_time', `${Number(get_data("coins_time")) + 0.5}`, {secure: true, 'max-age': 360000000});
        set_data('coins', `${Number(get_data("coins")) - 300}`, {secure: true, 'max-age': 360000000});
        break;
      }
    }
    showNotification(`✅ Purchased!`, true);
  } else {
    showNotification(`❌ Not enough coins!`, false);
  }
}

document.getElementById('spinBtn').addEventListener('click', async () => {
  spinButton.disabled = true;

  // 💰 Проверка баланса
  if (coins < 1000) {
    showNotification('❌ Not enough coins!', false);
    spinButton.disabled = false;
    return;
  }

  // 💸 Списываем 1000 монет
  updateBalance(-1000);

  // Вращаем
  const durations = [1, 2, 3];

  await Promise.all([
    animateReel(reels[0], durations[0]),
    animateReel(reels[1], durations[1]),
    animateReel(reels[2], durations[2])
  ]);

  const centerIcons = reels.map(getCenterIcon);
  const [a, b, c] = centerIcons;
  console.log(centerIcons);
  console.log(a, b, c);

  // Победа — совпали три символа
  if (a === b && b === c) {
    showNotification('🎉 Skin unlocked!', true);

    // Разблокировка скина по символу
    const skinName = iconToSkin[a];
    if (skinName) unlockSkin(skinName);
  } else {
    showNotification('Try again', false);
  }

  spinButton.disabled = false;
});

window.onload = () => {
  reels.forEach(generateReelContent);
  coinDisplay.textContent = coins;

  const unlockedSkins = JSON.parse(get_data("unlockedSkins") || '[]');
  const availableIcons = icons.filter(icon => {
    const skinName = iconToSkin[icon];
    return !unlockedSkins.includes(skinName);
  });

  if (availableIcons.length === 0) {
    disableSpinButton();
  }
};

function goBack() {
  window.location.href = '../menu/gameMenu.html';
}
