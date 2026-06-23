/* ═══════════════════════════════════════════════════════════
   Money Map — script.js
   Persistence: localStorage for income, expenses, dark mode
   ═══════════════════════════════════════════════════════════ */

/* ─── Storage Keys ─────────────────────────────────────── */
const KEYS = {
  income:   'mm_income',
  expenses: 'mm_expenses',
  dark:     'mm_dark'
};

/* ─── Persist State ────────────────────────────────────── */
function save() {
  localStorage.setItem(KEYS.income,   JSON.stringify(income));
  localStorage.setItem(KEYS.expenses, JSON.stringify(expenses));
}

/* ─── Load State from localStorage ────────────────────── */
function loadState() {
  try {
    const si = localStorage.getItem(KEYS.income);
    const se = localStorage.getItem(KEYS.expenses);
    const sd = localStorage.getItem(KEYS.dark);
    income   = si ? JSON.parse(si) : 0;
    expenses = se ? JSON.parse(se) : [];
    dark     = sd === 'true';
  } catch (e) {
    // Corrupt storage — start fresh
    income = 0; expenses = []; dark = false;
  }
}

/* ─── State ────────────────────────────────────────────── */
let income   = 0;
let expenses = [];        // [{ name, amount }]
let selected = new Set(); // indices — never persisted (intentional)
let dark     = false;

/* ─── DOM refs ─────────────────────────────────────────── */
const toggleBtn = document.getElementById('dark-toggle');
const body      = document.body;
const incVal    = document.getElementById('inc-val');
const expVal    = document.getElementById('exp-val');
const savVal    = document.getElementById('sav-val');
const list      = document.getElementById('explist');
const empty     = document.getElementById('empty-state');
const counter   = document.getElementById('count');
const incInput  = document.getElementById('income');

/* ─── Dark Mode Toggle ─────────────────────────────────── */
function applyDark(state) {
  body.classList.toggle('dark', state);
  toggleBtn.textContent = state ? '☀️' : '🌙';
}

toggleBtn.addEventListener('click', () => {
  dark = !dark;
  applyDark(dark);
  localStorage.setItem(KEYS.dark, dark);
});

/* ─── Formatting ───────────────────────────────────────── */
const fmt = n => Number(n).toLocaleString('en-IN');

/* ─── Recalculate Balances ─────────────────────────────── */
function recalc() {
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const savings  = income - totalExp;
  incVal.textContent = fmt(income);
  expVal.textContent = fmt(totalExp);
  savVal.textContent = fmt(savings);
  // Turn savings red when negative
  document.getElementById('sav').style.color =
    savings < 0 ? 'var(--red-soft)' : '';
}

/* ─── Render Expense List ──────────────────────────────── */
function renderList() {
  list.innerHTML = '';
  counter.textContent = `${expenses.length} item${expenses.length !== 1 ? 's' : ''}`;

  if (expenses.length === 0) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  expenses.forEach((exp, i) => {
    const li = document.createElement('li');
    li.className = 'expense-list__item' + (selected.has(i) ? ' is-selected' : '');
    li.innerHTML = `
      <div class="expense-list__item-left">
        <span class="expense-list__dot"></span>
        <span class="expense-list__name">${exp.name}</span>
      </div>
      <span class="expense-list__amount">₹${fmt(exp.amount)}</span>
    `;
    li.addEventListener('click', () => {
      if (selected.has(i)) selected.delete(i);
      else selected.add(i);
      renderList();
    });
    list.appendChild(li);
  });
}

/* ─── Calculate Income ─────────────────────────────────── */
document.getElementById('cal').addEventListener('click', () => {
  const val = parseFloat(incInput.value);
  if (!isNaN(val) && val >= 0) {
    income = val;
    save();
    recalc();
  }
});

/* ─── Also save income on Enter key ───────────────────── */
incInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('cal').click();
});

/* ─── Add Expense ──────────────────────────────────────── */
document.getElementById('add').addEventListener('click', () => {
  const nameEl = document.getElementById('item');
  const amtEl  = document.getElementById('amt');
  const name   = nameEl.value.trim();
  const amount = parseFloat(amtEl.value);
  if (!name || isNaN(amount) || amount <= 0) return;
  expenses.push({ name, amount });
  nameEl.value = '';
  amtEl.value  = '';
  selected.clear();
  save();
  renderList();
  recalc();
});

/* ─── Add on Enter key in expense fields ──────────────── */
['item', 'amt'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('add').click();
  });
});

/* ─── Remove Selected ──────────────────────────────────── */
document.getElementById('remove').addEventListener('click', () => {
  expenses = expenses.filter((_, i) => !selected.has(i));
  selected.clear();
  save();
  renderList();
  recalc();
});

/* ─── Init — restore everything on page load ───────────── */
loadState();
applyDark(dark);

// Restore income field value so user sees what was set
if (income > 0) incInput.value = income;

renderList();
recalc();
