/* =========================================
   ZAY CHARMS - BRACELET SIMULATOR
   ========================================= */


/* =========================================
   BRACELET DATA
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
   ELEMENTS
========================================= */

const canvas =
  document.getElementById("braceletCanvas");

const ctx =
  canvas.getContext("2d");

const charmGrid =
  document.getElementById("charmGrid");

const categoryFilter =
  document.getElementById("categoryFilter");

const chainGrid =
  document.getElementById("chainGrid");

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

let availableCharms = [];

let placedCharms = [];

let selectedCharmIndex = -1;

let braceletImage = null;

let imageCache = {};

let dragging = false;


/* =========================================
   IMAGE LOADER
========================================= */

function getImage(src) {

  if (imageCache[src]) {
    return imageCache[src];
  }

  const img = new Image();

  img.src = src;

  imageCache[src] = img;

  return img;
}


/* =========================================
   LOAD BRACELET
========================================= */

function loadBracelet() {

  const bracelet =
    BRACELETS[currentBracelet];

  braceletImage =
    getImage(bracelet.src);

  if (braceletImage.complete) {

    drawCanvas();

  } else {

    braceletImage.onload = () => {
      drawCanvas();
    };

  }

  drawCanvas();
}


/* =========================================
   DRAW CANVAS
========================================= */

function drawCanvas() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /*
    Canvas background
  */

  ctx.fillStyle = "#faf7f2";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /*
    Draw bracelet
  */

  if (
    braceletImage &&
    braceletImage.complete &&
    braceletImage.naturalWidth > 0
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


  /*
    Draw charms
  */

  placedCharms.forEach(
    (item, index) => {

      drawCharm(
        item,
        index
      );

    }
  );
}


/* =========================================
   DRAW CHARM
========================================= */

function drawCharm(
  item,
  index
) {

  const img =
    getImage(item.charm.src);


  if (
    !img.complete ||
    img.naturalWidth === 0
  ) {

    img.onload = () => {
      drawCanvas();
    };

    return;
  }


  /*
    Charm size
  */

  const size = 70;


  /*
    Selected charm ring
  */

  if (index === selectedCharmIndex) {

    ctx.beginPath();

    ctx.arc(
      item.x,
      item.y,
      size * 0.60,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      "#a18b74";

    ctx.lineWidth = 2;

    ctx.stroke();
  }


  /*
    Charm image
  */

  ctx.drawImage(
    img,
    item.x - size / 2,
    item.y - size / 2,
    size,
    size
  );
}


/* =========================================
   CHARM Y POSITION
========================================= */

function getCharmY() {

  /*
    Keep all charms on the
    horizontal bracelet line.
  */

  return canvas.height / 2;
}


/* =========================================
   ADD CHARM
========================================= */

function addCharm(charm) {

  if (!charm) {
    return;
  }

  if (charm.soldOut) {
    return;
  }


  /*
    Put charms around the centre
    of the bracelet.
  */

  const centerX =
    canvas.width / 2;

  const spacing = 78;

  let x;


  if (placedCharms.length === 0) {

    x = centerX;

  } else {

    const number =
      Math.ceil(
        placedCharms.length / 2
      );

    if (
      placedCharms.length % 2 === 1
    ) {

      x =
        centerX -
        number * spacing;

    } else {

      x =
        centerX +
        number * spacing;
    }
  }


  /*
    Keep charms inside the bracelet.
  */

  const minimum =
    canvas.width * 0.14;

  const maximum =
    canvas.width * 0.86;


  x =
    Math.max(
      minimum,
      Math.min(
        maximum,
        x
      )
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
   REMOVE
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

function selectChain(number) {

  number = Number(number);

  if (!BRACELETS[number]) {
    return;
  }


  currentBracelet = number;


  /*
    Active chain styling
  */

  document
    .querySelectorAll(".chain-card")
    .forEach(card => {

      const cardNumber =
        Number(
          card.dataset.bracelet
        );

      card.classList.toggle(
        "active",
        cardNumber === number
      );

    });


  loadBracelet();

  updateSummary();
}


/* =========================================
   CATEGORIES
========================================= */

function createCategories() {

  if (!categoryFilter) {
    return;
  }


  const categories =
    [
      ...new Set(
        availableCharms.map(
          charm => charm.category
        )
      )
    ].sort(
      (a, b) =>
        a.localeCompare(b)
    );


  categoryFilter.innerHTML =
    "";


  const allOption =
    document.createElement("option");

  allOption.value = "all";

  allOption.textContent =
    "All Charms";

  categoryFilter.appendChild(
    allOption
  );


  categories.forEach(
    category => {

      const option =
        document.createElement("option");

      option.value =
        category;

      option.textContent =
        category;

      categoryFilter.appendChild(
        option
      );

    }
  );
}


/* =========================================
   RENDER CHARM GRID
========================================= */

function renderCharmGrid() {

  if (!charmGrid) {
    return;
  }


  const selectedCategory =
    categoryFilter
      ? categoryFilter.value
      : "all";


  charmGrid.innerHTML = "";


  const filtered =
    availableCharms.filter(
      charm => {

        if (
          selectedCategory !== "all" &&
          charm.category !== selectedCategory
        ) {

          return false;
        }

        return true;

      }
    );


  filtered.forEach(
    charm => {

      const card =
        document.createElement("button");

      card.type = "button";

      card.className =
        "charm-card";


      if (charm.soldOut) {

        card.classList.add(
          "sold-out"
        );

      }


      /*
        Charm image
      */

      const img =
        document.createElement("img");

      img.src =
        charm.src;

      img.alt =
        "Charm";

      img.loading =
        "lazy";


      /*
        Price
      */

      const price =
        document.createElement("span");

      price.className =
        "charm-price";

      price.textContent =
        `AED ${charm.price}`;


      card.appendChild(img);

      card.appendChild(price);


      /*
        Sold out badge
      */

      if (charm.soldOut) {

        const badge =
          document.createElement("span");

        badge.className =
          "charm-badge";

        badge.textContent =
          "SOLD OUT";

        card.appendChild(
          badge
        );

      }


      /*
        Click
      */

      card.addEventListener(
        "click",
        () => {

          if (charm.soldOut) {
            return;
          }

          addCharm(charm);

        }
      );


      charmGrid.appendChild(
        card
      );

    }
  );
}


/* =========================================
   SUMMARY
========================================= */

function updateSummary() {

  const bracelet =
    BRACELETS[currentBracelet];


  /*
    Chain
  */

  if (braceletPriceLabel) {

    braceletPriceLabel.textContent =
      bracelet.name;

  }


  if (braceletPrice) {

    braceletPrice.textContent =
      `AED ${bracelet.price}`;

  }


  /*
    Charm total
  */

  const count =
    placedCharms.length;


  const charmTotal =
    placedCharms.reduce(
      (total, item) => {

        return (
          total +
          Number(item.charm.price)
        );

      },
      0
    );


  if (charmCountLabel) {

    charmCountLabel.textContent =
      `${count} ${
        count === 1
          ? "Charm"
          : "Charms"
      }`;

  }


  if (charmPrice) {

    charmPrice.textContent =
      `AED ${charmTotal}`;

  }


  /*
    Grand total
  */

  const total =
    bracelet.price +
    charmTotal;


  if (totalPrice) {

    totalPrice.textContent =
      `AED ${total}`;

  }


  /*
    Selected charms
  */

  if (selectedList) {

    if (count === 0) {

      selectedList.textContent =
        "No charms selected yet.";

    } else {

      selectedList.textContent =
        `${count} charm${
          count === 1
            ? ""
            : "s"
        } selected.`;

    }

  }
}


/* =========================================
   CANVAS POSITION
========================================= */

function getCanvasPosition(event) {

  const rect =
    canvas.getBoundingClientRect();


  let clientX;
  let clientY;


  if (
    event.touches &&
    event.touches.length > 0
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
   FIND CHARM
========================================= */

function findCharmAt(x, y) {

  for (
    let i =
      placedCharms.length - 1;

    i >= 0;

    i--
  ) {

    const item =
      placedCharms[i];


    const dx =
      x - item.x;

    const dy =
      y - item.y;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (distance <= 42) {

      return i;

    }
  }


  return -1;
}


/* =========================================
   START DRAG
========================================= */

function startDrag(event) {

  event.preventDefault();


  const position =
    getCanvasPosition(event);


  const index =
    findCharmAt(
      position.x,
      position.y
    );


  if (index === -1) {

    selectedCharmIndex = -1;

    drawCanvas();

    return;

  }


  selectedCharmIndex =
    index;


  dragging = true;


  drawCanvas();
}


/* =========================================
   DRAG
========================================= */

function drag(event) {

  if (!dragging) {
    return;
  }


  event.preventDefault();


  const position =
    getCanvasPosition(event);


  const item =
    placedCharms[
      selectedCharmIndex
    ];


  if (!item) {
    return;
  }


  /*
    Move horizontally only.
  */

  item.x =
    position.x;


  item.y =
    getCharmY();


  /*
    Keep charm on bracelet.
  */

  const minimum =
    canvas.width * 0.12;

  const maximum =
    canvas.width * 0.88;


  item.x =
    Math.max(
      minimum,
      Math.min(
        maximum,
        item.x
      )
    );


  drawCanvas();
}


/* =========================================
   STOP DRAG
========================================= */

function stopDrag() {

  dragging = false;
}


/* =========================================
   SAVE DESIGN
========================================= */

function saveDesign() {

  /*
    Save the bracelet canvas
    as a PNG.
  */

  const link =
    document.createElement("a");


  link.download =
    "ZAY-bracelet-design.png";


  link.href =
    canvas.toDataURL(
      "image/png"
    );


  link.click();
}


/* =========================================
   EVENT LISTENERS
========================================= */


/*
  Chains
*/

if (chainGrid) {

  chainGrid
    .querySelectorAll(".chain-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          selectChain(
            card.dataset.bracelet
          );

        }
      );

    });

}


/*
  Category
*/

if (categoryFilter) {

  categoryFilter.addEventListener(
    "change",
    renderCharmGrid
  );

}


/*
  Buttons
*/

if (removeBtn) {

  removeBtn.addEventListener(
    "click",
    removeSelectedCharm
  );

}


if (clearBtn) {

  clearBtn.addEventListener(
    "click",
    clearDesign
  );

}


if (saveBtn) {

  saveBtn.addEventListener(
    "click",
    saveDesign
  );

}


/*
  Mouse
*/

canvas.addEventListener(
  "mousedown",
  startDrag
);

canvas.addEventListener(
  "mousemove",
  drag
);

canvas.addEventListener(
  "mouseup",
  stopDrag
);

canvas.addEventListener(
  "mouseleave",
  stopDrag
);


/*
  Touch
*/

canvas.addEventListener(
  "touchstart",
  startDrag,
  {
    passive: false
  }
);

canvas.addEventListener(
  "touchmove",
  drag,
  {
    passive: false
  }
);

canvas.addEventListener(
  "touchend",
  stopDrag
);


/* =========================================
   INITIALIZE
========================================= */

async function initialize() {

  try {

    /*
      Get charms from charms.js
    */

    availableCharms =
      await CHARMS_READY;


    console.log(
      `ZAY: ${availableCharms.length} charms loaded.`
    );


    /*
      Build category menu
    */

    createCategories();


    /*
      Display charms
    */

    renderCharmGrid();


    /*
      Load first bracelet
    */

    loadBracelet();


    /*
      Update pricing
    */

    updateSummary();

  } catch (error) {

    console.error(
      "ZAY simulator failed to initialize:",
      error
    );

  }
}


initialize();
