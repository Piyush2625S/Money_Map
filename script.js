/* ─── Dark Mode Toggle ─────────────────────────────────── */
const toggleBtn = document.getElementById('dark-toggle');
const body      = document.body;
let dark = false;

toggleBtn.addEventListener('click', () => {
  dark = !dark;
  body.classList.toggle('dark', dark);
  toggleBtn.textContent = dark ? '☀️' : '🌙';
});

/* ─── State ────────────────────────────────────────────── */
let income   = 0;
let expenses = [];        // [{name, amount}]
let selected = new Set(); // indices of selected items

/* ─── DOM refs ─────────────────────────────────────────── */
const incVal  = document.getElementById('inc-val');
const expVal  = document.getElementById('exp-val');
const savVal  = document.getElementById('sav-val');
const list    = document.getElementById('explist');
const empty   = document.getElementById('empty-state');
const counter = document.getElementById('count');

/* ─── Helpers ──────────────────────────────────────────── */
const fmt = n => n.toLocaleString('en-IN');

function recalc() {
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const savings  = income - totalExp;
  incVal.textContent = fmt(income);
  expVal.textContent = fmt(totalExp);
  savVal.textContent = fmt(savings);
  // Turn savings red if negative
  const savEl = document.getElementById('sav');
  savEl.style.color = savings < 0 ? 'var(--red-soft)' : '';
}

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
  const val = parseFloat(document.getElementById('income').value);
  if (!isNaN(val) && val >= 0) {
    income = val;
    recalc();
  }
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
  renderList();
  recalc();
});

/* ─── Remove Selected ──────────────────────────────────── */
document.getElementById('remove').addEventListener('click', () => {
  expenses = expenses.filter((_, i) => !selected.has(i));
  selected.clear();
  renderList();
  recalc();
});

/* ─── Init ─────────────────────────────────────────────── */
renderList();
recalc();