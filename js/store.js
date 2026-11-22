/**
 * Application state and persistence. Nothing in this file touches the DOM.
 *
 * A book looks like:
 *   { month: 'January', title: '', author: '', isDone: false, finishedOn: null }
 * `finishedOn` (YYYY-MM-DD) is new – older saved data without it still loads.
 */

const EDITABLE_FIELDS = ['title', 'author'];

const Store = {
  books: [],
  filter: FILTERS.ALL,
  search: '',

  // ---------- Persistence ----------

  load() {
    this.books = this._readSaved() || createEmptyBooks();
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.books));
    } catch (error) {
      console.warn('Could not save reading list:', error);
    }
  },

  /** Returns the saved list (validated), or null if missing/corrupted. */
  _readSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length === TARGET) {
        return MONTHS.map((month, i) => normalizeBook(month, saved[i]));
      }
    } catch (error) {
      console.warn('Ignoring corrupted saved data:', error);
    }
    return null;
  },

  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Could not clear saved data:', error);
    }
    this.books = createEmptyBooks();
    this.clearFilters();
  },

  // ---------- Mutations ----------

  setField(index, field, value) {
    if (!EDITABLE_FIELDS.includes(field) || !this.books[index]) return;
    this.books[index][field] = value;
    this.save();
  },

  setDone(index, isDone) {
    const book = this.books[index];
    if (!book) return;
    book.isDone = isDone;
    book.finishedOn = isDone ? todayISO() : null;
    this.save();
  },

  clearFilters() {
    this.filter = FILTERS.ALL;
    this.search = '';
  },

  // ---------- Derived data ----------

  getStats() {
    const completed = this.books.filter((b) => b.isDone).length;
    return {
      completed,
      remaining: TARGET - completed,
      total: TARGET,
      percent: toPercent(completed, TARGET),
    };
  },

  /** Books matching the current filter + search, each tagged with its original index. */
  getVisibleBooks() {
    const query = this.search.trim().toLowerCase();

    return this.books
      .map((book, index) => ({ ...book, index }))
      .filter((book) => {
        if (this.filter === FILTERS.COMPLETED && !book.isDone) return false;
        if (this.filter === FILTERS.TODO && book.isDone) return false;
        if (!query) return true;
        return [book.month, book.title, book.author].some((text) => text.toLowerCase().includes(query));
      });
  },
};

function createEmptyBooks() {
  return MONTHS.map((month) => normalizeBook(month));
}

/** Coerces whatever was saved into a well-formed book. */
function normalizeBook(month, raw = {}) {
  const isDone = Boolean(raw?.isDone);
  return {
    month,
    title: typeof raw?.title === 'string' ? raw.title : '',
    author: typeof raw?.author === 'string' ? raw.author : '',
    isDone,
    finishedOn: isDone && typeof raw?.finishedOn === 'string' ? raw.finishedOn : null,
  };
}
