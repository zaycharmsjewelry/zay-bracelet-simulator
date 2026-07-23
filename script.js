/* =========================================
   ZAY BRACELET SIMULATOR
========================================= */


/* ELEMENTS */

const canvas =
  document.getElementById(
    "braceletCanvas"
  );

const ctx =
  canvas.getContext("2d");


const charmGrid =
  document.getElementById(
    "charmGrid"
  );

const searchInput =
  document.getElementById(
    "search"
  );

const categoryFilter =
  document.getElementById(
    "categoryFilter"
  );


const braceletPriceLabel =
  document.getElementById(
    "braceletPriceLabel"
  );

const braceletPriceEl =
  document.getElementById(
    "braceletPrice"
  );

const charmCountLabel =
  document.getElementById(
    "charmCountLabel"
  );

const charmPriceEl =
  document.getElementById(
    "charmPrice"
  );

const totalPriceEl =
  document.getElementById(
    "totalPrice"
  );

const selectedList =
  document.getElementById(
    "selectedList"
  );


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

const charmImages = {};


/* =========================================
   GET CHARM PRICE
========================================= */

function getCharmPrice(charm) {

  const category =
    String(
      charm.category || ""
    ).toLowerCase();


  const name =
    String(
      charm.name || ""
    ).toLowerCase();


  /* VINTAGE = AED 8 */

  if (
    category.includes("vintage") ||
    name.includes("vintage")
  ) {

    return VINTAGE_CHARM_PRICE;

  }


  /* CUTE CHARACTERS = AED 6 */

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


  /* EVERYTHING ELSE = AED 5 */

  return NORMAL_CHARM_PRICE;
}


/* =========================================
   IMAGE LOADER
========================================= */

function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      const img =
        new Image();


      img.onload =
        () => resolve(img);


      img.onerror =
        () => reject(
          new Error(
            "Could not load " +
            src
          )
        );


      img.src = src;

    }
  );
}


/* =========================================
   PRELOAD IMAGES
========================================= */

async function preloadImages() {

  try {

    braceletImages[1] =
      await loadImage(
        "assets/bracelet-1.png"
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


          button.classList
            .add(
              "active"
            );


          render();

        }
      );

    }
  );


/* =========================================
   BRACELET POSITION
========================================= */

function getBraceletArea() {

  return {

    left: 55,

    right:
      canvas.width - 55,

    centerX:
      canvas.width / 2,

    /*
      Chain sits near the upper-middle
      portion of the design area.
    */

    chainY: 145

  };

}


/* =========================================
   DRAW BRACELET
========================================= */

function drawBracelet() {

  const image =
    braceletImages[
      currentBracelet
    ];


  if (!image) return;


  const area =
    getBraceletArea();


  /*
    Bracelet uses almost the entire
    available width.
  */

  const targetWidth =
    area.right -
    area.left;


  const scale =
    targetWidth /
    image.width;


  const targetHeight =
    image.height *
    scale;


  /*
    Prevent unusually tall transparent
    PNG canvases from making the chain
    enormous vertically.
  */

  const maxHeight = 115;


  let width =
    targetWidth;


  let height =
    targetHeight;


  if (height > maxHeight) {

    const correction =
      maxHeight /
      height;


    width *= correction;

    height *= correction;

  }


  const x =
    area.centerX -
    width / 2;


  const y =
    area.chainY -
    height / 2;


  ctx.drawImage(
    image,
    x,
    y,
    width,
    height
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
    All charms use EXACTLY
    the same Y position.

    This prevents the diagonal
    layout from before.
  */

  const charmY = 205;


  /*
    Usable width for charms.
  */

  const startX = 105;

  const endX =
    canvas.width - 105;


  if (total <= 1) {

    return {

      x:
        canvas.width / 2,

      y:
        charmY

    };

  }


  /*
    If customer selects 7 charms:

       x   x   x   x   x   x   x

    evenly across the bracelet.
  */

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
   ARRANGE AUTOMATIC CHARMS
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
    Charm display size.

    88px gives good visibility
    while still fitting 7 charms.
  */

  const boxSize = 88;


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
   RENDER CANVAS
========================================= */

function render() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /*
    Background matching ZAY
    cream aesthetic.
  */

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


  /*
    Every newly selected charm
    is automatically distributed
    along the bracelet.
  */

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


  if (
    selected.length === 0
  ) {

    selectedList
      .textContent =
        "No charms selected yet.";

  }

  else {

    selectedList
      .textContent =
        selected.length +
        (
          selected.length === 1
            ? " charm selected."
            : " charms selected."
        );

  }

}


/* =========================================
   CHARM CATALOGUE
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

        /*
          Don't display broken
          charm images.
        */

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
   SELECTED BADGES
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


      /*
        Reposition remaining
        automatic charms.
      */

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
   FIND CHARM UNDER POINTER
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
        item.w || 88
      ) /
      2 +
      15;


    const halfH =
      (
        item.h || 88
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
   START DRAGGING
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


  canvas.style.cursor =
    "grabbing";


  event.preventDefault();

}


/* =========================================
   DRAG CHARM
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
      80,

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

  canvas.style.cursor =
    "default";

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
