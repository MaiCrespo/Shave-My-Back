const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: { preload, create, update },
};

const game = new Phaser.Game(config);
let hairs = [];
let razor;

function preload() {
  // MATCHING YOUR SCREENSHOT FILENAMES EXACTLY
  this.load.image("skin", "assets/Skin.png");
  this.load.image("hair0", "assets/Hair_-_0.png");
  this.load.image("hair1", "assets/Hair_-_1.png");
  this.load.image("hair2", "assets/Hair_-_2.png");
  this.load.image("hair3", "assets/Hair_-_3.png");
  this.load.image("razor", "assets/Razor.png");
  this.load.image("wound", "assets/Wound.png");
  this.load.image("irritation", "assets/Skin_Wound_State.png");
}

function create() {
  // 1. Background Skin - cover whole screen
  let bg = this.add.image(
    window.innerWidth / 2,
    window.innerHeight / 2,
    "skin"
  );
  bg.setDisplaySize(window.innerWidth, window.innerHeight);

  // 2. Create Overlapping Hairs
  const spacing = 35; // Lower number = more overlap/density
  for (let x = 0; x < window.innerWidth; x += spacing) {
    for (let y = 0; y < window.innerHeight; y += spacing) {
      let hX = x + Phaser.Math.Between(-15, 15);
      let hY = y + Phaser.Math.Between(-15, 15);

      // Start at max growth (hair3)
      let h = this.add.sprite(hX, hY, "hair3");
      h.growthLevel = 3;
      h.irritationLevel = 0;
      hairs.push(h);
    }
  }

  // 3. Razor Cursor
  razor = this.add.image(0, 0, "razor").setDepth(100).setScale(0.4);
  this.input.setDefaultCursor("none"); // Hide standard mouse

  // 4. Fast Growth Timer (Grows every 1.5 seconds)
  this.time.addEvent({
    delay: 1500,
    callback: () => {
      hairs.forEach((h) => {
        if (h.growthLevel < 3) {
          h.growthLevel++;
          h.setTexture("hair" + h.growthLevel);
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
    shaveAction(this);
  }
}

function shaveAction(scene) {
  const pointer = scene.input.activePointer;

  hairs.forEach((h) => {
    let dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, h.x, h.y);

    if (dist < 40) {
      if (h.growthLevel > 0) {
        // Gradually fall off (3 -> 2 -> 1 -> 0)
        h.growthLevel--;
        h.setTexture("hair" + h.growthLevel);
      } else {
        // If clicked too much at level 0, trigger wounds
        h.irritationLevel++;

        if (h.irritationLevel === 15) {
          // Show red irritation state
          scene.add.image(h.x, h.y, "irritation").setAlpha(0.4).setDepth(1);
        } else if (h.irritationLevel > 40) {
          // Trigger actual wound
          scene.add.image(h.x, h.y, "wound").setScale(0.2).setDepth(2);
          h.irritationLevel = -500; // Prevent spamming wounds on one spot
        }
      }
    }
  });
}
