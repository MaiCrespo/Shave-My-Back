var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#3d2b1f", // Back-up skin tone color
  scene: { preload: preload, create: create },
};

const game = new Phaser.Game(config);
let hairs = [];
let razor;

function preload() {
  // 1. MATCHING YOUR FILENAMES EXACTLY
  this.load.image("skin_bg", "assets/Skin.png");
  this.load.image("h3", "assets/HairTwo.png");
  this.load.image("razor_img", "assets/Razor.png");
  this.load.image("wound_img", "assets/Wound.png");
  this.load.image("irritation_img", "assets/Skin_Wound_State.png");
}

function create() {
  // 2. DRAW SKIN FIRST: Position it in the center
  // console.log("the skin should load");
  let bg = this.add.image(
    window.innerWidth / 2,
    window.innerHeight / 2,
    "skin_bg"
  );
  bg.setDisplaySize(window.innerWidth, window.innerHeight);

  // 3. GENERATE HAIR GRID:
  const spacing = 40;
  for (let x = 0; x < window.innerWidth; x += spacing) {
    for (let y = 0; y < window.innerHeight; y += spacing) {
      // Add randomness so it doesn't look like a perfect grid
      let rx = x + Phaser.Math.Between(-15, 15);
      let ry = y + Phaser.Math.Between(-15, 15);

      // Start at stage 3 (longest hair)
      let h = this.add.sprite(rx, ry, "h3");
      h.growthStage = 3;
      h.irritation = 0;
      hairs.push(h);
    }
  }

  // 4. RAZOR CURSOR:
  razor = this.add.image(0, 0, "razor_img").setDepth(100).setScale(0.5);
  this.input.setDefaultCursor("none");

  // 5. GROWTH TIMER: Hairs grow every 1.5 seconds
  //   this.time.addEvent({
  //     delay: 1500,
  //     callback: () => {
  //       hairs.forEach((h) => {
  //         if (h.growthStage < 3) {
  //           h.growthStage++;
  //           h.setTexture("h" + h.growthStage);
  //         }
  //       });
  //     },
  //     loop: true,
  //   });
  // }

  function update() {
    console.log("pdate");
  }
  //   // Follow mouse
  //   razor.x = this.input.x;
  //   razor.y = this.input.y;

  // SHAVE LOGIC: Only happens when mouse is held down
  //   if (this.input.activePointer.isDown) {
  //     const mx = this.input.x;
  //     const my = this.input.y;

  //     hairs.forEach((h) => {
  //       let dist = Phaser.Math.Distance.Between(mx, my, h.x, h.y);

  //       if (dist < 50) {
  //         if (h.growthStage > 0) {
  //           // Shave down the stages
  //           h.growthStage--;
  //           h.setTexture("h" + h.growthStage);
  //         } else {
  //           // Start irritating the skin if already bald
  //           h.irritation++;
  //           if (h.irritation === 30) {
  //             this.add.image(h.x, h.y, "irritation_img").setAlpha(0.5);
  //           } else if (h.irritation > 70) {
  //             this.add.image(h.x, h.y, "wound_img").setScale(0.3);
  //             h.irritation = -1000; // Stop wounding this spot
  //           }
  //         }
  //       }
  //     });
  //   }
}
