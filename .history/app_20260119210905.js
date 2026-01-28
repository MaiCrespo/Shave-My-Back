const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#3d2b1f", // A dark brown backup color
  scene: { preload, create, update },
};

const game = new Phaser.Game(config);
let hairs = [];
let razor;

function preload() {
  // 1. Setup an error logger to see why files fail
  this.load.on("loaderror", (file) => {
    console.error("FILE FAILED TO LOAD:", file.src);
  });

  // 2. MATCHING YOUR FOLDER FILENAMES EXACTLY (Case Sensitive)
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
  // 1. ADD SKIN: Scale it to fill the screen
  let bg = this.add.image(
    window.innerWidth / 2,
    window.innerHeight / 2,
    "skin_bg"
  );
  bg.setDisplaySize(window.innerWidth, window.innerHeight);

  // 2. ADD HAIRS: Create the grid
  const spacing = 40;
  for (let x = 0; x < window.innerWidth; x += spacing) {
    for (let y = 0; y < window.innerHeight; y += spacing) {
      let rx = x + Phaser.Math.Between(-15, 15);
      let ry = y + Phaser.Math.Between(-15, 15);

      let h = this.add.sprite(rx, ry, "h3");
      h.growthStage = 3;
      h.irritation = 0;
      hairs.push(h);
    }
  }

  // 3. RAZOR
  razor = this.add.image(0, 0, "razor_img").setDepth(100).setScale(0.5);
  this.input.setDefaultCursor("none");

  // 4. GROWTH TIMER
  this.time.addEvent({
    delay: 2000,
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
  razor.x = this.input.x;
  razor.y = this.input.y;

  if (this.input.activePointer.isDown) {
    const mx = this.input.x;
    const my = this.input.y;

    hairs.forEach((h) => {
      let dist = Phaser.Math.Distance.Between(mx, my, h.x, h.y);

      if (dist < 50) {
        if (h.growthStage > 0) {
          h.growthStage--;
          h.setTexture("h" + h.growthStage);
        } else {
          h.irritation++;
          if (h.irritation === 30) {
            this.add.image(h.x, h.y, "irritation_img").setAlpha(0.5);
          } else if (h.irritation > 70) {
            this.add.image(h.x, h.y, "wound_img").setScale(0.3);
            h.irritation = -1000;
          }
        }
      }
    });
  }
}
