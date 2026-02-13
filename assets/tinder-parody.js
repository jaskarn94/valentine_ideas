const cards = [
  {
    id: 1,
    photo: "./assets/photos/me-1.jpg",
    name: "Jaskaran",
    age: 20,
    distance: "12 km away",
    bio: "Classic era: soft launch to dangerous charm."
  },
  {
    id: 2,
    photo: "./assets/photos/me-2.jpg",
    name: "Jaskaran",
    age: 20,
    distance: "12 km away",
    bio: "Adventure mode unlocked. Sunglasses included."
  },
  {
    id: 3,
    photo: "./assets/photos/me-3.jpg",
    name: "Jaskaran",
    age: 20,
    distance: "12 km away",
    bio: "Backpack phase, still very matchable."
  },
  {
    id: 4,
    photo: "./assets/photos/me-4.jpg",
    name: "Jaskaran",
    age: 31,
    distance: "2 km away",
    bio: "Cafe checkpoint. Dessert mostly survived."
  },
  {
    id: 5,
    photo: "./assets/photos/me-5.jpg",
    name: "Jaskaran",
    age: 31,
    distance: "1 km away",
    bio: "Latest drop. Street side hero shot."
  }
];

const LEFT_MESSAGE = "you are kutie";
const RIGHT_MESSAGES = [
  "you are lucky",
  "you are the chosen one",
  "You got a punjabi.",
  "fate has decided"
];

const state = {
  currentIndex: 0,
  swipeCount: 0,
  rightSwipeCount: 0,
  isDragging: false,
  pendingSwipe: false,
  audioEnabled: false
};

const dragState = {
  pointerId: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  lastX: 0,
  lastTime: 0,
  velocityX: 0
};

const refs = {
  cardStack: document.getElementById("cardStack"),
  deckWrap: document.getElementById("deckWrap"),
  toast: document.getElementById("toast"),
  leftBtn: document.getElementById("leftBtn"),
  rightBtn: document.getElementById("rightBtn"),
  actions: document.getElementById("actions"),
  finalPanel: document.getElementById("finalPanel"),
  yesBtn: document.getElementById("yesBtn"),
  audioToggle: document.getElementById("audioToggle"),
  confettiCanvas: document.getElementById("confettiCanvas"),
  ambientAudio: document.getElementById("ambientAudio"),
  leftAudio: document.getElementById("leftAudio"),
  rightAudio: document.getElementById("rightAudio"),
  matchAudio: document.getElementById("matchAudio")
};

const confetti = {
  particles: [],
  raf: null,
  endAt: 0,
  ctx: null,
  width: 0,
  height: 0,
  dpr: 1
};

let toastTimer = null;

function init() {
  refs.leftBtn.addEventListener("click", () => handleButtonSwipe("left"));
  refs.rightBtn.addEventListener("click", () => handleButtonSwipe("right"));
  refs.yesBtn.addEventListener("click", handleYesClick);
  refs.audioToggle.addEventListener("click", toggleAudio);
  window.addEventListener("resize", resizeConfettiCanvas);

  setupConfetti();
  renderDeck();
  showToast("Swipe any direction. It is always a match.", "right");
}

function renderDeck() {
  refs.cardStack.innerHTML = "";

  const remaining = cards.length - state.currentIndex;
  if (remaining <= 0) {
    showFinalPanel();
    return;
  }

  for (let depth = remaining - 1; depth >= 0; depth -= 1) {
    const cardData = cards[state.currentIndex + depth];
    const cardEl = buildCard(cardData, depth);
    refs.cardStack.appendChild(cardEl);
  }
}

function buildCard(cardData, depth) {
  const card = document.createElement("article");
  card.className = "profile-card";
  card.dataset.cardId = String(cardData.id);
  card.style.transform = getStackTransform(depth);
  card.style.zIndex = String(40 - depth);

  const img = document.createElement("img");
  img.src = cardData.photo;
  img.alt = `${cardData.name} profile card ${cardData.id}`;
  img.loading = "eager";
  img.addEventListener("error", () => {
    img.classList.add("fallback");
    img.removeAttribute("src");
  });

  const gradient = document.createElement("div");
  gradient.className = "card-gradient";

  const info = document.createElement("div");
  info.className = "card-info";
  info.innerHTML = `
    <h2 class="name-row">${cardData.name}<span>${cardData.age}</span></h2>
    <p class="meta-row">${cardData.distance}</p>
    <p class="bio">${cardData.bio}</p>
  `;

  const nopeBadge = document.createElement("div");
  nopeBadge.className = "badge nope";
  nopeBadge.textContent = "NOPE";

  const likeBadge = document.createElement("div");
  likeBadge.className = "badge like";
  likeBadge.textContent = "LIKE";

  card.append(img, gradient, info, nopeBadge, likeBadge);

  if (depth === 0) {
    card.classList.add("is-top");
    bindDrag(card, nopeBadge, likeBadge);
  }

  return card;
}

function getStackTransform(depth) {
  const y = depth * 8;
  const scale = 1 - depth * 0.028;
  return `translateY(${y}px) scale(${scale})`;
}

function bindDrag(card, nopeBadge, likeBadge) {
  card.addEventListener("pointerdown", (event) => {
    if (state.isDragging || state.pendingSwipe || state.currentIndex >= cards.length) {
      return;
    }

    state.isDragging = true;
    dragState.pointerId = event.pointerId;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.currentX = event.clientX;
    dragState.currentY = event.clientY;
    dragState.lastX = event.clientX;
    dragState.lastTime = performance.now();
    dragState.velocityX = 0;

    card.setPointerCapture(event.pointerId);
    card.style.transition = "none";
  });

  card.addEventListener("pointermove", (event) => {
    if (!state.isDragging || event.pointerId !== dragState.pointerId) {
      return;
    }

    dragState.currentX = event.clientX;
    dragState.currentY = event.clientY;

    const deltaX = dragState.currentX - dragState.startX;
    const deltaY = dragState.currentY - dragState.startY;
    const rotation = deltaX * 0.06;
    const pullY = deltaY * 0.13;

    card.style.transform = `translate(${deltaX}px, ${pullY}px) rotate(${rotation}deg)`;
    updateBadges(deltaX, nopeBadge, likeBadge);

    const now = performance.now();
    const elapsed = Math.max(now - dragState.lastTime, 1);
    dragState.velocityX = (event.clientX - dragState.lastX) / elapsed;
    dragState.lastX = event.clientX;
    dragState.lastTime = now;
  });

  const onRelease = (event) => {
    if (!state.isDragging || event.pointerId !== dragState.pointerId) {
      return;
    }

    state.isDragging = false;
    card.releasePointerCapture(event.pointerId);

    const deltaX = dragState.currentX - dragState.startX;
    const fastEnough = Math.abs(dragState.velocityX) > 0.5 && Math.abs(deltaX) > 32;
    const farEnough = Math.abs(deltaX) > 110;

    if (fastEnough || farEnough) {
      const direction = deltaX >= 0 ? "right" : "left";
      commitSwipe(direction, card);
      return;
    }

    card.style.transition = "transform 0.22s ease";
    card.style.transform = getStackTransform(0);
    updateBadges(0, nopeBadge, likeBadge);
  };

  card.addEventListener("pointerup", onRelease);
  card.addEventListener("pointercancel", onRelease);
}

function updateBadges(deltaX, nopeBadge, likeBadge) {
  const strength = Math.min(Math.abs(deltaX) / 130, 1);
  if (deltaX > 0) {
    likeBadge.style.opacity = String(strength);
    nopeBadge.style.opacity = "0";
    return;
  }

  if (deltaX < 0) {
    nopeBadge.style.opacity = String(strength);
    likeBadge.style.opacity = "0";
    return;
  }

  nopeBadge.style.opacity = "0";
  likeBadge.style.opacity = "0";
}

function handleButtonSwipe(direction) {
  if (state.pendingSwipe || state.isDragging || state.currentIndex >= cards.length) {
    return;
  }

  const topCard = refs.cardStack.querySelector(".profile-card.is-top");
  if (!topCard) {
    return;
  }

  commitSwipe(direction, topCard);
}

function commitSwipe(direction, card) {
  if (!card || state.pendingSwipe) {
    return;
  }

  state.pendingSwipe = true;
  state.isDragging = false;
  card.style.transition = "transform 0.28s ease-out, opacity 0.28s ease-out";
  card.classList.add(direction === "left" ? "swipe-left" : "swipe-right");
  playSwipeAudio(direction);

  window.setTimeout(() => {
    resolveSwipe(direction);
  }, 280);
}

function resolveSwipe(direction) {
  state.swipeCount += 1;
  state.currentIndex += 1;

  if (direction === "left") {
    showToast(LEFT_MESSAGE, "left");
  } else {
    const idx = Math.min(state.rightSwipeCount, RIGHT_MESSAGES.length - 1);
    showToast(RIGHT_MESSAGES[idx], "right");
    state.rightSwipeCount += 1;
  }

  state.pendingSwipe = false;

  if (state.swipeCount >= cards.length) {
    window.setTimeout(showFinalPanel, 220);
    return;
  }

  renderDeck();
}

function showFinalPanel() {
  refs.deckWrap.classList.add("hidden");
  refs.actions.classList.add("hidden");
  refs.finalPanel.classList.remove("hidden");
}

function handleYesClick() {
  if (refs.yesBtn.disabled) {
    return;
  }

  refs.yesBtn.disabled = true;
  refs.yesBtn.textContent = "MATCHED";
  launchConfetti();
  playAudio(refs.matchAudio);

  window.setTimeout(() => {
    resetGame();
  }, 2800);
}

function resetGame() {
  state.currentIndex = 0;
  state.swipeCount = 0;
  state.rightSwipeCount = 0;
  state.isDragging = false;
  state.pendingSwipe = false;

  refs.finalPanel.classList.add("hidden");
  refs.deckWrap.classList.remove("hidden");
  refs.actions.classList.remove("hidden");
  refs.yesBtn.disabled = false;
  refs.yesBtn.textContent = "YES";

  renderDeck();
  showToast("Round reset. Still a guaranteed match.", "right");
}

function showToast(message, direction) {
  refs.toast.textContent = message;
  refs.toast.className = `toast ${direction} show`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    refs.toast.className = "toast";
  }, 1500);
}

function toggleAudio() {
  if (state.audioEnabled) {
    state.audioEnabled = false;
    refs.audioToggle.classList.remove("enabled");
    refs.audioToggle.textContent = "Enable Sound";
    refs.ambientAudio.pause();
    refs.ambientAudio.currentTime = 0;
    return;
  }

  state.audioEnabled = true;
  refs.audioToggle.classList.add("enabled");
  refs.audioToggle.textContent = "Sound On";
  refs.ambientAudio.volume = 0.18;
  playAudio(refs.ambientAudio);
}

function playSwipeAudio(direction) {
  if (!state.audioEnabled) {
    return;
  }

  const clip = direction === "left" ? refs.leftAudio : refs.rightAudio;
  playAudio(clip);
}

function playAudio(audioEl) {
  if (!audioEl || !state.audioEnabled) {
    return;
  }

  audioEl.currentTime = 0;
  audioEl.play().catch(() => {
    state.audioEnabled = false;
    refs.audioToggle.classList.remove("enabled");
    refs.audioToggle.textContent = "Enable Sound";
  });
}

function setupConfetti() {
  confetti.ctx = refs.confettiCanvas.getContext("2d");
  resizeConfettiCanvas();
}

function resizeConfettiCanvas() {
  confetti.dpr = window.devicePixelRatio || 1;
  confetti.width = window.innerWidth;
  confetti.height = window.innerHeight;
  refs.confettiCanvas.width = Math.floor(confetti.width * confetti.dpr);
  refs.confettiCanvas.height = Math.floor(confetti.height * confetti.dpr);
  refs.confettiCanvas.style.width = `${confetti.width}px`;
  refs.confettiCanvas.style.height = `${confetti.height}px`;
  confetti.ctx.setTransform(confetti.dpr, 0, 0, confetti.dpr, 0, 0);
}

function launchConfetti() {
  const palette = ["#ff5d7f", "#ff8c5d", "#ffd266", "#48d597", "#4fa8ff", "#ffffff"];
  confetti.particles = [];
  confetti.endAt = performance.now() + 2100;

  for (let i = 0; i < 180; i += 1) {
    confetti.particles.push({
      x: Math.random() * confetti.width,
      y: -20 - Math.random() * confetti.height * 0.4,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4.5,
      size: 4 + Math.random() * 7,
      color: palette[Math.floor(Math.random() * palette.length)],
      angle: Math.random() * Math.PI * 2,
      spin: -0.22 + Math.random() * 0.44
    });
  }

  if (confetti.raf) {
    cancelAnimationFrame(confetti.raf);
  }

  const tick = (now) => {
    confetti.ctx.clearRect(0, 0, confetti.width, confetti.height);

    for (const item of confetti.particles) {
      item.x += item.vx;
      item.y += item.vy;
      item.vy += 0.03;
      item.angle += item.spin;

      confetti.ctx.save();
      confetti.ctx.translate(item.x, item.y);
      confetti.ctx.rotate(item.angle);
      confetti.ctx.fillStyle = item.color;
      confetti.ctx.fillRect(-item.size / 2, -item.size / 2, item.size, item.size * 0.6);
      confetti.ctx.restore();
    }

    confetti.particles = confetti.particles.filter((item) => item.y < confetti.height + 40);

    if (now < confetti.endAt || confetti.particles.length > 0) {
      confetti.raf = requestAnimationFrame(tick);
      return;
    }

    confetti.ctx.clearRect(0, 0, confetti.width, confetti.height);
  };

  confetti.raf = requestAnimationFrame(tick);
}

init();
