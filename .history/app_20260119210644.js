const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: "arcade" },
  scene: { preload, create, update },
};

const game = new Phaser.Game(config);
let hairs = [];
let razor;

function preload() {
  // LOADING ASSETS: Matching your screenshot filenames exactly
  this.load.image("skin_bg", "assets/Skin.png");
  this.load.image("h0", "assets/Hair_-_0.png");
  this.load.image("h1", "assets/Hair_-_1.png");
  this.load.image("h2", "assets/Hair_-_2.png");
  this.load.image("h3", "assets/Hair_-_3.png");
  this.load.image("razor_img", "assets/Razor.png");
  this.load.image("wound_img", "assets/Wound.png");
  this.load.image("irritation_img", "assets/Skin_Wound_State.png");
}

function create() {
  // 1. SKIN: Add the background first so it stays at the bottom
  let bg = this.add.image(
    window.innerWidth / 2,
    window.innerHeight / 2,
    "skin_bg"
  );
  bg.setDisplaySize(window.innerWidth, window.innerHeight);

  // 2. HAIRS: Create an overlapping grid
  const spacing = 35; // How close hairs are. Lower = more dense.
  for (let x = 0; x < window.innerWidth; x += spacing) {
    for (let y = 0; y < window.innerHeight; y += spacing) {
      // Random offset makes it look like natural back hair
      let rx = x + Phaser.Math.Between(-15, 15);
      let ry = y + Phaser.Math.Between(-15, 15);

      // Start at the longest state (h3)
      let h = this.add.sprite(rx, ry, "h3");
      h.growthStage = 3;
      h.irritation = 0;
      hairs.push(h);
    }
  }

  // 3. RAZOR: Custom cursor setup
  razor = this.add.image(0, 0, "razor_img").setDepth(100).setScale(0.5);
  this.input.setDefaultCursor("none"); // Hide the standard white arrow

  // 4. GROWTH LOOP: Make hairs grow fast every 1.5 seconds
  this.time.addEvent({
    delay: 1500,
    callback: () => {
      hairs.forEach((h) => {
        if (h.growthStage < 3) {
          h.growthStage++;
          h.setTexture("h" + h.growthStage);
        }
      });
    },
    loop: true,
  });
}

function update() {
  // Update razor position to follow mouse
  razor.x = this.input.x;
  razor.y = this.input.y;

  // Logic for shaving when mouse button is held down
  if (this.input.activePointer.isDown) {
    const mx = this.input.x;
    const my = this.input.y;

    hairs.forEach((h) => {
      let dist = Phaser.Math.Distance.Between(mx, my, h.x, h.y);

      // If razor is touching a hair
      if (dist < 45) {
        if (h.growthStage > 0) {
          // Gradually lessen growth state (3 -> 2 -> 1 -> 0)
          h.growthStage--;
          h.setTexture("h" + h.growthStage);
        } else {
          // If clicking too much on bare skin, trigger wounds
          h.irritation++;
          if (h.irritation === 25) {
            // Apply red irritation state
            this.add.image(h.x, h.y, "irritation_img").setAlpha(0.5);
          } else if (h.irritation > 60) {
            // Trigger actual wound asset
            this.add.image(h.x, h.y, "wound_img").setScale(0.25);
            h.irritation = -1000; // Stop wounding this specific spot
          }
        }
      }
    });
  }
}
