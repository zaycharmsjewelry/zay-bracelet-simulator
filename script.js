/* =========================================
   ZAY CHARMS BRACELET SIMULATOR
   ========================================= */


/* =========================================
   DOM ELEMENTS
   ========================================= */

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
   BRACELET INFORMATION
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
   STATE
   ========================================= */

let selectedBracelet = 1;

let CHARMS = [];

let selectedCharms = [];

let selectedCharmIndex = -1;

let braceletImage = null;

let charmImages = new Map();


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
            `Could not load image: ${src}`
          )
        );

      img.src = src;

    }
  );

}


/* =========================================
   LOAD BRACELET
   ========================================= */

async function loadBraceletImage() {

  const bracelet =
    BRACELETS[selectedBracelet];


  try {

    braceletImage =
      await loadImage(
        bracelet.src
      );

    drawCanvas();

  }

  catch (error) {

    console.error(error);

  }

}


/* =========================================
   CREATE CATEGORIES
   ========================================= */

function createCategories() {

  const categories =
    [
      ...new Set(
        CHARMS.map(
          charm => charm.category
        )
      )
    ];


  categories.sort(
    (a, b) =>
      a.localeCompare(b)
  );


  categoryFilter.innerHTML =
    `<option value="all">All Charms</option>`;


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

function renderGrid() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const category =
    categoryFilter.value;


  charmGrid.innerHTML = "";


  const filtered =
    CHARMS.filter(
      charm => {

        const matchesSearch =
          charm.name
            .toLowerCase()
            .includes(search);


        const matchesCategory =
          category === "all" ||
          charm.category === category;


        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );


  if (filtered.length === 0) {

    charmGrid.innerHTML =
      `<p class="no-results">
        No charms found.
      </p>`;

    return;

  }


  filtered.forEach(
    charm => {

      const card =
        document.createElement("button");

      card.type =
        "button";

      card.className =
        "charm-card";


      if (charm.soldOut) {

        card.classList.add(
          "sold-out"
        );

        card.disabled =
          true;

      }


      const img =
        document.createElement("img");

      img.src =
        charm.src;

      img.alt =
        "ZAY charm";

      img.loading =
        "lazy";


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

        card.appendChild(
          badge
        );

      }


      card.addEventListener(
        "click",
        () => {

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
   CHAIN SELECTION
   ========================================= */

document
  .querySelectorAll(".chain-card")
  .forEach(
    card => {

      card.addEventListener(
        "click",
        async () => {

          selectedBracelet =
            Number(
              card.dataset.bracelet
            );


          document
            .querySelectorAll(".chain-card")
            .forEach(
              item =>
                item.classList.remove(
                  "active"
                )
            );


          card.classList.add(
            "active"
          );


          await loadBraceletImage();


          updateSummary();

        }
      );

    }
  );


/* =========================================
   ADD CHARM
   ========================================= */

function addCharm(charm) {

  if (charm.soldOut) {

    return;

  }


  if (selectedCharms.length >= 12) {

    alert(
      "You can add up to 12 charms."
    );

    return;

  }


  selectedCharms.push({

    ...charm,

    x: 0,

    y: 210,

    width: 70,

    height: 70

  });


  selectedCharmIndex =
    selectedCharms.length - 1;


  positionCharms();

  updateSummary();

  drawCanvas();

}


/* =========================================
   POSITION CHARMS
   ========================================= */

function positionCharms() {

  const count =
    selectedCharms.length;


  if (count === 0) {

    return;

  }


  /*
    Keep charms horizontally spaced
    across the bracelet.
  */

  const centerX =
    canvas.width / 2;


  const spacing =
    Math.min(
      105,
      720 / Math.max(count - 1, 1)
    );


  const startX =
    centerX -
    ((count - 1) * spacing) / 2;


  selectedCharms.forEach(
    (charm, index) => {

      charm.x =
        startX +
        index * spacing;


      charm.y =
        210;

    }
  );

}


/* =========================================
   DRAW BRACELET
   ========================================= */

function drawCanvas() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  if (!braceletImage) {

    return;

  }


  const maxWidth =
    850;

  const maxHeight =
    240;


  let width =
    braceletImage.width;

  let height =
    braceletImage.height;


  const scale =
    Math.min(
      maxWidth / width,
      maxHeight / height,
      1
    );


  width *= scale;

  height *= scale;


  const braceletX =
    (canvas.width - width) / 2;


  const braceletY =
    190 -
    height / 2;


  ctx.drawImage(
    braceletImage,
    braceletX,
    braceletY,
    width,
    height
  );


  drawCharms();

}


/* =========================================
   DRAW CHARMS
   ========================================= */

function drawCharms() {

  selectedCharms.forEach(
    (charm, index) => {

      const img =
        charmImages.get(
          charm.id
        );


      if (!img) {

        return;

      }


      const size =
        charm.width;


      const x =
        charm.x -
        size / 2;


      const y =
        charm.y -
        size / 2;


      ctx.save();


      if (
        index ===
        selectedCharmIndex
      ) {

        ctx.strokeStyle =
          "#b99b5f";

        ctx.lineWidth =
          2;

        ctx.setLineDash(
          [5, 5]
        );

        ctx.strokeRect(
          x - 4,
          y - 4,
          size + 8,
          size + 8
        );

        ctx.setLineDash([]);

      }


      ctx.drawImage(
        img,
        x,
        y,
        size,
        size
      );


      ctx.restore();

    }
  );

}


/* =========================================
   PRELOAD CHARM IMAGE
   ========================================= */

async function preloadCharmImage(
  charm
) {

  if (
    charmImages.has(
      charm.id
    )
  ) {

    return;

  }


  try {

    const img =
      await loadImage(
        charm.src
      );

    charmImages.set(
      charm.id,
      img
    );

  }

  catch (error) {

    console.error(
      error
    );

  }

}


/* =========================================
   REMOVE SELECTED CHARM
   ========================================= */

removeBtn.addEventListener(
  "click",
  () => {

    if (
      selectedCharmIndex <
      0
    ) {

      return;

    }


    selectedCharms.splice(
      selectedCharmIndex,
      1
    );


    selectedCharmIndex =
      selectedCharms.length - 1;


    positionCharms();

    updateSummary();

    drawCanvas();

  }
);


/* =========================================
   CLEAR
   ========================================= */

clearBtn.addEventListener(
  "click",
  () => {

    selectedCharms = [];

    selectedCharmIndex = -1;

    updateSummary();

    drawCanvas();

  }
);


/* =========================================
   SEARCH
   ========================================= */

searchInput.addEventListener(
  "input",
  () => {

    renderGrid();

  }
);


/* =========================================
   CATEGORY FILTER
   ========================================= */

categoryFilter.addEventListener(
  "change",
  () => {

    renderGrid();

  }
);


/* =========================================
   CANVAS CLICK
   ========================================= */

canvas.addEventListener(
  "click",
  event => {

    const rect =
      canvas.getBoundingClientRect();


    const scaleX =
      canvas.width /
      rect.width;


    const scaleY =
      canvas.height /
      rect.height;


    const mouseX =
      (event.clientX -
        rect.left) *
      scaleX;


    const mouseY =
      (event.clientY -
        rect.top) *
      scaleY;


    selectedCharmIndex =
      -1;


    for (
      let i =
        selectedCharms.length - 1;
      i >= 0;
      i--
    ) {

      const charm =
        selectedCharms[i];


      const half =
        charm.width / 2;


      if (

        mouseX >=
        charm.x - half &&

        mouseX <=
        charm.x + half &&

        mouseY >=
        charm.y - half &&

        mouseY <=
        charm.y + half

      ) {

        selectedCharmIndex =
          i;

        break;

      }

    }


    drawCanvas();

  }
);


/* =========================================
   DRAGGING
   ========================================= */

let dragging =
  false;

let dragOffsetX =
  0;

let dragOffsetY =
  0;


canvas.addEventListener(
  "mousedown",
  event => {

    const rect =
      canvas.getBoundingClientRect();


    const scaleX =
      canvas.width /
      rect.width;


    const scaleY =
      canvas.height /
      rect.height;


    const mouseX =
      (event.clientX -
        rect.left) *
      scaleX;


    const mouseY =
      (event.clientY -
        rect.top) *
      scaleY;


    for (
      let i =
        selectedCharms.length - 1;
      i >= 0;
      i--
    ) {

      const charm =
        selectedCharms[i];


      const half =
        charm.width / 2;


      if (

        mouseX >=
        charm.x - half &&

        mouseX <=
        charm.x + half &&

        mouseY >=
        charm.y - half &&

        mouseY <=
        charm.y + half

      ) {

        selectedCharmIndex =
          i;


        dragging =
          true;


        dragOffsetX =
          mouseX -
          charm.x;


        dragOffsetY =
          mouseY -
          charm.y;


        drawCanvas();

        break;

      }

    }

  }
);


canvas.addEventListener(
  "mousemove",
  event => {

    if (!dragging) {

      return;

    }


    if (
      selectedCharmIndex <
      0
    ) {

      return;

    }


    const rect =
      canvas.getBoundingClientRect();


    const scaleX =
      canvas.width /
      rect.width;


    const scaleY =
      canvas.height /
      rect.height;


    const mouseX =
      (event.clientX -
        rect.left) *
      scaleX;


    const mouseY =
      (event.clientY -
        rect.top) *
      scaleY;


    const charm =
      selectedCharms[
        selectedCharmIndex
      ];


    charm.x =
      mouseX -
      dragOffsetX;


    charm.y =
      mouseY -
      dragOffsetY;


    drawCanvas();

  }
);


window.addEventListener(
  "mouseup",
  () => {

    dragging =
      false;

  }
);


/* =========================================
   TOUCH DRAGGING
   ========================================= */

canvas.addEventListener(
  "touchstart",
  event => {

    const touch =
      event.touches[0];


    const rect =
      canvas.getBoundingClientRect();


    const scaleX =
      canvas.width /
      rect.width;


    const scaleY =
      canvas.height /
      rect.height;


    const touchX =
      (touch.clientX -
        rect.left) *
      scaleX;


    const touchY =
      (touch.clientY -
        rect.top) *
      scaleY;


    for (
      let i =
        selectedCharms.length - 1;
      i >= 0;
      i--
    ) {

      const charm =
        selectedCharms[i];


      const half =
        charm.width / 2;


      if (

        touchX >=
        charm.x - half &&

        touchX <=
        charm.x + half &&

        touchY >=
        charm.y - half &&

        touchY <=
        charm.y + half

      ) {

        selectedCharmIndex =
          i;


        dragging =
          true;


        dragOffsetX =
          touchX -
          charm.x;


        dragOffsetY =
          touchY -
          charm.y;


        event.preventDefault();

        break;

      }

    }

  },
  { passive: false }
);


canvas.addEventListener(
  "touchmove",
  event => {

    if (!dragging) {

      return;

    }


    if (
      selectedCharmIndex <
      0
    ) {

      return;

    }


    const touch =
      event.touches[0];


    const rect =
      canvas.getBoundingClientRect();


    const scaleX =
      canvas.width /
      rect.width;


    const scaleY =
      canvas.height /
      rect.height;


    const touchX =
      (touch.clientX -
        rect.left) *
      scaleX;


    const touchY =
      (touch.clientY -
        rect.top) *
      scaleY;


    const charm =
      selectedCharms[
        selectedCharmIndex
      ];


    charm.x =
      touchX -
      dragOffsetX;


    charm.y =
      touchY -
      dragOffsetY;


    drawCanvas();


    event.preventDefault();

  },
  { passive: false }
);


canvas.addEventListener(
  "touchend",
  () => {

    dragging =
      false;

  }
);


/* =========================================
   UPDATE SUMMARY
   ========================================= */

function updateSummary() {

  const bracelet =
    BRACELETS[
      selectedBracelet
    ];


  const charmTotal =
    selectedCharms.reduce(
      (
        total,
        charm
      ) =>
        total +
        charm.price,
      0
    );


  const total =
    bracelet.price +
    charmTotal;


  braceletPriceLabel.textContent =
    bracelet.name;


  braceletPrice.textContent =
    `AED ${bracelet.price}`;


  charmCountLabel.textContent =
    `${selectedCharms.length} ${
      selectedCharms.length === 1
        ? "Charm"
        : "Charms"
    }`;


  charmPrice.textContent =
    `AED ${charmTotal}`;


  totalPrice.textContent =
    `AED ${total}`;


  if (
    selectedCharms.length === 0
  ) {

    selectedList.textContent =
      "No charms selected yet.";

    return;

  }


  selectedList.textContent =
    selectedCharms
      .map(
        charm =>
          `${charm.name} — AED ${charm.price}`
      )
      .join(" • ");

}


/* =========================================
   SAVE DESIGN
   ========================================= */

saveBtn.addEventListener(
  "click",
  () => {

    try {

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

    catch (error) {

      console.error(
        "Could not save design:",
        error
      );

      alert(
        "Sorry, the design could not be saved."
      );

    }

  }
);


/* =========================================
   PRELOAD EVERYTHING
   ========================================= */

async function preload() {

  try {

    CHARMS =
      await CHARMS_READY;


    console.log(
      `ZAY simulator received ${CHARMS.length} charms.`
    );


    createCategories();


    /*
      Preload charm images in the background.
    */

    await Promise.all(
      CHARMS.map(
        charm =>
          preloadCharmImage(
            charm
          )
      )
    );


    renderGrid();


    await loadBraceletImage();


    updateSummary();

  }

  catch (error) {

    console.error(
      "ZAY simulator failed to start:",
      error
    );


    charmGrid.innerHTML =
      `<p class="no-results">
        We couldn't load the charms right now.
        Please refresh the page.
      </p>`;

  }

}


/* =========================================
   START
   ========================================= */

preload();
