/* =========================================
   ZAY BRACELET SIMULATOR
========================================= */


/* ==============================
   ELEMENTS
============================== */

const canvas =
  document.getElementById("braceletCanvas");

const ctx =
  canvas.getContext("2d");

const charmGrid =
  document.getElementById("charmGrid");

const searchInput =
  document.getElementById("search");

const categoryFilter =
  document.getElementById("categoryFilter");

const removeBtn =
  document.getElementById("removeBtn");

const braceletPriceLabel =
  document.getElementById("braceletPriceLabel");

const braceletPriceEl =
  document.getElementById("braceletPrice");

const charmCountLabel =
  document.getElementById("charmCountLabel");

const charmPriceEl =
  document.getElementById("charmPrice");

const totalPriceEl =
  document.getElementById("totalPrice");

const selectedList =
  document.getElementById("selectedList");


/* ==============================
   PRICES
============================== */

const BRACELET_PRICES = {
  1: 15,
  2: 18,
  3: 22,
  4: 20
};

const REGULAR_PRICE = 5;
const CUTE_PRICE = 6;
const VINTAGE_PRICE = 8;


/* ==============================
   STATE
============================== */

let currentBracelet = 1;

let selected = [];

let selectedCharmIndex = -1;

let draggingIndex = -1;

let dragOffsetX = 0;
let dragOffsetY = 0;

const braceletImages = {};
const braceletBounds = {};
const charmImages = {};


/* ==============================
   CHARM PRICE
============================== */

function getCharmPrice(charm) {

  if (
    charm.category ===
    "Vintage Florals"
  ) {
    return VINTAGE_PRICE;
  }

  if (
    charm.category ===
    "Cute Characters"
  ) {
    return CUTE_PRICE;
  }

  return REGULAR_PRICE;
}


/* ==============================
   IMAGE LOADER
============================== */

function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      const image = new Image();

      image.onload =
        () => resolve(image);

      image.onerror =
        () =>
          reject(
            new Error(
              `Could not load ${src}`
            )
          );

      image.src = src;

    }
  );
}


/* ==============================
   FIND VISIBLE PNG AREA
============================== */

function findVisibleBounds(image) {

  const temp =
    document.createElement(
      "canvas"
    );

  temp.width =
    image.width;

  temp.height =
    image.height;

  const tempCtx =
    temp.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  tempCtx.drawImage(
    image,
    0,
    0
  );

  const pixels =
    tempCtx.getImageData(
      0,
      0,
      image.width,
      image.height
    ).data;

  let minX =
    image.width;

  let minY =
    image.height;

  let maxX = 0;
  let maxY = 0;

  let found = false;

  for (
    let y = 0;
    y < image.height;
    y++
  ) {

    for (
      let x = 0;
      x < image.width;
      x++
    ) {

      const alpha =
        pixels[
          (
            y *
            image.width +
            x
          ) *
          4 +
          3
        ];

      if (
        alpha > 10
      ) {

        found = true;

        minX =
          Math.min(
            minX,
            x
          );

        maxX =
          Math.max(
            maxX,
            x
          );

        minY =
          Math.min(
            minY,
            y
          );

        maxY =
          Math.max(
            maxY,
            y
          );

      }

    }

  }

  if (!found) {

    return {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height
    };

  }

  return {
    x: minX,
    y: minY,
    width:
      maxX -
      minX +
      1,
    height:
      maxY -
      minY +
      1
  };
}


/* ==============================
   PRELOAD
============================== */

async function preload() {

  /* LOAD BRACELETS FIRST */

  for (
    let i = 1;
    i <= 4;
    i++
  ) {

    try {

      braceletImages[i] =
        await loadImage(
          `assets/bracelet-${i}.png`
        );

      braceletBounds[i] =
        findVisibleBounds(
          braceletImages[i]
        );

    }

    catch (error) {

      console.error(
        `Bracelet ${i} failed`,
        error
      );

    }

  }


  /* SHOW BRACELET IMMEDIATELY */

  createCategories();

  render();


  /* LOAD CHARMS */

  const charmPromises =
    CHARMS.map(
      charm => {

        return loadImage(
          charm.src
        )
          .then(
            image => {

              charmImages[
                charm.id
              ] = image;

            }
          )
          .catch(
            error => {

              console.warn(
                "Charm failed:",
                charm.src
              );

            }
          );

      }
    );


  await Promise.allSettled(
    charmPromises
  );


  renderGrid();

  render();
}


/* ==============================
   CATEGORY MENU
============================== */

function createCategories() {

  categoryFilter.innerHTML =
    `
    <option value="all">
      All categories
    </option>
    `;

  const categories =
    [
      ...new Set(
        CHARMS.map(
          charm =>
            charm.category
        )
      )
    ];

  categories.forEach(
    category => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        category;

      option.textContent =
        category;

      categoryFilter
        .appendChild(
          option
        );

    }
  );
}


/* ==============================
   CHAIN SELECTION
============================== */

document
  .querySelectorAll(
    ".chain-card"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          currentBracelet =
            Number(
              button.dataset
                .bracelet
            );

          document
            .querySelectorAll(
              ".chain-card"
            )
            .forEach(
              card => {

                card
                  .classList
                  .remove(
                    "active"
                  );

              }
            );

          button
            .classList
            .add(
              "active"
            );

          selectedCharmIndex =
            -1;

          render();

        }
      );

    }
  );


/* ==============================
   DRAW BRACELET
============================== */

function drawBracelet() {

  const image =
    braceletImages[
      currentBracelet
    ];

  const bounds =
    braceletBounds[
      currentBracelet
    ];

  if (
    !image ||
    !bounds
  ) {
    return;
  }

  const targetWidth =
    canvas.width *
    0.91;

  const scale =
    targetWidth /
    bounds.width;

  const height =
    bounds.height *
    scale;

  const x =
    (
      canvas.width -
      targetWidth
    ) /
    2;

  const chainCenterY =
    125;

  const y =
    chainCenterY -
    height /
    2;

  ctx.drawImage(
    image,

    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,

    x,
    y,
    targetWidth,
    height
  );
}


/* ==============================
   AUTOMATIC POSITION
============================== */

function getPosition(
  index,
  total
) {

  const startX =
    105;

  const endX =
    canvas.width -
    105;

  const y =
    200;

  if (
    total <= 1
  ) {

    return {
      x:
        canvas.width /
        2,
      y
    };

  }

  const spacing =
    (
      endX -
      startX
    ) /
    (
      total -
      1
    );

  return {
    x:
      startX +
      spacing *
      index,
    y
  };
}


/* ==============================
   ARRANGE CHARMS
============================== */

function arrangeCharms() {

  const automatic =
    selected.filter(
      item =>
        !item.moved
    );

  automatic.forEach(
    (item, index) => {

      const position =
        getPosition(
          index,
          automatic.length
        );

      item.x =
        position.x;

      item.y =
        position.y;

    }
  );
}


/* ==============================
   DRAW CHARM
============================== */

function drawCharm(
  item,
  index
) {

  const image =
    charmImages[
      item.id
    ];

  if (!image) {
    return;
  }

  const boxSize =
    88;

  const scale =
    Math.min(
      boxSize /
      image.width,

      boxSize /
      image.height
    );

  const width =
    image.width *
    scale;

  const height =
    image.height *
    scale;

  item.w =
    width;

  item.h =
    height;

  ctx.save();

  ctx.shadowColor =
    "rgba(70,45,20,.15)";

  ctx.shadowBlur =
    4;

  ctx.shadowOffsetY =
    2;

  ctx.drawImage(
    image,

    item.x -
    width /
    2,

    item.y -
    height /
    2,

    width,
    height
  );

  ctx.restore();


  if (
    index ===
    selectedCharmIndex
  ) {

    ctx.save();

    ctx.strokeStyle =
      "#c58b2a";

    ctx.lineWidth =
      3;

    ctx.setLineDash(
      [6, 4]
    );

    ctx.strokeRect(
      item.x -
      width /
      2 -
      8,

      item.y -
      height /
      2 -
      8,

      width +
      16,

      height +
      16
    );

    ctx.restore();

  }
}


/* ==============================
   RENDER
============================== */

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

  drawBracelet();

  selected.forEach(
    (item, index) => {

      drawCharm(
        item,
        index
      );

    }
  );

  updatePrices();

  updateBadges();

  updateRemoveButton();
}


/* ==============================
   ADD CHARM
============================== */

function addCharm(id) {

  selected.push({
    id,
    x:
      canvas.width /
      2,
    y:
      200,
    moved:
      false
  });

  selectedCharmIndex =
    selected.length -
    1;

  arrangeCharms();

  render();
}


/* ==============================
   PRICE SUMMARY
============================== */

function updatePrices() {

  const bracelet =
    BRACELET_PRICES[
      currentBracelet
    ];

  let charmTotal =
    0;

  selected.forEach(
    item => {

      const charm =
        CHARMS.find(
          charm =>
            charm.id ===
            item.id
        );

      if (charm) {

        charmTotal +=
          getCharmPrice(
            charm
          );

      }

    }
  );

  const total =
    bracelet +
    charmTotal;

  braceletPriceLabel
    .textContent =
      `Chain ${currentBracelet}`;

  braceletPriceEl
    .textContent =
      `AED ${bracelet}`;

  charmCountLabel
    .textContent =

      selected.length === 1

        ? "1 Charm"

        : `${selected.length} Charms`;

  charmPriceEl
    .textContent =
      `AED ${charmTotal}`;

  totalPriceEl
    .textContent =
      `AED ${total}`;

  selectedList
    .textContent =

      selected.length === 0

        ? "No charms selected yet."

        : `${selected.length} charm${
            selected.length === 1
              ? ""
              : "s"
          } selected.`;
}


/* ==============================
   CHARM GRID
============================== */

function renderGrid() {

  const query =
    searchInput
      .value
      .toLowerCase()
      .trim();

  const category =
    categoryFilter
      .value;

  const filtered =
    CHARMS.filter(
      charm => {

        const imageLoaded =
          Boolean(
            charmImages[
              charm.id
            ]
          );

        if (
          !imageLoaded
        ) {
          return false;
        }

        const categoryMatch =

          category ===
          "all"

          ||

          charm.category ===
          category;

        const searchMatch =

          !query

          ||

          charm.name
            .toLowerCase()
            .includes(
              query
            )

          ||

          charm.category
            .toLowerCase()
            .includes(
              query
            );

        return (
          categoryMatch &&
          searchMatch
        );

      }
    );


  charmGrid.innerHTML =
    "";


  filtered.forEach(
    charm => {

      const card =
        document.createElement(
          "button"
        );

      card.type =
        "button";

      card.className =
        "charm-card";

      card.dataset.id =
        charm.id;

      const price =
        getCharmPrice(
          charm
        );

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

      charmGrid
        .appendChild(
          card
        );

    }
  );

  updateBadges();
}


/* ==============================
   BADGES
============================== */

function updateBadges() {

  document
    .querySelectorAll(
      ".charm-card"
    )
    .forEach(
      card => {

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

        if (!badge) {
          return;
        }

        badge.textContent =
          count;

        badge.style.display =

          count > 0

            ? "flex"

            : "none";

      }
    );
}


/* ==============================
   SEARCH + FILTER
============================== */

searchInput
  .addEventListener(
    "input",
    renderGrid
  );

categoryFilter
  .addEventListener(
    "change",
    renderGrid
  );


/* ==============================
   REMOVE BUTTON
============================== */

function updateRemoveButton() {

  removeBtn.disabled =

    selectedCharmIndex < 0

    ||

    selectedCharmIndex >=
    selected.length;
}


removeBtn
  .addEventListener(
    "click",
    () => {

      if (
        selectedCharmIndex <
        0
      ) {
        return;
      }

      selected.splice(
        selectedCharmIndex,
        1
      );

      selectedCharmIndex =
        -1;

      draggingIndex =
        -1;

      arrangeCharms();

      render();

    }
  );


/* ==============================
   CLEAR
============================== */

document
  .getElementById(
    "clearBtn"
  )
  .addEventListener(
    "click",
    () => {

      selected =
        [];

      selectedCharmIndex =
        -1;

      draggingIndex =
        -1;

      render();

    }
  );


/* ==============================
   POINTER POSITION
============================== */

function pointerPosition(
  event
) {

  const rect =
    canvas
      .getBoundingClientRect();

  const source =

    event.touches?.[0]

    ||

    event.changedTouches?.[0]

    ||

    event;

  return {

    x:

      (
        source.clientX -
        rect.left
      )

      *

      canvas.width /
      rect.width,

    y:

      (
        source.clientY -
        rect.top
      )

      *

      canvas.height /
      rect.height

  };
}


/* ==============================
   FIND CHARM
============================== */

function findCharm(
  point
) {

  for (
    let i =
      selected.length -
      1;

    i >= 0;

    i--
  ) {

    const item =
      selected[i];

    const halfW =
      (
        item.w ||
        88
      ) /
      2 +
      15;

    const halfH =
      (
        item.h ||
        88
      ) /
      2 +
      15;

    if (

      point.x >=
      item.x -
      halfW

      &&

      point.x <=
      item.x +
      halfW

      &&

      point.y >=
      item.y -
      halfH

      &&

      point.y <=
      item.y +
      halfH

    ) {

      return i;

    }

  }

  return -1;
}


/* ==============================
   START DRAG
============================== */

function startDrag(
  event
) {

  const point =
    pointerPosition(
      event
    );

  draggingIndex =
    findCharm(
      point
    );

  selectedCharmIndex =
    draggingIndex;

  if (
    draggingIndex <
    0
  ) {

    render();

    return;

  }

  const item =
    selected[
      draggingIndex
    ];

  dragOffsetX =
    point.x -
    item.x;

  dragOffsetY =
    point.y -
    item.y;

  render();

  event.preventDefault();
}


/* ==============================
   DRAG
============================== */

function dragCharm(
  event
) {

  if (
    draggingIndex <
    0
  ) {
    return;
  }

  event.preventDefault();

  const point =
    pointerPosition(
      event
    );

  const item =
    selected[
      draggingIndex
    ];

  item.x =
    Math.max(
      45,
      Math.min(
        canvas.width -
        45,
        point.x -
        dragOffsetX
      )
    );

  item.y =
    Math.max(
      50,
      Math.min(
        canvas.height -
        45,
        point.y -
        dragOffsetY
      )
    );

  item.moved =
    true;

  render();
}


/* ==============================
   END DRAG
============================== */

function endDrag() {

  draggingIndex =
    -1;
}


/* MOUSE */

canvas.addEventListener(
  "mousedown",
  startDrag
);

canvas.addEventListener(
  "mousemove",
  dragCharm
);

window.addEventListener(
  "mouseup",
  endDrag
);


/* TOUCH */

canvas.addEventListener(
  "touchstart",
  startDrag,
  {
    passive: false
  }
);

canvas.addEventListener(
  "touchmove",
  dragCharm,
  {
    passive: false
  }
);

canvas.addEventListener(
  "touchend",
  endDrag
);


/* ==============================
   SAVE DESIGN
============================== */

document
  .getElementById(
    "saveBtn"
  )
  .addEventListener(
    "click",
    () => {

      const oldSelection =
        selectedCharmIndex;

      selectedCharmIndex =
        -1;

      render();

      const link =
        document.createElement(
          "a"
        );

      link.download =
        "my-zay-bracelet.png";

      link.href =
        canvas.toDataURL(
          "image/png"
        );

      link.click();

      selectedCharmIndex =
        oldSelection;

      render();

    }
  );


/* ==============================
   START
============================== */

preload();
