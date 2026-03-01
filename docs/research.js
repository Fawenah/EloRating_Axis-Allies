function createElement(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

const researchSetup = "Each Major power chooses a technology and places a roundel upside down in phase 1 for free. Minor powers, Italy, and ANZAC must wait for their turn before investing in Research and Development.";

const developmentFlow = [
  {
    phase: "0 → 1",
    detail: "To start a research pay 4 IPCs, place a token in Phase 1, and choose a technology secretly."
  },
  {
    phase: "1 → 2",
    detail: "Pay 4 IPCs. Automatic advancement."
  },
  {
    phase: "2 → 3",
    detail: "Pay 4 IPCs. Automatic advancement."
  },
  {
    phase: "3 → 4",
    detail: "Roll 1d6, pay that amount of IPCs. On a 6 skip Phase 4 and proceed to an immediate discovery."
  },
  {
    phase: "4",
    detail: "Pay 1 IPC per die. Discover a breakthrough on 5, or 6."
  }
];

const breakthroughs = [
  { name: "Self Propelled Artillery", image: "images/artillery.png", effect: "Artillery supports 2 Infantry or Mechanized Infantry and moves 2 (up from 1)." },
  { name: "Super Battleships", image: "images/battleship.png", effect: "Battleships roll 2 dice on attacks and bombardments." },
  { name: "Heavy Bombers", image: "images/heavyBomber.png", effect: "Strategic bombers become Heavy bombers and roll 2 dice on attacks and bombing raids." },
  { name: "Super Carriers", image: "images/superCarrier.png", effect: "Carriers support 3 planes." },
  { name: "Heavy Tanks", image: "images/tank.png", effect: "Tanks defend at 4." },
  { name: "Improved Transports", image: "images/transport.png", effect: "Naval transports can carry any 2 ground units plus 1 Infantry." },
  { name: "Super Submarines", image: "images/superSubmarine.png", effect: "Submarine attack increases to 3 (up from 2)." },
  { name: "Jet Fighters", image: "images/jetFighter.png", effect: "Fighter attack increases to 4; Escorting and Intercepting fighter hits increase to 2." },
  { name: "Improved Shipyards", image: "images/navalBase.png", effect: "See Unit Statistics chart for Improved Shipyard unit costs." },
  { name: "Radar", image: "images/aaGunRadar.png", effect: "Anti-Aircraft and facility fire increase to 2; Air Bases can scramble unlimited planes (up from 3)." },
  { name: "Long Range Aircraft", image: "images/fighter.png", effect: "All air unit range is increased by two spaces." }
];

function renderSetup() {
  document.getElementById("researchSetup").textContent = researchSetup;
}

function renderFlow() {
  const wrap = document.getElementById("researchFlow");
  wrap.innerHTML = "";

  for (let index = 0; index < developmentFlow.length; index += 1) {
    const step = developmentFlow[index];
    const item = createElement("div", "research-step");
    item.appendChild(createElement("div", "research-step-phase", step.phase));
    item.appendChild(createElement("div", "research-step-text", step.detail));
    wrap.appendChild(item);
  }
}

function renderBreakthroughs() {
  const wrap = document.getElementById("breakthroughCards");
  wrap.innerHTML = "";

  for (const tech of breakthroughs) {
    const card = createElement("article", "research-card");
    const titleRow = createElement("div", "research-tech-title");
    if (tech.image) {
      const image = document.createElement("img");
      image.className = "research-tech-image";
      image.src = tech.image;
      image.alt = tech.name;
      titleRow.appendChild(image);
    }
    titleRow.appendChild(createElement("h3", "", tech.name));
    card.appendChild(titleRow);
    card.appendChild(createElement("p", "muted", tech.effect));
    wrap.appendChild(card);
  }
}

function main() {
  renderSetup();
  renderFlow();
  renderBreakthroughs();
}

main();