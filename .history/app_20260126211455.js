const container = document.getElementById("game-container");
const razor = document.getElementById("razor");
const layers = [
  { id: "layer1", src: "assets/HairOne.png", ctx: null },
  { id: "layer2", src: "assets/HairTwo.png", ctx: null },
  { id: "layer3", src: "assets/HairThree.png", ctx: null },
  { id: "layer4", src: "assets/HairFour.png", ctx: null },
];

const shaveHistory = {}; // Tracks depth per area

function init() {
  layers.forEach((layer, index) => {
    const canvas = document.getElementById(layer.id);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    layer.ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = layer.src;
    img.onload = () => fillLayer(layer.ctx, img, index);
  });
}

function fillLayer(ctx, img, level) {
  // Fill the screen with hair. Higher layers (longer hair) get more density.
  const density = 400 + level * 200;
  for (let i = 0; i < density; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.drawImage(img, -75, -75, 150, 150);
    ctx.restore();
  }
  // Set to eraser mode
  ctx.globalCompositeOperation = "destination-out";
}

window.addEventListener("mousemove", (e) => {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";

  if (e.buttons === 1) {
    performNaturalShave(e.clientX, e.clientY);
  }
});

function performNaturalShave(x, y) {
  const gridKey = `${Math.floor(x / 20)}-${Math.floor(y / 20)}`;
  shaveHistory[gridKey] = (shaveHistory[gridKey] || 0) + 1;

  const depth = shaveHistory[gridKey];

  // Progression Logic:
  // 0-10 hits: Erase Layer 4 (HairFour)
  // 11-20 hits: Erase Layer 3 (HairThree)
  // 21-30 hits: Erase Layer 2 (HairTwo)
  // 31-40 hits: Erase Layer 1 (HairOne)
  // 41+ hits: TRIGGER WOUND

  let targetLayer;
  if (depth <= 10) targetLayer = layers[3].ctx; // HairFour
  else if (depth <= 20) targetLayer = layers[2].ctx; // HairThree
  else if (depth <= 30) targetLayer = layers[1].ctx; // HairTwo
  else if (depth <= 40) targetLayer = layers[0].ctx; // HairOne
  else if (depth === 41) {
    spawnWound(x, y);
    return;
  }

  if (targetLayer) {
    targetLayer.beginPath();
    targetLayer.arc(x, y, 40, 0, Math.PI * 2);
    targetLayer.fill();
  }
}

function spawnWound(x, y) {
  const wound = document.createElement("img");
  wound.src = "assets/Wound.png";
  wound.className = "wound";
  wound.style.left = x - 40 + "px";
  wound.style.top = y - 40 + "px";
  container.appendChild(wound);
}

init();
