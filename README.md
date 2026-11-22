# Books to Read – The Reading Room

A one-book-per-month reading tracker with a vintage library look: mahogany panelling, a brass
nameplate, a bookshelf where each month is a spine, ruled catalogue cards and a "READ" rubber stamp.
No build step and no backend – progress is saved in `localStorage`.

## Structure

```
index.html            Markup only
css/
  base.css            Design tokens (wood, brass, parchment, ink), textures, reset, accessibility
  layout.css          Page structure + responsive breakpoints (mobile-first)
  components.css      Plaque, buttons, shelf & spines, stamp, cards, dialog, toast…
js/
  constants.js        Year, months, storage key, shelf settings
  utils.js            Helpers (escapeHtml, dates, CSV-safe cells, download)
  store.js            State, persistence, filtering and stats (no DOM)
  views.js            Rendering + HTML templates
  ui.js               Toast, reset dialog, confetti celebration
  app.js              Event wiring (data-action delegation) and startup
```

Scripts load in that order from `index.html`; each file depends only on the ones above it.

## Customising

- **Change the year / number of books:** edit `YEAR` and `MONTHS` in `js/constants.js`.
- **Retheme:** colours, fonts and textures are CSS variables at the top of `css/base.css`.

## Run locally

Open `index.html` in a browser (or serve the folder with any static server).
