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

function checkInjury(x, y) {
  // Logic: If the razor moves too fast or hits a 'danger' zone
  // For this example, let's say "HairOne" depth is 50px
  // If the "y" coordinate is at a certain spot, trigger wound
  if (Math.random() > 0.98) {
    // Random chance to 'nick' the skin
    const bg = document.body;
    const wound = document.createElement("img");
    wound.src = "Wound.png";
    wound.style.position = "absolute";
    wound.style.left = x - 25 + "px";
    wound.style.top = y - 25 + "px";
    wound.style.width = "50px";
    wound.style.pointerEvents = "none";
    document.body.appendChild(wound);
  }
}

initHairs();
