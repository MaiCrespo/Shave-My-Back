const container = document.getElementById("game-container");
const razor = document.getElementById("razor");

const layers = [
  { id: "layer1", src: "assets/HairOne.png", ctx: null, canvas: null },
  { id: "layer2", src: "assets/HairTwo.png", ctx: null, canvas: null },
  { id: "layer3", src: "assets/HairThree.png", ctx: null, canvas: null },
  { id: "layer4", src: "assets/HairFour.png", ctx: null, canvas: null },
];

let shaveHistory = {};
let undoStack = [];
let redoStack = [];
let lastX, lastY;
let isDrawing = false;

function init() {
  layers.forEach((layer, index) => {
    const canvas = document.getElementById(layer.id);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    layer.canvas = canvas;
    layer.ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = layer.src;
    img.onload = () => {
      const density = 60 + index * 35;
      for (let i = 0; i < density; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        layer.ctx.save();
        layer.ctx.translate(x, y);
        layer.ctx.rotate(Math.random() * Math.PI);
        layer.ctx.drawImage(img, -70, -70, 140, 140);
        layer.ctx.restore();
      }
      layer.ctx.globalCompositeOperation = "destination-out";
    };
  });
}

function updateUI() {
  document
    .getElementById("undoBtn")
    .classList.toggle("visible", undoStack.length > 0);
  document
    .getElementById("redoBtn")
    .classList.toggle("visible", redoStack.length > 0);
  document
    .getElementById("restartBtn")
    .classList.toggle("visible", undoStack.length > 0 || redoStack.length > 0);
}

// Captures everything: Hair layers, shave depth, and wounds
function getSnapshot() {
  return {
    layerData: layers.map((l) => l.canvas.toDataURL()),
    depthData: JSON.stringify(shaveHistory),
    woundHTML: container.innerHTML, // Saves existing wounds
  };
}

window.addEventListener("mousedown", (e) => {
  isDrawing = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

window.addEventListener("mouseup", () => {
  if (isDrawing) {
    isDrawing = false;
    undoStack.push(getSnapshot());
    if (undoStack.length > 20) undoStack.shift();
    redoStack = []; // Reset redo when a new action is taken
    updateUI();
  }
});

window.addEventListener("mousemove", (e) => {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";
  if (e.buttons === 1) smoothShave(e.clientX, e.clientY);
});

function smoothShave(x, y) {
  const gridKey = `${Math.floor(x / 15)}-${Math.floor(y / 15)}`;
  shaveHistory[gridKey] = (shaveHistory[gridKey] || 0) + 1;
  const depth = shaveHistory[gridKey];

  let activeCtx = null;
  if (depth <= 10) activeCtx = layers[3].ctx;
  else if (depth <= 20) activeCtx = layers[2].ctx;
  else if (depth <= 30) activeCtx = layers[1].ctx;
  else if (depth <= 40) activeCtx = layers[0].ctx;
  else if (depth === 41) spawnWound(x, y);

  if (activeCtx) {
    activeCtx.lineWidth = 65;
    activeCtx.lineCap = "round";
    activeCtx.lineJoin = "round";
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

function undo() {
  if (undoStack.length === 0) return;
  // Push current state to redo before moving back
  redoStack.push(getSnapshot());
  const state = undoStack.pop();
  applyState(state);
}

function redo() {
  if (redoStack.length === 0) return;
  // Push current state to undo before moving forward
  undoStack.push(getSnapshot());
  const state = redoStack.pop();
  applyState(state);
}

function applyState(state) {
  // 1. Restore Hair Layers
  state.layerData.forEach((data, i) => {
    const img = new Image();
    img.src = data;
    img.onload = () => {
      const ctx = layers[i].ctx;
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    };
  });
  // 2. Restore Shave Map
  shaveHistory = JSON.parse(state.depthData);
  // 3. Restore Wounds (removes wounds that didn't exist in that state)
  container.innerHTML = state.woundHTML;
  updateUI();
}

init();
