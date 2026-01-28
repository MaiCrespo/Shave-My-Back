const container = document.getElementById("game-container");
const razor = document.getElementById("razor");

// Setup the four layers
const layers = [
  { id: "layer1", src: "assets/HairOne.png", ctx: null },
  { id: "layer2", src: "assets/HairTwo.png", ctx: null },
  { id: "layer3", src: "assets/HairThree.png", ctx: null },
  { id: "layer4", src: "assets/HairFour.png", ctx: null },
];

const shaveHistory = {};
let lastX, lastY; // For smooth line drawing

function init() {
  layers.forEach((layer, index) => {
    const canvas = document.getElementById(layer.id);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    layer.ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = layer.src;
    img.onload = () => {
      // Balanced density for a natural look
      const density = 70 + index * 40;
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

window.addEventListener("mousedown", (e) => {
  lastX = e.clientX;
  lastY = e.clientY;
});

window.addEventListener("mousemove", (e) => {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";

  if (e.buttons === 1) {
    smoothShave(e.clientX, e.clientY);
  }
});

function smoothShave(x, y) {
  // Grid key to track local shave depth
  const gridKey = `${Math.floor(x / 15)}-${Math.floor(y / 15)}`;
  shaveHistory[gridKey] = (shaveHistory[gridKey] || 0) + 1;
  const depth = shaveHistory[gridKey];

  // Progression Logic: Layer 4 -> 3 -> 2 -> 1 -> Wound
  let activeCtx = null;
  if (depth <= 10) activeCtx = layers[3].ctx; // HairFour
  else if (depth <= 20) activeCtx = layers[2].ctx; // HairThree
  else if (depth <= 30) activeCtx = layers[1].ctx; // HairTwo
  else if (depth <= 40) activeCtx = layers[0].ctx; // HairOne
  else if (depth === 41) spawnWound(x, y);

  if (activeCtx) {
    // Draw smooth lines to prevent patchiness
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

init();
