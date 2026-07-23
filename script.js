// ==========================================
// ZAY BRACELET SIMULATOR
// ==========================================


// ------------------------------------------
// PAGE ELEMENTS
// ------------------------------------------

const canvas =
  document.getElementById("braceletCanvas");

const ctx =
  canvas.getContext("2d");

const charmGrid =
  document.getElementById("charmGrid");

const search =
  document.getElementById("search");

const categoryFilter =
  document.getElementById("categoryFilter");

const selectedList =
  document.getElementById("selectedList");

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
// SIMULATOR STATE
// ==========================================

let currentBracelet = 1;

let selected = [];

let draggingIndex = -1;


const braceletImages = {};

const charmImages = {};



// ==========================================
// CHARM PRICING
// ==========================================

function getCharmPrice(charm) {

  const category =
    charm.category
      .toLowerCase();


  // Vintage charms = AED 8
  if (
    category.includes(
      "vintage"
    )
  ) {

    return VINTAGE_PRICE;

  }


  // Cute Characters = AED 6
  if (
    category.includes(
      "cute character"
    )
  ) {

    return CUTE_CHARACTER_PRICE;

  }


  // Everything else = AED 5
  return REGULAR_PRICE;

}



// ==========================================
// IMAGE LOADER
// ==========================================

function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      const image =
        new Image();


      image.onload =
        () =>
          resolve(image);


      image.onerror =
        () =>
          reject(
            new Error(
              `Unable to load ${src}`
            )
          );


      image.src = src;

    }
  );

}



// ==========================================
// PRELOAD IMAGES
// ==========================================

async function preload() {


  try {

    braceletImages[1] =
      await loadImage(
        "assets/bracelet-1.png"
      );

  }

  catch (error) {

    console.log(
      "Chain 1 missing"
    );

  }



  try {

    braceletImages[2] =
      await loadImage(
        "assets/bracelet-2.png"
      );

  }

  catch (error) {

    console.log(
      "Chain 2 missing"
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

          console.log(
            "Missing charm:",
            charm.src
          );

        }

      }

    )

  );


  createCategoryMenu();

  renderGrid();

  render();

}



// ==========================================
// CATEGORY MENU
// ==========================================

function createCategoryMenu() {

  const categories = [

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



// ==========================================
// CHAIN BUTTONS
// ==========================================

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
              button.dataset.bracelet
            );


          document
            .querySelectorAll(
              ".chain-card"
            )
            .forEach(

              card => {

                card.classList.remove(
                  "active"
                );

              }

            );


          button.classList.add(
            "active"
          );


          repositionAutomaticCharms();

          render();

        }

      );

    }

  );



// ==========================================
// HORIZONTAL CHARM POSITIONING
// ==========================================

function defaultPosition(index) {

  const total =
    Math.max(
      selected.length,
      1
    );


  // Area where charms should hang
  const startX = 170;

  const endX = 730;


  let x;


  // One charm goes in the middle
  if (total === 1) {

    x = 450;

  }

  else {

    x =
      startX
      +
      (
        index /
        (total - 1)
      )
      *
      (
        endX -
        startX
      );

  }


  /*
    IMPORTANT:

    Same Y position for ALL charms.

    This is what stops them appearing
    diagonally.
  */

  const y = 315;


  return {

    x: x,
    y: y

  };

}



// ==========================================
// REPOSITION NON-DRAGGED CHARMS
// ==========================================

function repositionAutomaticCharms() {

  selected.forEach(

    (
      item,
      index
    ) => {

      if (
        !item.moved
      ) {

        const position =
          defaultPosition(
            index
          );


        item.x =
          position.x;


        item.y =
          position.y;

      }

    }

  );

}



// ==========================================
// ENSURE POSITIONS
// ==========================================

function ensurePositions() {

  selected.forEach(

    (
      item,
      index
    ) => {

      if (
        !Number.isFinite(
          item.x
        )
        ||
        !Number.isFinite(
          item.y
        )
      ) {

        const position =
          defaultPosition(
            index
          );


        item.x =
          position.x;


        item.y =
          position.y;

      }

    }

  );

}



// ==========================================
// DRAW BRACELET
// ==========================================

function drawBracelet(image) {

  if (!image) return;


  /*
    Keeps chain large and horizontal.
  */

  const maximumWidth =
    canvas.width * 0.92;


  const maximumHeight =
    canvas.height * 0.42;


  const scale =
    Math.min(

      maximumWidth /
      image.width,

      maximumHeight /
      image.height

    );


  const width =
    image.width *
    scale;


  const height =
    image.height *
    scale;


  /*
    Chain sits around upper-middle
    so the charms can hang underneath.
  */

  const x =
    (
      canvas.width -
      width
    ) / 2;


  const y =
    175 -
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
// MAIN RENDER
// ==========================================

function render() {

  ctx.clearRect(

    0,
    0,

    canvas.width,
    canvas.height

  );


  // Background
  ctx.fillStyle =
    "#fffaf2";


  ctx.fillRect(

    0,
    0,

    canvas.width,
    canvas.height

  );


  // Draw chain
  drawBracelet(

    braceletImages[
      currentBracelet
    ]

  );


  ensurePositions();



  // Draw charms
  selected.forEach(

    item => {

      const image =
        charmImages[
          item.id
        ];


      if (!image) return;



      /*
        Charm display size.

        Change 100 to 90 if you
        later want slightly smaller charms.
      */

      const targetSize =
        100;


      const ratio =
        Math.min(

          targetSize /
          image.width,

          targetSize /
          image.height

        );


      const width =
        image.width *
        ratio;


      const height =
        image.height *
        ratio;


      item.w =
        width;


      item.h =
        height;



      ctx.save();


      ctx.shadowColor =
        "rgba(80,50,20,0.15)";


      ctx.shadowBlur =
        6;


      ctx.shadowOffsetY =
        3;



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

  );


  updatePrice();

  updateBadges();

}



// ==========================================
// PRICING
// ==========================================

function updatePrice() {

  const braceletPrice =
    BRACELET_PRICES[
      currentBracelet
    ];


  let charmsTotal =
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

        charmsTotal +=
          getCharmPrice(
            charm
          );

      }

    }

  );


  const total =
    braceletPrice +
    charmsTotal;



  braceletPriceLabel
    .textContent =
      `Chain ${currentBracelet}`;


  braceletPriceElement
    .textContent =
      `AED ${braceletPrice}`;



  charmCountLabel
    .textContent =

      selected.length === 1

        ? "1 Charm"

        : `${selected.length} Charms`;



  charmPriceElement
    .textContent =
      `AED ${charmsTotal}`;



  totalPriceElement
    .textContent =
      `AED ${total}`;



  selectedList
    .textContent =

      selected.length === 0

        ? "No charms selected yet"

        : `${selected.length} charm${
            selected.length === 1
              ? ""
              : "s"
          } selected`;

}



// ==========================================
// CHARM CATALOGUE
// ==========================================

function renderGrid() {

  const query =
    search.value
      .trim()
      .toLowerCase();


  const selectedCategory =
    categoryFilter.value;



  const visibleCharms =
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

          selectedCategory ===
          "all"

          ||

          charm.category ===
          selectedCategory;



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



  visibleCharms.forEach(

    charm => {

      const price =
        getCharmPrice(
          charm
        );


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



// ==========================================
// ADD CHARM
// ==========================================

function addCharm(id) {

  selected.push({

    id: id,

    x: null,

    y: null,

    moved: false

  });


  /*
    Whenever a charm is added,
    automatically space them evenly
    along the horizontal chain.
  */

  repositionAutomaticCharms();

  render();

}



// ==========================================
// NUMBER BADGES
// ==========================================

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


        if (!badge) return;


        badge.textContent =
          count;


        badge.style.display =

          count > 0

            ? "grid"

            : "none";

      }

    );

}



// ==========================================
// UNDO
// ==========================================

document
  .getElementById(
    "undoBtn"
  )
  .addEventListener(

    "click",

    () => {

      selected.pop();

      repositionAutomaticCharms();

      render();

    }

  );



// ==========================================
// CLEAR
// ==========================================

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



// ==========================================
// SEARCH & FILTER
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
// MOUSE / TOUCH POSITION
// ==========================================

function pointFromEvent(event) {

  const rectangle =
    canvas
      .getBoundingClientRect();


  const touch =

    event.touches?.[0]

    ||

    event.changedTouches?.[0];



  const clientX =

    touch

      ? touch.clientX

      : event.clientX;



  const clientY =

    touch

      ? touch.clientY

      : event.clientY;



  return {

    x:
      (
        clientX -
        rectangle.left
      )
      *
      canvas.width
      /
      rectangle.width,


    y:
      (
        clientY -
        rectangle.top
      )
      *
      canvas.height
      /
      rectangle.height

  };

}



// ==========================================
// DETECT CHARM CLICK
// ==========================================

function hitTest(point) {

  for (

    let index =
      selected.length - 1;

    index >= 0;

    index--

  ) {

    const item =
      selected[index];


    const horizontal =

      Math.abs(
        point.x -
        item.x
      )

      <

      (
        item.w || 90
      ) / 2
      + 15;



    const vertical =

      Math.abs(
        point.y -
        item.y
      )

      <

      (
        item.h || 90
      ) / 2
      + 15;



    if (
      horizontal &&
      vertical
    ) {

      return index;

    }

  }


  return -1;

}



// ==========================================
// START DRAGGING
// ==========================================

function startDrag(event) {

  const point =
    pointFromEvent(
      event
    );


  draggingIndex =
    hitTest(
      point
    );


  if (
    draggingIndex >= 0
  ) {

    event.preventDefault();

  }

}



// ==========================================
// DRAG
// ==========================================

function moveDrag(event) {

  if (
    draggingIndex < 0
  ) {

    return;

  }


  event.preventDefault();


  const point =
    pointFromEvent(
      event
    );


  selected[
    draggingIndex
  ].x =

    Math.max(

      50,

      Math.min(

        canvas.width - 50,

        point.x

      )

    );



  selected[
    draggingIndex
  ].y =

    Math.max(

      90,

      Math.min(

        canvas.height - 50,

        point.y

      )

    );


  selected[
    draggingIndex
  ].moved =
    true;


  render();

}



// ==========================================
// STOP DRAGGING
// ==========================================

function endDrag() {

  draggingIndex =
    -1;

}



// Mouse controls

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



// Mobile controls

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
        "zay-bracelet-design.png";


      link.href =
        canvas.toDataURL(
          "image/png"
        );


      link.click();

    }

  );



// ==========================================
// START
// ==========================================

preload();
