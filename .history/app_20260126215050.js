const container = document.getElementById("game-container");
const razor = document.getElementById("razor");
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
let lastX,
  lastY,
  isDrawing = false;

function init() {
  let loadedCount = 0;
  layers.forEach((layer, index) => {
    layer.canvas.width = window.innerWidth;
    layer.canvas.height = window.innerHeight;
    const img = new Image();
    img.src = layer.src;
    img.onload = () => {
      const density = 60 + index * 35; // Keep it natural
      for (let i = 0; i < density; i++) {
        const x = Math.random() * layer.canvas.width;
        const y = Math.random() * layer.canvas.height;
        layer.ctx.save();
        layer.ctx.translate(x, y);
        layer.ctx.rotate(Math.random() * Math.PI);
        layer.ctx.drawImage(img, -70, -70, 140, 140);
        layer.ctx.restore();
      }
      layer.ctx.globalCompositeOperation = "destination-out";
      loadedCount++;
      if (loadedCount === 4) {
        saveToHistory(); // Capture "Full Hair" state as Index 0
      }
    };
  });
}

function saveToHistory() {
  // If we were in the middle of an undo chain and started drawing, chop off the "future"
  if (historyIndex < historyStack.length - 1) {
    historyStack = historyStack.slice(0, historyIndex + 1);
  }

  historyStack.push({
    layers: layers.map((l) => l.canvas.toDataURL()),
    shave: JSON.stringify(shaveHistory),
    wounds: container.innerHTML,
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
    activeCtx.lineWidth = 65; // Smooth dragging
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
      layers[i].ctx.save();
      layers[i].ctx.globalCompositeOperation = "source-over";
      layers[i].ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      layers[i].ctx.drawImage(img, 0, 0);
      layers[i].ctx.restore();
    };
  });
  shaveHistory = JSON.parse(state.shave);

  // Clean up wounds carefully
  const currentWounds = container.querySelectorAll(".wound");
  currentWounds.forEach((w) => w.remove());
  container.insertAdjacentHTML("beforeend", ""); // Placeholder logic
  // We only want to restore the wound images, not the canvases inside the innerHTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = state.wounds;
  tempDiv
    .querySelectorAll(".wound")
    .forEach((w) => container.appendChild(w.cloneNode(true)));

  updateUI();
}

init();
