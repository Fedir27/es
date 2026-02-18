import { vocab } from "./verbs.js";

let mode = "pl2es";
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const infoEl = document.getElementById("info");
const toggleBtn = document.getElementById("toggleBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const statsEl = document.getElementById("stats");
let scopeCheckboxes;
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const selectedCountEl = document.getElementById("selectedCount");

dropdownBtn.onclick = () => {
  dropdownMenu.style.display =
    dropdownMenu.style.display === "flex" ? "none" : "flex";
};

document.addEventListener("click", (e) => {
  if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.style.display = "none";
  }
});

function updateSelectedCount() {
  const checked = document.querySelectorAll(".scope:checked").length;
  selectedCountEl.textContent = checked;
}


const STATS_KEY = "spanishQuizStats";
function loadStats() {
  const saved = localStorage.getItem(STATS_KEY);
  if (saved) { try { return JSON.parse(saved); } catch {} }
  return { correct: 0, wrong: 0 };
}
function saveStats(stats) { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }
let stats = loadStats();
function renderStats() {
  statsEl.textContent = `Poprawne: ${stats.correct} | Błędne: ${stats.wrong}`;
}
resetBtn.onclick = () => { stats = { correct: 0, wrong: 0 }; saveStats(stats); renderStats(); };

function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

function getActiveVocab() {
  const activeScopes = Array.from(scopeCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  return vocab.filter(v => activeScopes.includes(v.scope));
}

function newQuestion() {
  infoEl.textContent = "";
  optionsEl.innerHTML = "";

  const pool = getActiveVocab();
  if (pool.length < 4) {
    questionEl.textContent = "Zaznacz co najmniej 1 kategorię (SER / TENER / LLEVAR).";
    return;
  }

  const correct = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffle(pool.filter(v => v !== correct)).slice(0,3);
  const answers = shuffle([correct, ...others]);

  questionEl.textContent = mode === "pl2es"
    ? `Jak po hiszpańsku: "${correct.pl}"?`
    : `Jak po polsku: "${correct.es}"?`;

  answers.forEach(v => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = mode === "pl2es" ? v.es : v.pl;
    btn.onclick = () => checkAnswer(btn, v === correct, correct);
    optionsEl.appendChild(btn);
  });
}

function checkAnswer(btn, isCorrect, correct) {
  document.querySelectorAll('.option').forEach(b => b.disabled = true);
  if (isCorrect) {
    btn.classList.add('correct');
    infoEl.textContent = "✅ Poprawnie!";
    stats.correct++;
  } else {
    btn.classList.add('wrong');
    const rightText = mode === "pl2es" ? correct.es : correct.pl;
    infoEl.textContent = `❌ Źle. Poprawna odpowiedź: ${rightText}`;
    stats.wrong++;
  }
  saveStats(stats);
  renderStats();
}


toggleBtn.onclick = () => {
  mode = mode === "pl2es" ? "es2pl" : "pl2es";
  toggleBtn.textContent = mode === "pl2es" ? "Tryb: PL → ES" : "Tryb: ES → PL";
  newQuestion();
};

nextBtn.onclick = newQuestion;
scopeCheckboxes = document.querySelectorAll('.scope');
scopeCheckboxes.forEach(cb => cb.addEventListener('change', newQuestion));
scopeCheckboxes = document.querySelectorAll('.scope');

scopeCheckboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    updateSelectedCount();
    newQuestion();
  });
});

updateSelectedCount();
renderStats();
newQuestion();
