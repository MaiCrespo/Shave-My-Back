const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("game-container");
const razor = document.getElementById("razor");

canvas.width = 800;
canvas.height = 600;

// Corrected paths to match your "assets" folder
const hairFiles = [
  "assets/HairOne.png",
  "assets/HairTwo.png",
  "assets/HairThree.png",
  "assets/HairFour.png",
];

const shaveMap = {};
let loadedCount = 0;
const hairImages = [];

// Preload images
hairFiles.forEach((src, index) => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    hairImages[index] = img;
    loadedCount++;
    if (loadedCount === hairFiles.length) {
      setupHairs();
    }
  };
});

function setupHairs() {
  // Generate 400 random hairs
  for (let i = 0; i < 400; i++) {
    const img = hairImages[Math.floor(Math.random() * hairImages.length)];
    const x = Math.random() * canvas.width - 50;
    const y = Math.random() * canvas.height - 50;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.drawImage(img, 0, 0, 100, 100);
    ctx.restore();
  }
  // "destination-out" makes the drawing act as an eraser
  ctx.globalCompositeOperation = "destination-out";
}

window.addEventListener("mousemove", (e) => {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";

  if (e.buttons === 1) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Erase hair
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Track "Depth"
    const gridKey = `${Math.floor(x / 15)}-${Math.floor(y / 15)}`;
    shaveMap[gridKey] = (shaveMap[gridKey] || 0) + 1;

    // If user shaves the same spot too much, it triggers the wound
    if (shaveMap[gridKey] === 20) {
      spawnWound(x, y);
    }
  }
});

function spawnWound(x, y) {
  const wound = document.createElement("img");
  wound.src = "assets/Wound.png"; // Fixed path
  wound.className = "wound";
  wound.style.left = x - 30 + "px";
  wound.style.top = y - 30 + "px";
  container.appendChild(wound);
}
