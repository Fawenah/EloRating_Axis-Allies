let RUN = null;
let chart = null;

function winPct(p) {
  const gp = p.GP || 0;
  if (!gp) return 0;
  return (p.W / gp) * 100;
}

function fmt(n, digits = 2) {
  return Number(n).toFixed(digits);
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

async function loadRun() {
  const res = await fetch("data/elo.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load data/elo.json: ${res.status}`);
  return await res.json();
}

function renderHeader() {
  const gen = RUN?.meta?.generated_at || "";
  document.getElementById("generatedAt").textContent = gen ? `Generated: ${gen}` : "";
  document.getElementById("configBox").textContent = JSON.stringify(RUN.config || {}, null, 2);
}


function renderSideSummary() {
  const ss = RUN?.side_stats || {};
  const wrap = document.getElementById("sideSummary");
  wrap.innerHTML = "";

  const axis = ss.axis || {};
  const allies = ss.allies || {};

  const box = el("div", "stats");
  const mk = (label, obj) => {
    const s = el("div", "stat");
    s.appendChild(el("div", "k", label));
    s.appendChild(el("div", "v", `GP ${obj.GP||0} | W ${obj.W||0} | L ${obj.L||0} | D ${obj.D||0}`));
    return s;
  };

  box.appendChild(mk("Axis", axis));
  box.appendChild(mk("Allies", allies));
  wrap.appendChild(box);
}

function getPlayersArray() {
  const players = RUN.players || {};
  return Object.entries(players).map(([name, p]) => {
    const s = p.stats || {};
    return {
      name,
      rating: p.rating,
      // flatten stats so the rest of the UI can keep using p.GP, p.W, etc.
      GP: s.GP || 0,
      W: s.W || 0,
      L: s.L || 0,
      D: s.D || 0,
      // keep history accessible if needed
      rating_history: p.rating_history || []
    };
  });
}

function renderLeaderboard(filter = "") {
  const tbody = document.querySelector("#leaderboard tbody");
  tbody.innerHTML = "";

  const f = (filter || "").toLowerCase();

  const rows = getPlayersArray()
    .filter(p => p.name.toLowerCase().includes(f))
    .sort((a, b) => (b.rating - a.rating));

  for (const p of rows) {
    const tr = document.createElement("tr");
    tr.appendChild(el("td", "", p.name));
    tr.appendChild(el("td", "num", fmt(p.rating, 2)));
    tr.appendChild(el("td", "num", String(p.GP || 0)));
    tr.appendChild(el("td", "num", String(p.W || 0)));
    tr.appendChild(el("td", "num", String(p.L || 0)));
    tr.appendChild(el("td", "num", String(p.D || 0)));
    tr.appendChild(el("td", "num", fmt(winPct(p), 1)));
    tr.addEventListener("click", () => selectPlayer(p.name));
    tbody.appendChild(tr);
  }
}

function renderPlayerSelect() {
  const sel = document.getElementById("playerSelect");
  sel.innerHTML = "";

  const rows = getPlayersArray().sort((a, b) => a.name.localeCompare(b.name));
  for (const p of rows) {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = p.name;
    sel.appendChild(opt);
  }

  sel.addEventListener("change", () => selectPlayer(sel.value));
}

function renderPlayerStats(name) {
  const p = (RUN.players || {})[name];
  const wrap = document.getElementById("playerStats");
  wrap.innerHTML = "";
  if (!p) return;

  const s0 = p.stats || {};

  const stats = el("div", "stats");
  const add = (k, v) => {
    const s = el("div", "stat");
    s.appendChild(el("div", "k", k));
    s.appendChild(el("div", "v", v));
    stats.appendChild(s);
  };

  const flat = { GP: s0.GP || 0, W: s0.W || 0, L: s0.L || 0, D: s0.D || 0 };

  add("Rating", fmt(p.rating, 2));
  add("Games played", String(flat.GP));
  add("W / L / D", `${flat.W} / ${flat.L} / ${flat.D}`);
  add("Win%", fmt(winPct(flat), 1));
  wrap.appendChild(stats);
}

function renderMatchList(name) {
  const wrap = document.getElementById("matchList");
  wrap.innerHTML = "";

  const matches = RUN.matches || [];
  const relevant = matches
    .filter(m => (m.axis || []).includes(name) || (m.allies || []).includes(name))
    .slice()
    .sort((a, b) => (b.date.localeCompare(a.date)));

  for (const m of relevant.slice(0, 25)) {
    const axisHas = (m.axis || []).includes(name);
    const deltas = axisHas ? (m.axis_player_deltas || {}) : (m.allies_player_deltas || {});
    const delta = deltas[name] ?? 0;

    const card = el("div", "match");
    const top = el("div", "top");
    top.appendChild(el("div", "", `${m.date} • ${m.tournament || ""} • ${m.id}`));
    top.appendChild(el("div", "", `Δ ${fmt(delta, 2)}`));
    card.appendChild(top);

    card.appendChild(el("div", "small", `Axis: ${(m.axis||[]).join(", ")}`));
    card.appendChild(el("div", "small", `Allies: ${(m.allies||[]).join(", ")}`));
    card.appendChild(el("div", "small", `Result: ${m.result} • Expected(Axis): ${fmt(m.expected_axis, 3)} • Surprise(Axis): ${fmt(m.surprise_axis, 3)}`));
    wrap.appendChild(card);
  }
}

function renderChart(name) {
  const p = (RUN.players || {})[name];
  const hist = p?.rating_history || [];

  // Convert mixed history entries into a clean series:
  // - use "rating" if present (snapshots)
  // - otherwise use "rating_after" (detailed match entries)
  const points = hist
    .map(h => {
      const y = (h.rating !== undefined) ? h.rating : h.rating_after;
      if (y === undefined || y === null) return null;
      const label = h.match_id ? `${h.date} • ${h.match_id}` : h.date;
      return { x: label, y: Number(y) };
    })
    .filter(Boolean);

  const labels = points.map(p => p.x);
  const data = points.map(p => p.y);

  const ctx = document.getElementById("ratingChart");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `Rating over time: ${name}`,
        data,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { ticks: { callback: v => v } } }
    }
  });
}

function selectPlayer(name) {
  document.getElementById("playerSelect").value = name;
  renderPlayerStats(name);
  renderMatchList(name);
  renderChart(name);
}

async function main() {
  RUN = await loadRun();
  renderHeader();
  renderSideSummary();
  renderLeaderboard("");

  renderPlayerSelect();

  const first = getPlayersArray().sort((a, b) => b.rating - a.rating)[0];
  if (first) selectPlayer(first.name);

  const search = document.getElementById("playerSearch");
  search.addEventListener("input", () => renderLeaderboard(search.value.trim().toLowerCase()));
}

main().catch(err => {
  console.error(err);
  document.body.innerHTML = `<pre style="color:#fff;background:#000;padding:16px;">${err.stack}</pre>`;
});
