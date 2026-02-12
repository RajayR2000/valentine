const SECRET = "kutti chutti";
const STRICT_SELECTION = true;

const moodToGif = {
  idle: "assets/dudu_cool.gif",
  talk: "assets/dudu_tease.gif",
  love: "assets/dudu_love.gif",
  kiss: "assets/dudu_kiss.gif",
  oops: "assets/dudu_cry.gif",
  sad2: "assets/dudu_sad_2.gif",
  happy: "assets/dudu_dance.gif",
  celebrate: "assets/dudu_dance_2.gif",
};

const state = {
  scene: 0,
  selectedTiles: new Set(),
  correctTileIds: new Set(["tile1", "tile2", "tile3", "tile4"]),
  nicknameOk: false,
  noDodges: 0,
};

const scenes = [...document.querySelectorAll(".scene")];
const narratorDock = document.getElementById("narratorDock");
const duduSprite = document.getElementById("duduSprite");
const duduBubble = document.getElementById("duduBubble");
const toast = document.getElementById("toast");
const tileButtons = [...document.querySelectorAll(".tile")];
const tileCounter = document.getElementById("tileCounter");
const nicknameInput = document.getElementById("nicknameInput");
const btnVerify = document.getElementById("btnVerify");
const captchaError = document.getElementById("captchaError");
const btnNo = document.getElementById("btnNo");
const buttonArena = document.getElementById("buttonArena");
const confettiLayer = document.getElementById("confettiLayer");
const hugGif = document.getElementById("hugGif");
const phaseBreak = document.getElementById("phaseBreak");
const phaseBreakGif = document.getElementById("phaseBreakGif");
const phaseBreakText = document.getElementById("phaseBreakText");
const isTouchDevice = window.matchMedia("(hover: none)").matches;

function preloadCoreGifs() {
  ["assets/dudu_walk.gif", moodToGif.idle, moodToGif.talk].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function say(text) {
  duduBubble.textContent = text;
}

function setDuduMood(mood) {
  duduSprite.src = moodToGif[mood] || moodToGif.idle;
}

function withTemporaryMood(mood, ms = 900) {
  setDuduMood(mood);
  window.setTimeout(() => setDuduMood("idle"), ms);
}

function goToScene(target) {
  state.scene = target;
  scenes.forEach((scene, index) => {
    scene.classList.toggle("is-active", index === target);
  });

  if (target > 0) narratorDock.classList.add("visible");
  else narratorDock.classList.remove("visible");

  if (target === 1) {
    say("Pick our photos, then answer the question.");
    setDuduMood("talk");
  } else if (target === 2) {
    say("Final question");
    setDuduMood("talk");
  } else if (target === 3) {
    say("Vera level da baby");
    setDuduMood("celebrate");
    loadHugGif();
    burstConfetti();
  } else {
    setDuduMood("idle");
    say("Dudu reporting for duty");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1400);
}

function selectedCorrectCount() {
  let count = 0;
  state.selectedTiles.forEach((id) => {
    if (state.correctTileIds.has(id)) count += 1;
  });
  return count;
}

function updateTileCounter() {
  tileCounter.textContent = `Selected: ${state.selectedTiles.size}`;
}

function selectionIsValid() {
  if (STRICT_SELECTION) {
    if (state.selectedTiles.size !== state.correctTileIds.size) return false;
    for (const id of state.correctTileIds) {
      if (!state.selectedTiles.has(id)) return false;
    }
    return true;
  }

  for (const id of state.correctTileIds) {
    if (!state.selectedTiles.has(id)) return false;
  }
  return true;
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function showPhaseBreak({ gif, text, duration = 1200, onDone }) {
  window.clearTimeout(showPhaseBreak.timeoutId);
  phaseBreakGif.src = gif;
  phaseBreakText.textContent = text;
  phaseBreak.classList.add("show");
  showPhaseBreak.timeoutId = window.setTimeout(() => {
    phaseBreak.classList.remove("show");
    if (onDone) onDone();
  }, duration);
}

function reactToSelection(changedTileId, wasSelected) {
  if (wasSelected) {
    withTemporaryMood("talk", 500);
    say("Thookidu chutti");
    return;
  }

  if (!state.correctTileIds.has(changedTileId)) {
    withTemporaryMood("oops", 900);
    say("Athu namma ella baby");
    showToast("Decoy spotted.");
    return;
  }

  const correctCount = selectedCorrectCount();
  if (correctCount <= 1) {
    withTemporaryMood("love", 700);
    say("Nicee");
  } else if (correctCount <= 3) {
    withTemporaryMood("kiss", 700);
    say("Smart gf");
  } else {
    withTemporaryMood("happy", 900);
    say("Top G baby nee dhan");
  }
}

function validateCaptcha() {
  const errors = [];

  if (!selectionIsValid()) {
    errors.push("Select only the photos that are us.");
  }

  state.nicknameOk = normalize(nicknameInput.value) === normalize(SECRET);
  if (!state.nicknameOk) {
    errors.push('Answer "how do I like to call you?" correctly.');
  }

  captchaError.textContent = errors.join(" ");
  if (errors.length) {
    withTemporaryMood("talk", 900);
    say("Close, but one check is still missing.");
    return;
  }

  showPhaseBreak({
    gif: "assets/dudu_dance.gif",
    text: "Round 1 over. Next round unlocked.",
    duration: 1250,
    onDone: () => goToScene(2),
  });
}

function randomInRange(max) {
  return Math.floor(Math.random() * Math.max(0, max));
}

function moveNoButton() {
  const arenaRect = buttonArena.getBoundingClientRect();
  const btnRect = btnNo.getBoundingClientRect();
  const padding = 10;
  const maxX = arenaRect.width - btnRect.width - padding;
  const maxY = arenaRect.height - btnRect.height - padding;

  btnNo.style.left = `${padding + randomInRange(maxX)}px`;
  btnNo.style.top = `${padding + randomInRange(maxY)}px`;
  btnNo.style.transform = "none";
}

function handleNoDodge() {
  const lines = [
    "No kudukatha baby",
    "Romba nandri",
    "Whyy kutti?",
    "Hehehehe",
  ];
  const labels = ["No", "No :/", "No :(", "No :\'(", "YES"];

  state.noDodges += 1;
  const index = Math.min(state.noDodges - 1, lines.length - 1);
  btnNo.textContent = labels[Math.min(state.noDodges, labels.length - 1)];
  withTemporaryMood("talk", 850);
  say(lines[index]);

  if (state.noDodges >= 4) {
    btnNo.classList.remove("btn-ghost");
    btnNo.classList.add("btn-primary");
  }

  moveNoButton();
}

function loadHugGif() {
  if (!hugGif.getAttribute("src")) {
    hugGif.src = hugGif.dataset.src;
  }
}

function burstConfetti() {
  confettiLayer.innerHTML = "";
  const colors = ["#f25f5c", "#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#ffffff"];

  for (let i = 0; i < 84; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1.4 + Math.random() * 1.8}s`;
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    confettiLayer.appendChild(piece);
  }

  window.clearTimeout(burstConfetti.timeoutId);
  burstConfetti.timeoutId = window.setTimeout(() => {
    confettiLayer.innerHTML = "";
  }, 3800);
}

function completePhaseTwo() {
  setDuduMood("happy");
  showPhaseBreak({
    gif: "assets/dudu_love.gif",
    text: "Round 2 complete.",
    duration: 1200,
    onDone: () => goToScene(3),
  });
}

function resetMission() {
  state.scene = 0;
  state.selectedTiles.clear();
  state.nicknameOk = false;
  state.noDodges = 0;

  tileButtons.forEach((tile) => tile.classList.remove("selected"));
  updateTileCounter();
  nicknameInput.value = "";
  captchaError.textContent = "";
  btnNo.textContent = "No";
  btnNo.classList.remove("btn-primary");
  btnNo.classList.add("btn-ghost");
  btnNo.style.left = "58%";
  btnNo.style.top = "52%";
  btnNo.style.transform = "translateY(-50%)";
  confettiLayer.innerHTML = "";
  phaseBreak.classList.remove("show");
  window.clearTimeout(showPhaseBreak.timeoutId);

  goToScene(0);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("btnStart").addEventListener("click", () => {
  withTemporaryMood("talk", 700);
  window.setTimeout(() => {
    goToScene(1);
    document.getElementById("scene1_captcha").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 160);
});

tileButtons.forEach((tile) => {
  tile.addEventListener("click", () => {
    const id = tile.dataset.id;
    const wasSelected = state.selectedTiles.has(id);

    if (wasSelected) {
      state.selectedTiles.delete(id);
      tile.classList.remove("selected");
    } else {
      state.selectedTiles.add(id);
      tile.classList.add("selected");
    }

    updateTileCounter();
    reactToSelection(id, wasSelected);
  });
});

btnVerify.addEventListener("click", validateCaptcha);
nicknameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") validateCaptcha();
});

document.getElementById("btnYes").addEventListener("click", () => {
  completePhaseTwo();
});

if (isTouchDevice) {
  btnNo.addEventListener("click", (event) => {
    if (state.noDodges >= 4) {
      completePhaseTwo();
      return;
    }
    event.preventDefault();
    handleNoDodge();
    showToast("Nice try.");
  });
} else {
  btnNo.addEventListener("mouseenter", () => {
    if (state.noDodges >= 4) return;
    handleNoDodge();
  });
  btnNo.addEventListener("click", (event) => {
    if (state.noDodges >= 4) {
      completePhaseTwo();
      return;
    }
    event.preventDefault();
    handleNoDodge();
  });
}

document.getElementById("btnReplay").addEventListener("click", resetMission);
preloadCoreGifs();
