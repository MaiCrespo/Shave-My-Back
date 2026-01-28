const container = document.getElementById("game-container");
const razor = document.getElementById("razor");

// Setup the four layers
const layers = [
  { id: "layer1", src: "assets/HairOne.png", ctx: null, threshold: 40 },
  { id: "layer2", src: "assets/HairTwo.png", ctx: null, threshold: 30 },
  { id: "layer3", src: "assets/HairThree.png", ctx: null, threshold: 20 },
  { id: "layer4", src: "assets/HairFour.png", ctx: null, threshold: 10 },
];

const shaveHistory = {}; // Tracks how many times a spot has been "hit"
let imagesLoaded = 0;

function init() {
  layers.forEach((layer, index) => {
    const canvas = document.getElementById(layer.id);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    layer.ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = layer.src;
    img.onload = () => {
      // Lower density to prevent the "wall of hair"
      // We use a lower multiplier for a more natural look
      const density = 80 + index * 40;
      for (let i = 0; i < density; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        layer.ctx.save();
        layer.ctx.translate(x, y);
        layer.ctx.rotate(Math.random() * Math.PI);
        layer.ctx.drawImage(img, -60, -60, 120, 120);
        layer.ctx.restore();
      }
      // Set eraser mode for this canvas
      layer.ctx.globalCompositeOperation = "destination-out";

      imagesLoaded++;
    };
  });
}

window.addEventListener("mousemove", (e) => {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";

  if (e.buttons === 1) {
    // Left click held
    performShave(e.clientX, e.clientY);
  }
});

function performShave(x, y) {
  // Grid key to track local shave depth
  const gridKey = `${Math.floor(x / 15)}-${Math.floor(y / 15)}`;
  shaveHistory[gridKey] = (shaveHistory[gridKey] || 0) + 1;
  const depth = shaveHistory[gridKey];

  // Progression Logic:
  // If depth is 1-10, erase Layer 4 (HairFour)
  // If depth is 11-20, erase Layer 3 (HairThree)
  // If depth is 21-30, erase Layer 2 (HairTwo)
  // If depth is 31-40, erase Layer 1 (HairOne)
  // If depth > 40, spawn a wound

  let activeLayer = null;
  if (depth <= 10) activeLayer = layers[3].ctx;
  else if (depth <= 20) activeLayer = layers[2].ctx;
  else if (depth <= 30) activeLayer = layers[1].ctx;
  else if (depth <= 40) activeLayer = layers[0].ctx;
  else if (depth === 41) {
    spawnWound(x, y);
  }

  if (activeLayer) {
    activeLayer.beginPath();
    activeLayer.arc(x, y, 35, 0, Math.PI * 2);
    activeLayer.fill();
  }
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
