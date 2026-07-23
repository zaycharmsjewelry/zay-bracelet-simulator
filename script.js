// ==========================================
// ZAY BRACELET SIMULATOR
// ==========================================


// ------------------------------------------
// ELEMENTS
// ------------------------------------------

const canvas = document.getElementById("braceletCanvas");
const ctx = canvas.getContext("2d");

const charmGrid = document.getElementById("charmGrid");
const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");

const braceletPriceLabel =
  document.getElementById("braceletPriceLabel");

const braceletPriceElement =
  document.getElementById("braceletPrice");

const charmCountLabel =
  document.getElementById("charmCountLabel");

const charmPriceElement =
  document.getElementById("charmPrice");

const totalPriceElement =
  document.getElementById("totalPrice");

const selectedList =
  document.getElementById("selectedList");


// ==========================================
// PRICES
// ==========================================

const BRACELET_PRICES = {
  1: 15,
  2: 20
};

const REGULAR_PRICE = 5;
const VINTAGE_PRICE = 8;
const CUTE_CHARACTER_PRICE = 6;


// ==========================================
// STATE
// ==========================================

let currentBracelet = 1;

let selected = [];

let draggingIndex = -1;

let dragOffsetX = 0;
let dragOffsetY = 0;

const braceletImages = {};
const charmImages = {};


// ==========================================
// CHARM PRICE
// ==========================================

function getCharmPrice(charm) {

  const category =
    String(charm.category || "")
      .toLowerCase();


  if (category.includes("vintage")) {
    return VINTAGE_PRICE;
  }


  if (
    category.includes("cute character") ||
    category.includes("cute characters")
  ) {
    return CUTE_CHARACTER_PRICE;
  }


  return REGULAR_PRICE;
}


// ==========================================
// IMAGE LOADING
// ==========================================

function loadImage(src) {

  return new Promise((resolve, reject) => {

    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () =>
      reject(
        new Error(
          `Could not load ${src}`
        )
      );

    image.src = src;

  });
}


// ==========================================
// PRELOAD
// ==========================================

async function preload() {

  try {

    braceletImages[1] =
      await loadImage(
        "assets/bracelet-1.png"
      );

  } catch (error) {

    console.log(
      "Could not load bracelet 1",
      error
    );

  }


  try {

    braceletImages[2] =
      await loadImage(
        "assets/bracelet-2.png"
      );

  } catch (error) {

    console.log(
      "Could not load bracelet 2",
      error
    );

  }


  await Promise.all(

    CHARMS.map(async charm => {

      try {

        charmImages[charm.id] =
          await loadImage(
            charm.src
          );

      } catch (error) {

        console.log(
          "Missing charm:",
          charm.src
        );

      }

    })

  );


  createCategoryMenu();

  renderGrid();

  render();
}


// ==========================================
// CATEGORY MENU
// ==========================================

function createCategoryMenu() {

  const categories =
    [
      ...new Set(
        CHARMS.map(
          charm => charm.category
        )
      )
    ];


  categories.forEach(category => {

    const option =
      document.createElement(
        "option"
      );

    option.value = category;

    option.textContent = category;

    categoryFilter.appendChild(
      option
    );

  });
}


// ==========================================
// BRACELET SELECTION
// ==========================================

document
  .querySelectorAll(".chain-card")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentBracelet =
          Number(
            button.dataset.bracelet
          );


        document
          .querySelectorAll(
            ".chain-card"
          )
          .forEach(card => {

            card.classList.remove(
              "active"
            );

          });


        button.classList.add(
          "active"
        );


        arrangeCharms();

        render();

      }
    );

  });


// ==========================================
// LARGE CHAIN POSITION
// ==========================================

function getChainSettings() {

  /*
    This controls where the bracelet appears
    inside the canvas.

    Chain width is 94% of the canvas.
  */

  return {
    centerX: canvas.width / 2,
    centerY: 190,
    width: canvas.width * 0.94
  };
}


// ==========================================
// DRAW LARGE BRACELET
// ==========================================

function drawBracelet(image) {

  if (!image) return;


  const settings =
    getChainSettings();


  /*
    IMPORTANT:

    Width controls the chain size.

    We are NOT restricting it based on
    the PNG height anymore.
  */

  const width =
    settings.width;


  const scale =
    width / image.width;


  const height =
    image.height * scale;


  const x =
    settings.centerX -
    width / 2;


  const y =
    settings.centerY -
    height / 2;


  ctx.drawImage(
    image,
    x,
    y,
    width,
    height
  );
}


// ==========================================
// AUTOMATIC CHARM POSITION
// ==========================================

function defaultPosition(index) {

  const total =
    Math.max(
      selected.length,
      1
    );


  /*
    These positions span almost the entire
    bracelet.

    7 charms fit comfortably.
  */

  const startX = 100;
  const endX = 900;


  let x;


  if (total === 1) {

    x = canvas.width / 2;

  }

  else {

    x =
      startX +
      (
        index /
        (total - 1)
      ) *
      (
        endX -
        startX
      );

  }


  /*
    Charm center.

    The charm loop sits near the chain,
    while the charm body hangs underneath.
  */

  const y = 270;


  return {
    x,
    y
  };
}


// ==========================================
// ARRANGE CHARMS
// ==========================================

function arrangeCharms() {

  selected.forEach(
    (item, index) => {

      /*
        Only automatically position charms
        the customer has NOT manually moved.
      */

      if (!item.moved) {

        const position =
          defaultPosition(index);

        item.x = position.x;
        item.y = position.y;

      }

    }
  );
}


// ==========================================
// ENSURE POSITION
// ==========================================

function ensurePositions() {

  selected.forEach(
    (item, index) => {

      if (
        !Number.isFinite(item.x) ||
        !Number.isFinite(item.y)
      ) {

        const position =
          defaultPosition(index);

        item.x = position.x;
        item.y = position.y;

      }

    }
  );
}


// ==========================================
// DRAW CHARM
// ==========================================

function drawCharm(item) {

  const image =
    charmImages[item.id];


  if (!image) return;


  /*
    82px gives enough room for
    7+ charms on the bracelet.
  */

  const targetSize = 82;


  const scale =
    Math.min(
      targetSize / image.width,
      targetSize / image.height
    );


  const width =
    image.width * scale;


  const height =
    image.height * scale;


  item.w = width;
  item.h = height;


  ctx.save();


  ctx.shadowColor =
    "rgba(70, 45, 20, 0.18)";

  ctx.shadowBlur = 5;

  ctx.shadowOffsetY = 3;


  ctx.drawImage(
    image,

    item.x - width / 2,
    item.y - height / 2,

    width,
    height
  );


  ctx.restore();
}


// ==========================================
// RENDER
// ==========================================

function render() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.fillStyle =
    "#fffaf1";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  drawBracelet(
    braceletImages[
      currentBracelet
    ]
  );


  ensurePositions();


  selected.forEach(item => {

    drawCharm(item);

  });


  updatePrice();

  updateBadges();
}


// ==========================================
// PRICES
// ==========================================

function updatePrice() {

  const braceletPrice =
    BRACELET_PRICES[
      currentBracelet
    ];


  let charmsTotal = 0;


  selected.forEach(item => {

    const charm =
      CHARMS.find(
        charm =>
          charm.id === item.id
      );


    if (charm) {

      charmsTotal +=
        getCharmPrice(charm);

    }

  });


  const total =
    braceletPrice +
    charmsTotal;


  braceletPriceLabel.textContent =
    `Chain ${currentBracelet}`;


  braceletPriceElement.textContent =
    `AED ${braceletPrice}`;


  charmCountLabel.textContent =
    selected.length === 1
      ? "1 Charm"
      : `${selected.length} Charms`;


  charmPriceElement.textContent =
    `AED ${charmsTotal}`;


  totalPriceElement.textContent =
    `AED ${total}`;


  selectedList.textContent =
    selected.length === 0
      ? "No charms selected yet"
      : `${selected.length} charm${
          selected.length === 1
            ? ""
            : "s"
        } selected`;
}


// ==========================================
// CHARM GRID
// ==========================================

function renderGrid() {

  const query =
    search.value
      .trim()
      .toLowerCase();


  const chosenCategory =
    categoryFilter.value;


  const visibleCharms =
    CHARMS.filter(charm => {

      if (!charmImages[charm.id]) {
        return false;
      }


      const categoryMatch =
        chosenCategory === "all" ||
        charm.category ===
          chosenCategory;


      const searchMatch =
        !query ||

        String(charm.name)
          .toLowerCase()
          .includes(query) ||

        String(charm.category)
          .toLowerCase()
          .includes(query);


      return (
        categoryMatch &&
        searchMatch
      );

    });


  charmGrid.innerHTML = "";


  visibleCharms.forEach(charm => {

    const price =
      getCharmPrice(charm);


    const card =
      document.createElement(
        "button"
      );


    card.type = "button";

    card.className =
      "charm-card";

    card.dataset.id =
      charm.id;


    card.innerHTML = `

      <img
        src="${charm.src}"
        alt="${charm.name}"
      >

      <span class="charm-name">
        ${charm.name}
      </span>

      <span class="charm-price">
        AED ${price}
      </span>

      <i class="charm-badge">
        0
      </i>

    `;


    card.addEventListener(
      "click",
      () => {

        addCharm(
          charm.id
        );

      }
    );


    charmGrid.appendChild(
      card
    );

  });


  updateBadges();
}


// ==========================================
// ADD CHARM
// ==========================================

function addCharm(id) {

  selected.push({

    id,

    x: null,

    y: null,

    moved: false

  });


  /*
    Re-space all automatically placed charms
    whenever another charm is added.
  */

  arrangeCharms();

  render();
}


// ==========================================
// BADGES
// ==========================================

function updateBadges() {

  document
    .querySelectorAll(
      ".charm-card"
    )
    .forEach(card => {

      const count =
        selected.filter(
          item =>
            item.id ===
            card.dataset.id
        ).length;


      const badge =
        card.querySelector(
          ".charm-badge"
        );


      if (!badge) return;


      badge.textContent =
        count;


      badge.style.display =
        count > 0
          ? "grid"
          : "none";

    });
}


// ==========================================
// UNDO
// ==========================================

document
  .getElementById("undoBtn")
  .addEventListener(
    "click",
    () => {

      selected.pop();

      arrangeCharms();

      render();

    }
  );


// ==========================================
// CLEAR
// ==========================================

document
  .getElementById("clearBtn")
  .addEventListener(
    "click",
    () => {

      selected = [];

      render();

    }
  );


// ==========================================
// SEARCH
// ==========================================

search.addEventListener(
  "input",
  renderGrid
);


categoryFilter.addEventListener(
  "change",
  renderGrid
);


// ==========================================
// POINTER POSITION
// ==========================================

function getPointerPosition(event) {

  const rect =
    canvas.getBoundingClientRect();


  const source =
    event.touches?.[0] ||
    event.changedTouches?.[0] ||
    event;


  return {

    x:
      (
        source.clientX -
        rect.left
      ) *
      (
        canvas.width /
        rect.width
      ),

    y:
      (
        source.clientY -
        rect.top
      ) *
      (
        canvas.height /
        rect.height
      )

  };
}


// ==========================================
// HIT TEST
// ==========================================

function findCharmAt(point) {

  for (
    let i =
      selected.length - 1;

    i >= 0;

    i--
  ) {

    const item =
      selected[i];


    const halfWidth =
      (item.w || 82) / 2 + 15;


    const halfHeight =
      (item.h || 82) / 2 + 15;


    if (
      point.x >=
        item.x - halfWidth &&

      point.x <=
        item.x + halfWidth &&

      point.y >=
        item.y - halfHeight &&

      point.y <=
        item.y + halfHeight
    ) {

      return i;

    }

  }


  return -1;
}


// ==========================================
// START DRAG
// ==========================================

function startDrag(event) {

  const point =
    getPointerPosition(event);


  draggingIndex =
    findCharmAt(point);


  if (draggingIndex < 0) {
    return;
  }


  const item =
    selected[draggingIndex];


  dragOffsetX =
    point.x - item.x;


  dragOffsetY =
    point.y - item.y;


  event.preventDefault();
}


// ==========================================
// MOVE DRAG
// ==========================================

function moveDrag(event) {

  if (draggingIndex < 0) {
    return;
  }


  event.preventDefault();


  const point =
    getPointerPosition(event);


  const item =
    selected[draggingIndex];


  item.x =
    Math.max(
      45,
      Math.min(
        canvas.width - 45,
        point.x - dragOffsetX
      )
    );


  item.y =
    Math.max(
      100,
      Math.min(
        canvas.height - 45,
        point.y - dragOffsetY
      )
    );


  item.moved = true;


  render();
}


// ==========================================
// END DRAG
// ==========================================

function endDrag() {

  draggingIndex = -1;

}


// MOUSE

canvas.addEventListener(
  "mousedown",
  startDrag
);

canvas.addEventListener(
  "mousemove",
  moveDrag
);

window.addEventListener(
  "mouseup",
  endDrag
);


// TOUCH

canvas.addEventListener(
  "touchstart",
  startDrag,
  {
    passive: false
  }
);

canvas.addEventListener(
  "touchmove",
  moveDrag,
  {
    passive: false
  }
);

canvas.addEventListener(
  "touchend",
  endDrag
);


// ==========================================
// SAVE DESIGN
// ==========================================

document
  .getElementById("saveBtn")
  .addEventListener(
    "click",
    () => {

      render();


      const link =
        document.createElement(
          "a"
        );


      link.download =
        "zay-bracelet-design.png";


      link.href =
        canvas.toDataURL(
          "image/png"
        );


      link.click();

    }
  );


// ==========================================
// START SIMULATOR
// ==========================================

preload();
