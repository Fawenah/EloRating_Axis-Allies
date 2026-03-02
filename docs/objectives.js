const STORAGE_KEY = "aa_objective_tracker_v2";

const TERRITORIES = {
  china18: [
    "Kansu", "Tsinghai", "Sikang", "Kiangsu", "Shantung", "Hopei", "Jehol", "Kweichow", "Hunan",
    "Kiangsi", "Yunnan", "Anhwe", "Chahar", "Suiyuyan", "Shensi", "Szechwan", "Kwangsi", "Manchuria"
  ],
  axisEuropeCities12: [
    "Washington", "Ottawa", "Johannisburg", "Cairo", "London", "Moscow",
    "Leningrad", "Stalingrad", "Warsaw", "Berlin", "Rome", "Paris"
  ],
  usIslands8: [
    "Philippines", "Guam", "Wake Island", "Johnston Island", "Hawaiian Islands", "Midway", "Line Islands", "Aleutian Islands"
  ],
  japanIslands8: [
    "Okinawa", "Iwo Jima", "Marianas", "Marshall Islands", "Caroline Islands", "Paulau Island", "Hainan", "Formosa"
  ],
  africaNonNeutralAllied: [
    "Morocco", "Algeria", "Tunisia", "Libya", "Tobruk", "Alexandria", "Egypt", "French West Aftica", "Gold Coast",
    "French Central Africa", "Nigeria", "French Equatorial Africa", "Anglo-Egyptian Sudan", "Ethiopia",
    "British Somaliland", "Italian Somaliland", "Kenya", "Belgian Congo", "Tanganyika Territory", "Rhodesia",
    "South West Africa", "Union of South Africa", "French Madagascar"
  ],
  proAlliedNeutral8: ["Eire", "Yugoslavia", "Greece", "Crete", "NW Persia", "Persia", "E Persia", "Brazil"],
  japanPacificIncome10: [
    "Guam", "Midway", "Wake Island", "Gilbert Islands", "Solomon Islands", "Fiji", "Philippines", "Johnston Island", "Line Islands", "Hawaiian Islands"
  ]
};

const objectiveGroups = [
  {
    id: "axis-major",
    side: "Axis",
    nation: "Axis Major Objectives",
    type: "Major",
    objectives: [
      {
        id: "axis-major-supremacy",
        title: "Supremacy",
        condition: "Major objective check",
        requirement: "Control Washington and/or San Francisco.",
        reward: "Counts as one Axis major objective.",
        parts: ["Washington", "San Francisco"],
        rule: { type: "min", min: 1 }
      },
      {
        id: "axis-major-london",
        title: "London",
        condition: "Major objective check",
        requirement: "Control London and/or convoy disrupt a total of 12 IPC in one turn from originally owned UK Europe territories in their Collect Income phase.",
        reward: "Counts as one Axis major objective.",
        parts: [
          "Control London",
          "Convoy disrupt 12 IPC in one turn from originally owned UK Europe territories."
        ],
        rule: { type: "min", min: 1 }
      },
      { id: "axis-major-sydney", title: "Sydney", condition: "Major objective check", requirement: "Control Sydney.", reward: "Counts as one Axis major objective.", parts: ["Sydney"] },
      { id: "axis-major-moscow", title: "Moscow", condition: "Major objective check", requirement: "Control Moscow.", reward: "Counts as one Axis major objective.", parts: ["Moscow"] },
      {
        id: "axis-major-china",
        title: "China",
        condition: "Major objective check",
        requirement: "Control all 18 originally Chinese territories.",
        reward: "Counts as one Axis major objective.",
        parts: TERRITORIES.china18
      },
      {
        id: "axis-major-europe",
        title: "Europe",
        condition: "Major objective check",
        requirement: "Control 7 victory cities on the Europe side of the map.",
        reward: "Counts as one Axis major objective.",
        parts: TERRITORIES.axisEuropeCities12,
        rule: { type: "min", min: 7 }
      },
      {
        id: "axis-major-pacific",
        title: "Pacific",
        condition: "Major objective check",
        requirement: "Control all 8 originally American islands.",
        reward: "Counts as one Axis major objective.",
        parts: TERRITORIES.usIslands8
      },
      {
        id: "axis-major-africa",
        title: "Africa",
        condition: "Major objective check",
        requirement: "Control key African territories.",
        reward: "Counts as one Axis major objective.",
        parts: ["Morocco", "Algeria", "Tunisia", "Libya", "Tobruk", "Alexandria", "Egypt"]
      },
      {
        id: "axis-major-asia",
        title: "Asia",
        condition: "Major objective check",
        requirement: "Control key Asian territories.",
        reward: "Counts as one Axis major objective.",
        parts: ["Calcutta", "Malaya", "Hong Kong", "Shanghai"]
      },
      {
        id: "axis-major-economy",
        title: "Economy",
        condition: "Major objective check",
        requirement: "Control territories worth a combined total of 144 IPCs.",
        reward: "Counts as one Axis major objective.",
        parts: ["Combined territory value is at least 144 IPC"]
      }
    ]
  },
  {
    id: "allied-major",
    side: "Allies",
    nation: "Allied Major Objectives",
    type: "Major",
    objectives: [
      {
        id: "allied-major-supremacy",
        title: "Supremacy",
        condition: "Major objective check",
        requirement: "Control Berlin and/or Tokyo.",
        reward: "Counts as one Allied major objective.",
        parts: ["Berlin", "Tokyo"],
        rule: { type: "min", min: 1 }
      },
      { id: "allied-major-rome", title: "Rome", condition: "Major objective check", requirement: "Control Rome.", reward: "Counts as one Allied major objective.", parts: ["Rome"] },
      {
        id: "allied-major-china",
        title: "China",
        condition: "Major objective check",
        requirement: "Control all 18 originally Chinese territories.",
        reward: "Counts as one Allied major objective.",
        parts: TERRITORIES.china18
      },
      { id: "allied-major-europe", title: "Europe", condition: "Major objective check", requirement: "Liberate Paris.", reward: "Counts as one Allied major objective.", parts: ["Paris is liberated"] },
      {
        id: "allied-major-pacific",
        title: "Pacific",
        condition: "Major objective check",
        requirement: "Control all 8 originally Japanese islands.",
        reward: "Counts as one Allied major objective.",
        parts: TERRITORIES.japanIslands8
      },
      {
        id: "allied-major-africa",
        title: "Africa",
        condition: "Major objective check",
        requirement: "Control all non-neutral territories on the African continent.",
        reward: "Counts as one Allied major objective.",
        parts: TERRITORIES.africaNonNeutralAllied
      },
      {
        id: "allied-major-asia",
        title: "Asia",
        condition: "Major objective check",
        requirement: "Control Calcutta, Malaya, Hong Kong, Shanghai.",
        reward: "Counts as one Allied major objective.",
        parts: ["Calcutta", "Malaya", "Hong Kong", "Shanghai"]
      },
      {
        id: "allied-major-occupation",
        title: "Occupation",
        condition: "Major objective check",
        requirement: "Control Poland, Bulgaria, Finland, and Iraq.",
        reward: "Counts as one Allied major objective.",
        parts: ["Poland", "Bulgaria", "Finland", "Iraq"]
      },
      {
        id: "allied-major-diplomacy",
        title: "Diplomacy",
        condition: "Major objective check",
        requirement: "Control all 8 original pro-Allied neutral territories.",
        reward: "Counts as one Allied major objective.",
        parts: TERRITORIES.proAlliedNeutral8
      },
      {
        id: "allied-major-attrition",
        title: "Attrition",
        condition: "End of game",
        requirement: "Score is tied at end of game.",
        reward: "Allies win automatically.",
        parts: ["Score is tied at end of game"]
      }
    ]
  },
  {
    id: "germany",
    side: "Axis",
    nation: "Germany",
    type: "National",
    subtitle: "Lebensraum",
    objectives: [
      {
        id: "de-trade",
        title: "Soviet Trade Access",
        condition: "Germany is not at war with the Soviet Union",
        requirement: "Germany is not at war with the Soviet Union.",
        reward: "+5 IPCs representing wheat and oil from the Soviet Union.",
        parts: ["Germany is not at war with the Soviet Union"]
      },
      {
        id: "de-cities",
        title: "Key Soviet Cities",
        condition: "Germany is at war with the Soviet Union",
        requirement: "Germany controls key Soviet cities.",
        reward: "+5 IPCs for each listed territory controlled.",
        parts: ["Novgorod (Leningrad)", "Volgograd (Stalingrad)", "Russia (Moscow)"]
      },
      {
        id: "de-caucasus",
        title: "Caucasus Access",
        condition: "Germany is at war with the Soviet Union",
        requirement: "An Axis power controls Caucasus.",
        reward: "+5 IPCs.",
        parts: ["Caucasus"]
      },
      {
        id: "de-egypt",
        title: "Egypt Land Presence",
        condition: "Germany is at war with the United Kingdom and France",
        requirement: "At least 1 German land unit is in Axis-controlled Egypt.",
        reward: "+5 IPCs.",
        parts: ["At least 1 German land unit in Axis-controlled Egypt"]
      },
      {
        id: "de-denmark-norway",
        title: "Denmark and Norway",
        condition: "Germany is at war with the United Kingdom and France",
        requirement: "Germany controls both Denmark and Norway while Sweden is neither pro-Allies nor Allies-controlled.",
        reward: "+5 IPCs.",
        parts: ["Denmark", "Norway", "Sweden is neither pro-Allies nor Allies-controlled"]
      },
      {
        id: "de-me",
        title: "Middle East Territories",
        condition: "Germany is at war with the United Kingdom and France",
        requirement: "Germany controls key Middle East territories.",
        reward: "+2 IPCs for each listed territory controlled.",
        parts: ["Iraq", "Persia", "Northwest Persia"]
      },
      {
        id: "de-subs",
        title: "Submarine Pressure",
        condition: "Germany is at war with the United Kingdom and France",
        requirement: "At least 5 submarines are on the map, excluding Baltic sea zones 113, 114, and 115, during Germany's Collect Income phase after deploying reinforcements.",
        reward: "+5 IPCs.",
        parts: ["At least 5 submarines on map excluding sea zones 113, 114, 115 during Collect Income"]
      }
    ]
  },
  {
    id: "japan",
    side: "Axis",
    nation: "Japan",
    type: "National",
    subtitle: "The Greater East Asia Co-Prosperity Sphere",
    objectives: [
      { id: "jp-calc", title: "Calcutta", condition: "Japan is at war", requirement: "Axis powers control Calcutta.", reward: "+5 IPCs.", parts: ["Calcutta"] },
      {
        id: "jp-china-once",
        title: "Full China Control (One-Time)",
        condition: "Japan is at war",
        requirement: "Axis powers control all originally Chinese territories.",
        reward: "+10 IPCs (one time only).",
        parts: TERRITORIES.china18
      },
      {
        id: "jp-pacific-income",
        title: "Pacific Island Control Income",
        condition: "Japan is at war",
        requirement: "Axis powers control key Pacific island territories.",
        reward: "+3 IPCs for each listed island controlled.",
        parts: TERRITORIES.japanPacificIncome10
      },
      { id: "jp-burma", title: "Burma", condition: "Japan is at war", requirement: "Axis powers control Burma.", reward: "+5 IPCs.", parts: ["Burma"] },
      {
        id: "jp-central-pacific",
        title: "Central Pacific Chain",
        condition: "Japan is at war",
        requirement: "Axis powers control key Central Pacific territories.",
        reward: "+5 IPCs.",
        parts: ["Guam", "Midway", "Wake Island", "Gilbert Islands", "Solomon Islands"]
      },
      {
        id: "jp-key-capitals",
        title: "Key Capital Territories",
        condition: "Japan is at war",
        requirement: "Axis powers control key city territories.",
        reward: "+5 IPCs for each listed territory controlled.",
        parts: ["India (Calcutta)", "New South Wales (Sydney)", "Hawaiian Islands (Honolulu)", "Western United States (San Francisco)"]
      },
      {
        id: "jp-dei",
        title: "Dutch East Indies Block",
        condition: "Japan is at war",
        requirement: "Axis powers control key Dutch East Indies territories.",
        reward: "+5 IPCs.",
        parts: ["Sumatra", "Java", "Borneo", "Celebes"]
      }
    ]
  },
  {
    id: "italy",
    side: "Axis",
    nation: "Italy",
    type: "National",
    subtitle: "Mare Nostrum",
    objectives: [
      {
        id: "it-med",
        title: "Mediterranean Sea Control",
        condition: "Italy is at war",
        requirement: "No Allied surface warships are in Mediterranean sea zones 92 through 99.",
        reward: "+5 IPCs.",
        parts: ["No Allied surface warships in sea zones 92-99"]
      },
      {
        id: "it-3of4",
        title: "Strategic 3-of-4",
        condition: "Italy is at war",
        requirement: "Axis powers control at least 3 territories from the Greater Roman Empire.",
        reward: "+5 IPCs.",
        parts: ["Gibraltar", "Southern France", "Greece", "Egypt"],
        rule: { type: "min", min: 3 }
      },
      {
        id: "it-na",
        title: "North Africa Coastal Chain",
        condition: "Italy is at war",
        requirement: "Axis powers control key North Africa territories.",
        reward: "+5 IPCs.",
        parts: ["Morocco", "Algeria", "Tunisia", "Libya", "Tobruk", "Alexandria"]
      },
      {
        id: "it-me",
        title: "Middle East Territories",
        condition: "Italy is at war",
        requirement: "Italy controls key Middle East territories.",
        reward: "+2 IPCs for each listed territory controlled.",
        parts: ["Iraq", "Persia", "Northwest Persia"]
      },
      {
        id: "it-isola",
        title: "Mare Nostrum Isola",
        condition: "Italy is at war",
        requirement: "Axis powers control key Mediterranean islands.",
        reward: "+5 IPCs.",
        parts: ["Cyprus", "Crete", "Malta", "Sardinia", "Sicily"]
      },
      {
        id: "it-east-africa",
        title: "East Africa Chain",
        condition: "Italy is at war",
        requirement: "Axis powers control key East Africa territories.",
        reward: "+5 IPCs.",
        parts: ["British Somaliland", "Italian Somaliland", "Ethopia", "Anglo-Egyptian Sudan", "Kenya"]
      }
    ]
  },
  {
    id: "soviet-union",
    side: "Allies",
    nation: "Soviet Union",
    type: "National",
    subtitle: "The Great Patriotic War",
    objectives: [
      {
        id: "su-berlin",
        title: "Capture Berlin (One-Time)",
        condition: "Soviet Union is at war on the European side",
        requirement: "First time the Soviet Union controls Germany (Berlin).",
        reward: "+10 IPCs (one time only).",
        parts: ["Berlin is controlled by Soviet Union"]
      },
      {
        id: "su-3of4",
        title: "Eastern Europe Control Block",
        condition: "Soviet Union is at war on the European side",
        requirement: "Soviet Union controls 3 out of 4 key Eastern European territories.",
        reward: "+10 IPCs.",
        parts: ["Finland", "Poland", "Slovakia/Hungary", "Romania"],
        rule: { type: "min", min: 3 }
      },
      {
        id: "su-no-allies",
        title: "No Non-Soviet Allied Units",
        condition: "Soviet Union is at war on the European side",
        requirement: "No Allied (non-Soviet Union) units are on any originally controlled Soviet territories.",
        reward: "+5 IPCs.",
        parts: ["No Allied non-Soviet units in originally controlled Soviet territories"]
      },
      {
        id: "su-archangel",
        title: "Archangel Reinforcement",
        condition: "Soviet Union is at war on the European side",
        requirement: "Soviet Union controls Archangel and Allies control Scotland and Iceland.",
        reward: "Place 1 Artillery in Archangel.",
        parts: ["Archangel", "Scotland", "Iceland"]
      },
      {
        id: "su-caucasus",
        title: "Caucasus Reinforcement",
        condition: "Soviet Union is at war on the European side",
        requirement: "Soviet Union controls Caucasus and Allies control Persia and Northwest Persia.",
        reward: "Place 1 Artillery in Caucasus.",
        parts: ["Caucasus", "Persia", "Northwest Persia"]
      },
      {
        id: "su-amur",
        title: "Amur Reinforcement",
        condition: "Soviet Union is at war on the Pacific side",
        requirement: "Soviet Union controls Amur and Allies control Aleutian Islands and Alaska.",
        reward: "Place 1 Artillery in Amur.",
        parts: ["Amur", "Aleutian Islands", "Alaska"]
      }
    ]
  },
  {
    id: "united-states",
    side: "Allies",
    nation: "United States",
    type: "National",
    subtitle: "The Sleeping Giant",
    objectives: [
      {
        id: "us-core",
        title: "Continental Core",
        condition: "United States is at war",
        requirement: "United States controls both Eastern United States and Central United States.",
        reward: "+10 IPCs.",
        parts: ["Eastern United States", "Central United States"]
      },
      {
        id: "us-npac",
        title: "North Pacific Perimeter",
        condition: "United States is at war",
        requirement: "United States controls key North Pacific territories.",
        reward: "+5 IPCs.",
        parts: ["Alaska", "Aleutian Islands", "Hawaiian Islands", "Johnston Island", "Line Islands"]
      },
      {
        id: "us-caribbean",
        title: "Caribbean Corridor",
        condition: "United States is at war",
        requirement: "United States controls key Caribbean territories.",
        reward: "+5 IPCs.",
        parts: ["South Eastern Mexico", "Central America", "West Indies"]
      },
      {
        id: "us-philippines",
        title: "Philippines",
        condition: "United States is at war",
        requirement: "United States controls key Philippine territories.",
        reward: "+5 IPCs.",
        parts: ["Philippines"]
      }
    ]
  },
  {
    id: "china",
    side: "Allies",
    nation: "China",
    type: "National",
    subtitle: "The Flying Tigers",
    objectives: [
      {
        id: "cn-burma-road",
        title: "Burma Road Open",
        condition: "China is at war",
        requirement: "Allies control key Burma Road territories.",
        reward: "+6 IPCs.",
        parts: ["India", "Burma", "Yunnan"]
      }
    ]
  },
  {
    id: "uk-europe",
    side: "Allies",
    nation: "United Kingdom Europe",
    type: "National",
    subtitle: "Maximum bonus: 20 IPCs per turn",
    objectives: [
      {
        id: "uke-colonies",
        title: "British Colonies",
        condition: "UK Europe objective check",
        requirement: "UK Europe controls key African territories.",
        reward: "+5 IPCs.",
        parts: [
          "Gold Coast",
          "Nigeria",
          "Belgian Congo",
          "Alexandria",
          "Egypt",
          "Kenya",
          "Tanganyika Territory",
          "Rhodesia",
          "South West Africa",
          "British Somaliland",
          "Anglo-Egyptian Sudan",
          "Union of South Africa"
        ]
      },
      {
        id: "uke-commonwealth",
        title: "British Commonwealth",
        condition: "UK Europe objective check",
        requirement: "UK Europe controls key Commonwealth territories outside Africa.",
        reward: "+5 IPCs.",
        parts: [
          "United Kingdom", "Scotland", "Iceland", "Gibraltar", "Malta",
          "Ontario", "Quebec", "New Brunswick/Nova Scotia"
        ]
      },
      {
        id: "uke-med",
        title: "Mediterranean Theater",
        condition: "UK Europe objective check",
        requirement: "There are no Axis warships in the Mediterranean Sea (sea zones 92 through 99).",
        reward: "+5 IPCs.",
        parts: ["No Axis warships in sea zones 92-99"]
      },
      {
        id: "uke-euro",
        title: "European Theater",
        condition: "UK Europe objective check",
        requirement: "At least 1 UK Europe land unit is on an originally controlled French territory in Europe.",
        reward: "+5 IPCs.",
        parts: ["France", "Normandy-Bordeaux", "Southern France"],
        rule: { type: "min", min: 1 }
      }
    ]
  },
  {
    id: "uk-pacific",
    side: "Allies",
    nation: "United Kingdom Pacific",
    type: "National",
    subtitle: "Maximum bonus: 20 IPCs per turn",
    objectives: [
      {
        id: "ukp-hk",
        title: "Hong Kong",
        condition: "UK Pacific is at war with Japan",
        requirement: "United Kingdom Pacific controls Hong Kong.",
        reward: "+5 IPCs.",
        parts: ["Hong Kong"]
      },
      {
        id: "ukp-malaya",
        title: "Malaya",
        condition: "UK Pacific is at war with Japan",
        requirement: "United Kingdom Pacific controls Malaya.",
        reward: "+5 IPCs.",
        parts: ["Malaya"]
      },
      {
        id: "ukp-shanghai",
        title: "Shanghai",
        condition: "UK Pacific is at war with Japan",
        requirement: "Allies control Shanghai (any Allied power).",
        reward: "+5 IPCs.",
        parts: ["Shanghai"]
      },
      {
        id: "ukp-outer",
        title: "Outer Perimeter",
        condition: "UK Pacific is at war with Japan",
        requirement: "United Kingdom Pacific has at least 1 land unit on key Outer Perimeter territories.",
        reward: "+5 IPCs.",
        parts: ["Sumatra", "Java", "Celebes", "Dutch New Guinea"],
        rule: { type: "min", min: 1 }
      }
    ]
  }
];

let state = loadState();

function createElement(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      parts: parsed.parts || {},
      scored: parsed.scored || {},
      uiOpen: parsed.uiOpen || {}
    };
  } catch {
    return { parts: {}, scored: {}, uiOpen: {} };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function partKey(objectiveId, partIndex) {
  return `${objectiveId}::part::${partIndex}`;
}

function getPartChecked(objectiveId, partIndex) {
  return Boolean(state.parts[partKey(objectiveId, partIndex)]);
}

function setPartChecked(objectiveId, partIndex, checked) {
  state.parts[partKey(objectiveId, partIndex)] = checked;
}

function getScored(objectiveId) {
  return Boolean(state.scored[objectiveId]);
}

function setScored(objectiveId, value) {
  state.scored[objectiveId] = value;
}

function getUiOpen(key, defaultOpen) {
  if (typeof state.uiOpen[key] === "boolean") return state.uiOpen[key];
  return defaultOpen;
}

function setUiOpen(key, value) {
  state.uiOpen[key] = value;
}

function attachOpenTracking(detailsElement, uiKey) {
  detailsElement.addEventListener("toggle", () => {
    setUiOpen(uiKey, detailsElement.open);
    saveState();
  });
}

function evaluateObjective(objective) {
  const checks = objective.parts.map((_, index) => getPartChecked(objective.id, index));
  const checkedCount = checks.filter(Boolean).length;
  const total = checks.length;
  const rule = objective.rule || { type: "all" };

  let met = false;
  if (rule.type === "all") met = checkedCount === total;
  if (rule.type === "min") met = checkedCount >= (rule.min || 1);

  return {
    met,
    checkedCount,
    total,
    remaining: Math.max(total - checkedCount, 0)
  };
}

function getSideObjectives(side) {
  return objectiveGroups.filter((group) => group.side === side);
}

function getSideStats(side) {
  const groups = getSideObjectives(side);
  let majorTotal = 0;
  let majorScored = 0;
  let majorMetNow = 0;
  let nationalTotal = 0;
  let nationalActive = 0;

  for (const group of groups) {
    for (const objective of group.objectives) {
      const status = evaluateObjective(objective);
      if (group.type === "Major") {
        majorTotal += 1;
        if (status.met) majorMetNow += 1;
        if (getScored(objective.id)) majorScored += 1;
      } else {
        nationalTotal += 1;
        if (status.met) nationalActive += 1;
      }
    }
  }

  return { majorTotal, majorScored, majorMetNow, nationalTotal, nationalActive };
}

function mergeUnits(targetUnits, sourceUnits) {
  for (const [unit, count] of Object.entries(sourceUnits)) {
    targetUnits[unit] = (targetUnits[unit] || 0) + count;
  }
}

function formatUnits(units) {
  const entries = Object.entries(units);
  if (entries.length === 0) return "None";
  return entries
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([unit, count]) => `${count} ${unit}`)
    .join(", ");
}

function calculateObjectiveRewards(objective, type) {
  const status = evaluateObjective(objective);
  let ipc = 0;
  const units = {};

  const ipcMatch = objective.reward.match(/\+?(\d+)\s*IPCs?/i);
  if (ipcMatch) {
    const amount = Number(ipcMatch[1]);
    const isForEach = /for each/i.test(objective.reward);
    ipc = isForEach ? amount * status.checkedCount : (status.met ? amount : 0);
  }

  if (!/IPC/i.test(objective.reward) && status.met) {
    const unitMatch = objective.reward.match(/(?:Place\s+)?(\d+)\s+([A-Za-z][A-Za-z ]*?)(?:\s+in\b|\.|$)/i);
    if (unitMatch) {
      const count = Number(unitMatch[1]);
      const unitType = unitMatch[2].trim();
      units[unitType] = (units[unitType] || 0) + count;
    }
  }

  if (type === "Major") {
    return { ipc: 0, units: {} };
  }

  return { ipc, units };
}

function calculateGroupRewards(group) {
  const result = { ipc: 0, units: {} };
  for (const objective of group.objectives) {
    const reward = calculateObjectiveRewards(objective, group.type);
    result.ipc += reward.ipc;
    mergeUnits(result.units, reward.units);
  }
  return result;
}

function calculateSideRewards(side) {
  const result = { ipc: 0, units: {} };
  for (const group of getSideObjectives(side)) {
    const reward = calculateGroupRewards(group);
    result.ipc += reward.ipc;
    mergeUnits(result.units, reward.units);
  }
  return result;
}

function isObjectiveFullyComplete(objective, type) {
  const status = evaluateObjective(objective);
  if (type === "Major") return getScored(objective.id);
  return status.met;
}

function renderOverview() {
  const container = document.getElementById("teamOverview");
  container.innerHTML = "";

  for (const side of ["Axis", "Allies"]) {
    const stats = getSideStats(side);
    const sideRewards = calculateSideRewards(side);
    const sideGroups = getSideObjectives(side);
    const card = createElement("article", "objective-overview-card");
    card.appendChild(createElement("h3", "", side));

    const list = createElement("div", "objective-overview-stats");
    list.appendChild(createElement("div", "", `Major scored: ${stats.majorScored}/${stats.majorTotal}`));
    list.appendChild(createElement("div", "", `Major complete now: ${stats.majorMetNow}/${stats.majorTotal}`));
    list.appendChild(createElement("div", "", `National active now: ${stats.nationalActive}/${stats.nationalTotal}`));
    list.appendChild(createElement("div", "", `Current IPC rewards: ${sideRewards.ipc}`));
    list.appendChild(createElement("div", "", `Current unit rewards: ${formatUnits(sideRewards.units)}`));
    card.appendChild(list);

    const nationTitle = createElement("h4", "objective-overview-subtitle", `${side} nation breakdown`);
    card.appendChild(nationTitle);

    const nationList = createElement("div", "objective-overview-nations");
    for (const group of sideGroups) {
      const nationRewards = calculateGroupRewards(group);
      const nationRow = createElement("div", "objective-overview-nation");
      nationRow.appendChild(createElement("span", "objective-overview-nation-name", group.nation));
      nationRow.appendChild(
        createElement(
          "span",
          "objective-overview-nation-reward",
          `IPC: ${nationRewards.ipc} • Units: ${formatUnits(nationRewards.units)}`
        )
      );
      nationList.appendChild(nationRow);
    }
    card.appendChild(nationList);

    container.appendChild(card);
  }
}

function createObjectiveGroupCard(group) {
  const card = createElement("section", "objective-group-card");

  const header = createElement("div", "objective-group-header");
  const title = createElement("h3", "", group.nation);
  header.appendChild(title);

  const metaParts = [group.side, group.type];
  if (group.subtitle) metaParts.push(group.subtitle);
  const groupStats = getGroupStats(group);
  metaParts.push(groupStats.label);
  header.appendChild(createElement("p", "muted", metaParts.join(" • ")));

  card.appendChild(header);

  const list = createElement("div", "objective-group-list");
  for (const objective of group.objectives) {
    list.appendChild(createObjectiveCard(objective, group.type));
  }
  card.appendChild(list);

  return card;
}

function getGroupStats(group) {
  let met = 0;
  let scored = 0;

  for (const objective of group.objectives) {
    const status = evaluateObjective(objective);
    if (status.met) met += 1;
    if (group.type === "Major" && getScored(objective.id)) scored += 1;
  }

  if (group.type === "Major") {
    return { label: `scored ${scored}/${group.objectives.length}, complete now ${met}/${group.objectives.length}` };
  }

  return { label: `active ${met}/${group.objectives.length}` };
}

function groupObjectivesByCondition(objectives) {
  const grouped = {};
  for (const objective of objectives) {
    if (!grouped[objective.condition]) grouped[objective.condition] = [];
    grouped[objective.condition].push(objective);
  }
  return grouped;
}

function createObjectiveCard(objective, type) {
  const status = evaluateObjective(objective);
  const card = createElement("article", "objective-item");

  const header = createElement("div", "objective-header");
  header.appendChild(createElement("h4", "objective-item-title", objective.title));

  const headerSummary = createElement("div", "objective-header-summary");
  headerSummary.appendChild(createElement("span", "objective-summary-chip", getProgressShortText(objective, status)));
  headerSummary.appendChild(createElement("span", "objective-summary-chip", getRewardShortText(objective, type)));
  header.appendChild(headerSummary);
  card.appendChild(header);

  const meta = createElement("div", "objective-item-meta");
  meta.appendChild(createElement("p", "", `Requirement: ${objective.requirement}`));
  meta.appendChild(createElement("p", "", `Reward: ${objective.reward}`));
  card.appendChild(meta);

  const checklistDetails = document.createElement("details");
  checklistDetails.className = "objective-checklist";
  const checklistKey = `checklist:${objective.id}`;
  checklistDetails.open = getUiOpen(checklistKey, false);
  attachOpenTracking(checklistDetails, checklistKey);

  const checklistSummary = createElement("summary", "objective-checklist-summary", `Checklist (${status.checkedCount}/${status.total})`);
  checklistDetails.appendChild(checklistSummary);

  const partsWrap = createElement("div", "objective-parts");
  objective.parts.forEach((part, index) => {
    const partLabel = createElement("label", "objective-checkbox");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = getPartChecked(objective.id, index);
    checkbox.addEventListener("change", () => {
      setPartChecked(objective.id, index, checkbox.checked);
      const isComplete = isObjectiveFullyComplete(objective, type);
      setUiOpen(checklistKey, !isComplete);
      saveState();
      render();
    });
    partLabel.appendChild(checkbox);
    partLabel.appendChild(createElement("span", "", part));
    partsWrap.appendChild(partLabel);
  });
  checklistDetails.appendChild(partsWrap);
  card.appendChild(checklistDetails);

  const footer = createElement("div", "objective-footer");

  if (type === "Major") {
    const scoredWrap = createElement("label", "objective-checkbox objective-scored");
    const scored = document.createElement("input");
    scored.type = "checkbox";
    scored.checked = getScored(objective.id);
    scored.addEventListener("change", () => {
      setScored(objective.id, scored.checked);
      const isComplete = isObjectiveFullyComplete(objective, type);
      setUiOpen(checklistKey, !isComplete);
      saveState();
      render();
    });
    scoredWrap.appendChild(scored);
    scoredWrap.appendChild(createElement("span", "", "Scored (permanent major objective point)"));
    footer.appendChild(scoredWrap);

    const majorStatus = getScored(objective.id) ? "Scored" : status.met ? "Complete now" : "Not complete now";
    footer.appendChild(createElement("span", "objective-status-chip", majorStatus));
  } else {
    const nationalStatus = status.met ? "Active now" : "Inactive now";
    footer.appendChild(createElement("span", "objective-status-chip", nationalStatus));
  }

  card.appendChild(footer);

  return card;
}

function getProgressShortText(objective, status) {
  const rule = objective.rule || { type: "all" };
  if (rule.type === "min") {
    return `${status.checkedCount}/${status.total} (need ${rule.min})`;
  }
  return `${status.checkedCount}/${status.total}`;
}

function getRewardShortText(objective, type) {
  if (type === "Major") {
    return getScored(objective.id) ? "Scored" : "Major point";
  }

  const reward = calculateObjectiveRewards(objective, type);
  const hasUnits = Object.keys(reward.units).length > 0;

  if (reward.ipc > 0 && hasUnits) {
    return `${reward.ipc} IPC + ${formatUnits(reward.units)}`;
  }
  if (reward.ipc > 0) {
    return `${reward.ipc} IPC`;
  }
  if (hasUnits) {
    return formatUnits(reward.units);
  }
  return "0 IPC";
}

function renderObjectiveGroups() {
  const majorGrid = document.getElementById("majorObjectivesGrid");
  const nationalGrid = document.getElementById("nationalObjectivesGrid");
  majorGrid.innerHTML = "";
  nationalGrid.innerHTML = "";

  const majorOrder = ["axis-major", "allied-major"];
  const nationalOrder = [
    "germany",
    "japan",
    "italy",
    "soviet-union",
    "united-states",
    "china",
    "uk-europe",
    "uk-pacific"
  ];

  for (const groupId of majorOrder) {
    const group = objectiveGroups.find((item) => item.id === groupId);
    if (group) majorGrid.appendChild(createObjectiveGroupCard(group));
  }

  for (const groupId of nationalOrder) {
    const group = objectiveGroups.find((item) => item.id === groupId);
    if (group) nationalGrid.appendChild(createObjectiveGroupCard(group));
  }
}

function attachReset() {
  const button = document.getElementById("resetObjectives");
  button.addEventListener("click", () => {
    state = { parts: {}, scored: {}, uiOpen: {} };
    saveState();
    render();
  });
}

function render() {
  renderOverview();
  renderObjectiveGroups();
}

function main() {
  attachReset();
  render();
}

main();
