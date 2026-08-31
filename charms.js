/* =========================================
   ZAY CHARMS DATABASE
========================================= */

const CHARMS = [];


/* =========================================
   HELPER
========================================= */

function addCharm(id, name, category, filename) {

  CHARMS.push({
    id,
    name,
    category,
    src: `assets/charms/${filename}`
  });

}


/* =========================================
   LETTERS
   C-A-001 → C-A-026
========================================= */

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

for (let i = 0; i < 26; i++) {

  const number =
    String(i + 1).padStart(3, "0");

  addCharm(
    `letter-${alphabet[i].toLowerCase()}`,
    `Letter ${alphabet[i]}`,
    "Letters",
    `C-A-${number}.png`
  );

}


/* =========================================
   ROUND LETTERS
   C-AL-001 → C-AL-026
========================================= */

for (let i = 0; i < 26; i++) {

  const number =
    String(i + 1).padStart(3, "0");

  addCharm(
    `round-letter-${alphabet[i].toLowerCase()}`,
    `Round Letter ${alphabet[i]}`,
    "Round Letters",
    `C-AL-${number}.png`
  );

}


/* =========================================
   TRAVEL
   C-AIR-001
========================================= */

addCharm(
  "airplane",
  "Airplane",
  "Travel",
  "C-AIR-001.png"
);


/* =========================================
   FLOWERS
   C-FLO-001 → C-FLO-049
========================================= */

for (let i = 1; i <= 49; i++) {

  const number =
    String(i).padStart(3, "0");

  addCharm(
    `flower-${number}`,
    `Flower ${i}`,
    "Flowers",
    `C-FLO-${number}.png`
  );

}


/* =========================================
   FRUITS
   C-FRU-001 → C-FRU-023
========================================= */

for (let i = 1; i <= 23; i++) {

  const number =
    String(i).padStart(3, "0");

  let name =
    `Fruit ${i}`;

  if (i === 23) {
    name = "Cherry";
  }

  addCharm(
    `fruit-${number}`,
    name,
    "Fruits",
    `C-FRU-${number}.png`
  );

}


/* =========================================
   GRADUATION
   C-GRA-001
========================================= */

addCharm(
  "graduation",
  "Graduation",
  "Graduation",
  "C-GRA-001.png"
);


/* =========================================
   CUTE CHARACTERS
   C-K-001 → C-K-017
========================================= */

for (let i = 1; i <= 17; i++) {

  const number =
    String(i).padStart(3, "0");

  addCharm(
    `cute-${number}`,
    `Cute Character ${i}`,
    "Cute Characters",
    `C-K-${number}.png`
  );

}


/* =========================================
   SEA
   C-SEA-001 → C-SEA-022
========================================= */

for (let i = 1; i <= 22; i++) {

  const number =
    String(i).padStart(3, "0");

  addCharm(
    `sea-${number}`,
    `Sea Charm ${i}`,
    "Sea",
    `C-SEA-${number}.png`
  );

}


/* =========================================
   VINTAGE FLORALS
   C-V-001 → C-V-009
========================================= */

for (let i = 1; i <= 9; i++) {

  const number =
    String(i).padStart(3, "0");

  addCharm(
    `vintage-${number}`,
    `Vintage Floral ${i}`,
    "Vintage Florals",
    `C-V-${number}.png`
  );

}


/* =========================================
   VEGETABLES
   C-VEG-001 → C-VEG-007
========================================= */

for (let i = 1; i <= 7; i++) {

  const number =
    String(i).padStart(3, "0");

  addCharm(
    `vegetable-${number}`,
    `Vegetable ${i}`,
    "Vegetables",
    `C-VEG-${number}.png`
  );

}
/* =========================================
   SOLD OUT CHARMS
========================================= */

const SOLD_OUT_FILES = new Set([
  "C-SEA-005.png",
  "C-FRU-003.png",
  "C-K-002.png",
  "C-FLO-046.png",
  "C-SEA-022.png"
]);

CHARMS.forEach(charm => {

  const fileName =
    charm.src.split("/").pop();

  if (
    SOLD_OUT_FILES.has(fileName)
  ) {
    charm.soldOut = true;
  }

});

/* =========================================
   CHECK
========================================= */

console.log(
  `ZAY Simulator loaded ${CHARMS.length} charms.`
);
