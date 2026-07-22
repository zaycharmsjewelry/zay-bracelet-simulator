// ========================================
// ZAY BRACELET SIMULATOR
// 154 CHARMS WITH CATEGORIES
// ========================================

const CATEGORY_RANGES = [
  {
    category: "Vintage Florals",
    start: 1,
    end: 9
  },

  {
    category: "Letters",
    start: 10,
    end: 35
  },

  {
    category: "Flower",
    start: 36,
    end: 51
  },

  {
    category: "Fruits & Vegetables",
    start: 52,
    end: 80
  },

  {
    category: "Mini Flowers",
    start: 81,
    end: 92
  },

  {
    category: "Ocean",
    start: 93,
    end: 103
  },

  {
    category: "Cute Characters",
    start: 104,
    end: 121
  },

  {
    category: "Shells",
    start: 122,
    end: 133
  },

  {
    category: "Daisies",
    start: 134,
    end: 154
  }
];


// ========================================
// LETTER NAMES
// ========================================

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


// ========================================
// CREATE CHARM LIST
// ========================================

const CHARMS = [];

CATEGORY_RANGES.forEach(group => {

  for (let number = group.start; number <= group.end; number++) {

    const paddedNumber =
      String(number).padStart(3, "0");

    let charmName;


    // ------------------------------------
    // LETTERS
    // ------------------------------------

    if (group.category === "Letters") {

      const letterIndex =
        number - group.start;

      charmName =
        `Letter ${LETTERS[letterIndex]}`;

    }


    // ------------------------------------
    // VINTAGE FLORALS
    // ------------------------------------

    else if (group.category === "Vintage Florals") {

      charmName =
        `Vintage Floral ${number - group.start + 1}`;

    }


    // ------------------------------------
    // FLOWER STEMS
    // ------------------------------------

    else if (group.category === "Flower") {

      charmName =
        `Flower ${number - group.start + 1}`;

    }


    // ------------------------------------
    // FRUITS
    // ------------------------------------

    else if (group.category === "Fruits & Vegetables") {

      charmName =
        `Fruit ${number - group.start + 1}`;

    }


    // ------------------------------------
    // FOOD & VEGETABLES
    // ------------------------------------

    else if (group.category === "Food & Vegetables") {

      charmName =
        `Food & Vegetable ${number - group.start + 1}`;

    }


    // ------------------------------------
    // MINI FLOWERS
    // ------------------------------------

    else if (group.category === "Mini Flowers") {

      charmName =
        `Mini Flower ${number - group.start + 1}`;

    }


    // ------------------------------------
    // OCEAN
    // ------------------------------------

    else if (group.category === "Ocean") {

      charmName =
        `Ocean Charm ${number - group.start + 1}`;

    }


    // ------------------------------------
    // CUTE CHARACTERS
    // ------------------------------------

    else if (group.category === "Cute Characters") {

      charmName =
        `Cute Character ${number - group.start + 1}`;

    }


    // ------------------------------------
    // CHARACTER MINIS
    // ------------------------------------

    else if (group.category === "Character Minis") {

      charmName =
        `Character Mini ${number - group.start + 1}`;

    }


    // ------------------------------------
    // SHELLS
    // ------------------------------------

    else if (group.category === "Shells") {

      charmName =
        `Shell ${number - group.start + 1}`;

    }


    // ------------------------------------
    // DAISIES
    // ------------------------------------

    else if (group.category === "Daisies") {

      charmName =
        `Daisy ${number - group.start + 1}`;

    }


    // ------------------------------------
    // PETAL FLOWERS
    // ------------------------------------

    else if (group.category === "Petal Flowers") {

      charmName =
        `Petal Flower ${number - group.start + 1}`;

    }


    // ------------------------------------
    // FALLBACK
    // ------------------------------------

    else {

      charmName =
        `Charm ${paddedNumber}`;

    }


    CHARMS.push({

      id: `c${paddedNumber}`,

      name: charmName,

      category: group.category,

      src:
        `assets/charms/charm-${paddedNumber}.png`

    });

  }

});


console.log(
  `ZAY Simulator: ${CHARMS.length} charms loaded`
);
