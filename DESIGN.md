---
name: elythria.dev
description: A playful personal-web studio for Aurora's creative work, writing, scanlation, and experiments.
colors:
  primary-cyan: "#6de6e2"
  primary-cyan-light: "#a8f5f2"
  primary-cyan-dark: "#4fc9c5"
  accent-blue: "#78beff"
  pink: "#ff6b9d"
  purple: "#9b59b6"
  green: "#2ecc71"
  orange: "#ff9f43"
  blue: "#5dade2"
  red: "#e74c3c"
  yellow: "#f1c40f"
  teal: "#1abc9c"
  light-bg: "#f7fcfc"
  light-card: "#ffffff"
  light-text: "#2c3e3e"
  light-muted: "#5a7070"
  dark-bg: "#0f1a1a"
  dark-elevated: "#162525"
  dark-card: "#1a2d2d"
  dark-text: "#e4ffff"
  dark-muted: "#a0c9c9"
typography:
  display:
    fontFamily: "Ecoder, Poppins, sans-serif"
    fontSize: "1.8rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "3px"
  headline:
    fontFamily: "Poppins, system-ui, -apple-system, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "2px"
  title:
    fontFamily: "Poppins, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Poppins, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Courier New, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "5px"
  md: "8px"
  lg: "10px"
  xl: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "10px"
  lg: "15px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary-cyan}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-control:
    backgroundColor: "{colors.light-card}"
    textColor: "{colors.primary-cyan}"
    rounded: "{rounded.md}"
    size: "40px"
  card:
    backgroundColor: "{colors.light-card}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.md}"
    padding: "15px"
---

# Design System: elythria.dev

## Overview

**Creative North Star: "The Hand-Built Personal Web Studio"**

elythria.dev is a deliberately personal, content-rich web space: part creator portfolio, part scanlation archive, part journal, and part playful internet clubhouse. Its visual language is bright, tactile, and a little nostalgic without becoming a novelty theme. The interface keeps content in framed modules so many different interests can coexist while the color system, header treatment, and motion keep the whole site recognizable.

The incumbent system uses a light or dark atmospheric background, a selectable accent palette, compact uppercase section headers, rounded cards, and small interactive details. It should feel authored and expressive rather than like a generic SaaS dashboard. The existing identity, imagery, Poppins/Ecoder pairing, theme controls, and CRT/status treatment are the visual authority for this refactor.

**Key Characteristics:**

- Framed personal-web modules with a double-line outer shell.
- Cyan-first accent system with selectable pink, purple, green, orange, blue, red, yellow, and teal variants.
- Poppins for readable UI and Ecoder for the branded display wordmark.
- Soft gradients, dotted motion texture, rounded 8px cards, and hover lift.
- Dense but navigable content, with progressive disclosure on mobile.

## Colors

The palette is a bright accent carried through borders, gradient headers, links, focus rings, and interactive states over a quiet neutral canvas. Dark mode changes the neutral surfaces while preserving the selected accent hue.

### Primary

- **Signal Cyan** (#6de6e2): Default accent for borders, links, section headers, controls, and status highlights.
- **Signal Cyan Light** (#a8f5f2): Gradient endpoint, display accents, and high-contrast status text.
- **Signal Cyan Dark** (#4fc9c5): Hover and pressed-adjacent accent, divider, and stronger edge treatment.

### Secondary

- **Sky Blue** (#78beff): Supporting accent for the default theme and a selectable blue-family emphasis.
- **Palette Pink** (#ff6b9d), **Palette Purple** (#9b59b6), **Palette Green** (#2ecc71), **Palette Orange** (#ff9f43), **Palette Blue** (#5dade2), **Palette Red** (#e74c3c), **Palette Yellow** (#f1c40f), and **Palette Teal** (#1abc9c): User-selectable theme accents. Each keeps the same light/dark role structure as cyan.

### Neutral

- **Paper Mist** (#f7fcfc): Default light page background.
- **White Surface** (#ffffff): Light elevated and card surfaces.
- **Ink Teal** (#2c3e3e): Light-theme primary text.
- **Muted Teal** (#5a7070): Secondary text, metadata, and supporting copy.
- **Night Teal** (#0f1a1a): Default dark page background.
- **Night Elevation** (#162525): Dark elevated surface.
- **Night Card** (#1a2d2d): Dark card surface.
- **Night Text** (#e4ffff): Dark-theme primary text.
- **Night Muted** (#a0c9c9): Dark-theme secondary text.

### Named Rules

**The Palette-Continuity Rule.** Theme changes may swap the accent family, but they must preserve the same semantic roles, contrast hierarchy, gradient structure, and interaction language.

**The Authored-Web Rule.** Keep the palette and decoration visibly personal; do not flatten the site into a neutral product dashboard.

## Typography

**Display Font:** Ecoder (with Poppins, sans-serif)
**Body Font:** Poppins (with system-ui, -apple-system, sans-serif)
**Label/Mono Font:** Courier New, monospace

**Character:** Poppins keeps dense content friendly and legible. Ecoder is reserved for the branded display treatment, while Courier New marks the CRT/status surface as a distinct technical channel.

### Hierarchy

- **Display** (700, 1.8rem, 1.3): Branded site name and prominent header identity; Ecoder may use outlined/drop-shadow treatment.
- **Headline** (600, 1.2rem, 1.3, 2px tracking): Section titles and compact module headers; uppercase treatment is allowed for framed headers.
- **Title** (600, 1rem, 1.3): Card titles, portfolio names, and subsection headings.
- **Body** (400, 15px, 1.6): General copy, descriptions, and long-form reading; keep line lengths comfortable inside content modules.
- **Label** (400, 0.85rem, 1.4): Status metadata, small controls, dates, and technical readouts in the CRT strip.

### Named Rules

**The Two-Voice Rule.** Poppins carries the site; Ecoder and Courier New are signature voices, not default replacements for body text.

## Layout

The desktop shell is centered at roughly 1100px, with a 2px accent outer border, a 3px inset, and a 1px inner border. The main content uses a three-column topology: a sticky narrow left navigation rail, a flexible center content rail, and a sticky right widget rail. Columns and modules are separated by compact 10px gaps so the page can hold a lot of personality without losing scanability.

The center rail is composed of stacked `neo-box` modules. The home page begins with a banner/hero, then moves through about, manga, favorites, portfolio, recent content, widgets, chat, and community modules. Grids use two columns for portfolio and recent content where space allows; carousels use 3/2/1 visible items at desktop/tablet/phone widths.

At 768px and below, side rails and full desktop navigation collapse into mobile navigation and the More drawer. At 700px and below, two-column content stacks; at 500px and below, carousels show one item. Body padding reserves space for the mobile bottom navigation.

## Elevation & Depth

Depth is a hybrid of tonal layering, accent borders, soft ambient shadows, and restrained hover lift. The outer shell uses a light cyan-tinted shadow in light mode and a dark ambient shadow in dark mode. Cards are flat enough to remain readable, then lift by roughly 2–3px on hover with the accent shadow. The dotted background texture, gradient headers, and double shell border provide additional depth without heavy skeuomorphism.

### Shadow Vocabulary

- **Ambient shell:** `0 4px 12px rgba(109, 230, 226, 0.15)` in the default light theme; dark mode uses `0 4px 12px rgba(0, 0, 0, 0.3)`.
- **Interactive lift:** `0 8px 24px rgba(109, 230, 226, 0.25)` in the default light theme; dark mode uses the same accent logic at reduced opacity.

### Named Rules

**The Responsive-Lift Rule.** Hover lift is a feedback signal for interactive cards and controls, never a substitute for hierarchy or legibility.

## Shapes

The form language is rounded but bounded: most cards, carousels, inputs, and compact controls use an 8px radius; larger banners use 10px; modal surfaces use 12px. Accent borders are common and often 1px, with 2px reserved for the outer shell, strong controls, focus, and signature imagery. Carousels clip content inside rounded viewports, while the outer shell maintains its double-line frame.

## Components

### Buttons

- **Shape:** Rounded 8px controls, with 40px square icon buttons in the header and carousels.
- **Primary:** Accent background or gradient, white text, compact 8px–15px internal padding.
- **Hover / Focus:** Accent darkening or filled accent state, small scale/lift where appropriate, and a 2px accent `:focus-visible` outline with 2px offset.
- **Secondary / Ghost / Tertiary:** Card-colored or translucent controls with an accent border and accent text; keep the same radius and focus language.

### Chips

- **Style:** Small rounded accent-bordered tabs and filter pills on the card-colored surface.
- **State:** Selected tabs use the active accent treatment; unselected tabs remain quiet but visibly interactive.

### Cards / Containers

- **Corner Style:** 8px for ordinary cards and modules; 10px for hero/banner imagery.
- **Background:** `--card` for content, `--bg-elev` for elevated surfaces, and `--gradient` for section headers.
- **Shadow Strategy:** Use the shadow vocabulary above; hover lift is reserved for actionable cards.
- **Border:** 1px accent or light-accent border; the outer shell is 2px plus a 1px inset line.
- **Internal Padding:** 12px–15px for normal content, 20px for roomier community or hero blocks.

### Inputs / Fields

- **Style:** Card or page background, accent/light-accent border, 6px–8px radius, compact padding.
- **Focus:** Accent border and the shared 2px `:focus-visible` outline.
- **Error / Disabled:** Preserve the existing muted/opacity treatment and never rely on color alone.

### Navigation

The desktop header combines an image-backed gradient banner, Ecoder brand, compact navigation links, and icon controls for theme/color. Desktop side navigation is a framed scrollable module with smaller Poppins labels. Mobile navigation becomes a fixed bottom bar with a More drawer for secondary destinations and contextual widgets; arcade/games remain secondary navigation rather than primary identity.

### CRT Status Strip

The status strip is a signature technical surface: near-black background, Courier New, accent text, scanlines, subtle RGB separation, and a marquee. Keep status information readable first; animation should pause on hover and remain supplementary.

### Manga Hover Card

Manga carousel cards are image-led, rounded, and lightly lifted on hover. The associated fixed hover card uses a 2px accent border, 10px radius, card background, accent title, muted metadata, and a readable description. It is pointer-transparent and must not obstruct keyboard access to the underlying link.

## Do's and Don'ts

### Do:

- **Do** use the existing theme tokens and `data-theme`/`data-color` roles so every surface remains switchable.
- **Do** keep content in reusable Astro components and data/content collections rather than duplicating markup across routes.
- **Do** preserve the framed module rhythm, playful micro-interactions, and mobile More-drawer behavior.
- **Do** keep focus-visible states at least as clear as hover states.
- **Do** use real project imagery and existing copy as the source of truth for personal identity.

### Don't:

- **Don't** introduce a new font pairing or unrelated palette without an explicit identity decision.
- **Don't** replace the personal-web character with generic SaaS cards, oversized marketing hero copy, or empty whitespace.
- **Don't** hide essential navigation or status information behind hover-only interactions.
- **Don't** canonize the current inline-style drift as a new token; consolidate it when touching a component.
- **Don't** make the CRT/status effects compete with the content or reduce readability.
