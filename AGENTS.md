# Project agent notes

## Impeccable live mode

The homepage widgets in `public/scripts/widgets.js` are populated after load from API responses. Their rendered cards do not exist as literal Astro markup, so Impeccable's automatic `live-wrap` source lookup cannot resolve them reliably.

When a live `generate` event targets one of these runtime-rendered widgets and includes `scaffoldAttempted` with `scaffoldError`, skip another `live-wrap` attempt and use the documented agent-driven fallback immediately. Preview in `public/scripts/widgets.js`, persist accepted visual changes in the owning stylesheet or renderer, and remove all temporary `data-impeccable-*` wrappers before committing.
