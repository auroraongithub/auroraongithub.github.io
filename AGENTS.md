# Project agent notes

## Impeccable live mode

The homepage widgets in `public/scripts/widgets.js` are populated after load from API responses. Their rendered cards do not exist as literal Astro markup, so Impeccable's automatic `live-wrap` source lookup cannot resolve them reliably.

When a live `generate` event targets one of these runtime-rendered widgets and includes `scaffoldAttempted` with `scaffoldError`, skip another `live-wrap` attempt and use the documented agent-driven fallback immediately. Preview in `public/scripts/widgets.js`, persist accepted visual changes in the owning stylesheet or renderer, and remove all temporary `data-impeccable-*` wrappers before committing.

Repeated runtime cards should have a source-backed Astro component and a hidden `<template>` when their data is fetched client-side. The renderer should clone that template and fill it with text and attributes, preserving Astro's source metadata. This lets automatic live wrapping resolve the shared component and makes visual edits apply to every instance through the component or its shared stylesheet.
