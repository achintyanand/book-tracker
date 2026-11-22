/**
 * Static configuration.
 */

const YEAR = 2027;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** One book per month. */
const TARGET = MONTHS.length;

/** Kept identical to the previous version so existing saved progress still loads. */
const STORAGE_KEY = 'reading_tracker_2027_v2';

const FILTERS = { ALL: 'all', COMPLETED: 'completed', TODO: 'todo' };

/** Number of cloth colours defined in components.css (.spine--tone-0 … -5). */
const SPINE_TONE_COUNT = 6;

/** Slightly different spine heights (rem) so the shelf looks natural. */
const SPINE_HEIGHTS = [7.2, 8.4, 6.6, 7.8, 8.8, 6.9, 8.1, 7.4, 8.6, 6.8, 7.9, 8.3];

const TOAST_DURATION_MS = 3000;

const CONFETTI_COLORS = ['#b8923a', '#e0c57a', '#6e1f2b', '#2e4a3b', '#f6ecd3'];
