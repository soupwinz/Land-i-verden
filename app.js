// Landquiz — 198 land (inkl. Kosovo, Taiwan, Vest-Sahara)
// Kontinent-regler (som du bestemte):
// - Russland, Kosovo, Kypros -> Europa
// - Palestina, Kasakhstan -> Asia
// - Amerika samlet (Latin-Amerika+Karibia + USA+Canada)

const DATA = {
  "Europa": [
    "Albania","Andorra","Belarus","Belgia","Bosnia-Hercegovina","Bulgaria","Danmark","Estland","Finland","Frankrike",
    "Hellas","Irland","Island","Italia","Kosovo","Kroatia","Latvia","Liechtenstein","Litauen","Luxembourg","Malta",
    "Moldova","Monaco","Montenegro","Nederland","Nord-Makedonia","Norge","Polen","Portugal","Romania","Russland",
    "San Marino","Serbia","Slovakia","Slovenia","Spania","Storbritannia","Sveits","Sverige","Tsjekkia","Tyskland",
    "Ukraina","Ungarn","Vatikanstaten","Østerrike","Kypros"
  ],
  "Asia": [
    "Afghanistan","Armenia","Aserbajdsjan","Bahrain","Bangladesh","Bhutan","Brunei","De forente arabiske emirater",
    "Filippinene","Georgia","India","Indonesia","Irak","Iran","Israel","Japan","Jordan","Kambodsja","Kasakhstan","Kina",
    "Kirgisistan","Kuwait","Laos","Libanon","Malaysia","Maldivene","Mongolia","Myanmar","Nepal","Nord-Korea","Oman",
    "Pakistan","Palestina","Qatar","Saudi-Arabia","Singapore","Sri Lanka","Sør-Korea","Syria","Tadsjikistan","Thailand",
    "Timor-Leste","Turkmenistan","Tyrkia","Usbekistan","Vietnam","Yemen","Taiwan"
  ],
  "Afrika": [
    "Algerie","Angola","Benin","Botswana","Burkina Faso","Burundi","Den sentralafrikanske republikk",
    "Den demokratiske republikken Kongo","Djibouti","Egypt","Ekvatorial-Guinea","Elfenbenskysten","Eritrea","Eswatini",
    "Etiopia","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau","Kamerun","Kapp Verde","Kenya","Komorene","Kongo",
    "Lesotho","Liberia","Libya","Madagaskar","Malawi","Mali","Marokko","Mauritania","Mauritius","Mosambik","Namibia",
    "Niger","Nigeria","Rwanda","São Tomé og Príncipe","Senegal","Seychellene","Sierra Leone","Somalia","Sudan",
    "Sør-Afrika","Sør-Sudan","Tanzania","Togo","Tsjad","Tunisia","Uganda","Vest-Sahara","Zambia","Zimbabwe"
  ],
  "Amerika": [
    "Antigua og Barbuda","Argentina","Bahamas","Barbados","Belize","Bolivia","Brasil","Canada","Chile","Colombia",
    "Costa Rica","Cuba","Den dominikanske republikk","Dominica","Ecuador","El Salvador","Grenada","Guatemala","Guyana",
    "Haiti","Honduras","Jamaica","Mexico","Nicaragua","Panama","Paraguay","Peru","Saint Kitts og Nevis","Saint Lucia",
    "Saint Vincent og Grenadinene","Surinam","Trinidad og Tobago","Uruguay","USA","Venezuela"
  ],
  "Oseania": [
    "Australia","Fiji","Kiribati","Marshalløyene","Mikronesia","Nauru","New Zealand","Palau","Papua Ny-Guinea",
    "Salomonøyene","Samoa","Tonga","Tuvalu","Vanuatu"
  ]
};

// Alias: normalisert input -> canonical landnavn i DATA
const ALIASES = new Map([
  // --- USA / UK / UAE ---
  ["us","USA"], ["u s","USA"], ["usa","USA"], ["united states","USA"], ["united states of america","USA"], ["america","USA"],
  ["uk","Storbritannia"], ["u k","Storbritannia"], ["united kingdom","Storbritannia"], ["great britain","Storbritannia"],
  ["britain","Storbritannia"], ["england","Storbritannia"],

  ["uae","De forente arabiske emirater"], ["united arab emirates","De forente arabiske emirater"],

  // --- Europa ---
  ["hviterussland","Belarus"], ["byelorussia","Belarus"], ["belorussia","Belarus"], ["belarus","Belarus"],
  ["czechia","Tsjekkia"], ["czech republic","Tsjekkia"],
  ["macedonia","Nord-Makedonia"], ["north macedonia","Nord-Makedonia"],
  ["russia","Russland"], ["russian federation","Russland"],
  ["holy see","Vatikanstaten"], ["vatican","Vatikanstaten"], ["vatican city","Vatikanstaten"],
  ["cyprus","Kypros"],

  // --- Asia ---
  ["palestine","Palestina"], ["state of palestine","Palestina"],
  ["south korea","Sør-Korea"], ["republic of korea","Sør-Korea"],
  ["north korea","Nord-Korea"], ["dprk","Nord-Korea"],
  ["turkey","Tyrkia"], ["turkiye","Tyrkia"], ["türkiye","Tyrkia"],
  ["timor leste","Timor-Leste"], ["east timor","Timor-Leste"],
  ["lao","Laos"], ["lao pdr","Laos"],
  ["taipei","Taiwan"], ["republic of china","Taiwan"],

  // --- Afrika ---
  ["ivory coast","Elfenbenskysten"], ["cote d ivoire","Elfenbenskysten"], ["côte d ivoire","Elfenbenskysten"],
  ["drc","Den demokratiske republikken Kongo"], ["dr congo","Den demokratiske republikken Kongo"],
  ["democratic republic of the congo","Den demokratiske republikken Kongo"], ["congo kinshasa","Den demokratiske republikken Kongo"],
  ["republic of the congo","Kongo"], ["congo brazzaville","Kongo"],
  ["car","Den sentralafrikanske republikk"], ["central african republic","Den sentralafrikanske republikk"],
  ["cape verde","Kapp Verde"], ["cabo verde","Kapp Verde"],
  ["sao tome and principe","São Tomé og Príncipe"], ["sao tome & principe","São Tomé og Príncipe"],
  ["swaziland","Eswatini"],
  ["western sahara","Vest-Sahara"],

  // --- Amerika ---
  ["dominican republic","Den dominikanske republikk"], ["dominican rep","Den dominikanske republikk"],
  ["st lucia","Saint Lucia"], ["saint lucia","Saint Lucia"],
  ["st kitts and nevis","Saint Kitts og Nevis"], ["saint kitts and nevis","Saint Kitts og Nevis"],
  ["st vincent and the grenadines","Saint Vincent og Grenadinene"], ["saint vincent and the grenadines","Saint Vincent og Grenadinene"],
  ["trinidad & tobago","Trinidad og Tobago"],
  ["suriname","Surinam"],

  // --- Oseania ---
  ["new zealand","New Zealand"],
  ["papua new guinea","Papua Ny-Guinea"],
  ["solomon islands","Salomonøyene"],
  ["marshall islands","Marshalløyene"],
  ["micronesia","Mikronesia"], ["federated states of micronesia","Mikronesia"]
]);

const STORAGE_KEY = "landquiz_198_v1";
let isFinished = false;

function normalize(s) {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'".,()-]/g, " ")
    .replace(/\s+/g, " ");
}

function buildIndex() {
  const idx = new Map();
  for (const [continent, countries] of Object.entries(DATA)) {
    for (const c of countries) idx.set(normalize(c), { continent, canonical: c });
  }
  for (const [a, canonical] of ALIASES.entries()) {
    const hit = idx.get(normalize(canonical));
    if (hit) idx.set(normalize(a), hit);
  }
  return idx;
}

const INDEX = buildIndex();

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadProgress();

function ensureState(continent) {
  if (!Array.isArray(state[continent])) state[continent] = [];
}

function totalFound() {
  let sum = 0;
  for (const cont of Object.keys(DATA)) sum += (state[cont]?.length || 0);
  return sum;
}

function totalAll() {
  let sum = 0;
  for (const cont of Object.keys(DATA)) sum += DATA[cont].length;
  return sum;
}

function updateTotalUI() {
  const el = document.getElementById("totalCounts");
  const found = totalFound();
  const all = totalAll();
  el.textContent = `Totalt: ${found} / ${all} funnet — ${all - found} gjenstår`;
}

function setGlobalFeedback(msg, ok) {
  const el = document.getElementById("globalFeedback");
  el.textContent = msg || "";
  el.className = "feedback " + (msg ? (ok ? "ok" : "bad") : "");
}

function computeMissing() {
  const res = {};
  for (const [continent, countries] of Object.entries(DATA)) {
    ensureState(continent);
    const foundSet = new Set(state[continent]);
    res[continent] = countries.filter(c => !foundSet.has(c));
  }
  return res;
}

function showResults() {
  const results = document.getElementById("results");
  const missingTotals = document.getElementById("missingTotals");
  const missingByContinent = document.getElementById("missingByContinent");

  const missing = computeMissing();
  const missingCount = Object.values(missing).reduce((a, arr) => a + arr.length, 0);

  missingTotals.textContent = `${missingCount} land gjenstår (av ${totalAll()}).`;

  missingByContinent.innerHTML = "";
  for (const [continent, list] of Object.entries(missing)) {
    const block = document.createElement("div");
    block.className = "missingBlock";

    const h3 = document.createElement("h3");
    h3.textContent = `${continent} — ${list.length} gjenstår`;
    block.appendChild(h3);

    const wrap = document.createElement("div");
    wrap.className = "missingList";

    [...list].sort((a,b)=>a.localeCompare(b,"no")).forEach(name => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = name;
      wrap.appendChild(chip);
    });

    block.appendChild(wrap);
    missingByContinent.appendChild(block);
  }

  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setInputsDisabled(disabled) {
  document.querySelectorAll(".continent .input").forEach(inp => {
    inp.disabled = disabled;
    inp.placeholder = disabled ? "Avsluttet (trykk Nullstill for ny runde)" : "Skriv et land og trykk Enter…";
  });
}

function render() {
  const root = document.getElementById("continents");
  const tpl = document.getElementById("continentTpl");

  root.innerHTML = "";

  for (const [continent, countries] of Object.entries(DATA)) {
    ensureState(continent);

    const node = tpl.content.cloneNode(true);
    const nameEl = node.querySelector(".name");
    const countsEl = node.querySelector(".counts");
    const input = node.querySelector(".input");
    const feedback = node.querySelector(".feedback");
    const list = node.querySelector(".list");

    nameEl.textContent = continent;
    input.disabled = isFinished;

    function updateCounts() {
      const found = state[continent].length;
      const total = countries.length;
      countsEl.textContent = `${found} / ${total} funnet — ${total - found} gjenstår`;
    }

    function setFeedback(msg, ok) {
      feedback.textContent = msg || "";
      feedback.className = "feedback " + (msg ? (ok ? "ok" : "bad") : "");
    }

    function renderList() {
      list.innerHTML = "";
      const items = [...state[continent]].sort((a,b)=>a.localeCompare(b,"no"));
      for (const c of items) {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = c;

        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "×";
        del.title = "Fjern";
        del.addEventListener("click", () => {
          state[continent] = state[continent].filter(x => x !== c);
          saveProgress(state);
          renderList();
          updateCounts();
          updateTotalUI();
          setFeedback("", true);
          setGlobalFeedback("", true);
        });

        chip.appendChild(del);
        list.appendChild(chip);
      }
    }

    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      if (isFinished) return;

      const raw = input.value;
      input.value = "";
      const n = normalize(raw);
      if (!n) return;

      const hit = INDEX.get(n);
      if (!hit) {
        setFeedback("Ikke gjenkjent som land i fasiten.", false);
        setGlobalFeedback("", true);
        return;
      }

      if (hit.continent !== continent) {
        setFeedback(`Det landet ligger under: ${hit.continent}.`, false);
        setGlobalFeedback("", true);
        return;
      }

      if (state[continent].includes(hit.canonical)) {
        setFeedback("Du har allerede skrevet det.", false);
        setGlobalFeedback("", true);
        return;
      }

      state[continent].push(hit.canonical);
      saveProgress(state);

      renderList();
      updateCounts();
      updateTotalUI();
      setFeedback("Godkjent ✅", true);
      setGlobalFeedback(`+ ${hit.canonical}`, true);
    });

    updateCounts();
    renderList();
    root.appendChild(node);
  }

  updateTotalUI();
}

document.getElementById("resetAll").addEventListener("click", () => {
  for (const k of Object.keys(DATA)) state[k] = [];
  saveProgress(state);

  isFinished = false;
  document.getElementById("results").hidden = true;
  setInputsDisabled(false);

  render();
  setGlobalFeedback("Nullstilt.", true);
});

document.getElementById("finishBtn").addEventListener("click", () => {
  isFinished = true;
  setInputsDisabled(true);
  setGlobalFeedback("Avsluttet. Se listen over land du mangler under.", true);
  showResults();
});

document.getElementById("closeResults").addEventListener("click", () => {
  document.getElementById("results").hidden = true;
});

render();
updateTotalUI();