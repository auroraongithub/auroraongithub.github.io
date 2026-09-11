# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from the existing site and prior brief: people visiting Aurora's personal site to browse their creative work, scanlation projects, blogs, stories, interests, and contact links. Potential collaborators are a secondary audience.

## Product Purpose

Inferred from the existing site and prior brief: provide a personal, expressive hub where Aurora can share projects and writing, present a portfolio, connect visitors to scanlation and creator resources, and make contact easy. Success means visitors can quickly understand who Aurora is, discover something interesting, and reach the right content or contact point.

## Positioning

Inferred from the existing site and prior brief: an authentic personal web space combining creator portfolio, scanlation archive, writing, gaming interests, and playful interactive widgets rather than a conventional professional portfolio.

## Operating Context

The public site is a statically built Astro application deployed through the existing GitHub Pages workflow. Public content and live widgets use the existing backend API, while Astro content collections provide build-time fallbacks and generated detail routes. The `astro-refactor` branch is the active redesign workspace; `main` must remain untouched during this work.

## Capabilities and Constraints

- Preserve the existing elythria.dev identity, content, assets, theme controls, and important legacy public URLs unless a change is explicitly requested.
- Keep the site modular and component-based so new pages, posts, projects, widgets, and themes are easy to add.
- Support desktop and mobile browsing, including the original mobile navigation and More drawer behavior.
- Current public surfaces include Home, About, Portfolio, Blogs, Stories, Experiments, Resources, and Changelog, with arcade/games treated as secondary content.
- Preserve live status, recent posts/stories, portfolio, favorites, manga hover cards, CRT/status treatment, updates, chat, and other existing widgets while refactoring their implementation.

## Brand Commitments

Inferred from the existing site and prior brief: use the `elythria.dev` name and Aurora identity; retain the established color-theme system, existing type choices, imagery, and playful personal voice as the incumbent design authority. Visual refinement should improve clarity and consistency without flattening the site into a generic SaaS or portfolio template.

## Evidence on Hand

- Existing Astro implementation under `src/`.
- Existing visual system and assets under `public/assets/`, `public/img/`, and the legacy root files preserved for compatibility.
- Existing content collections and sync script under `src/content.config.ts`, `src/content/`, and `scripts/sync-content.mjs`.
- Existing browser coverage under `tests/site.spec.ts`.

## Product Principles

1. Make Aurora's personality and work discoverable immediately.
2. Preserve the playful personal-web character while improving hierarchy and usability.
3. Keep content and widgets modular so future additions do not require page rewrites.
4. Treat mobile behavior and legacy links as first-class public functionality.

