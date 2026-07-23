// ==========================================
// ZAY BRACELET SIMULATOR
// ==========================================


// ------------------------------------------
// ELEMENTS
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



// ------------------------------------------
// PRICING
// ------------------------------------------

const BRACELET_PRICES = {

  1: 15,

  2: 20

};


const REGULAR_CHARM_PRICE = 5;

const VINTAGE_CHARM_PRICE = 8;



// ------------------------------------------
// STATE
// ------------------------------------------

let currentBracelet = 1;

let selected = [];

let draggingIndex = -1;


const braceletImages = {};

const charmImages = {};



// ------------------------------------------
// CHARM PRICE
// ------------------------------------------

function getCharmPrice(charm) {

  if (
    charm.category
      .toLowerCase()
      .includes("vintage")
  ) {

    return VINTAGE_CHARM_PRICE;

  }

  return REGULAR_CHARM_PRICE;

}



// ------------------------------------------
// LOAD IMAGE
// ------------------------------------------

function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      const image =
        new Image();


      image.onload =
        () => resolve(image);


      image.onerror =
        () => reject(
          new Error(
            `Could not load ${src}`
          )
        );


      image.src = src;

    }
  );

}



// ------------------------------------------
// PRELOAD
// ------------------------------------------

async function preload() {


  // Bracelet 1

  try {

    braceletImages[1] =
      await loadImage(
        "assets/bracelet-1.png"
      );

  }

  catch (error) {

    console.log(
      "Bracelet 1 could not load"
    );

  }



  // Bracelet 2

  try {

    braceletImages[2] =
      await loadImage(
        "assets/bracelet-2.png"
      );

  }

  catch (error) {

    console.log(
      "Bracelet 2 could not load"
    );

  }



  // Charms

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
            "Skipping missing charm:",
            charm.src
          );

        }

      }

    )

  );


  createCategories();

  renderGrid();

  render();

}



// ------------------------------------------
// CATEGORY MENU
// ------------------------------------------

function createCategories() {

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



// ------------------------------------------
// CHAIN BUTTONS
// ------------------------------------------

document
  .querySelectorAll(
    ".chain-button"
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
              ".chain-button"
            )
            .forEach(
              item =>
                item.classList
                  .remove(
                    "active"
                  )
            );


          button.classList
            .add(
              "active"
            );


          repositionUnmovedCharms();

          render();

        }
      );

    }
  );



// ------------------------------------------
// DEFAULT CHARM POSITION
// ------------------------------------------

function defaultPosition(index) {

  const total = Math.max(selected.length, 1);

  // Space charms evenly across the middle of the bracelet
  const startX = 190;
  const endX = 710;

  let x;

  if (total === 1) {

    x = 450;

  } else {

    x =
      startX +
      (
        index /
        (total - 1)
      ) *
      (endX - startX);

  }


  // Same vertical position for every charm
  // This makes them hang below the horizontal chain
  const y = 410;


  return {
    x: x,
    y: y
  };
}



// ------------------------------------------
// REPOSITION AUTOMATIC CHARMS
// ------------------------------------------

function repositionUnmovedCharms() {

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



// ------------------------------------------
// ENSURE POSITIONS
// ------------------------------------------

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



// ------------------------------------------
// DRAW BRACELET
// ------------------------------------------

function drawBracelet(
  image
) {

  if (!image) return;


  const scale =
    Math.min(

      canvas.width /
      image.width,

      canvas.height /
      image.height

    ) * 0.95;


  const width =
    image.width *
    scale;


  const height =
    image.height *
    scale;


  ctx.drawImage(

    image,

    (
      canvas.width -
      width
    ) / 2,

    (
      canvas.height -
      height
    ) / 2,

    width,

    height

  );

}



// ------------------------------------------
// RENDER CANVAS
// ------------------------------------------

function render() {

  ctx.clearRect(

    0,
    0,

    canvas.width,
    canvas.height

  );


  // Warm cream background

  ctx.fillStyle =
    "#fffaf2";


  ctx.fillRect(

    0,
    0,

    canvas.width,
    canvas.height

  );



  // Bracelet

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



      const targetSize =
        92;


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
        "rgba(70,45,20,0.16)";


      ctx.shadowBlur =
        7;


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



// ------------------------------------------
// PRICE CALCULATION
// ------------------------------------------

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
          c =>
            c.id ===
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



  if (
    selected.length === 0
  ) {

    selectedList
      .textContent =
        "No charms selected yet";

  }

  else {

    selectedList
      .textContent =

        `${selected.length} charm${
          selected.length === 1
            ? ""
            : "s"
        } selected`;

  }

}



// ------------------------------------------
// CHARM CATALOGUE
// ------------------------------------------

function renderGrid() {

  const query =
    search.value
      .trim()
      .toLowerCase();


  const category =
    categoryFilter.value;



  const filtered =
    CHARMS.filter(

      charm => {


        // Don't show missing images

        if (
          !charmImages[
            charm.id
          ]
        ) {

          return false;

        }


        const categoryMatch =

          category === "all"
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
          categoryMatch
          &&
          searchMatch
        );

      }

    );



  charmGrid.innerHTML =
    "";



  filtered.forEach(

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

        <i
          class="charm-badge"
        >
          0
        </i>

      `;



      card.addEventListener(

        "click",

        () =>
          addCharm(
            charm.id
          )

      );



      charmGrid.appendChild(
        card
      );

    }

  );


  updateBadges();

}



// ------------------------------------------
// BADGES
// ------------------------------------------

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



// ------------------------------------------
// ADD CHARM
// ------------------------------------------

function addCharm(
  id
) {

  selected.push({

    id: id,

    x: null,

    y: null,

    moved: false

  });


  repositionUnmovedCharms();

  render();

}



// ------------------------------------------
// UNDO
// ------------------------------------------

document
  .getElementById(
    "undoBtn"
  )
  .addEventListener(

    "click",

    () => {

      selected.pop();

      repositionUnmovedCharms();

      render();

    }

  );



// ------------------------------------------
// CLEAR
// ------------------------------------------

document
  .getElementById(
    "clearBtn"
  )
  .addEventListener(

    "click",

    () => {

      selected =
        [];

      render();

    }

  );



// ------------------------------------------
// SEARCH
// ------------------------------------------

search
  .addEventListener(

    "input",

    renderGrid

  );



// ------------------------------------------
// CATEGORY
// ------------------------------------------

categoryFilter
  .addEventListener(

    "change",

    renderGrid

  );



// ------------------------------------------
// POINTER POSITION
// ------------------------------------------

function pointFromEvent(
  event
) {

  const rect =
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
        rect.left
      )
      *
      canvas.width
      /
      rect.width,


    y:

      (
        clientY -
        rect.top
      )
      *
      canvas.height
      /
      rect.height

  };

}



// ------------------------------------------
// HIT TEST
// ------------------------------------------

function hitTest(
  point
) {

  for (

    let index =
      selected.length - 1;

    index >= 0;

    index--

  ) {


    const item =
      selected[index];


    const insideX =

      Math.abs(

        point.x -
        item.x

      )

      <

      (
        item.w || 90
      ) / 2
      + 12;



    const insideY =

      Math.abs(

        point.y -
        item.y

      )

      <

      (
        item.h || 90
      ) / 2
      + 12;



    if (
      insideX
      &&
      insideY
    ) {

      return index;

    }

  }


  return -1;

}



// ------------------------------------------
// START DRAG
// ------------------------------------------

function startDrag(
  event
) {

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



// ------------------------------------------
// MOVE DRAG
// ------------------------------------------

function moveDrag(
  event
) {

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

      45,

      Math.min(

        canvas.width -
        45,

        point.x

      )

    );



  selected[
    draggingIndex
  ].y =

    Math.max(

      45,

      Math.min(

        canvas.height -
        45,

        point.y

      )

    );



  selected[
    draggingIndex
  ].moved =
    true;


  render();

}



// ------------------------------------------
// END DRAG
// ------------------------------------------

function endDrag() {

  draggingIndex =
    -1;

}



// Mouse

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



// Touch

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



// ------------------------------------------
// SAVE DESIGN
// ------------------------------------------

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
// START ZAY SIMULATOR
// ==========================================

preload();
