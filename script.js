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
  document.getElementById(
    "braceletCanvas"
  );

const ctx =
  canvas.getContext("2d");


const charmGrid =
  document.getElementById(
    "charmGrid"
  );


const categoryFilter =
  document.getElementById(
    "categoryFilter"
  );


const chainGrid =
  document.getElementById(
    "chainGrid"
  );


const removeBtn =
  document.getElementById(
    "removeBtn"
  );


const clearBtn =
  document.getElementById(
    "clearBtn"
  );


const saveBtn =
  document.getElementById(
    "saveBtn"
  );


const braceletPriceLabel =
  document.getElementById(
    "braceletPriceLabel"
  );


const braceletPrice =
  document.getElementById(
    "braceletPrice"
  );


const charmCountLabel =
  document.getElementById(
    "charmCountLabel"
  );


const charmPrice =
  document.getElementById(
    "charmPrice"
  );


const totalPrice =
  document.getElementById(
    "totalPrice"
  );


const selectedList =
  document.getElementById(
    "selectedList"
  );


/* =========================================
   SETTINGS
========================================= */


/*
   THIS controls the actual size of charms
   inside the bracelet visualization.

   38px = small/delicate.
*/

const CHARM_SIZE = 38;


/*
   Distance between charms when they
   initially appear in a line.
*/

const INITIAL_SPACING = 58;


/*
   Invisible click/drag area.

   Slightly bigger than the charm itself
   so the customer can grab it easily.
*/

const CHARM_HIT_RADIUS = 25;


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

let dragOffsetX = 0;

let dragOffsetY = 0;


/* =========================================
   IMAGE LOADER
========================================= */

function getImage(src) {

  if (imageCache[src]) {

    return imageCache[src];

  }


  const img =
    new Image();


  img.src =
    src;


  imageCache[src] =
    img;


  return img;
}


/* =========================================
   LOAD BRACELET
========================================= */

function loadBracelet() {

  const bracelet =
    BRACELETS[
      currentBracelet
    ];


  braceletImage =
    getImage(
      bracelet.src
    );


  if (
    braceletImage.complete
  ) {

    drawCanvas();

  } else {

    braceletImage.onload =
      () => {

        drawCanvas();

      };

  }


  drawCanvas();
}


/* =========================================
   BRACELET SIZE
========================================= */

function getBraceletDrawSize() {

  if (
    !braceletImage ||
    !braceletImage.naturalWidth
  ) {

    return null;

  }


  /*
     Normal chains.
  */

  let maxWidth =
    canvas.width *
    0.84;


  let maxHeight =
    canvas.height *
    0.62;


  /*
     Cable + Curb are given
     substantially more space.
  */

  if (
    currentBracelet === 1 ||
    currentBracelet === 2
  ) {

    maxWidth =
      canvas.width *
      0.97;


    maxHeight =
      canvas.height *
      0.78;

  }


  const scale =
    Math.min(

      maxWidth /
        braceletImage.naturalWidth,

      maxHeight /
        braceletImage.naturalHeight

    );


  return {

    width:
      braceletImage.naturalWidth *
      scale,

    height:
      braceletImage.naturalHeight *
      scale

  };

}


/* =========================================
   DRAW CANVAS
========================================= */

function drawCanvas() {


  /* Clear */

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* Background */

  ctx.fillStyle =
    "#faf7f2";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* =====================================
     DRAW BRACELET
  ===================================== */

  if (

    braceletImage &&

    braceletImage.complete &&

    braceletImage.naturalWidth > 0

  ) {


    const size =
      getBraceletDrawSize();


    const x =
      (
        canvas.width -
        size.width
      ) / 2;


    const y =
      (
        canvas.height -
        size.height
      ) / 2;


    ctx.drawImage(

      braceletImage,

      x,

      y,

      size.width,

      size.height

    );

  }


  /* =====================================
     DRAW CHARMS
  ===================================== */

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
    getImage(
      item.charm.src
    );


  if (

    !img.complete ||

    img.naturalWidth === 0

  ) {


    img.onload =
      () => {

        drawCanvas();

      };


    return;

  }


  /*
     IMPORTANT:

     There is NO selection circle.

     The selected charm is simply
     the charm that REMOVE acts on.
  */


  ctx.drawImage(

    img,

    item.x -
      CHARM_SIZE / 2,

    item.y -
      CHARM_SIZE / 2,

    CHARM_SIZE,

    CHARM_SIZE

  );

}


/* =========================================
   INITIAL CHARM POSITION
========================================= */

function getInitialPosition(
  index
) {


  const centerX =
    canvas.width / 2;


  const centerY =
    canvas.height / 2;


  /*
     First charm:
     center

     Second:
     left

     Third:
     right

     Fourth:
     further left

     Fifth:
     further right
  */

  const side =
    index % 2 === 0
      ? 1
      : -1;


  const distance =
    Math.ceil(
      index / 2
    ) *
    INITIAL_SPACING;


  return {

    x:
      centerX +
      side *
      distance,

    y:
      centerY

  };

}


/* =========================================
   ADD CHARM
========================================= */

function addCharm(
  charm
) {


  if (!charm) {

    return;

  }


  if (charm.soldOut) {

    return;

  }


  /*
     New charms initially appear
     in a neat line.
  */

  const position =
    getInitialPosition(
      placedCharms.length
    );


  const half =
    CHARM_SIZE / 2;


  const item = {

    charm:
      charm,

    x:
      Math.max(

        half,

        Math.min(

          canvas.width -
            half,

          position.x

        )

      ),

    y:
      Math.max(

        half,

        Math.min(

          canvas.height -
            half,

          position.y

        )

      )

  };


  placedCharms.push(
    item
  );


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

    selectedCharmIndex >=
      placedCharms.length

  ) {

    return;

  }


  placedCharms.splice(

    selectedCharmIndex,

    1

  );


  selectedCharmIndex =
    -1;


  updateSummary();

  drawCanvas();

}


/* =========================================
   CLEAR
========================================= */

function clearDesign() {


  placedCharms = [];


  selectedCharmIndex =
    -1;


  updateSummary();

  drawCanvas();

}


/* =========================================
   CHAIN SELECTION
========================================= */

function selectChain(
  number
) {


  number =
    Number(number);


  if (
    !BRACELETS[number]
  ) {

    return;

  }


  currentBracelet =
    number;


  document
    .querySelectorAll(
      ".chain-card"
    )
    .forEach(
      card => {

        const cardNumber =
          Number(
            card.dataset
              .bracelet
          );


        card.classList.toggle(

          "active",

          cardNumber ===
            number

        );

      }
    );


  loadBracelet();

  updateSummary();

}


/* =========================================
   CATEGORIES
========================================= */

function createCategories() {


  if (
    !categoryFilter
  ) {

    return;

  }


  const categories = [

    ...new Set(

      availableCharms.map(

        charm =>
          charm.category

      )

    )

  ].sort(

    (a, b) =>
      a.localeCompare(b)

  );


  categoryFilter.innerHTML =
    "";


  const allOption =
    document.createElement(
      "option"
    );


  allOption.value =
    "all";


  allOption.textContent =
    "All Charms";


  categoryFilter.appendChild(
    allOption
  );


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
   RENDER CHARMS
========================================= */

function renderCharmGrid() {


  if (!charmGrid) {

    return;

  }


  const selectedCategory =
    categoryFilter
      ? categoryFilter.value
      : "all";


  charmGrid.innerHTML =
    "";


  const filtered =
    availableCharms.filter(

      charm => {

        if (

          selectedCategory !==
            "all" &&

          charm.category !==
            selectedCategory

        ) {

          return false;

        }


        return true;

      }

    );


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


      if (
        charm.soldOut
      ) {

        card.classList.add(
          "sold-out"
        );

      }


      /* IMAGE */

      const img =
        document.createElement(
          "img"
        );


      img.src =
        charm.src;


      img.alt =
        "Charm";


      img.loading =
        "lazy";


      /* PRICE */

      const price =
        document.createElement(
          "span"
        );


      price.className =
        "charm-price";


      price.textContent =
        `AED ${charm.price}`;


      card.appendChild(
        img
      );


      card.appendChild(
        price
      );


      /* SOLD OUT */

      if (
        charm.soldOut
      ) {


        const badge =
          document.createElement(
            "span"
          );


        badge.className =
          "charm-badge";


        badge.textContent =
          "SOLD OUT";


        card.appendChild(
          badge
        );

      }


      /* CLICK */

      card.addEventListener(

        "click",

        () => {


          if (
            charm.soldOut
          ) {

            return;

          }


          addCharm(
            charm
          );

        }

      );


      charmGrid.appendChild(
        card
      );

    }

  );

}


/* =========================================
   SUMMARY / PRICING
========================================= */

function updateSummary() {


  const bracelet =
    BRACELETS[
      currentBracelet
    ];


  const count =
    placedCharms.length;


  const charmTotal =
    placedCharms.reduce(

      (
        total,
        item
      ) => {

        return (

          total +
          Number(
            item.charm.price
          )

        );

      },

      0

    );


  /* Chain */

  braceletPriceLabel.textContent =
    bracelet.name;


  braceletPrice.textContent =
    `AED ${bracelet.price}`;


  /* Charms */

  charmCountLabel.textContent =

    `${count} ${
      count === 1
        ? "Charm"
        : "Charms"
    }`;


  charmPrice.textContent =
    `AED ${charmTotal}`;


  /* Total */

  totalPrice.textContent =

    `AED ${
      bracelet.price +
      charmTotal
    }`;


  /* Selected */

  if (
    count === 0
  ) {

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


/* =========================================
   CANVAS POSITION
========================================= */

function getCanvasPosition(
  event
) {


  const rect =
    canvas.getBoundingClientRect();


  return {

    x:

      (
        event.clientX -
        rect.left
      ) *

      (
        canvas.width /
        rect.width
      ),


    y:

      (
        event.clientY -
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
  x,
  y
) {


  /*
     Search from top to bottom
     so the top charm is selected.
  */

  for (

    let i =
      placedCharms.length - 1;

    i >= 0;

    i--

  ) {


    const item =
      placedCharms[i];


    const dx =
      x -
      item.x;


    const dy =
      y -
      item.y;


    const distance =
      Math.sqrt(

        dx * dx +
        dy * dy

      );


    if (

      distance <=
      CHARM_HIT_RADIUS

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


  event.preventDefault();


  const position =
    getCanvasPosition(
      event
    );


  const index =
    findCharmAt(

      position.x,

      position.y

    );


  /*
     Clicked empty space.
  */

  if (
    index === -1
  ) {

    selectedCharmIndex =
      -1;


    drawCanvas();

    return;

  }


  /*
     Select charm.
  */

  selectedCharmIndex =
    index;


  dragging =
    true;


  /*
     Remember exactly where
     the customer grabbed it.
  */

  dragOffsetX =

    position.x -
    placedCharms[index].x;


  dragOffsetY =

    position.y -
    placedCharms[index].y;


  /*
     Bring selected charm
     to the front.
  */

  const selected =
    placedCharms.splice(

      index,

      1

    )[0];


  placedCharms.push(
    selected
  );


  selectedCharmIndex =
    placedCharms.length - 1;


  drawCanvas();

}


/* =========================================
   DRAG
========================================= */

function drag(
  event
) {


  if (!dragging) {

    return;

  }


  event.preventDefault();


  const position =
    getCanvasPosition(
      event
    );


  const item =
    placedCharms[
      selectedCharmIndex
    ];


  if (!item) {

    return;

  }


  /*
     FREE MOVEMENT.

     No horizontal restriction.
     No bracelet-line restriction.
     No snapping.
  */

  item.x =

    position.x -
    dragOffsetX;


  item.y =

    position.y -
    dragOffsetY;


  /*
     Only restriction:

     Keep the charm inside
     the visualization box.
  */

  const half =
    CHARM_SIZE / 2;


  item.x =
    Math.max(

      half,

      Math.min(

        canvas.width -
          half,

        item.x

      )

    );


  item.y =
    Math.max(

      half,

      Math.min(

        canvas.height -
          half,

        item.y

      )

    );


  drawCanvas();

}


/* =========================================
   STOP DRAG
========================================= */

function stopDrag() {

  dragging =
    false;

}


/* =========================================
   SAVE DESIGN
========================================= */

function saveDesign() {


  const link =
    document.createElement(
      "a"
    );


  link.download =
    "ZAY-bracelet-design.png";


  link.href =
    canvas.toDataURL(
      "image/png"
    );


  link.click();

}


/* =========================================
   CHAIN EVENTS
========================================= */

if (chainGrid) {


  chainGrid
    .querySelectorAll(
      ".chain-card"
    )
    .forEach(

      card => {


        card.addEventListener(

          "click",

          () => {


            selectChain(

              card.dataset
                .bracelet

            );

          }

        );

      }

    );

}


/* =========================================
   CATEGORY EVENT
========================================= */

if (
  categoryFilter
) {


  categoryFilter.addEventListener(

    "change",

    renderCharmGrid

  );

}


/* =========================================
   BUTTON EVENTS
========================================= */

if (
  removeBtn
) {

  removeBtn.addEventListener(

    "click",

    removeSelectedCharm

  );

}


if (
  clearBtn
) {

  clearBtn.addEventListener(

    "click",

    clearDesign

  );

}


if (
  saveBtn
) {

  saveBtn.addEventListener(

    "click",

    saveDesign

  );

}


/* =========================================
   MOUSE / POINTER
========================================= */

/*
   Pointer events work for mouse and
   make the dragging system much simpler.
*/

canvas.addEventListener(

  "pointerdown",

  event => {


    canvas.setPointerCapture(
      event.pointerId
    );


    startDrag(
      event
    );

  }

);


canvas.addEventListener(

  "pointermove",

  event => {


    if (
      dragging
    ) {

      drag(
        event
      );

    }

  }

);


canvas.addEventListener(

  "pointerup",

  event => {


    stopDrag();


    try {

      canvas.releasePointerCapture(
        event.pointerId
      );

    } catch (
      error
    ) {}

  }

);


canvas.addEventListener(

  "pointercancel",

  stopDrag

);


/* =========================================
   INITIALIZE
========================================= */

async function initialize() {


  try {


    /*
       Get all charms from charms.js.
    */

    availableCharms =
      await CHARMS_READY;


    console.log(

      `ZAY: ${
        availableCharms.length
      } charms loaded.`

    );


    /*
       Category menu.
    */

    createCategories();


    /*
       Charm catalog.
    */

    renderCharmGrid();


    /*
       First chain.
    */

    loadBracelet();


    /*
       Pricing.
    */

    updateSummary();


  } catch (
    error
  ) {


    console.error(

      "ZAY simulator failed to initialize:",

      error

    );

  }

}


initialize();
