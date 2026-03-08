const container = document.getElementById("game-container");
const razor = document.getElementById("razor");
const ouchOverlay = document.getElementById("ouch-overlay");

const layers = [
  { id: "layer1", src: "assets/HairOne.png" },
  { id: "layer2", src: "assets/HairTwo.png" },
  { id: "layer3", src: "assets/HairThree.png" },
  { id: "layer4", src: "assets/HairFour.png" },
].map((obj) => ({
  ...obj,
  ctx: document.getElementById(obj.id).getContext("2d"),
  canvas: document.getElementById(obj.id),
}));

let shaveHistory = {};
let historyStack = [];
let historyIndex = -1;
let lastX, lastY;
let isDrawing = false;
let currentSkin = "Skin";

const SKIN_MAP = {
  Skin: "assets/Skin.png",
  TattooBG: "assets/TattooBG.png",
  GreenBG: "assets/GreenBG.png",
  AlienBG: "assets/AlienBGpng.png",
};

const SKIN_IMGS = {
  Skin: { active: "assets/SkinActive.png", inactive: "assets/SkinSmall.png" },
  TattooBG: {
    active: "assets/TattooedActive.png",
    inactive: "assets/Tattooed.png",
  },
  GreenBG: { active: "assets/GreenActive.png", inactive: "assets/Green.png" },
  AlienBG: { active: "assets/AlienActive.png", inactive: "assets/Alien.png" },
};

function selectSkin(key) {
  currentSkin = key;
  const bgSrc = SKIN_MAP[key] || "assets/" + key + ".png";
  container.style.backgroundImage = 'url("' + bgSrc + '")';
  const titleScreen = document.getElementById("title-screen");
  if (titleScreen && !titleScreen.classList.contains("hidden")) {
    titleScreen.style.backgroundImage = 'url("' + bgSrc + '")';
  }
  const idMap = {
    Skin: "skin",
    TattooBG: "tattoo",
    GreenBG: "green",
    AlienBG: "alien",
  };
  ["ts", "gs"].forEach(function (prefix) {
    Object.entries(idMap).forEach(function (entry) {
      var skinKey = entry[0],
        short = entry[1];
      var el = document.getElementById(prefix + "-" + short);
      if (!el) return;
      var img = el.querySelector("img");
      if (!img) return;
      img.src =
        skinKey === key
          ? SKIN_IMGS[skinKey].active
          : SKIN_IMGS[skinKey].inactive;
    });
  });
}

function startGame() {
  var titleScreen = document.getElementById("title-screen");
  titleScreen.classList.add("hidden");
  document.getElementById("title-skin-selector").style.display = "none";
  document.getElementById("game-skin-selector").classList.add("visible");
  attachEvents();
  setTimeout(function () {
    titleScreen.style.display = "none";
    init();
  }, 650);
}

function restartGame() {
  container.querySelectorAll(".wound").forEach(function (w) {
    w.remove();
  });
  shaveHistory = {};
  historyStack = [];
  historyIndex = -1;
  updateUI();
  init();
}

function init() {
  var loadedCount = 0;
  layers.forEach(function (layer, index) {
    // Resizing clears canvas AND resets context state to defaults (source-over)
    layer.canvas.width = window.innerWidth;
    layer.canvas.height = window.innerHeight;

    var img = new Image();
    img.onload = function () {
      var density = 60 + index * 35;
      for (var i = 0; i < density; i++) {
        var x = Math.random() * layer.canvas.width;
        var y = Math.random() * layer.canvas.height;
        layer.ctx.setTransform(1, 0, 0, 1, x, y);
        layer.ctx.rotate(Math.random() * Math.PI);
        layer.ctx.drawImage(img, -70, -70, 140, 140);
      }
      layer.ctx.resetTransform();
      layer.ctx.globalCompositeOperation = "destination-out";
      loadedCount++;
      console.log("Layer loaded:", index, "count:", loadedCount);
      if (loadedCount === layers.length) {
        console.log("All layers loaded, saving initial history");
        saveToHistory();
      }
    };
    img.src = layer.src;
  });
}

function snapshotLayers() {
  return layers.map(function (l) {
    l.ctx.globalCompositeOperation = "source-over";
    var url = l.canvas.toDataURL();
    l.ctx.globalCompositeOperation = "destination-out";
    // Check the snapshot is non-empty
    console.log("Snapshot length:", url.length);
    return url;
  });
}

function saveToHistory() {
  if (historyIndex < historyStack.length - 1) {
    historyStack = historyStack.slice(0, historyIndex + 1);
  }
  var woundDivs = document.createElement("div");
  container.querySelectorAll(".wound").forEach(function (w) {
    woundDivs.appendChild(w.cloneNode(true));
  });
  historyStack.push({
    layers: snapshotLayers(),
    shave: JSON.stringify(shaveHistory),
    wounds: woundDivs.innerHTML,
  });
  if (historyStack.length > 20) {
    historyStack.shift();
  } else {
    historyIndex++;
  }
  console.log(
    "saveToHistory: index=",
    historyIndex,
    "stack length=",
    historyStack.length
  );
  updateUI();
}

function updateUI() {
  document
    .getElementById("undoBtn")
    .classList.toggle("visible", historyIndex > 0);
  document
    .getElementById("redoBtn")
    .classList.toggle("visible", historyIndex < historyStack.length - 1);
  document
    .getElementById("restartBtn")
    .classList.toggle("visible", historyIndex > 0);
}

function attachEvents() {
  window.addEventListener("mousedown", function (e) {
    isDrawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener("mouseup", function () {
    if (isDrawing) {
      isDrawing = false;
      saveToHistory();
    }
  });
  window.addEventListener("mousemove", function (e) {
    razor.style.left = e.clientX + "px";
    razor.style.top = e.clientY + "px";
    if (e.buttons === 1) smoothShave(e.clientX, e.clientY);
  });
  window.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault();
      isDrawing = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    },
    { passive: false }
  );
  window.addEventListener("touchend", function () {
    if (isDrawing) {
      isDrawing = false;
      saveToHistory();
    }
  });
  window.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
      var t = e.touches[0];
      razor.style.left = t.clientX + "px";
      razor.style.top = t.clientY + "px";
      smoothShave(t.clientX, t.clientY);
    },
    { passive: false }
  );
}

function smoothShave(x, y) {
  var gridKey = Math.floor(x / 15) + "-" + Math.floor(y / 15);
  shaveHistory[gridKey] = (shaveHistory[gridKey] || 0) + 1;
  var depth = shaveHistory[gridKey];
  var activeCtx = null;
  if (depth <= 10) activeCtx = layers[3].ctx;
  else if (depth <= 20) activeCtx = layers[2].ctx;
  else if (depth <= 30) activeCtx = layers[1].ctx;
  else if (depth <= 40) activeCtx = layers[0].ctx;
  else if (depth === 41) {
    spawnWound(x, y);
    triggerOuch();
  }
  if (activeCtx) {
    activeCtx.lineWidth = 65;
    activeCtx.lineCap = "round";
    activeCtx.beginPath();
    activeCtx.moveTo(lastX, lastY);
    activeCtx.lineTo(x, y);
    activeCtx.stroke();
  }
  lastX = x;
  lastY = y;
}

function spawnWound(x, y) {
  var wound = document.createElement("img");
  wound.src = "assets/Wound.png";
  wound.className = "wound";
  wound.style.left = x - 50 + "px";
  wound.style.top = y - 50 + "px";
  container.appendChild(wound);
}

function triggerOuch() {
  ouchOverlay.classList.remove("flash");
  void ouchOverlay.offsetWidth;
  ouchOverlay.classList.add("flash");
}

function undo() {
  console.log(
    "undo called, historyIndex=",
    historyIndex,
    "stack=",
    historyStack.length
  );
  if (historyIndex > 0) {
    historyIndex--;
    applyState(historyStack[historyIndex]);
  }
}

function redo() {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    applyState(historyStack[historyIndex]);
  }
}

function applyState(state) {
  console.log("applyState called, restoring index", historyIndex);
  isDrawing = false;
  var loadedCount = 0;
  state.layers.forEach(function (data, i) {
    var img = new Image();
    img.onload = function () {
      console.log("applyState layer", i, "loaded, drawing...");
      layers[i].ctx.globalCompositeOperation = "source-over";
      layers[i].ctx.clearRect(
        0,
        0,
        layers[i].canvas.width,
        layers[i].canvas.height
      );
      layers[i].ctx.drawImage(img, 0, 0);
      layers[i].ctx.globalCompositeOperation = "destination-out";
      loadedCount++;
      if (loadedCount === layers.length) {
        console.log("applyState complete");
        shaveHistory = JSON.parse(state.shave);
        container.querySelectorAll(".wound").forEach(function (w) {
          w.remove();
        });
        var tmp = document.createElement("div");
        tmp.innerHTML = state.wounds;
        tmp.querySelectorAll(".wound").forEach(function (w) {
          container.appendChild(w.cloneNode(true));
        });
        updateUI();
      }
    };
    img.src = data;
  });
}

window.addEventListener("mousemove", function (e) {
  razor.style.left = e.clientX + "px";
  razor.style.top = e.clientY + "px";
});

selectSkin("Skin");
