/* =========================================
   ZAY CHARMS
   BUILD YOUR BRACELET
========================================= */


/* =========================================
   BRACELETS
========================================= */

const BRACELETS = {
  1: {
    name: "Cable Chain",
    price: 15,
    src: "assets/bracelet-1.png"
  },

  2: {
    name: "Curb Chain",
    price: 18,
    src: "assets/bracelet-2.png"
  },

  3: {
    name: "Oval Link Chain",
    price: 22,
    src: "assets/bracelet-3.png"
  },

  4: {
    name: "Paperclip Chain",
    price: 20,
    src: "assets/bracelet-4.png"
  }
};


/* =========================================
   DOM
========================================= */

const canvas = document.getElementById("braceletCanvas");
const ctx = canvas.getContext("2d");

const chainGrid = document.getElementById("chainGrid");
const charmGrid = document.getElementById("charmGrid");

const categoryFilter =
  document.getElementById("categoryFilter");

const removeBtn =
  document.getElementById("removeBtn");

const clearBtn =
  document.getElementById("clearBtn");

const saveBtn =
  document.getElementById("saveBtn");

const braceletPriceLabel =
  document.getElementById("braceletPriceLabel");

const braceletPrice =
  document.getElementById("braceletPrice");

const charmCountLabel =
  document.getElementById("charmCountLabel");

const charmPrice =
  document.getElementById("charmPrice");

const totalPrice =
  document.getElementById("totalPrice");

const selectedList =
  document.getElementById("selectedList");


/* =========================================
   STATE
========================================= */

let currentBracelet = 1;

let charms = [];

let placedCharms = [];

let selectedCharmIndex = -1;

let braceletImage = null;


/* =========================================
   IMAGE CACHE
========================================= */

const imageCache = new Map();


function loadImage(src) {

  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const img = new Image();

  img.src = src;

  imageCache.set(src, img);

  return img;
}


/* =========================================
   LOAD BRACELET
========================================= */

function loadBraceletImage() {

  const bracelet =
    BRACELETS[currentBracelet];

  braceletImage =
    loadImage(bracelet.src);

  braceletImage.onload = () => {
    drawCanvas();
  };

  drawCanvas();
}


/* =========================================
   CANVAS SIZE
========================================= */

function resizeCanvasForDevice() {

  const box =
    canvas.parentElement;

  if (!box) {
    return;
  }

  const width =
    Math.max(
      600,
      Math.min(
        1000,
        box.clientWidth * 1.4
      )
    );

  canvas.width = Math.round(width);

  canvas.height = 420;

  drawCanvas();
}


/* =========================================
   DRAW BRACELET
========================================= */

function drawCanvas() {

  if (!ctx) {
    return;
  }

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* Background */

  ctx.fillStyle = "#faf7f2";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  if (
    braceletImage &&
    braceletImage.complete &&
    braceletImage.naturalWidth
  ) {

    const maxWidth =
      canvas.width * 0.88;

    const maxHeight =
      canvas.height * 0.62;


    const scale =
      Math.min(
        maxWidth / braceletImage.naturalWidth,
        maxHeight / braceletImage.naturalHeight
      );


    const width =
      braceletImage.naturalWidth * scale;

    const height =
      braceletImage.naturalHeight * scale;


    const x =
      (canvas.width - width) / 2;

    const y =
      (canvas.height - height) / 2;


    ctx.drawImage(
      braceletImage,
      x,
      y,
      width,
      height
    );
  }


  /* Draw charms */

  placedCharms.forEach(
    (placedCharm, index) => {

      drawPlacedCharm(
        placedCharm,
        index
      );

    }
  );
}


/* =========================================
   DRAW INDIVIDUAL CHARM
========================================= */

function drawPlacedCharm(
  placedCharm,
  index
) {

  const charm =
    placedCharm.charm;

  const img =
    loadImage(charm.src);


  if (!img.complete || !img.naturalWidth) {

    img.onload = () => {
      drawCanvas();
    };

    return;
  }


  /*
    Keep charms horizontal and
    large enough to see.
  */

  const size =
    Math.min(
      72,
      canvas.width * 0.085
    );


  const x =
    placedCharm.x;

  const y =
    placedCharm.y;


  /* Selection ring */

  if (index === selectedCharmIndex) {

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      size * 0.62,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      "#9d8871";

    ctx.lineWidth = 2;

    ctx.stroke();
  }


  /* Charm */

  ctx.drawImage(
    img,
    x - size / 2,
    y - size / 2,
    size,
    size
  );
}


/* =========================================
   FIND BRACELET CENTER LINE
========================================= */

function getCharmY() {

  /*
    Keep all charms along one horizontal
    line across the bracelet.
  */

  return canvas.height * 0.50;
}


/* =========================================
   ADD CHARM
========================================= */

function addCharm(charm) {

  if (!charm || charm.soldOut) {
    return;
  }


  /*
    Spread new charms horizontally.
    Start near the centre.
  */

  const center =
    canvas.width / 2;

  const spacing =
    Math.min(
      75,
      canvas.width * 0.075
    );


  let x;


  if (placedCharms.length === 0) {

    x = center;

  } else {

    const side =
      placedCharms.length % 2 === 1
        ? -1
        : 1;

    const distance =
      Math.ceil(
        placedCharms.length / 2
      ) * spacing;

    x =
      center + side * distance;
  }


  /*
    Keep charm inside bracelet area.
  */

  const minX =
    canvas.width * 0.16;

  const maxX =
    canvas.width * 0.84;

  x =
    Math.max(
      minX,
      Math.min(maxX, x)
    );


  placedCharms.push({
    charm: charm,
    x: x,
    y: getCharmY()
  });


  selectedCharmIndex =
    placedCharms.length - 1;


  updateSummary();

  drawCanvas();
}


/* =========================================
   REMOVE SELECTED CHARM
========================================= */

function removeSelectedCharm() {

  if (
    selectedCharmIndex < 0 ||
    selectedCharmIndex >= placedCharms.length
  ) {
    return;
  }


  placedCharms.splice(
    selectedCharmIndex,
    1
  );


  selectedCharmIndex = -1;


  updateSummary();

  drawCanvas();
}


/* =========================================
   CLEAR
========================================= */

function clearDesign() {

  placedCharms = [];

  selectedCharmIndex = -1;

  updateSummary();

  drawCanvas();
}


/* =========================================
   CHAIN SELECTION
========================================= */

function selectBracelet(number) {

  if (!BRACELETS[number]) {
    return;
  }


  currentBracelet =
    Number(number);


  document
    .querySelectorAll(".chain-card")
    .forEach(card => {

      card.classList.toggle(
        "active",
        Number(
          card.dataset.bracelet
        ) === currentBracelet
      );

    });


  loadBraceletImage();

  updateSummary();
}


/* =========================================
   BUILD CATEGORIES
========================================= */

function buildCategories() {

  if (!categoryFilter) {
    return;
  }


  const categories =
    [...new Set(
      charms.map(
        charm => charm.category
      )
    )].sort(
      (a, b) =>
        a.localeCompare(b)
    );


  categoryFilter.innerHTML =
    `<option value="all">All Charms</option>`;


  categories.forEach(category => {

    const option =
      document.createElement("option");

    option.value = category;

    option.textContent = category;

    categoryFilter.appendChild(
      option
    );

  });
}


/* =========================================
   RENDER CHARMS
========================================= */

function renderCharms() {

  if (!charmGrid) {
    return;
  }


  const selectedCategory =
    categoryFilter.value;


  charmGrid.innerHTML = "";


  let filtered =
    charms.filter(charm => {

      if (
        selectedCategory !== "all" &&
        charm.category !== selectedCategory
      ) {
        return false;
      }

      return true;

    });


  filtered.forEach(charm => {

    const card =
      document.createElement("button");

    card.type = "button";

    card.className =
      "charm-card";


    if (charm.soldOut) {
      card.classList.add("sold-out");
    }


    const img =
      document.createElement("img");

    img.src = charm.src;

    img.alt = "Charm";

    img.loading = "lazy";


    const price =
      document.createElement("span");

    price.className =
      "charm-price";

    price.textContent =
      `AED ${charm.price}`;


    card.appendChild(img);

    card.appendChild(price);


    if (charm.soldOut) {

      const badge =
        document.createElement("span");

      badge.className =
        "charm-badge";

      badge.textContent =
        "SOLD OUT";

      card.appendChild(badge);

    }


    card.addEventListener(
      "click",
      () => {

        if (charm.soldOut) {
          return;
        }

        addCharm(charm);

      }
    );


    charmGrid.appendChild(card);

  });
}


/* =========================================
   SUMMARY
========================================= */

function updateSummary() {

  const bracelet =
    BRACELETS[currentBracelet];


  braceletPriceLabel.textContent =
    bracelet.name;


  braceletPrice.textContent =
    `AED ${bracelet.price}`;


  const numberOfCharms =
    placedCharms.length;


  const charmsTotal =
    placedCharms.reduce(
      (total, placed) =>
        total + Number(placed.charm.price),
      0
    );


  charmCountLabel.textContent =
    `${numberOfCharms} ${
      numberOfCharms === 1
        ? "Charm"
        : "Charms"
    }`;


  charmPrice.textContent =
    `AED ${charmsTotal}`;


  const total =
    bracelet.price + charmsTotal;


  totalPrice.textContent =
    `AED ${total}`;


  if (numberOfCharms === 0) {

    selectedList.textContent =
      "No charms selected yet.";

    return;
  }


  /*
    Customer-facing summary only.
    We don't show charm filenames/numbers
    in the charm cards themselves.
  */

  selectedList.textContent =
    `${numberOfCharms} charm${
      numberOfCharms === 1
        ? ""
        : "s"
    } selected.`;
}


/* =========================================
   CANVAS CLICK / TOUCH
========================================= */

function getCanvasPosition(event) {

  const rect =
    canvas.getBoundingClientRect();


  let clientX;
  let clientY;


  if (
    event.touches &&
    event.touches.length
  ) {

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
      (clientX - rect.left) *
      (canvas.width / rect.width),

    y:
      (clientY - rect.top) *
      (canvas.height / rect.height)
  };
}


/* =========================================
   FIND CHARM AT POSITION
========================================= */

function findCharmAt(x, y) {

  for (
    let i = placedCharms.length - 1;
    i >= 0;
    i--
  ) {

    const charm =
      placedCharms[i];


    const distance =
      Math.sqrt(
        Math.pow(x - charm.x, 2) +
        Math.pow(y - charm.y, 2)
      );


    if (distance < 45) {
      return i;
    }

  }


  return -1;
}


/* =========================================
   DRAGGING
========================================= */

let dragging = false;

let dragOffsetX = 0;

let dragOffsetY = 0;


function startDragging(event) {

  event.preventDefault();


  const pos =
    getCanvasPosition(event);


  const index =
    findCharmAt(
      pos.x,
      pos.y
    );


  if (index === -1) {

    selectedCharmIndex = -1;

    drawCanvas();

    return;
  }


  selectedCharmIndex =
    index;


  dragging = true;


  dragOffsetX =
    placedCharms[index].x -
    pos.x;

  dragOffsetY =
    placedCharms[index].y -
    pos.y;


  drawCanvas();
}


function dragCharm(event) {

  if (!dragging) {
    return;
  }


  event.preventDefault();


  const pos =
    getCanvasPosition(event);


  const charm =
    placedCharms[
      selectedCharmIndex
    ];


  if (!charm) {
    return;
  }


  charm.x =
    pos.x + dragOffsetX;

  /*
    Keep charms horizontal.
    Their Y position stays fixed.
  */

  charm.y =
    getCharmY();


  const minX =
    canvas.width * 0.12;

  const maxX =
    canvas.width * 0.88;


  charm.x =
    Math.max(
      minX,
      Math.min(
        maxX,
        charm.x
      )
    );


  drawCanvas();
}


function stopDragging() {

  dragging = false;
}


/* =========================================
   SAVE DESIGN
========================================= */

function saveDesign() {

  /*
    Create a temporary canvas so the
    saved image doesn't include UI.
  */

  const saveCanvas =
    document.createElement("canvas");


  saveCanvas.width =
    canvas.width;

  saveCanvas.height =
    canvas.height;


  const saveCtx =
    saveCanvas.getContext("2d");


  /*
    Cream background.
  */

  saveCtx.fillStyle =
    "#faf7f2";

  saveCtx.fillRect(
    0,
    0,
    saveCanvas.width,
    saveCanvas.height
  );


  /*
    Draw bracelet.
  */

  if (
    braceletImage &&
    braceletImage.complete &&
    braceletImage.naturalWidth
  ) {

    const maxWidth =
      saveCanvas.width * 0.88;

    const maxHeight =
      saveCanvas.height * 0.62;


    const scale =
      Math.min(
        maxWidth /
          braceletImage.naturalWidth,

        maxHeight /
          braceletImage.naturalHeight
      );


    const width =
      braceletImage.naturalWidth *
      scale;

    const height =
      braceletImage.naturalHeight *
      scale;


    const x =
      (saveCanvas.width - width) / 2;

    const y =
      (saveCanvas.height - height) / 2;


    saveCtx.drawImage(
      braceletImage,
      x,
      y,
      width,
      height
    );
  }


  /*
    Draw charms without selection ring.
  */

  placedCharms.forEach(
    placedCharm => {

      const img =
        loadImage(
          placedCharm.charm.src
        );


      if (
        !img.complete ||
        !img.naturalWidth
      ) {
        return;
      }


      const size =
        Math.min(
          72,
          saveCanvas.width * 0.085
        );


      saveCtx.drawImage(
        img,
        placedCharm.x - size / 2,
        placedCharm.y - size / 2,
        size,
        size
      );

    }
  );


  const link =
    document.createElement("a");

  link.download =
    "ZAY-bracelet-design.png";

  link.href =
    saveCanvas.toDataURL(
      "image/png"
    );

  link.click();
}


/* =========================================
   EVENT LISTENERS
========================================= */


/* Chains */

document
  .querySelectorAll(".chain-card")
  .forEach(card => {

    card.addEventListener(
      "click",
      () => {

        selectBracelet(
          card.dataset.bracelet
        );

      }
    );

  });


/* Category */

categoryFilter.addEventListener(
  "change",
  renderCharms
);


/* Buttons */

removeBtn.addEventListener(
  "click",
  removeSelectedCharm
);


clearBtn.addEventListener(
  "click",
  clearDesign
);


saveBtn.addEventListener(
  "click",
  saveDesign
);


/* Canvas */

canvas.addEventListener(
  "mousedown",
  startDragging
);

canvas.addEventListener(
  "mousemove",
  dragCharm
);

canvas.addEventListener(
  "mouseup",
  stopDragging
);

canvas.addEventListener(
  "mouseleave",
  stopDragging
);


/* Touch */

canvas.addEventListener(
  "touchstart",
  startDragging,
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  dragCharm,
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  stopDragging
);


/* =========================================
   WINDOW RESIZE
========================================= */

window.addEventListener(
  "resize",
  () => {

    resizeCanvasForDevice();

  }
);


/* =========================================
   START
========================================= */

async function startSimulator() {

  /*
    CHARMS_READY comes from charms.js.
  */

  charms =
    await CHARMS_READY;


  console.log(
    `ZAY simulator loaded ${charms.length} charms.`
  );


  buildCategories();

  renderCharms();

  loadBraceletImage();

  resizeCanvasForDevice();

  updateSummary();
}


startSimulator();
