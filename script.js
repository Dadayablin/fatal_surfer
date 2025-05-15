const character = document.querySelector("#hero");
const block = document.querySelector("#blocks");
const score = document.querySelector("#score");
const highScore = document.querySelector("#top-score");
const police = document.querySelector("#police");

let lost = true;

const moveRight = () => {
  if (lost) {
    lost = false;
  }
  let left = character.offsetLeft;
  if (left != 455) {
    left += 220;
  }
  character.style.left = left + "px";
  setTimeout(() => {
    police.style.left = left + "px";
  }, 100);
};

const moveLeft = () => {
  if (lost) {
    lost = false;
  }
  let left = character.offsetLeft;
  if (left != 15) {
    left -= 220;
  }
  character.style.left = left + "px";
  setTimeout(() => {
    police.style.left = left + "px";
  }, 100);
};

const topScoreHandler = (score, topScore) => {
  if (score > topScore) {
    localStorage.setItem("High Score", score);
    highScore.innerText = localStorage.getItem("High Score");
  }
};

window.addEventListener("keydown", (e) => {
  if (e.key == "ArrowRight" || e.key == "d") {
    moveRight();
  } else if (e.key == "ArrowLeft" || e.key == "a") {
    moveLeft();
  }
});

block.addEventListener("animationiteration", () => {
  let rand = Math.floor(Math.random() * 3); // 0 1 2
  block.style.left = rand * 220 + "px";

  if (!lost) {
    score.innerText = parseInt(score.innerText) + 1;
  }
});

setInterval(() => {
  let characterLeftPos = parseInt(
    window.getComputedStyle(character).getPropertyValue("left")
  );
  let blockLeftPos = parseInt(
    window.getComputedStyle(block).getPropertyValue("left")
  );

  let blockTopPos = parseInt(
    window.getComputedStyle(block).getPropertyValue("top")
  );

  if (
    (characterLeftPos === blockLeftPos - 15 ||
      characterLeftPos === blockLeftPos + 15) &&
    blockTopPos > 500 &&
    blockTopPos < 550
  ) {
    character.style.left = 235 + "px";
    lost = true;
    topScoreHandler(parseInt(score.innerText), parseInt(highScore.innerText));
    score.innerText = 0;
  }
});

window.addEventListener("load", () => {
  if (localStorage.getItem("High Score")) {
    highScore.innerText = localStorage.getItem("High Score");
  } else {
    localStorage.setItem("High Score", 0);
    highScore.innerText = localStorage.getItem("High Score");
  }
});
