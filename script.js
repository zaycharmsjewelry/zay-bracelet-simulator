const CHAINS = [
  { id: "cable", name: "Cable chain", price: 15, image: "assets/bracelet-1.png" },
  { id: "curb", name: "Curb chain", price: 18, image: "assets/bracelet-2.png" },
  { id: "oval", name: "Oval link chain", price: 22, image: "assets/bracelet-3.png" },
  { id: "paperclip", name: "Paperclip chain", price: 20, image: "assets/bracelet-4.png" }
];

const categories = [
  ["Bows", "bow", 1, 7, 5],
  ["Characters", "characters", 1, 18, 6],
  ["Flowers", "flowers", 1, 68, 5],
  ["Fly", "fly", 1, 2, 5],
  ["Foods", "foods", 1, 6, 5],
  ["Fruits", "fruits", 1, 24, 5],
  ["Hearts", "heart", 1, 20, 5],
  ["Letter style 1", "letter", 1, 26, 5],
  ["Letter style 2", "letter1", 1, 26, 6],
  ["Ocean", "ocean", 1, 34, 5],
  ["Pets", "pets", 1, 4, 5],
  ["Random", "random", 1, 19, 5],
  ["Religion", "religion", 1, 5, 6],
  ["School", "school", 1, 1, 5],
  ["Travel", "travel", 1, 2, 5],
  ["Vegetables", "veg", 1, 7, 5],
  ["Vintage flowers", "vintage", 1, 9, 7]
];

const MAX_CHARMS = 12;

/* Add sold-out charm filenames here, without .png */
const SOLD_OUT = [
  "bow-003",
  "flowers-014",
  "heart-007"
];

const charmData = categories.map(([name, prefix, start, end, price]) => ({
  name,
  prefix,
  start,
  end,
  price
}));

let activeCategory = "all";
let selectedChain = null;
let selectedId = null;
let design = [];

const $ = (id) => document.getElementById(id);
const money = (number) => `${number} AED`;
const pad = (number) => String(number).padStart(3, "0");

function charmPath(charm) {
  return `assets/charms/${charm.prefix}-${pad(charm.number)}.png`;
}

function charmCode(charm) {
  return `${charm.prefix}-${pad(charm.number)}`;
}

function renderChains() {
  $("chain-list").innerHTML = CHAINS.map((chain) => `
    <button class="chain-card"
      aria-pressed="${selectedChain?.id === chain.id}"
      data-chain="${chain.id}">
      <img class="chain-${chain.id}" src="${chain.image}" alt="${chain.name}">
      <span>${chain.name}</span>
      <b>${money(chain.price)}</b>
    </button>
  `).join("");

  document.querySelectorAll("[data-chain]").forEach((button) => {
    button.onclick = () => selectChain(button.dataset.chain);
  });
}

function selectChain(id) {
  selectedChain = CHAINS.find((chain) => chain.id === id);

  $("bracelet-image").src = selectedChain.image;
  $("bracelet-image").className = `chain-${selectedChain.id}`;
  $("bracelet-image").style.display = "block";

  $("choose-chain-message").style.display = "none";
  $("save-button").disabled = false;

  renderChains();
  renderSummary();
}

function renderTabs() {
  $("category-select").innerHTML =
    `<option value="all" ${activeCategory === "all" ? "selected" : ""}>
      All charms
    </option>` +
    charmData.map((category, index) => `
      <option value="${index}" ${index === activeCategory ? "selected" : ""}>
        ${category.name}
      </option>
    `).join("");

  $("category-select").onchange = (event) => {
    activeCategory =
      event.target.value === "all"
        ? "all"
        : Number(event.target.value);

    renderCharms();
  };
}

function renderCharms() {
  const visibleCategories =
    activeCategory === "all"
      ? charmData.map((category, index) => ({ category, index }))
      : [{ category: charmData[activeCategory], index: activeCategory }];

  $("charm-list").innerHTML = visibleCategories.flatMap(
    ({ category, index }) =>
      Array.from(
        { length: category.end - category.start + 1 },
        (_, itemIndex) => {
          const charm = {
            ...category,
            category: category.name,
            number: category.start + itemIndex
          };

          const isSoldOut = SOLD_OUT.includes(charmCode(charm));

          return `
            <button class="charm-button ${isSoldOut ? "sold-out" : ""}"
              data-category="${index}"
              data-number="${charm.number}"
              ${isSoldOut ? "disabled" : ""}
              aria-label="${isSoldOut ? "Sold out" : `Add charm for ${money(category.price)}`}">
              <img src="${charmPath(charm)}" alt="" loading="lazy">
              <span>${isSoldOut ? "Sold out" : money(category.price)}</span>
            </button>
          `;
        }
      )
  ).join("");

  document.querySelectorAll(".charm-button:not(:disabled)").forEach((button) => {
    button.onclick = () => {
      addCharm(
        Number(button.dataset.category),
        Number(button.dataset.number)
      );
    };
  });
}

function addCharm(categoryIndex, number) {
  if (!selectedChain) {
    alert("Please choose a chain first.");
    return;
  }

  if (design.length >= MAX_CHARMS) {
    alert(`You can add up to ${MAX_CHARMS} charms.`);
    return;
  }

  const source = charmData[categoryIndex];
  const index = design.length;

  design.push({
    ...source,
    category: source.name,
    number,
    id: crypto.randomUUID(),
    x: 20 + (index % 5) * 15,
    y: 50
  });

  selectedId = design[design.length - 1].id;

  renderPlaced();
  renderSummary();
}

function renderPlaced() {
  $("placed-charms").innerHTML = design.map((charm) => `
    <button class="placed-charm ${charm.id === selectedId ? "selected" : ""}"
      data-id="${charm.id}"
      style="left:${charm.x}%; top:${charm.y}%">
      <img src="${charmPath(charm)}" alt="">
    </button>
  `).join("");

  document.querySelectorAll(".placed-charm").forEach((element) => {
    element.addEventListener("click", () => {
      selectedId = element.dataset.id;
      renderPlaced();
    });

    element.addEventListener("pointerdown", startDrag);
  });

  $("remove-button").disabled = !selectedId;

  $("selection-status").textContent = selectedId
    ? "Charm selected. You can drag it or remove it."
    : "Select a charm on the bracelet to remove it.";
}

function startDrag(event) {
  const element = event.currentTarget;
  const id = element.dataset.id;

  selectedId = id;

  document.querySelectorAll(".placed-charm").forEach((item) => {
    item.classList.toggle("selected", item.dataset.id === id);
  });

  $("remove-button").disabled = false;
  $("selection-status").textContent =
    "Charm selected. You can drag it or remove it.";

  element.setPointerCapture(event.pointerId);

  const move = (moveEvent) => {
    const box = $("bracelet-stage").getBoundingClientRect();
    const charm = design.find((item) => item.id === id);

    charm.x = Math.max(
      4,
      Math.min(96, ((moveEvent.clientX - box.left) / box.width) * 100)
    );

    charm.y = Math.max(
      10,
      Math.min(90, ((moveEvent.clientY - box.top) / box.height) * 100)
    );

    element.style.left = `${charm.x}%`;
    element.style.top = `${charm.y}%`;
  };

  const end = () => {
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", end);
    renderPlaced();
  };

  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", end);
}

function renderSummary() {
  const items = [];

  if (selectedChain) {
    items.push(`
      <div class="summary-line">
        <span>${selectedChain.name} <small>Chain</small></span>
        <b>${money(selectedChain.price)}</b>
      </div>
    `);
  }

  const grouped = design.reduce((all, charm) => {
    const key = `${charm.category}-${charm.prefix}-${charm.number}`;

    if (!all[key]) {
      all[key] = { ...charm, count: 0 };
    }

    all[key].count += 1;
    return all;
  }, {});

  Object.values(grouped).forEach((charm) => {
    items.push(`
      <div class="summary-line">
        <span>
          ${charm.category}
          <small>${charmCode(charm)} × ${charm.count}</small>
        </span>
        <b>${money(charm.price * charm.count)}</b>
      </div>
    `);
  });

  $("summary-items").innerHTML = items.length
    ? items.join("")
    : `<p class="empty-note">Choose a chain to see your total.</p>`;

  const total =
    (selectedChain?.price || 0) +
    design.reduce((sum, charm) => sum + charm.price, 0);

  $("total-price").textContent = money(total);
}

$("remove-button").onclick = () => {
  if (!selectedId) return;

  design = design.filter((charm) => charm.id !== selectedId);
  selectedId = null;

  $("selection-status").textContent =
    "Select a charm on the bracelet to remove it.";

  renderPlaced();
  renderSummary();
};

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

$("save-button").onclick = async () => {
  if (!selectedChain) return;

  const button = $("save-button");
  button.textContent = "Creating image…";
  button.disabled = true;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 1080;
    canvas.height = 1850;

    context.fillStyle = "#fffaf0";
    context.fillRect(0, 0, 1080, 1850);

    try {
      const logo = await loadImage("assets/logo.png");
      const logoScale = Math.min(240 / logo.width, 75 / logo.height);

      context.drawImage(
        logo,
        (1080 - logo.width * logoScale) / 2,
        30,
        logo.width * logoScale,
        logo.height * logoScale
      );
    } catch {
      /* The image still saves if the logo cannot load. */
    }

    context.fillStyle = "#bf8b2c";
    context.font = "bold 28px sans-serif";
    context.textAlign = "center";
    context.fillText("YOUR CHARM BRACELET DESIGN", 540, 140);

    context.fillStyle = "#35291f";
    context.font = "bold 49px Georgia";
    context.fillText("Made especially for you", 540, 195);

    context.fillStyle = "#fffdf8";
    context.fillRect(50, 230, 980, 520);

    const chainImage = await loadImage(selectedChain.image);

    const chainScale = Math.min(
      900 / chainImage.width,
      420 / chainImage.height
    );

    const chainWidth = chainImage.width * chainScale;
    const chainHeight = chainImage.height * chainScale;

    const chainWidthMultiplier =
      selectedChain.id === "cable"
        ? 2.1
        : selectedChain.id === "curb"
          ? 1.45
          : 1;

    context.drawImage(
      chainImage,
      (1080 - chainWidth * chainWidthMultiplier) / 2,
      280 + (420 - chainHeight) / 2,
      chainWidth * chainWidthMultiplier,
      chainHeight
    );

    for (const charm of design) {
      const image = await loadImage(charmPath(charm));
      const size = 100;

      context.drawImage(
        image,
        (charm.x / 100) * 980 + 50 - size / 2,
        (charm.y / 100) * 520 + 230 - size / 2,
        size,
        size
      );
    }

    let y = 825;

    context.textAlign = "left";
    context.fillStyle = "#35291f";
    context.font = "bold 30px sans-serif";
    context.fillText("Design summary", 70, y);

    y += 55;
    context.font = "25px sans-serif";

    function drawLine(left, right) {
      context.fillStyle = "#584837";

      context.textAlign = "left";
      context.fillText(left, 70, y);

      context.textAlign = "right";
      context.fillText(right, 1010, y);

      y += 43;
    }

    drawLine(selectedChain.name, money(selectedChain.price));

    const grouped = design.reduce((all, charm) => {
      const key = `${charm.category}-${charm.prefix}-${charm.number}`;

      if (!all[key]) {
        all[key] = { ...charm, count: 0 };
      }

      all[key].count += 1;
      return all;
    }, {});

    Object.values(grouped).forEach((charm) => {
      drawLine(
        `${charm.category} ${charmCode(charm)} × ${charm.count}`,
        money(charm.price * charm.count)
      );
    });

    const total =
      selectedChain.price +
      design.reduce((sum, charm) => sum + charm.price, 0);

    y += 15;

    context.strokeStyle = "#e8d8b7";
    context.beginPath();
    context.moveTo(70, y);
    context.lineTo(1010, y);
    context.stroke();

    y += 55;

    context.fillStyle = "#6c1f32";
    context.font = "bold 36px sans-serif";

    context.textAlign = "left";
    context.fillText("Total", 70, y);

    context.textAlign = "right";
    context.fillText(money(total), 1010, y);

    context.textAlign = "left";
    context.font = "22px sans-serif";
    context.fillStyle = "#77654f";

    context.fillText(
      "Delivery cost will be calculated separately as per the address.",
      70,
      y + 65
    );

    const link = document.createElement("a");
    link.download = "my-charm-bracelet-design.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    alert("Some images could not be found. Please check your assets folder.");
    console.error(error);
  } finally {
    button.textContent = "Save design image";
    button.disabled = false;
  }
};

renderChains();
renderTabs();
renderCharms();
renderPlaced();
renderSummary();
