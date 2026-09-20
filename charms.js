/* =========================================
   ZAY CHARMS - AUTOMATIC CHARM LOADER
========================================= */

const GITHUB_API_URL =
  "https://api.github.com/repos/zaycharmsjewelry/zay-bracelet-simulator/contents/assets/charms";


/* =========================================
   PRICE RULES
========================================= */

const CHARM_PRICES = {
  bow: 6,
  characters: 6,
  flowers: 5,
  fly: 5,
  foods: 5,
  fruits: 5,
  heart: 6,
  letter1: 6,
  letter: 5,
  ocean: 6,
  pets: 6,
  random: 5,
  religion: 6,
  school: 6,
  travel: 5,
  veg: 5,
  vintage: 7
};


/* =========================================
   CATEGORY NAMES
========================================= */

const CATEGORY_NAMES = {
  bow: "Bows",
  characters: "Characters",
  flowers: "Flowers",
  fly: "Fly",
  foods: "Foods",
  fruits: "Fruits",
  heart: "Hearts",
  letter1: "Letters",
  letter: "Letters",
  ocean: "Ocean",
  pets: "Pets",
  random: "Random",
  religion: "Religion",
  school: "School",
  travel: "Travel",
  veg: "Vegetables",
  vintage: "Vintage"
};


/* =========================================
   FIND FILENAME PREFIX
========================================= */

function getPrefix(fileName) {

  const lower =
    fileName.toLowerCase();

  /*
     Important:
     letter1 must be checked before letter.
  */

  const prefixes =
    Object.keys(CHARM_PRICES).sort(
      (a, b) =>
        b.length - a.length
    );


  for (const prefix of prefixes) {

    if (
      lower.startsWith(
        `${prefix}-`
      )
    ) {

      return prefix;

    }

  }


  return null;

}


/* =========================================
   CREATE CHARM OBJECT
========================================= */

function createCharm(fileName) {

  const prefix =
    getPrefix(fileName);


  if (!prefix) {

    return null;

  }


  return {

    id: fileName,

    name: fileName,

    src:
      `assets/charms/${fileName}`,

    category:
      CATEGORY_NAMES[prefix],

    price:
      CHARM_PRICES[prefix],

    soldOut: false

  };

}


/* =========================================
   LOAD CHARMS FROM GITHUB
========================================= */

async function loadCharms() {

  try {

    const response =
      await fetch(
        GITHUB_API_URL
      );


    if (!response.ok) {

      throw new Error(
        `GitHub returned ${response.status} ${response.statusText}`
      );

    }


    const files =
      await response.json();


    const charms =
      files

        .filter(
          file =>
            file.type === "file"
        )

        .filter(
          file =>
            file.name
              .toLowerCase()
              .endsWith(".png")
        )

        .map(
          file =>
            createCharm(
              file.name
            )
        )

        .filter(Boolean);


    charms.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          undefined,
          {
            numeric: true,
            sensitivity: "base"
          }
        )
    );


    console.log(
      `ZAY: ${charms.length} charms loaded.`
    );


    return charms;

  }

  catch (error) {

    console.error(
      "Could not load ZAY charms:",
      error
    );


    return [];

  }

}


/* =========================================
   START LOADING
========================================= */

const CHARMS_READY =
  loadCharms();
