/**
 * Small, dependency-free helpers.
 */

const $ = (id) => document.getElementById(id);

/** Escapes a value for safe insertion into HTML text or attributes. */
function escapeHtml(value) {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Today's date as YYYY-MM-DD in the user's local time zone (not UTC). */
function todayISO() {
  const now = new Date();
  return new Date(now - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

/** "2027-03-14" -> "14 Mar 2027" */
function formatStampDate(isoDate) {
  const [year, month, day] = (isoDate || '').split('-').map(Number);
  if (!year || !month || !day) return '';
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toPercent(part, total) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

/**
 * Quotes a CSV field. Values starting with = + - @ are prefixed with an
 * apostrophe so spreadsheet apps don't run them as formulas.
 */
function csvCell(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadFile(content, fileName, mimeType) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
