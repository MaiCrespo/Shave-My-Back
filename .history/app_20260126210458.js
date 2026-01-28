const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const razor = document.getElementById("razor");

canvas.width = 800; // Match your background image aspect ratio
canvas.height = 600;

const hairImages = [
  "HairOne.png",
  "HairTwo.png",
  "HairThree.png",
  "HairFour.png",
];
const woundImg = new Image();
woundImg.src = "Wound.png";

// 1. Fill the canvas with randomized, overlapping hairs
function initHairs() {
  for (let i = 0; i < 200; i++) {
    const img = new Image();
    img.src = hairImages[Math.floor(Math.random() * hairImages.length)];
    img.onload = () => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.drawImage(img, x, y, 100, 100);
    };
  }
  // Set the blend mode to "erase" for shaving
  ctx.globalCompositeOperation = "destination-out";
}

// 2. Track Mouse/Razor
window.addEventListener("mousemove", (e) => {
  razor.style.left = e.pageX + "px";
  razor.style.top = e.pageY + "px";

  if (e.buttons === 1) {
    // Shave while left-clicking
    shave(e.offsetX, e.offsetY);
  }
});

// 3. Shaving Logic
function shave(x, y) {
  ctx.lineWidth = 40;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Trigger Wound Logic
  // If user shaves too deep (e.g., clicks/drags in a specific area
  // or stays too long), draw the wound on the background.
  checkInjury(x, y);
}

const canvas = document.getElementById("hairCanvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("game-container");
const razor = document.getElementById("razor");

canvas.width = 800;
canvas.height = 600;

// Correct paths based on your assets folder
const hairFiles = [
  "assets/HairOne.png",
  "assets/HairTwo.png",
  "assets/HairThree.png",
  "assets/HairFour.png",
];

const shaveMap = {}; // Tracks how many times a spot has been shaved
let imagesLoaded = 0;
const hairImages = [];

// Load all hair images before starting
hairFiles.forEach((src, index) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    hairImages[index] = img;
    imagesLoaded++;
    if (imagesLoaded === hairFiles.length) {
      initSimulator();
    }
  };
});

function initSimulator() {
  // Fill the back with randomized, overlapping hairs
  for (let i = 0; i < 500; i++) {
    const img = hairImages[Math.floor(Math.random() * hairImages.length)];
    const x = Math.random() * canvas.width - 40;
    const y = Math.random() * canvas.height - 40;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * 0.5 - 0.25); // Slight random tilt
    ctx.drawImage(img, 0, 0, 100, 100);
    ctx.restore();
  }

  // Set "destination-out" to make the razor act as an eraser
  ctx.globalCompositeOperation = "destination-out";
}

// Handle mouse movement and shaving
window.addEventListener("mousemove", (e) => {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";

  if (e.buttons === 1) {
    // 1 = Left Click
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    performShave(x, y);
  }
});

function performShave(x, y) {
  // Erase the hair
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, Math.PI * 2);
  ctx.fill();

  // Depth Logic: Track "shave pressure"
  // We divide the screen into 10x10 grids to track local shaving
  const gridX = Math.floor(x / 10);
  const gridY = Math.floor(y / 10);
  const key = `${gridX}-${gridY}`;

  shaveMap[key] = (shaveMap[key] || 0) + 1;

  // Trigger wound if user shaves the same spot too much
  // (Essentially "going deeper" than the HairOne stubble level)
  if (shaveMap[key] === 15) {
    triggerWound(x, y);
  }
}

function triggerWound(x, y) {
  const wound = document.createElement("img");
  wound.src = "assets/Wound.png";
  wound.className = "wound";
  wound.style.left = x - 25 + "px";
  wound.style.top = y - 25 + "px";
  container.appendChild(wound);
}
