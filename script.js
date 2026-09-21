/* =========================================
   ZAY BRACELET SIMULATOR
   ========================================= */

const canvas = document.getElementById("braceletCanvas");
const ctx = canvas.getContext("2d");

const BRACELET_PRICES = {
  1: 15,
  2: 18,
  3: 22,
  4: 20
};

const BRACELET_NAMES = {
  1: "Cable Chain",
  2: "Curb Chain",
  3: "Oval Link Chain",
  4: "Paperclip Chain"
};

/* =========================================
   CHARM DISPLAY SETTINGS
   ========================================= */

const CHARM_SIZE = 64;
const INITIAL_SPACING = 125;

let selectedBracelet = 1;
let selectedCharmIndex = null;
let placedCharms = [];
let availableCharms = [];

let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

/*
   Stores the visible/non-transparent area
   of each PNG so transparent padding does
   not make charms look tiny.
*/
const cropCache = new Map();


/* =========================================
   LOAD IMAGE
   ========================================= */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;

    img.src = src;
  });
}


/* =========================================
   FIND REAL PNG CONTENT
   ========================================= */

function getVisibleBounds(img) {

  if (cropCache.has(img.src)) {
    return cropCache.get(img.src);
  }

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = img.naturalWidth;
  tempCanvas.height = img.naturalHeight;

  tempCtx.clearRect(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );

  tempCtx.drawImage(
    img,
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );

  const imageData = tempCtx.getImageData(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );

  const data = imageData.data;

  let minX = tempCanvas.width;
  let minY = tempCanvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < tempCanvas.height; y++) {

    for (let x = 0; x < tempCanvas.width; x++) {

      const alpha =
        data[(y * tempCanvas.width + x) * 4 + 3];

      if (alpha > 10) {

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

      }
    }
  }

  /*
     If the image is completely transparent,
     fall back to the entire image.
  */
  if (maxX === -1) {

    const fallback = {
      x: 0,
      y: 0,
      width: img.naturalWidth,
      height: img.naturalHeight
    };

    cropCache.set(img.src, fallback);

    return fallback;
  }

  /*
     Small breathing room around the actual charm.
  */
  const padding = 2;

  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(
    tempCanvas.width - 1,
    maxX + padding
  );
  maxY = Math.min(
    tempCanvas.height - 1,
    maxY + padding
  );

  const bounds = {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };

  cropCache.set(img.src, bounds);

  return bounds;
}


/* =========================================
   DRAW CHARM
   ========================================= */

function drawCharm(item, index) {

  if (!item.img) return;

  const img = item.img;

  if (!img.complete || img.naturalWidth === 0) {
    return;
  }

  const bounds = getVisibleBounds(img);

  const sourceWidth = bounds.width;
  const sourceHeight = bounds.height;

  /*
     Fit the REAL visible charm inside
     CHARM_SIZE x CHARM_SIZE.
  */
  const scale = Math.min(
    CHARM_SIZE / sourceWidth,
    CHARM_SIZE / sourceHeight
  );

  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;

  const drawX =
    item.x - drawWidth / 2;

  const drawY =
    item.y - drawHeight / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    img,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
}


/* =========================================
   DRAW BRACELET
   ========================================= */

async function drawCanvas() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const braceletSrc =
    `assets/bracelet-${selectedBracelet}.png`;

  try {

    const braceletImg =
      await loadImage(braceletSrc);

    const naturalWidth =
      braceletImg.naturalWidth;

    const naturalHeight =
      braceletImg.naturalHeight;

    let maxWidth =
      canvas.width * 0.94;

    let maxHeight =
      canvas.height * 0.70;

    /*
       Cable + Curb should appear larger.
    */
    if (
      selectedBracelet === 1 ||
      selectedBracelet === 2
    ) {

      maxWidth =
        canvas.width * 0.98;

      maxHeight =
        canvas.height * 0.78;
    }

    const scale = Math.min(
      maxWidth / naturalWidth,
      maxHeight / naturalHeight
    );

    const width =
      naturalWidth * scale;

    const height =
      naturalHeight * scale;

    const x =
      (canvas.width - width) / 2;

    const y =
      (canvas.height - height) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      braceletImg,
      x,
      y,
      width,
      height
    );

  } catch (error) {

    console.error(
      "Could not load bracelet:",
      error
    );
  }

  /*
     Draw charms AFTER bracelet.
  */
  placedCharms.forEach((item, index) => {
    drawCharm(item, index);
  });
}


/* =========================================
   GET AVAILABLE CHARM
   ========================================= */

function findAvailableCharm(id) {

  return availableCharms.find(
    charm => charm.id === id
  );
}


/* =========================================
   ADD CHARM
   ========================================= */

async function addCharm(charm) {

  const img = await loadImage(charm.src);

  /*
     Calculate starting position.

     Charms are spread across the bracelet
     rather than stacked together.
  */
  const index =
    placedCharms.length;

  const centerX =
    canvas.width / 2;

  const totalWidth =
    Math.max(
      0,
      (index + 1) * INITIAL_SPACING
    );

  let startX;

  if (index === 0) {

    startX = centerX;

  } else {

    const existingCount =
      placedCharms.length;

    const groupWidth =
      existingCount * INITIAL_SPACING;

    const firstX =
      centerX - groupWidth / 2;

    /*
       Re-space all existing charms
       whenever a new one is added.
    */
    placedCharms.forEach((item, i) => {

      item.x =
        centerX -
        ((existingCount) * INITIAL_SPACING) / 2 +
        i * INITIAL_SPACING +
        INITIAL_SPACING / 2;

    });

    startX =
      centerX -
      ((existingCount + 1) * INITIAL_SPACING) / 2 +
      existingCount * INITIAL_SPACING +
      INITIAL_SPACING / 2;
  }

  /*
     Put charms slightly below the
     center of the bracelet.
  */
  const startY =
    canvas.height / 2 + 45;

  placedCharms.push({
    charm,
    img,
    x: startX,
    y: startY
  });

  selectedCharmIndex =
    placedCharms.length - 1;

  updatePrice();
  drawCanvas();
}


/* =========================================
   FIND CHARM AT POSITION
   ========================================= */

function findCharmAt(x, y) {

  /*
     Check from topmost charm backwards.
  */
  for (
    let i = placedCharms.length - 1;
    i >= 0;
    i--
  ) {

    const item =
      placedCharms[i];

    const distance =
      Math.sqrt(
        Math.pow(x - item.x, 2) +
        Math.pow(y - item.y, 2)
      );

    /*
       Larger click area than the visual
       charm itself, making mobile easier.
    */
    if (distance <= CHARM_SIZE * 0.75) {
      return i;
    }
  }

  return null;
}


/* =========================================
   CANVAS POSITION
   ========================================= */

function getCanvasPosition(event) {

  const rect =
    canvas.getBoundingClientRect();

  const scaleX =
    canvas.width / rect.width;

  const scaleY =
    canvas.height / rect.height;

  let clientX;
  let clientY;

  if (event.touches && event.touches.length) {

    clientX =
      event.touches[0].clientX;

    clientY =
      event.touches[0].clientY;

  } else {

    clientX =
      event.clientX;

    clientY =
      event.clientY;
  }

  return {
    x:
      (clientX - rect.left) * scaleX,

    y:
      (clientY - rect.top) * scaleY
  };
}


/* =========================================
   MOUSE DOWN
   ========================================= */

canvas.addEventListener(
  "mousedown",
  function(event) {

    const pos =
      getCanvasPosition(event);

    const index =
      findCharmAt(
        pos.x,
        pos.y
      );

    if (index === null) {

      selectedCharmIndex = null;
      return;
    }

    selectedCharmIndex = index;

    const item =
      placedCharms[index];

    dragOffsetX =
      pos.x - item.x;

    dragOffsetY =
      pos.y - item.y;

    dragging = true;

    event.preventDefault();
  }
);


/* =========================================
   MOUSE MOVE
   ========================================= */

canvas.addEventListener(
  "mousemove",
  function(event) {

    if (!dragging) return;

    if (
      selectedCharmIndex === null
    ) {
      return;
    }

    const pos =
      getCanvasPosition(event);

    const item =
      placedCharms[
        selectedCharmIndex
      ];

    /*
       Completely free movement.
       No line.
       No snapping.
    */
    item.x =
      pos.x - dragOffsetX;

    item.y =
      pos.y - dragOffsetY;

    /*
       Keep charm inside canvas.
    */
    const margin =
      CHARM_SIZE / 2;

    item.x =
      Math.max(
        margin,
        Math.min(
          canvas.width - margin,
          item.x
        )
      );

    item.y =
      Math.max(
        margin,
        Math.min(
          canvas.height - margin,
          item.y
        )
      );

    drawCanvas();
  }
);


/* =========================================
   MOUSE UP
   ========================================= */

window.addEventListener(
  "mouseup",
  function() {

    dragging = false;
  }
);


/* =========================================
   TOUCH START
   ========================================= */

canvas.addEventListener(
  "touchstart",
  function(event) {

    const pos =
      getCanvasPosition(event);

    const index =
      findCharmAt(
        pos.x,
        pos.y
      );

    if (index === null) {
      return;
    }

    selectedCharmIndex =
      index;

    const item =
      placedCharms[index];

    dragOffsetX =
      pos.x - item.x;

    dragOffsetY =
      pos.y - item.y;

    dragging = true;

    event.preventDefault();
  },
  { passive: false }
);


/* =========================================
   TOUCH MOVE
   ========================================= */

canvas.addEventListener(
  "touchmove",
  function(event) {

    if (!dragging) return;

    if (
      selectedCharmIndex === null
    ) {
      return;
    }

    const pos =
      getCanvasPosition(event);

    const item =
      placedCharms[
        selectedCharmIndex
      ];

    item.x =
      pos.x - dragOffsetX;

    item.y =
      pos.y - dragOffsetY;

    const margin =
      CHARM_SIZE / 2;

    item.x =
      Math.max(
        margin,
        Math.min(
          canvas.width - margin,
          item.x
        )
      );

    item.y =
      Math.max(
        margin,
        Math.min(
          canvas.height - margin,
          item.y
        )
      );

    drawCanvas();

    event.preventDefault();
  },
  { passive: false }
);


/* =========================================
   TOUCH END
   ========================================= */

canvas.addEventListener(
  "touchend",
  function() {

    dragging = false;
  }
);


/* =========================================
   REMOVE SELECTED CHARM
   ========================================= */

function removeSelectedCharm() {

  if (
    selectedCharmIndex === null
  ) {
    return;
  }

  placedCharms.splice(
    selectedCharmIndex,
    1
  );

  selectedCharmIndex = null;

  updatePrice();
  drawCanvas();
}


/* =========================================
   CLEAR DESIGN
   ========================================= */

function clearDesign() {

  placedCharms = [];
  selectedCharmIndex = null;

  updatePrice();
  drawCanvas();
}


/* =========================================
   UPDATE PRICE
   ========================================= */

function updatePrice() {

  let total =
    BRACELET_PRICES[
      selectedBracelet
    ];

  placedCharms.forEach(item => {

    total +=
      Number(item.charm.price);
  });

  const priceElement =
    document.getElementById(
      "totalPrice"
    );

  if (priceElement) {

    priceElement.textContent =
      `AED ${total}`;
  }
}


/* =========================================
   SAVE DESIGN
   ========================================= */

function saveDesign() {

  const link =
    document.createElement("a");

  link.download =
    "ZAY-my-bracelet.png";

  link.href =
    canvas.toDataURL("image/png");

  link.click();
}


/* =========================================
   CHAIN SELECTION
   ========================================= */

function setupChains() {

  const chainCards =
    document.querySelectorAll(
      ".chain-card"
    );

  chainCards.forEach(card => {

    card.addEventListener(
      "click",
      function() {

        selectedBracelet =
          Number(
            card.dataset.bracelet
          );

        chainCards.forEach(c =>
          c.classList.remove(
            "selected"
          )
        );

        card.classList.add(
          "selected"
        );

        updatePrice();
        drawCanvas();
      }
    );
  });

  const firstCard =
    document.querySelector(
      '.chain-card[data-bracelet="1"]'
    );

  if (firstCard) {
    firstCard.classList.add(
      "selected"
    );
  }
}


/* =========================================
   CATEGORY FILTER
   ========================================= */

function setupCategories() {

  const select =
    document.getElementById(
      "categorySelect"
    );

  if (!select) return;

  const categories =
    [
      ...new Set(
        availableCharms.map(
          charm => charm.category
        )
      )
    ].sort();

  select.innerHTML =
    `<option value="all">All Charms</option>`;

  categories.forEach(category => {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      category;

    option.textContent =
      category;

    select.appendChild(
      option
    );
  });

  select.addEventListener(
    "change",
    function() {

      renderCharmGrid(
        select.value
      );
    }
  );
}


/* =========================================
   RENDER CHARM GRID
   ========================================= */

function renderCharmGrid(
  category = "all"
) {

  const grid =
    document.getElementById(
      "charmGrid"
    );

  if (!grid) return;

  grid.innerHTML = "";

  const charms =
    availableCharms.filter(
      charm =>
        category === "all" ||
        charm.category === category
    );

  charms.forEach(charm => {

    const card =
      document.createElement(
        "button"
      );

    card.className =
      "charm-card";

    card.type =
      "button";

    card.innerHTML = `
      <img
        src="${charm.src}"
        alt=""
      >
      <span class="charm-price">
        AED ${charm.price}
      </span>
    `;

    card.addEventListener(
      "click",
      function() {

        addCharm(charm);
      }
    );

    grid.appendChild(card);
  });
}


/* =========================================
   BUTTONS
   ========================================= */

function setupButtons() {

  const removeButton =
    document.getElementById(
      "removeCharm"
    );

  const clearButton =
    document.getElementById(
      "clearDesign"
    );

  const saveButton =
    document.getElementById(
      "saveDesign"
    );

  if (removeButton) {

    removeButton.addEventListener(
      "click",
      removeSelectedCharm
    );
  }

  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearDesign
    );
  }

  if (saveButton) {

    saveButton.addEventListener(
      "click",
      saveDesign
    );
  }
}


/* =========================================
   INITIALIZE
   ========================================= */

async function initialize() {

  try {

    availableCharms =
      await CHARMS_READY;

    console.log(
      `ZAY: ${availableCharms.length} charms loaded.`
    );

    setupChains();
    setupCategories();
    renderCharmGrid();
    setupButtons();

    updatePrice();
    drawCanvas();

  } catch (error) {

    console.error(
      "ZAY initialization error:",
      error
    );
  }
}


initialize();
