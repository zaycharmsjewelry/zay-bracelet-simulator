/* =========================================
   ZAY BRACELET SIMULATOR
========================================= */


/* ELEMENTS */

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


/* =========================================
   PRICES
========================================= */

const BRACELET_PRICES = {
  1: 15,
  2: 20
};

const NORMAL_CHARM_PRICE = 5;
const VINTAGE_CHARM_PRICE = 8;
const CUTE_CHARACTER_PRICE = 6;


/* =========================================
   STATE
========================================= */

let currentBracelet = 1;

let selected = [];

let draggingIndex = -1;

let dragOffsetX = 0;
let dragOffsetY = 0;

const braceletImages = {};
const braceletBounds = {};
const charmImages = {};


/* =========================================
   PRICE LOGIC
========================================= */

function getCharmPrice(charm) {

  const category =
    String(charm.category || "")
      .toLowerCase();

  const name =
    String(charm.name || "")
      .toLowerCase();


  if (
    category.includes("vintage") ||
    name.includes("vintage")
  ) {
    return VINTAGE_CHARM_PRICE;
  }


  if (
    category.includes("cute") ||
    category.includes("character") ||
    name.includes("hello kitty") ||
    name.includes("kitty") ||
    name.includes("kuromi") ||
    name.includes("melody")
  ) {
    return CUTE_CHARACTER_PRICE;
  }


  return NORMAL_CHARM_PRICE;
}


/* =========================================
   IMAGE LOADER
========================================= */

function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      const img = new Image();

      img.onload =
        () => resolve(img);

      img.onerror =
        () => reject(
          new Error(
            "Could not load " + src
          )
        );

      img.src = src;

    }
  );
}


/* =========================================
   FIND VISIBLE PNG AREA
========================================= */

/*
  Your bracelet PNG contains transparent
  empty space around the actual chain.

  This function finds only the visible
  non-transparent pixels so the chain
  can be drawn MUCH larger.
*/

function findVisibleBounds(image) {

  const tempCanvas =
    document.createElement("canvas");

  tempCanvas.width =
    image.width;

  tempCanvas.height =
    image.height;


  const tempCtx =
    tempCanvas.getContext(
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


  const data =
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
        data[
          (
            y *
            image.width +
            x
          ) *
          4 +
          3
        ];


      if (alpha > 15) {

        found = true;

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;

        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

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


  const padding = 5;


  minX =
    Math.max(
      0,
      minX - padding
    );

  minY =
    Math.max(
      0,
      minY - padding
    );

  maxX =
    Math.min(
      image.width - 1,
      maxX + padding
    );

  maxY =
    Math.min(
      image.height - 1,
      maxY + padding
    );


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


/* =========================================
   PRELOAD
========================================= */

async function preloadImages() {

  try {

    braceletImages[1] =
      await loadImage(
        "assets/bracelet-1.png"
      );

    braceletBounds[1] =
      findVisibleBounds(
        braceletImages[1]
      );

  }

  catch (error) {

    console.error(
      "Bracelet 1 failed:",
      error
    );

  }


  try {

    braceletImages[2] =
      await loadImage(
        "assets/bracelet-2.png"
      );

    braceletBounds[2] =
      findVisibleBounds(
        braceletImages[2]
      );

  }

  catch (error) {

    console.error(
      "Bracelet 2 failed:",
      error
    );

  }


  await Promise.all(

    CHARMS.map(
      async charm => {

        try {

          charmImages[charm.id] =
            await loadImage(
              charm.src
            );

        }

        catch (error) {

          console.warn(
            "Charm failed:",
            charm.src
          );

        }

      }
    )

  );


  buildCategories();

  renderCharmGrid();

  arrangeAutomaticCharms();

  render();

}


/* =========================================
   CATEGORY MENU
========================================= */

function buildCategories() {

  const categories =
    [
      ...new Set(
        CHARMS
          .map(
            charm =>
              charm.category
          )
          .filter(Boolean)
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

      categoryFilter.appendChild(
        option
      );

    }
  );
}


/* =========================================
   CHAIN BUTTONS
========================================= */

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

                card.classList
                  .remove(
                    "active"
                  );

              }
            );


          button.classList.add(
            "active"
          );


          render();

        }
      );

    }
  );


/* =========================================
   DRAW LARGE BRACELET
========================================= */

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


  /*
    This is the important part:

    Make the ACTUAL VISIBLE CHAIN
    about 92% of the canvas width.
  */

  const targetWidth =
    canvas.width * 0.92;


  const scale =
    targetWidth /
    bounds.width;


  const targetHeight =
    bounds.height *
    scale;


  const destinationX =
    (
      canvas.width -
      targetWidth
    ) / 2;


  /*
    Chain sits high enough for
    charms to hang underneath.
  */

  const chainCenterY = 135;


  const destinationY =
    chainCenterY -
    targetHeight / 2;


  ctx.drawImage(

    image,

    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,

    destinationX,
    destinationY,
    targetWidth,
    targetHeight

  );
}


/* =========================================
   AUTOMATIC CHARM POSITION
========================================= */

function getAutomaticPosition(
  index,
  total
) {

  /*
    Use almost the full chain width.

    This comfortably fits at least
    7 charms.
  */

  const startX = 110;

  const endX =
    canvas.width - 110;


  /*
    Every charm stays on the SAME
    horizontal level.
  */

  const charmY = 205;


  if (total <= 1) {

    return {

      x:
        canvas.width / 2,

      y:
        charmY

    };

  }


  const spacing =
    (
      endX -
      startX
    ) /
    (
      total - 1
    );


  return {

    x:
      startX +
      spacing *
      index,

    y:
      charmY

  };
}


/* =========================================
   ARRANGE CHARMS
========================================= */

function arrangeAutomaticCharms() {

  const automatic =
    selected.filter(
      item =>
        !item.moved
    );


  automatic.forEach(
    (item, index) => {

      const position =
        getAutomaticPosition(
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


/* =========================================
   DRAW CHARM
========================================= */

function drawCharm(item) {

  const image =
    charmImages[
      item.id
    ];


  if (!image) return;


  /*
    Visible size of each charm.
  */

  const boxSize = 90;


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


  item.w = width;

  item.h = height;


  ctx.save();


  ctx.shadowColor =
    "rgba(70,45,20,.16)";

  ctx.shadowBlur = 4;

  ctx.shadowOffsetY = 2;


  ctx.drawImage(

    image,

    item.x -
      width / 2,

    item.y -
      height / 2,

    width,

    height

  );


  ctx.restore();
}


/* =========================================
   RENDER
========================================= */

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
    item => {

      drawCharm(item);

    }
  );


  updatePrices();

  updateCharmBadges();
}


/* =========================================
   ADD CHARM
========================================= */

function addCharm(id) {

  selected.push({

    id: id,

    x:
      canvas.width / 2,

    y: 205,

    moved: false

  });


  arrangeAutomaticCharms();


  render();
}


/* =========================================
   PRICE CALCULATION
========================================= */

function updatePrices() {

  const braceletPrice =
    BRACELET_PRICES[
      currentBracelet
    ];


  let charmsPrice = 0;


  selected.forEach(
    item => {

      const charm =
        CHARMS.find(
          charm =>
            charm.id ===
            item.id
        );


      if (charm) {

        charmsPrice +=
          getCharmPrice(
            charm
          );

      }

    }
  );


  const total =
    braceletPrice +
    charmsPrice;


  braceletPriceLabel
    .textContent =
      "Chain " +
      currentBracelet;


  braceletPriceEl
    .textContent =
      "AED " +
      braceletPrice;


  charmCountLabel
    .textContent =
      selected.length === 1
        ? "1 Charm"
        : selected.length +
          " Charms";


  charmPriceEl
    .textContent =
      "AED " +
      charmsPrice;


  totalPriceEl
    .textContent =
      "AED " +
      total;


  selectedList
    .textContent =

      selected.length === 0

        ? "No charms selected yet."

        : selected.length +
          (
            selected.length === 1
              ? " charm selected."
              : " charms selected."
          );

}


/* =========================================
   CHARM GRID
========================================= */

function renderCharmGrid() {

  const searchTerm =
    searchInput
      .value
      .trim()
      .toLowerCase();


  const category =
    categoryFilter
      .value;


  const filtered =
    CHARMS.filter(
      charm => {


        if (
          !charmImages[
            charm.id
          ]
        ) {

          return false;

        }


        const categoryMatch =
          category === "all" ||
          charm.category ===
            category;


        const searchMatch =
          !searchTerm ||

          String(
            charm.name || ""
          )
            .toLowerCase()
            .includes(
              searchTerm
            ) ||

          String(
            charm.category || ""
          )
            .toLowerCase()
            .includes(
              searchTerm
            );


        return (
          categoryMatch &&
          searchMatch
        );

      }
    );


  charmGrid.innerHTML = "";


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


      charmGrid.appendChild(
        card
      );

    }
  );


  updateCharmBadges();
}


/* =========================================
   BADGES
========================================= */

function updateCharmBadges() {

  document
    .querySelectorAll(
      ".charm-card"
    )
    .forEach(
      card => {

        const id =
          card.dataset.id;


        const count =
          selected.filter(
            item =>
              String(
                item.id
              ) ===
              String(id)
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
            ? "flex"
            : "none";

      }
    );

}


/* =========================================
   SEARCH EVENTS
========================================= */

searchInput.addEventListener(
  "input",
  renderCharmGrid
);


categoryFilter.addEventListener(
  "change",
  renderCharmGrid
);


/* =========================================
   UNDO
========================================= */

document
  .getElementById(
    "undoBtn"
  )
  .addEventListener(
    "click",
    () => {

      if (
        selected.length === 0
      ) {
        return;
      }


      selected.pop();


      arrangeAutomaticCharms();


      render();

    }
  );


/* =========================================
   CLEAR
========================================= */

document
  .getElementById(
    "clearBtn"
  )
  .addEventListener(
    "click",
    () => {

      selected = [];

      render();

    }
  );


/* =========================================
   POINTER POSITION
========================================= */

function getPointerPosition(
  event
) {

  const rect =
    canvas
      .getBoundingClientRect();


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


/* =========================================
   FIND CHARM
========================================= */

function findCharmAt(
  point
) {

  for (
    let i =
      selected.length - 1;

    i >= 0;

    i--
  ) {

    const item =
      selected[i];


    const halfW =
      (
        item.w || 90
      ) /
      2 +
      15;


    const halfH =
      (
        item.h || 90
      ) /
      2 +
      15;


    if (

      point.x >=
        item.x -
        halfW &&

      point.x <=
        item.x +
        halfW &&

      point.y >=
        item.y -
        halfH &&

      point.y <=
        item.y +
        halfH

    ) {

      return i;

    }

  }


  return -1;
}


/* =========================================
   START DRAG
========================================= */

function startDrag(
  event
) {

  const point =
    getPointerPosition(
      event
    );


  draggingIndex =
    findCharmAt(
      point
    );


  if (
    draggingIndex < 0
  ) {
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


  event.preventDefault();
}


/* =========================================
   DRAG
========================================= */

function dragCharm(
  event
) {

  if (
    draggingIndex < 0
  ) {
    return;
  }


  event.preventDefault();


  const point =
    getPointerPosition(
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
        canvas.width - 45,

        point.x -
        dragOffsetX
      )
    );


  item.y =
    Math.max(
      60,

      Math.min(
        canvas.height - 45,

        point.y -
        dragOffsetY
      )
    );


  item.moved = true;


  render();
}


/* =========================================
   END DRAG
========================================= */

function endDrag() {

  draggingIndex = -1;

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


/* =========================================
   SAVE IMAGE
========================================= */

document
  .getElementById(
    "saveBtn"
  )
  .addEventListener(
    "click",
    () => {

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

    }
  );


/* =========================================
   START
========================================= */

preloadImages();
