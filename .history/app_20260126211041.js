const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("game-container");
const razor = document.getElementById("razor");

// Set canvas to full window size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

const hairFiles = [
  "assets/HairOne.png",
  "assets/HairTwo.png",
  "assets/HairThree.png",
  "assets/HairFour.png",
];

const shaveMap = {};
let imagesLoaded = 0;
const hairImages = [];

// Load images and then spawn hairs
hairFiles.forEach((src, index) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    hairImages[index] = img;
    imagesLoaded++;
    if (imagesLoaded === hairFiles.length) {
      initHairs();
    }
  };
});

function initHairs() {
  // Fill the entire screen. More hairs = denser coverage.
  const hairDensity = 600;
  for (let i = 0; i < hairDensity; i++) {
    const img = hairImages[Math.floor(Math.random() * hairImages.length)];
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.drawImage(img, -75, -75, 150, 150);
    ctx.restore();
  }
  // Set globalCompositeOperation to 'destination-out' for the shaving effect
  ctx.globalCompositeOperation = "destination-out";
}

window.addEventListener("mousemove", (e) => {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";

  if (e.buttons === 1) {
    // While holding left click
    shave(e.clientX, e.clientY);
  }
});

function shave(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 40, 0, Math.PI * 2);
  ctx.fill();

  // Trigger Wound Logic: Shave "deeper" than stubble
  const gridKey = `${Math.floor(x / 20)}-${Math.floor(y / 20)}`;
  shaveMap[gridKey] = (shaveMap[gridKey] || 0) + 1;

  if (shaveMap[gridKey] === 25) {
    const wound = document.createElement("img");
    wound.src = "assets/Wound.png";
    wound.className = "wound";
    wound.style.left = x - 40 + "px";
    wound.style.top = y - 40 + "px";
    container.appendChild(wound);
  }
}
