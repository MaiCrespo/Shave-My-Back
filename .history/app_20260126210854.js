const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("game-container");
const razor = document.getElementById("razor");

// Set internal resolution to match your Skin.png
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

const hairFiles = [
  "assets/HairOne.png",
  "assets/HairTwo.png",
  "assets/HairThree.png",
  "assets/HairFour.png",
];

const shaveMap = {};
let imagesLoaded = 0;
const hairImages = [];

// Handle scaling for different screen sizes
function scaleGame() {
  const scale = Math.min(
    window.innerWidth / GAME_WIDTH,
    window.innerHeight / GAME_HEIGHT
  );
  container.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", scaleGame);
scaleGame();

// Load images from assets folder
hairFiles.forEach((src, index) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    hairImages[index] = img;
    imagesLoaded++;
    if (imagesLoaded === hairFiles.length) {
      initGame();
    }
  };
});

function initGame() {
  // Fill the 1920x1080 area with random overlapping hairs
  for (let i = 0; i < 600; i++) {
    const img = hairImages[Math.floor(Math.random() * hairImages.length)];
    const x = Math.random() * GAME_WIDTH;
    const y = Math.random() * GAME_HEIGHT;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.drawImage(img, -75, -75, 200, 200);
    ctx.restore();
  }
  ctx.globalCompositeOperation = "destination-out";
}

window.addEventListener("mousemove", (e) => {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";

  if (e.buttons === 1) {
    // Calculate mouse position relative to the scaled container
    const rect = container.getBoundingClientRect();
    const scale = rect.width / GAME_WIDTH;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    shave(x, y);
  }
});

function shave(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 40, 0, Math.PI * 2);
  ctx.fill();

  // Trigger Wound: If user shaves the same spot too many times
  const gridKey = `${Math.floor(x / 25)}-${Math.floor(y / 25)}`;
  shaveMap[gridKey] = (shaveMap[gridKey] || 0) + 1;

  // Threshold for "shaving deeper than HairOne"
  if (shaveMap[gridKey] === 30) {
    const wound = document.createElement("img");
    wound.src = "assets/Wound.png";
    wound.className = "wound";
    wound.style.left = x - 50 + "px";
    wound.style.top = y - 50 + "px";
    container.appendChild(wound);
  }
}
