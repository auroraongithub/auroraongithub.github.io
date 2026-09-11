# Elythria Astro refactor

This branch migrates `elythria.dev` from repeated static HTML into a modular Astro site while keeping the existing visual system, public backend, realtime chat, assets, and separate admin workflow.

## Local development

Use Node.js 24.

```bash
npm install
npm run dev
```

`npm run dev` automatically runs `npm run sync:content` first, then starts the Astro development server. The content sync reads the existing Elythria backend; it does not require admin credentials.

Production checks:

```bash
npm run build
npm run preview
npm run verify:build
npm run test:e2e
```

`npm run verify` runs Astro checks, a production build, output/security checks, and Playwright tests for desktop and mobile layouts.

## Content model and the existing admin

The existing `/admin/` area remains separate and continues to write to the current backend. It is still the normal CMS workflow for backend-managed content.

Before development and production builds, `scripts/sync-content.mjs` mirrors backend blogs, stories, and projects into `_generated` entries inside the Astro content collections. Those generated files are ignored by Git because the backend stays authoritative. Manually authored collection files placed outside `_generated` are left alone.

### Add a blog post

Preferred workflow: create the post through `/admin/`, then run `npm run sync:content` or restart the dev server.

A manual `src/content/blogs/my-post.md` entry can also use:

```md
---
title: "My post"
description: "Short summary"
date: 2026-09-11
tags: ["site", "dev"]
draft: false
---

Post content here.
```

`backendId` is optional for a manual post. Synced backend posts include it so the existing kudos endpoint can keep working.

### Add a story

Use `/admin/` and sync, or create `src/content/stories/my-story.md` with the same frontmatter schema as a blog post.

### Add a project

Preferred workflow: update Portfolio in `/admin/`, then sync. A manual `src/content/projects/my-project.md` can use:

```md
---
name: "Project name"
description: "What it does"
githubUrl: "https://github.com/example/repo"
language: "TypeScript"
stars: 0
forks: 0
order: 10
---
```

`url` and `image` are optional project fields.

### Favorites and changelog

Favorites and changelog remain backend-managed through `/admin/`. Their public rendering is isolated in the Astro widget/page modules instead of being embedded in large HTML files.

## Navigation

Edit `src/data/navigation.ts`.

`primaryNavigation` is intentionally limited to Home, About, Portfolio, Blogs, and Stories. Experiments, Resources, and Changelog live in `secondaryNavigation`. Arcade/Games belongs under `/experiments/` and should not be added to primary navigation.

## Themes and styles

The nine Elythria colors are defined in `src/data/themes.ts`: cyan, pink, purple, green, orange, blue, red, yellow, and teal. The migration still uses the established stylesheet from `public/assets/styles.css` for visual parity while Astro-specific additions live in `src/styles/`.

Theme selection and dark mode are isolated in `public/scripts/theme.js` and persist through `localStorage`.

## Public runtime modules

Interactive JavaScript is intentionally limited to small modules under `public/scripts/`:

- `theme.js` — color picker and dark mode
- `carousels.js` — carousel controls
- `widgets.js` — status, now, stats, favorites, projects, recent posts, Spotify, changelog
- `chat.js` — existing chat/API/realtime behavior
- `resources.js`, `changelog-page.js`, `post-kudos.js`, `post-filter.js` — route-specific behavior

The public site is not a React SPA.

## Backend configuration and secrets

The public API base remains `https://nijikade-backend.vercel.app/api`. No new private credentials are required by the Astro build. The existing browser-side realtime configuration is preserved only to maintain the current chat behavior.

`npm run verify:build` scans generated text output for common private-key/token patterns and fails if an `.env` file is emitted.

## GitHub Pages

`astro.config.mjs` uses static output for `https://auroraongithub.github.io`. The Pages workflow builds `dist/` with Node 24 and deploys that artifact only when `main` is updated. Work on this refactor stays on `astro-refactor` until it is deliberately reviewed and merged later.

## Legacy compatibility

The original root HTML source files are intentionally retained during migration. The Astro build also ships compatibility entry points for `blogs.html`, `stories.html`, `post.html`, `resources.html`, and `changelog.html` so older inbound links can resolve to the new routes.
