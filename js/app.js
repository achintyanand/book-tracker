/**
 * Entry point: wires DOM events to actions and boots the app.
 *
 * Buttons declare what they do with `data-action="..."` (plus optional
 * `data-filter` / `data-index`). One click listener looks the action up in
 * ACTIONS – there are no inline onclick handlers.
 */

// ---------- Actions ----------

function setSearch(query) {
  Store.search = query;
  Views.renderList();
  Views.renderFilters();
}

function resetFilters() {
  Store.clearFilters();
  $('searchInput').value = '';
  Views.renderAll();
}

function toggleDone(index, isDone) {
  const percentBefore = Store.getStats().percent;
  Store.setDone(index, isDone);
  Views.renderAll({ stampedIndex: isDone ? index : null });

  // Re-rendering replaced the checkbox; give keyboard users their focus back.
  document.querySelector(`.entry[data-index="${index}"] [data-field="isDone"]`)?.focus();

  const book = Store.books[index];
  const name = book.title.trim() ? `“${book.title.trim()}”` : `${book.month} book`;
  Toast.show(isDone ? `Stamped ${name} as read!` : `Moved ${name} back to the to-read pile`, isDone ? 'success' : 'info');

  // Celebrate only when this click is what completes the goal (not on page load).
  if (isDone && percentBefore < 100 && Store.getStats().percent === 100) {
    Celebration.fire();
    Toast.show(`🎉 Congratulations! You completed your ${YEAR} reading goal!`, 'success');
  }
}

/** Clicking a spine jumps to that month's index card. */
function goToEntry(index) {
  if (!Views.isVisible(index)) resetFilters();

  const row = document.querySelector(`.entry[data-index="${index}"]`);
  if (!row) return;
  row.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  row.querySelector('[data-field="title"]')?.focus({ preventScroll: true });
}

function confirmReset() {
  ResetDialog.close();
  Store.reset();
  $('searchInput').value = '';
  Views.renderAll();
  Toast.show('The ledger has been cleared', 'info');
}

function exportCSV() {
  const completed = Store.getStats().completed;
  const rows = Store.books.map((b) =>
    [b.month, csvCell(b.title), csvCell(b.author), b.isDone ? 'TRUE' : 'FALSE'].join(',')
  );

  const csv = [
    'Month,Title,Author,Is done?',
    ...rows,
    '',
    `Formula,=COUNTIF(D:D,"True")/${TARGET}`,
    `Goal Progress,${toPercent(completed, TARGET)}%`,
  ].join('\r\n');

  downloadFile(csv, `Books_to_read_${YEAR}_${Date.now()}.csv`, 'text/csv;charset=utf-8');
  Toast.show('Exported to CSV successfully!');
}

function exportJSON() {
  downloadFile(JSON.stringify(Store.books, null, 2), `books_to_read_${YEAR}_backup.json`, 'application/json');
  Toast.show('Exported to JSON backup file');
}

/** Maps `data-action` names to handlers. `el` is the clicked element. */
const ACTIONS = {
  'set-filter': (el) => {
    Store.filter = el.dataset.filter;
    Views.renderList();
    Views.renderFilters();
  },
  'clear-search': () => {
    $('searchInput').value = '';
    setSearch('');
    $('searchInput').focus();
  },
  'reset-filters': resetFilters,
  'go-to-entry': (el) => goToEntry(Number(el.dataset.index)),
  'scroll-top': () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }),

  'export-csv': exportCSV,
  'export-json': exportJSON,
  'open-reset': () => ResetDialog.open(),
  'close-reset': () => ResetDialog.close(),
  'confirm-reset': confirmReset,
};

// ---------- Event wiring ----------

function bindEvents() {
  document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action]');
    if (el) ACTIONS[el.dataset.action]?.(el);
  });

  $('searchInput').addEventListener('input', (event) => setSearch(event.target.value));

  const list = $('entryList');
  const indexOf = (el) => Number(el.closest('.entry').dataset.index);

  // Title / author: save as you type, without re-rendering the list.
  list.addEventListener('input', (event) => {
    const { field } = event.target.dataset;
    if (field !== 'title' && field !== 'author') return;
    Store.setField(indexOf(event.target), field, event.target.value);
    Views.renderDashboard();
  });

  list.addEventListener('change', (event) => {
    if (event.target.dataset.field === 'isDone') toggleDone(indexOf(event.target), event.target.checked);
  });

  // Clicking the dimmed backdrop closes the dialog (Esc is handled natively).
  $('resetDialog').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) ResetDialog.close();
  });
}

/** Fills year/target placeholders so they come from constants.js only. */
function applyConstants() {
  document.title = `Books to Read (${YEAR}) — The Reading Room`;
  document.querySelectorAll('[data-bind="year"]').forEach((el) => (el.textContent = YEAR));
  document.querySelectorAll('[data-bind="target"]').forEach((el) => (el.textContent = TARGET));
}

// ---------- Boot ----------

window.addEventListener('DOMContentLoaded', () => {
  Store.load();
  applyConstants();
  bindEvents();
  Views.renderAll();
});
