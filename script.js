const canvas = document.getElementById('braceletCanvas');
const ctx = canvas.getContext('2d');

const braceletSelect = document.getElementById('braceletSelect');
const grid = document.getElementById('charmGrid');
const search = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const selectedList = document.getElementById('selectedList');

const braceletImages = {};
const charmImages = {};

let selected = [];
let dragging = -1;


// -----------------------------
// IMAGE LOADING
// -----------------------------

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));

    img.src = src;
  });
}


// -----------------------------
// LOAD BRACELETS + CHARMS
// -----------------------------

async function preload() {

  // Bracelet 1
  try {
    braceletImages[1] = await loadImage('assets/bracelet-1.png');
  } catch (error) {
    console.log('Bracelet 1 could not load');
  }

  // Bracelet 2
  try {
    braceletImages[2] = await loadImage('assets/bracelet-2.png');
  } catch (error) {
    console.log('Bracelet 2 could not load');
  }

  // Load charms
  await Promise.all(
    CHARMS.map(async (charm) => {
      try {
        charmImages[charm.id] = await loadImage(charm.src);
      } catch (error) {
        console.log('Skipping missing charm:', charm.src);
      }
    })
  );

  render();
  renderGrid();
}


// -----------------------------
// CATEGORY LIST
// -----------------------------

const categories = [...new Set(CHARMS.map(c => c.category))];

categories.forEach(category => {
  const option = document.createElement('option');

  option.value = category;
  option.textContent = category;

  categoryFilter.appendChild(option);
});


// -----------------------------
// DEFAULT CHARM POSITION
// -----------------------------

function defaultPosition(index) {

  const type = braceletSelect.value;
  const total = Math.max(selected.length, 1);

  const t = (index + 1) / (total + 1);

  if (type === '1') {
    return {
      x: 105 + t * 690,
      y: 565 - t * 470
    };
  }

  return {
    x: 105 + t * 680,
    y: 585 - t * 490
  };
}


function ensurePositions() {

  selected.forEach((item, index) => {

    if (!Number.isFinite(item.x) || !Number.isFinite(item.y)) {

      const position = defaultPosition(index);

      item.x = position.x;
      item.y = position.y;
    }

  });
}


// -----------------------------
// DRAW BRACELET
// -----------------------------

function drawCoverImage(img) {

  const scale =
    Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    ) * 0.95;

  const width = img.width * scale;
  const height = img.height * scale;

  ctx.drawImage(
    img,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height
  );
}


// -----------------------------
// MAIN RENDER
// -----------------------------

function render() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  // Draw bracelet
  const bracelet = braceletImages[braceletSelect.value];

  if (bracelet) {
    drawCoverImage(bracelet);
  }


  ensurePositions();


  // Draw selected charms
  selected.forEach((item) => {

    const img = charmImages[item.id];

    if (!img) return;


    const targetSize = 92;

    const ratio =
      Math.min(
        targetSize / img.width,
        targetSize / img.height
      );


    const width = img.width * ratio;
    const height = img.height * ratio;


    item.w = width;
    item.h = height;


    ctx.save();

    ctx.shadowColor = 'rgba(0,0,0,.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    ctx.drawImage(
      img,
      item.x - width / 2,
      item.y - height / 2,
      width,
      height
    );

    ctx.restore();

  });


  // Selected count
  if (selected.length > 0) {

    selectedList.textContent =
      `${selected.length} charm${selected.length > 1 ? 's' : ''} selected`;

  } else {

    selectedList.textContent =
      'No charms selected yet';

  }


  updateBadges();
}


// -----------------------------
// CHARM CATALOGUE
// -----------------------------

function renderGrid() {

  const query =
    search.value.trim().toLowerCase();

  const category =
    categoryFilter.value;


  const filtered = CHARMS.filter(charm => {

    // Do not show missing images
    if (!charmImages[charm.id]) {
      return false;
    }


    const matchesCategory =
      category === 'all' ||
      charm.category === category;


    const matchesSearch =
      !query ||
      charm.name.toLowerCase().includes(query) ||
      charm.category.toLowerCase().includes(query);


    return matchesCategory && matchesSearch;

  });


  grid.innerHTML = '';


  filtered.forEach(charm => {

    const card =
      document.createElement('button');

    card.className = 'charm-card';
    card.type = 'button';
    card.dataset.id = charm.id;


    card.innerHTML = `
      <img src="${charm.src}" alt="${charm.name}">
      <span>${charm.name}</span>
      <i class="badge" style="display:none">0</i>
    `;


    card.addEventListener(
      'click',
      () => addCharm(charm.id)
    );


    grid.appendChild(card);

  });


  updateBadges();
}


// -----------------------------
// BADGES
// -----------------------------

function updateBadges() {

  document
    .querySelectorAll('.charm-card')
    .forEach(card => {

      const count =
        selected.filter(
          item => item.id === card.dataset.id
        ).length;


      const badge =
        card.querySelector('.badge');


      badge.textContent = count;

      badge.style.display =
        count ? 'grid' : 'none';

    });
}


// -----------------------------
// ADD CHARM
// -----------------------------

function addCharm(id) {

  selected.push({
    id: id,
    x: null,
    y: null,
    moved: false
  });


  selected.forEach((item, index) => {

    if (!item.moved) {

      const position =
        defaultPosition(index);

      item.x = position.x;
      item.y = position.y;

    }

  });


  render();
}


// -----------------------------
// BUTTONS
// -----------------------------

document.getElementById('undoBtn')
  .addEventListener('click', () => {

    selected.pop();

    render();

  });


document.getElementById('clearBtn')
  .addEventListener('click', () => {

    selected = [];

    render();

  });


// -----------------------------
// CHANGE BRACELET
// -----------------------------

braceletSelect.addEventListener(
  'change',
  () => {

    selected.forEach((item, index) => {

      if (!item.moved) {

        const position =
          defaultPosition(index);

        item.x = position.x;
        item.y = position.y;

      }

    });


    render();

  }
);


// -----------------------------
// SEARCH + CATEGORY
// -----------------------------

search.addEventListener(
  'input',
  renderGrid
);


categoryFilter.addEventListener(
  'change',
  renderGrid
);


// -----------------------------
// DRAGGING CHARMS
// -----------------------------

function pointFromEvent(event) {

  const rect =
    canvas.getBoundingClientRect();


  const touch =
    event.touches?.[0] ||
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
      (clientX - rect.left) *
      canvas.width /
      rect.width,

    y:
      (clientY - rect.top) *
      canvas.height /
      rect.height

  };
}


function hitTest(point) {

  for (
    let i = selected.length - 1;
    i >= 0;
    i--
  ) {

    const item = selected[i];


    const insideX =
      Math.abs(point.x - item.x) <
      (item.w || 90) / 2 + 10;


    const insideY =
      Math.abs(point.y - item.y) <
      (item.h || 90) / 2 + 10;


    if (insideX && insideY) {
      return i;
    }

  }


  return -1;
}


function startDrag(event) {

  const point =
    pointFromEvent(event);


  dragging =
    hitTest(point);


  if (dragging >= 0) {
    event.preventDefault();
  }

}


function moveDrag(event) {

  if (dragging < 0) return;


  event.preventDefault();


  const point =
    pointFromEvent(event);


  selected[dragging].x =
    Math.max(
      45,
      Math.min(
        canvas.width - 45,
        point.x
      )
    );


  selected[dragging].y =
    Math.max(
      45,
      Math.min(
        canvas.height - 45,
        point.y
      )
    );


  selected[dragging].moved = true;


  render();
}


function endDrag() {
  dragging = -1;
}


// Mouse

canvas.addEventListener(
  'mousedown',
  startDrag
);

canvas.addEventListener(
  'mousemove',
  moveDrag
);

window.addEventListener(
  'mouseup',
  endDrag
);


// Touch

canvas.addEventListener(
  'touchstart',
  startDrag,
  { passive: false }
);

canvas.addEventListener(
  'touchmove',
  moveDrag,
  { passive: false }
);

canvas.addEventListener(
  'touchend',
  endDrag
);


// -----------------------------
// SAVE DESIGN
// -----------------------------

document.getElementById('saveBtn')
  .addEventListener('click', () => {

    render();


    const link =
      document.createElement('a');


    link.download =
      'zay-bracelet-design.png';


    link.href =
      canvas.toDataURL('image/png');


    link.click();

  });


// -----------------------------
// START SIMULATOR
// -----------------------------

preload();
