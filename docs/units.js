function text(value) {
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

function createElement(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

const quickReferenceGroups = [
  { base: { unit: "Infantry", cost: "3", move: "1", attack: "1", defend: "2", capacity: "" } },
  {
    base: { unit: "Artillery", cost: "4", move: "1", attack: "2", defend: "2", capacity: "" },
    upgrade: { unit: "Self Propelled Artillery", cost: "4", move: "2", attack: "2", defend: "2", capacity: "" }
  },
  { base: { unit: "Mechanized Infantry", cost: "4", move: "2", attack: "1", defend: "2", capacity: "" } },
  {
    base: { unit: "Tank", cost: "6", move: "2", attack: "3", defend: "3", capacity: "" },
    upgrade: { unit: "Heavy Tank", cost: "6", move: "2", attack: "3", defend: "4", capacity: "" }
  },
  {
    base: { unit: "AA Gun", cost: "5", move: "1", attack: "0", defend: "1", capacity: "" },
    upgrade: { unit: "AA Gun with Radar", cost: "5", move: "1", attack: "0", defend: "2", capacity: "" }
  },
  {
    base: { unit: "Fighter", cost: "10", move: "4/6", attack: "3", defend: "3", capacity: "" },
    upgrade: { unit: "Jet Fighter", cost: "10", move: "4/6", attack: "4", defend: "3", capacity: "" }
  },
  { base: { unit: "Tactical Bomber", cost: "11", move: "4/6", attack: "3", defend: "3", capacity: "" } },
  {
    base: { unit: "Strategic Bomber", cost: "12", move: "6/8", attack: "4", defend: "1", capacity: "2" },
    upgrade: { unit: "Heavy Bomber", cost: "12", move: "6/8", attack: "2x4", defend: "1", capacity: "2" }
  },
  {
    base: { unit: "Submarine", cost: "6/5", move: "2", attack: "2", defend: "1", capacity: "" },
    upgrade: { unit: "Super Submarine", cost: "6/5", move: "2", attack: "3", defend: "1", capacity: "" }
  },
  {
    base: { unit: "Transport", cost: "7/5", move: "2", attack: "0", defend: "0", capacity: "2/1+1" },
    upgrade: { unit: "Improved Transport", cost: "7/5", move: "2", attack: "0", defend: "0", capacity: "2+1" }
  },
  { base: { unit: "Destroyer", cost: "8/7", move: "2", attack: "2", defend: "2", capacity: "" } },
  { base: { unit: "Cruiser", cost: "12/8", move: "2", attack: "3", defend: "3", capacity: "" } },
  {
    base: { unit: "Aircraft Carrier", cost: "16/13", move: "2", attack: "0", defend: "2", capacity: "2" },
    upgrade: { unit: "Super Aircraft Carrier", cost: "16/13", move: "2", attack: "0", defend: "2", capacity: "3" }
  },
  {
    base: { unit: "Battleship", cost: "20/16", move: "2", attack: "4", defend: "4", capacity: "" },
    upgrade: { unit: "Super Battleship", cost: "20/16", move: "2", attack: "2x4", defend: "4", capacity: "" }
  },
  {
    base: { unit: "Major Factory", cost: "30/20", move: "", attack: "", defend: "1", capacity: "" },
    upgrade: { unit: "Major Factory with Radar", cost: "30/20", move: "", attack: "", defend: "2", capacity: "" }
  },
  {
    base: { unit: "Minor Factory", cost: "12", move: "", attack: "", defend: "1", capacity: "" },
    upgrade: { unit: "Minor Factory with Radar", cost: "12", move: "", attack: "", defend: "2", capacity: "" }
  },
  {
    base: { unit: "Air/Naval Base", cost: "15", move: "", attack: "", defend: "1", capacity: "" },
    upgrade: { unit: "Air/Naval Base with Radar", cost: "15", move: "", attack: "", defend: "2", capacity: "" }
  },
  { base: { unit: "Naval Mine", cost: "2", move: "", attack: "", defend: "1", capacity: "" } }
];

const unitCards = [
  {
    title: "Infantry",
    image: "images/infantry.png",
    base: { name: "Infantry", cost: "3", move: "1", attack: "1", defend: "2", capacity: "-" },
    rules: [
      "Move 1; stop when entering hostile territory.",
      "Infantry + Artillery: Infantry attack increases to 2.",
      "Paratrooper delivery can carry infantry via Strategic/Heavy bombers under listed rules."
    ]
  },
  {
    title: "Artillery / Self Propelled Artillery",
    image: "images/artillery.png",
    base: { name: "Artillery", cost: "4", move: "1", attack: "2", defend: "2", capacity: "-" },
    upgrade: { name: "Self Propelled Artillery", cost: "4", move: "2", attack: "2", defend: "2", capacity: "-" },
    rules: [
      "Artillery supports Infantry or Mechanized Infantry (attack boost combinations listed in UnitRules).",
      "Self Propelled Artillery supports 2 Infantry or Mechanized Infantry and moves 2."
    ]
  },
  {
    title: "Mechanized Infantry",
    image: "images/mechanizedInfantry.png",
    base: { name: "Mechanized Infantry", cost: "4", move: "2", attack: "1", defend: "2", capacity: "-" },
    rules: [
      "Can blitz with one Tank (one Mechanized Infantry per Tank).",
      "With Artillery support, attack increases to 2.",
      "Mechanized Infantry + Tank: can blitz."
    ]
  },
  {
    title: "Tank / Heavy Tank",
    image: "images/tank.png",
    base: { name: "Tank", cost: "6", move: "2", attack: "3", defend: "3", capacity: "-" },
    upgrade: { name: "Heavy Tank", cost: "6", move: "2", attack: "3", defend: "4", capacity: "-" },
    rules: [
      "Tank can blitz through unoccupied hostile territory.",
      "Tactical Bomber + Tank: Tactical Bomber attack increases to 4.",
      "Heavy Tank technology improves Tank defense from 3 to 4."
    ]
  },
  {
    title: "AA Gun / AA Gun with Radar",
    image: "images/aaGun.png",
    imageUpgrade: "images/aaGunRadar.png",
    base: { name: "AA Gun", cost: "5", move: "1", attack: "0", defend: "1", capacity: "-" },
    upgrade: { name: "AA Gun with Radar", cost: "5", move: "1", attack: "0", defend: "2", capacity: "-" },
    rules: [
      "Radar technology increases Anti-Aircraft fire to 2."
    ]
  },
  {
    title: "Fighter / Jet Fighter",
    image: "images/fighter.png",
    imageUpgrade: "images/jetFighter.png",
    base: { name: "Fighter", cost: "10", move: "4/6", attack: "3", defend: "3", capacity: "-" },
    upgrade: { name: "Jet Fighter", cost: "10", move: "4/6", attack: "4", defend: "3", capacity: "-" },
    rules: [
      "Fighters have Intercept ability in all combats.",
      "Jet Fighters increase attack to 4 and Intercept hits to 2.",
      "Long Range Aircraft increases all air unit range by two spaces."
    ]
  },
  {
    title: "Tactical Bomber",
    image: "images/tacticalBomber.png",
    base: { name: "Tactical Bomber", cost: "11", move: "4/6", attack: "3", defend: "3", capacity: "-" },
    rules: [
      "Tactical Bomber + Tank: attack increases to 4.",
      "Tactical Bomber + Fighter: attack increases to 4.",
      "Long Range Aircraft increases all air unit range by two spaces."
    ]
  },
  {
    title: "Strategic Bomber / Heavy Bomber",
    image: "images/strategicBomber.png",
    imageUpgrade: "images/heavyBomber.png",
    base: { name: "Strategic Bomber", cost: "12", move: "6/8", attack: "4", defend: "1", capacity: "2" },
    upgrade: { name: "Heavy Bomber", cost: "12", move: "6/8", attack: "2x4", defend: "1", capacity: "2" },
    rules: [
      "Strategic bombers only roll dice / take casualties in first combat round.",
      "Against undefended transports: kill on roll of 4 or less per bomber.",
      "Can deliver paratroopers in combat/noncombat per listed restrictions.",
      "Heavy bombers roll 2 dice on attacks and bombing raids.",
      "Air transport variants: transport plane (2 infantry) and cargo plane (1 unit) as listed.",
      "Long Range Aircraft increases all air unit range by two spaces."
    ]
  },
  {
    title: "Submarine / Super Submarine",
    image: "images/submarine.png",
    imageUpgrade: "images/superSubmarine.png",
    base: { name: "Submarine", cost: "6/5", move: "2", attack: "2", defend: "1", capacity: "-" },
    upgrade: { name: "Super Submarine", cost: "6/5", move: "2", attack: "3", defend: "1", capacity: "-" },
    rules: [
      "Submarines can move through enemy ships except destroyers.",
      "Super Submarine increases attack from 2 to 3.",
      "Any Plane + Destroyer allows planes to hit submarines."
    ]
  },
  {
    title: "Transport / Improved Transport",
    image: "images/transport.png",
    base: { name: "Transport", cost: "7/5", move: "2", attack: "0", defend: "0", capacity: "2/1+1" },
    upgrade: { name: "Improved Transport", cost: "7/5", move: "2", attack: "0", defend: "0", capacity: "2+1" },
    rules: [
      "Improved Transport can carry any 2 ground units plus 1 Infantry."
    ]
  },
  {
    title: "Destroyer",
    image: "images/destroyer.png",
    base: { name: "Destroyer", cost: "8/7", move: "2", attack: "2", defend: "2", capacity: "-" },
    rules: [
      "Each Destroyer can lay 1 Naval mine in its sea zone during purchase for 2 IPC."
    ]
  },
  {
    title: "Naval Mine",
    image: "images/navalMine.png",
    base: { name: "Naval Mine", cost: "2", move: "-", attack: "-", defend: "1", capacity: "-" },
    rules: [
      "Restriction: only 1 Naval mine per faction in each sea zone.",
      "Restriction: total Naval mines on board cannot exceed your number of Destroyers.",
      "Trigger: when enemy sea units enter the zone, roll 1 die.",
      "On 1: enemy immediately takes one hit on a chosen ship.",
      "On 2-6: mine remains in the sea zone."
    ]
  },
  {
    title: "Cruiser",
    image: "images/cruiser.png",
    base: { name: "Cruiser", cost: "12/8", move: "2", attack: "3", defend: "3", capacity: "-" },
    rules: [
      "Cruiser has built-in anti-aircraft fire against up to 2 aircraft before battle.",
      "Cruiser + Battleship: Cruiser defend increases to 4."
    ]
  },
  {
    title: "Aircraft Carrier / Super Aircraft Carrier",
    image: "images/aircraftCarrier.png",
    imageUpgrade: "images/superCarrier.png",
    base: { name: "Aircraft Carrier", cost: "16/13", move: "2", attack: "0", defend: "2", capacity: "2" },
    upgrade: { name: "Super Aircraft Carrier", cost: "16/13", move: "2", attack: "0", defend: "2", capacity: "3" },
    rules: [
      "Carrier has sustain 1.",
      "Super Carrier supports 3 planes.",
      "Sunk capital ship rule: carriers are worth 1 IPC each when sunk."
    ]
  },
  {
    title: "Battleship / Super Battleship",
    image: "images/battleship.png",
    base: { name: "Battleship", cost: "20/16", move: "2", attack: "4", defend: "4", capacity: "-" },
    upgrade: { name: "Super Battleship", cost: "20/16", move: "2", attack: "2x4", defend: "4", capacity: "-" },
    rules: [
      "Battleship has sustain 1.",
      "Super Battleship rolls 2 dice on attacks and bombardments.",
      "Sunk capital ship rule: battleships are worth 1 IPC each when sunk."
    ]
  },
  {
    title: "Major Factory / Radar",
    image: "images/majorFactory.png",
    imageUpgrade: "images/majorFactoryRadar.png",
    base: { name: "Major Factory", cost: "30/20", move: "-", attack: "-", defend: "1", capacity: "-" },
    upgrade: { name: "Major Factory with Radar", cost: "30/20", move: "-", attack: "-", defend: "2", capacity: "-" },
    rules: [
      "Factory has anti-aircraft artillery fire.",
      "Radar increases facility fire from 1 to 2."
    ]
  },
  {
    title: "Minor Factory / Radar",
    image: "images/minorFactory.png",
    imageUpgrade: "images/minorFactoryRadar.png",
    base: { name: "Minor Factory", cost: "12", move: "-", attack: "-", defend: "1", capacity: "-" },
    upgrade: { name: "Minor Factory with Radar", cost: "12", move: "-", attack: "-", defend: "2", capacity: "-" },
    rules: [
      "Factory has anti-aircraft artillery fire.",
      "Radar increases facility fire from 1 to 2."
    ]
  },
  {
    title: "Air / Naval Base + Radar",
    image: "images/airBase.png",
    imageUpgrade: "images/airBaseRadar.png",
    base: { name: "Air/Naval Base", cost: "15", move: "-", attack: "-", defend: "1", capacity: "-" },
    upgrade: { name: "Air/Naval Base with Radar", cost: "15", move: "-", attack: "-", defend: "2", capacity: "-" },
    rules: [
      "Air and Naval base units have anti-aircraft artillery fire.",
      "Radar increases facility fire from 1 to 2.",
      "Air bases can scramble unlimited planes with Radar (up from 3)."
    ]
  }
];

const combatBoard = {
  attack: {
    0: [
      { label: "Aircraft Carrier / Super Aircraft Carrier", image: "images/aircraftCarrier.png" },
      { label: "Transport / Improved Transport", image: "images/transport.png" }
    ],
    1: [
      { label: "Infantry", image: "images/infantry.png" },
      { label: "Mechanized Infantry", image: "images/mechanizedInfantry.png" }
    ],
    2: [
      { label: "Artillery / Self Propelled Artillery", image: "images/artillery.png" },
      { label: "Submarine", image: "images/submarine.png" },
      { label: "Destroyer", image: "images/destroyer.png" },
      {
        combo: true,
        label: "Infantry + Artillery",
        detail: "Infantry: Atk 2 (was 1)",
        units: [
          { image: "images/infantry.png", label: "Infantry" },
          { image: "images/artillery.png", label: "Artillery" }
        ]
      },
      {
        combo: true,
        label: "Mechanized Infantry + Artillery",
        detail: "Mech Inf: Atk 2 (was 1)",
        units: [
          { image: "images/mechanizedInfantry.png", label: "Mechanized Infantry" },
          { image: "images/artillery.png", label: "Artillery" }
        ]
      }
    ],
    3: [
      { label: "Tank / Heavy Tank", image: "images/tank.png" },
      { label: "Super Submarine", image: "images/superSubmarine.png" },
      { label: "Tactical Bomber", image: "images/tacticalBomber.png" },
      { label: "Cruiser", image: "images/cruiser.png" }
    ],
    4: [
      { label: "Jet Fighter", image: "images/jetFighter.png" },
      { label: "Strategic Bomber / Heavy Bomber", image: "images/strategicBomber.png" },
      { label: "Battleship / Super Battleship", image: "images/battleship.png" },
      {
        combo: true,
        label: "Tactical Bomber + Tank",
        detail: "Tac Bomber: Atk 4 (was 3)",
        units: [
          { image: "images/tacticalBomber.png", label: "Tactical Bomber" },
          { image: "images/tank.png", label: "Tank", small: true }
        ]
      },
      {
        combo: true,
        label: "Tactical Bomber + Fighter",
        detail: "Tac Bomber: Atk 4 (was 3)",
        units: [
          { image: "images/tacticalBomber.png", label: "Tactical Bomber" },
          { image: "images/fighter.png", label: "Fighter", small: true }
        ]
      }
    ]
  },
  defend: {
    0: [
      { label: "Transport / Improved Transport", image: "images/transport.png" }
    ],
    1: [
      { label: "AA Gun", image: "images/aaGun.png" },
      { label: "Strategic Bomber / Heavy Bomber", image: "images/strategicBomber.png" },
      { label: "Submarine / Super Submarine", image: "images/submarine.png" }
    ],
    2: [
      { label: "Kamikaze Strike", image: "images/KamikazeKanji.png" },
      { label: "Infantry", image: "images/infantry.png" },
      { label: "Artillery / Self Propelled Artillery", image: "images/artillery.png" },
      { label: "Mechanized Infantry", image: "images/mechanizedInfantry.png" },
      { label: "Destroyer", image: "images/destroyer.png" },
      { label: "Aircraft Carrier / Super Aircraft Carrier", image: "images/aircraftCarrier.png" }
    ],
    3: [
      { label: "Tank", image: "images/tank.png" },
      { label: "Fighter / Jet Fighter", image: "images/fighter.png" },
      { label: "Tactical Bomber", image: "images/tacticalBomber.png" },
      { label: "Cruiser", image: "images/cruiser.png" }
    ],
    4: [
      { label: "Heavy Tank", image: "images/tank.png" },
      { label: "Battleship / Super Battleship", image: "images/battleship.png" },
      {
        combo: true,
        label: "Cruiser + Battleship",
        detail: "Cruiser: Def 4 (was 3)",
        units: [
          { image: "images/cruiser.png", label: "Cruiser" },
          { image: "images/battleship.png", label: "Battleship", small: true }
        ]
      }
    ]
  }
};

function compactStat(baseValue, upgradeValue) {
  if (upgradeValue === undefined) return text(baseValue);
  if (text(baseValue) === text(upgradeValue)) return text(baseValue);
  return `${text(baseValue)} → ${text(upgradeValue)}`;
}

function renderQuickTable() {
  const tbody = document.querySelector("#unitQuickTable tbody");
  tbody.innerHTML = "";

  for (const row of quickReferenceGroups) {
    const tr = document.createElement("tr");
    tr.appendChild(createElement("td", "", row.base.unit));
    tr.appendChild(createElement("td", "", row.upgrade ? row.upgrade.unit : "-"));
    tr.appendChild(createElement("td", "num", compactStat(row.base.cost, row.upgrade?.cost)));
    tr.appendChild(createElement("td", "num", compactStat(row.base.move, row.upgrade?.move)));
    tr.appendChild(createElement("td", "num", compactStat(row.base.attack, row.upgrade?.attack)));
    tr.appendChild(createElement("td", "num", compactStat(row.base.defend, row.upgrade?.defend)));
    tr.appendChild(createElement("td", "num", compactStat(row.base.capacity, row.upgrade?.capacity)));
    tbody.appendChild(tr);
  }
}

function createCombatToken(unit) {
  if (unit.combo) {
    const token = createElement("div", "combat-token combat-token-combo");
    const imagesWrap = createElement("div", "combat-combo-images");

    for (const comboUnit of unit.units || []) {
      const image = document.createElement("img");
      image.className = comboUnit.small ? "combat-unit-image combat-unit-image-small" : "combat-unit-image";
      image.src = comboUnit.image;
      image.alt = comboUnit.label;
      imagesWrap.appendChild(image);
    }

    token.appendChild(imagesWrap);
    token.appendChild(createElement("div", "combat-token-name", unit.label));
    if (unit.detail) {
      token.appendChild(createElement("div", "combat-token-detail", unit.detail));
    }
    return token;
  }

  const token = createElement("div", "combat-token");
  const imagePath = unit.image;

  if (imagePath) {
    const image = document.createElement("img");
    image.className = "combat-unit-image";
    image.src = imagePath;
    image.alt = unit.label;
    token.appendChild(image);
  }

  token.appendChild(createElement("div", "combat-token-name", unit.label));
  return token;
}

function statCell(label, value, isDifferent) {
  const item = createElement("div", "unit-stat");
  item.appendChild(createElement("div", "unit-stat-k", label));
  item.appendChild(createElement("div", isDifferent ? "unit-stat-v diff" : "unit-stat-v", text(value)));
  return item;
}

function renderProfile(profile, baseline) {
  const wrap = createElement("div", "unit-profile");
  wrap.appendChild(createElement("h4", "", profile.name));

  const stats = createElement("div", "unit-stats");
  stats.appendChild(statCell("Cost", profile.cost, baseline && profile.cost !== baseline.cost));
  stats.appendChild(statCell("Move", profile.move, baseline && profile.move !== baseline.move));
  stats.appendChild(statCell("Atk", profile.attack, baseline && profile.attack !== baseline.attack));
  stats.appendChild(statCell("Def", profile.defend, baseline && profile.defend !== baseline.defend));
  stats.appendChild(statCell("Cap", profile.capacity, baseline && profile.capacity !== baseline.capacity));
  wrap.appendChild(stats);

  return wrap;
}

function renderCards() {
  const cardsWrap = document.getElementById("unitCards");
  cardsWrap.innerHTML = "";

  for (const unit of unitCards) {
    const details = createElement("details", "unit-card");

    const summary = createElement("summary", "unit-card-summary");

    const imageWrap = createElement("div", "unit-card-images");
    const baseImage = document.createElement("img");
    baseImage.className = "unit-image";
    baseImage.src = unit.image;
    baseImage.alt = unit.base.name;
    imageWrap.appendChild(baseImage);

    if (unit.imageUpgrade) {
      const upgradeImage = document.createElement("img");
      upgradeImage.className = "unit-image";
      upgradeImage.src = unit.imageUpgrade;
      upgradeImage.alt = unit.upgrade ? unit.upgrade.name : `${unit.base.name} upgrade`;
      imageWrap.appendChild(upgradeImage);
    }

    const titleWrap = createElement("div", "unit-card-title");
    titleWrap.appendChild(createElement("h3", "", unit.title));
    titleWrap.appendChild(createElement("p", "muted", `${unit.base.name}${unit.upgrade ? " → " + unit.upgrade.name : ""}`));

    summary.appendChild(imageWrap);
    summary.appendChild(titleWrap);
    details.appendChild(summary);

    const body = createElement("div", "unit-card-body");
    const profiles = createElement("div", "unit-profile-grid");
    profiles.appendChild(renderProfile(unit.base));
    if (unit.upgrade) {
      profiles.appendChild(renderProfile(unit.upgrade, unit.base));
    }
    body.appendChild(profiles);

    const rulesTitle = createElement("h4", "", "Special Rules");
    body.appendChild(rulesTitle);
    const rulesList = createElement("ul", "unit-rules");
    for (const rule of unit.rules) {
      rulesList.appendChild(createElement("li", "", rule));
    }
    body.appendChild(rulesList);

    details.appendChild(body);
    cardsWrap.appendChild(details);
  }
}

function renderCombatBoard() {
  for (const side of ["attack", "defend"]) {
    for (const value of [0, 1, 2, 3, 4]) {
      const cell = document.querySelector(`[data-side="${side}"][data-value="${value}"]`);
      const units = combatBoard[side][value] || [];
      cell.innerHTML = "";

      const list = createElement("ul", "combat-list");
      for (const unit of units) {
        const item = createElement("li", unit.combo ? "combat-item combo-item" : "combat-item");
        item.appendChild(createCombatToken(unit));
        list.appendChild(item);
      }
      cell.appendChild(list);
    }
  }
}

function main() {
  renderQuickTable();
  renderCards();
  renderCombatBoard();
}

main();