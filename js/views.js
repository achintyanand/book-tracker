/**
 * Rendering: turns store data into HTML.
 *
 * Typing in a field must NOT re-render the list (it would steal focus), so
 * there are two entry points:
 *   Views.renderAll()        – everything (filters, toggles, reset…)
 *   Views.renderDashboard()  – stats, shelf, progress (safe while typing)
 */

const Views = {
  renderAll({ stampedIndex = null } = {}) {
    this.renderList(stampedIndex);
    this.renderFilters();
    this.renderDashboard();
  },

  // ---------- Reading list ----------

  renderList(stampedIndex = null) {
    const visible = Store.getVisibleBooks();
    $('entryList').innerHTML = visible.map((book) => Templates.entry(book, book.index === stampedIndex)).join('');
    $('emptyState').hidden = visible.length > 0;
  },

  isVisible(index) {
    return Store.getVisibleBooks().some((book) => book.index === index);
  },

  // ---------- Search + filter controls ----------

  renderFilters() {
    document.querySelectorAll('[data-action="set-filter"]').forEach((button) => {
      const isActive = button.dataset.filter === Store.filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    $('clearSearchBtn').hidden = Store.search.trim() === '';
  },

  // ---------- Stats, shelf and progress ----------

  renderDashboard() {
    const { completed, remaining, total, percent } = Store.getStats();

    $('statCompleted').textContent = completed;
    $('statRemaining').textContent = remaining;
    $('statPercent').textContent = `${percent}%`;
    $('filterCountCompleted').textContent = completed;
    $('filterCountTodo').textContent = remaining;
    $('statusText').textContent = `You have completed ${percent}% of your goal`;

    $('mainProgressBar').style.width = `${percent}%`;
    $('mainProgress').setAttribute('aria-valuenow', percent);

    $('mobileStickyBadge').textContent = `${completed}/${total}`;
    $('mobileStickyPercent').textContent = `${percent}% Done`;
    $('mobileStickyBar').style.width = `${percent}%`;

    $('dashboardCard').classList.toggle('is-complete', percent === 100);
    $('shelfBooks').innerHTML = Store.books.map(Templates.spine).join('');
  },
};

/** HTML templates. Every user-provided string goes through escapeHtml(). */
const Templates = {
  entry(book, justStamped) {
    const { index, month, title, author, isDone, finishedOn } = book;
    const stampDate = isDone ? formatStampDate(finishedOn) : '';
    const classes = ['entry', isDone && 'is-done', justStamped && 'entry--just-stamped'].filter(Boolean).join(' ');

    return `
      <li class="${classes}" data-index="${index}">
        <div class="entry__month">
          <span class="entry__dot" aria-hidden="true"></span>
          <span>${month}</span>
        </div>

        <div class="entry__field entry__field--title">
          <label class="entry__label" for="title-${index}">Book title</label>
          <input class="entry__input" id="title-${index}" type="text" data-field="title"
                 placeholder="Enter book title…" value="${escapeHtml(title)}" maxlength="200" autocomplete="off" />
        </div>

        <div class="entry__field entry__field--author">
          <label class="entry__label" for="author-${index}">Author</label>
          <input class="entry__input" id="author-${index}" type="text" data-field="author"
                 placeholder="Enter author…" value="${escapeHtml(author)}" maxlength="200" autocomplete="off" />
        </div>

        <div class="entry__status">
          <label class="stamp-toggle">
            <input class="stamp-toggle__input" type="checkbox" data-field="isDone"
                   aria-label="${month}: mark as read" ${isDone ? 'checked' : ''} />
            <span class="stamp" aria-hidden="true">
              <span class="stamp__idle">Mark read</span>
              <span class="stamp__done"><i class="fa-solid fa-check"></i> Read</span>
            </span>
          </label>
          ${stampDate ? `<span class="entry__date">Stamped ${stampDate}</span>` : ''}
        </div>
      </li>`;
  },

  /** One book spine on the shelf: empty slot, unread (sepia) or read (coloured cloth). */
  spine(book, index) {
    const hasTitle = book.title.trim() !== '';
    const state = book.isDone ? `spine--tone-${index % SPINE_TONE_COUNT}` : hasTitle ? 'spine--unread' : 'spine--empty';
    const label = hasTitle ? book.title.trim() : book.month.slice(0, 3);
    const description =
      `${book.month}: ${hasTitle ? book.title.trim() : 'nothing chosen yet'}` +
      `${book.author.trim() ? ` by ${book.author.trim()}` : ''}${book.isDone ? ' (read)' : ''}`;

    return `
      <li>
        <button type="button" class="spine ${state}" style="--h: ${SPINE_HEIGHTS[index % SPINE_HEIGHTS.length]}rem"
                data-action="go-to-entry" data-index="${index}"
                title="${escapeHtml(description)}" aria-label="${escapeHtml(description)}">
          <span class="spine__label">${escapeHtml(label)}</span>
        </button>
      </li>`;
  },
};
