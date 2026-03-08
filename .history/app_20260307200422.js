// ── State ──────────────────────────────────────────────────────────────────
const container = document.getElementById("game-container");
const razor = document.getElementById("razor");
const ouchOverlay = document.getElementById("ouch-overlay");

const layers = [
  { id: "layer1", src: "assets/HairOne.png" },
  { id: "layer2", src: "assets/HairTwo.png" },
  { id: "layer3", src: "assets/HairThree.png" },
  { id: "layer4", src: "assets/HairFour.png" },
].map((obj) => ({
  ...obj,
  ctx: document.getElementById(obj.id).getContext("2d"),
  canvas: document.getElementById(obj.id),
}));

let shaveHistory = {};
let historyStack = [];
let historyIndex = -1;
let lastX, lastY;
let isDrawing = false;
let gameStarted = false;
let currentSkin = "Skin"; // default skin key (no extension)

// Skin → background image map
const SKIN_MAP = {
  Skin: "assets/Skin.png",
  TattooBG: "assets/TattooBG.png",
  GreenBG: "assets/GreenBG.png",
  AlienBG: "assets/AlienBGpng.png",
};

// Active/inactive image for each selector button pair
const SKIN_IMGS = {
  Skin: { active: "assets/SkinActive.png", inactive: "assets/SkinSmall.png" },
  TattooBG: {
    active: "assets/TattooedActive.png",
    inactive: "assets/Tattooed.png",
  },
  GreenBG: { active: "assets/GreenActive.png", inactive: "assets/Green.png" },
  AlienBG: { active: "assets/AlienActive.png", inactive: "assets/Alien.png" },
};

// ── Skin selection ──────────────────────────────────────────────────────────
function selectSkin(key) {
  currentSkin = key;

  // Update game-container background
  const bgSrc = SKIN_MAP[key] || `assets/${key}.png`;
  container.style.backgroundImage = `url("${bgSrc}")`;

  // Also update title screen bg to preview
  const titleScreen = document.getElementById("title-screen");
  if (titleScreen && !titleScreen.classList.contains("hidden")) {
    titleScreen.style.backgroundImage = `url("${bgSrc}")`;
  }

  // Refresh all selector button images (title + in-game)
  const prefixes = [
    {
      skin: "ts-skin",
      tattoo: "ts-tattoo",
      green: "ts-green",
      alien: "ts-alien",
    },
    {
      skin: "gs-skin",
      tattoo: "gs-tattoo",
      green: "gs-green",
      alien: "gs-alien",
    },
  ];
  const idMap = {
    Skin: "skin",
    TattooBG: "tattoo",
    GreenBG: "green",
    AlienBG: "alien",
  };

  prefixes.forEach((p) => {
    Object.entries(idMap).forEach(([skinKey, shortId]) => {
      const prefix = p[shortId];
      if (!prefix) return;
      const el = document.getElementById(prefix);
      if (!el) return;
      const img = el.querySelector("img");
      if (!img) return;
      const isActive = skinKey === key;
      img.src = isActive
        ? SKIN_IMGS[skinKey].active
        : SKIN_IMGS[skinKey].inactive;
    });
  });
}

// ── Title → Game transition ─────────────────────────────────────────────────
function startGame() {
  const titleScreen = document.getElementById("title-screen");
  titleScreen.classList.add("hidden");

  // Hide title skin selector, show in-game one
  document.getElementById("title-skin-selector").style.display = "none";
  document.getElementById("game-skin-selector").classList.add("visible");

  gameStarted = true;

  // Attach mouse/touch events now
  attachEvents();

  setTimeout(() => {
    titleScreen.style.display = "none";
    init();
  }, 650);
}

function restartGame() {
  // Clear wounds
  container.querySelectorAll(".wound").forEach((w) => w.remove());

  // Clear canvases
  layers.forEach((l) => {
    l.ctx.globalCompositeOperation = "source-over";
    l.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    l.ctx.globalCompositeOperation = "destination-out";
  });

  shaveHistory = {};
  historyStack = [];
  historyIndex = -1;
  updateUI();
  init();
}

// ── Init / Draw Hair ─────────────────────────────────────────────────────────
function init() {
  let loadedCount = 0;
  layers.forEach((layer, index) => {
    layer.canvas.width = window.innerWidth;
    layer.canvas.height = window.innerHeight;

    // Reset composite before drawing fresh hair
    layer.ctx.globalCompositeOperation = "source-over";
    layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);

    const img = new Image();
    img.src = layer.src;
    img.onload = () => {
      const density = 60 + index * 35;
      for (let i = 0; i < density; i++) {
        const x = Math.random() * layer.canvas.width;
        const y = Math.random() * layer.canvas.height;
        layer.ctx.save();
        layer.ctx.globalCompositeOperation = "source-over";
        layer.ctx.translate(x, y);
        layer.ctx.rotate(Math.random() * Math.PI);
        layer.ctx.drawImage(img, -70, -70, 140, 140);
        layer.ctx.restore();
      }
      layer.ctx.globalCompositeOperation = "destination-out";
      loadedCount++;
      if (loadedCount === 4) saveToHistory();
    };
  });
}

// ── History ──────────────────────────────────────────────────────────────────
function saveToHistory() {
  if (historyIndex < historyStack.length - 1) {
    historyStack = historyStack.slice(0, historyIndex + 1);
  }
  const woundDivs = document.createElement("div");
  container
    .querySelectorAll(".wound")
    .forEach((w) => woundDivs.appendChild(w.cloneNode(true)));

  historyStack.push({
    layers: layers.map((l) => l.canvas.toDataURL()),
    shave: JSON.stringify(shaveHistory),
    wounds: woundDivs.innerHTML,
  });

  if (historyStack.length > 20) historyStack.shift();
  else historyIndex++;

  updateUI();
}

function updateUI() {
  document
    .getElementById("undoBtn")
    .classList.toggle("visible", historyIndex > 0);
  document
    .getElementById("redoBtn")
    .classList.toggle("visible", historyIndex < historyStack.length - 1);
  document
    .getElementById("restartBtn")
    .classList.toggle("visible", historyIndex > 0);
}

// ── Mouse / Touch events ─────────────────────────────────────────────────────
function attachEvents() {
  window.addEventListener("mousedown", (e) => {
    isDrawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener("mouseup", () => {
    if (isDrawing) {
      isDrawing = false;
      saveToHistory();
    }
  });
  window.addEventListener("mousemove", (e) => {
    razor.style.left = e.clientX + "px";
    razor.style.top = e.clientY + "px";
    if (e.buttons === 1) smoothShave(e.clientX, e.clientY);
  });

  // Touch support
  window.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      isDrawing = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    },
    { passive: false }
  );
  window.addEventListener("touchend", () => {
    if (isDrawing) {
      isDrawing = false;
      saveToHistory();
    }
  });
  window.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const t = e.touches[0];
      razor.style.left = t.clientX + "px";
      razor.style.top = t.clientY + "px";
      smoothShave(t.clientX, t.clientY);
    },
    { passive: false }
  );
}

// ── Shaving logic ─────────────────────────────────────────────────────────────
function smoothShave(x, y) {
  const gridKey = `${Math.floor(x / 15)}-${Math.floor(y / 15)}`;
  shaveHistory[gridKey] = (shaveHistory[gridKey] || 0) + 1;
  const depth = shaveHistory[gridKey];

  let activeCtx = null;
  if (depth <= 10) activeCtx = layers[3].ctx;
  else if (depth <= 20) activeCtx = layers[2].ctx;
  else if (depth <= 30) activeCtx = layers[1].ctx;
  else if (depth <= 40) activeCtx = layers[0].ctx;
  else if (depth === 41) {
    spawnWound(x, y);
    triggerOuch();
  }

  if (activeCtx) {
    activeCtx.lineWidth = 65;
    activeCtx.lineCap = "round";
    activeCtx.beginPath();
    activeCtx.moveTo(lastX, lastY);
    activeCtx.lineTo(x, y);
    activeCtx.stroke();
  }
  lastX = x;
  lastY = y;
}

function spawnWound(x, y) {
  const wound = document.createElement("img");
  wound.src = "assets/Wound.png";
  wound.className = "wound";
  wound.style.left = x - 50 + "px";
  wound.style.top = y - 50 + "px";
  container.appendChild(wound);
}

function triggerOuch() {
  ouchOverlay.classList.remove("flash");
  // Force reflow so re-adding the class restarts the animation
  void ouchOverlay.offsetWidth;
  ouchOverlay.classList.add("flash");
}

// ── Undo / Redo ───────────────────────────────────────────────────────────────
function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    applyState(historyStack[historyIndex]);
  }
}

function redo() {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    applyState(historyStack[historyIndex]);
  }
}

function applyState(state) {
  state.layers.forEach((data, i) => {
    const img = new Image();
    img.src = data;
    img.onload = () => {
      // Must NOT use save/restore here — restore() would revert our composite op
      layers[i].ctx.globalCompositeOperation = "source-over";
      layers[i].ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      layers[i].ctx.drawImage(img, 0, 0);
      // Back to erasing mode so subsequent shaving works
      layers[i].ctx.globalCompositeOperation = "destination-out";
    };
  });
  shaveHistory = JSON.parse(state.shave);

  container.querySelectorAll(".wound").forEach((w) => w.remove());
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = state.wounds;
  tempDiv
    .querySelectorAll(".wound")
    .forEach((w) => container.appendChild(w.cloneNode(true)));

  updateUI();
}

// ── Razor follows mouse even on title screen ──────────────────────────────────
window.addEventListener("mousemove", (e) => {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";
});

// ── Kick off with default skin active ────────────────────────────────────────
selectSkin("Skin");
