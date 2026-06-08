# OPENFLOOR — Project Guide

Company site. Single-page, full-screen scroll-snap experience driven by one
motion value. This file documents the conventions; follow them when filling in
sections.

## Status

Step 1 (engine + skeleton + placeholder sections) is done. Each section is a
labelled placeholder (`PlaceholderSection`); real content/interactions are added
one section at a time in later steps. **Don't build section content unless asked.**

## Stack

- **Package manager: yarn** (`yarn add`, `yarn.lock`). Do not use npm.
- **Vite + React + TypeScript**
- **Tailwind CSS v4** via `@tailwindcss/vite`. Config is CSS-first:
  `@import "tailwindcss"` + `@theme { … }` in `src/index.css`. **No
  `tailwind.config.js`.**
- **motion** (the framer-motion successor) — import from `'motion/react'`.
- **lucide-react** for icons.
- **clsx + tailwind-merge** → `cn()` helper in `src/lib/cn.ts`.
- **Prettier + prettier-plugin-tailwindcss** (`.prettierrc`). Run `yarn format`.

Scripts: `yarn dev`, `yarn build` (tsc -b + vite build), `yarn preview`,
`yarn format`.

## Commands

- `yarn dev` — dev server
- `yarn build` — typecheck + production build (run before considering work done)
- `yarn format` — Prettier

## Layout rules

- **Design frame** is `max-width: 1440px`, centered. Wider viewports get equal
  side margins, and that margin **bleeds the current slide's background color**.
- **Full-bleed elements** (section backgrounds, the bg crossfade) must NOT be
  capped at 1440. Only _content_ lives inside the frame. Use `<Container>` for
  content; keep backgrounds outside it.
- **Each section is exactly one screen tall.** Use `100dvh` / `svh` (mobile
  address-bar safe), never `vh`.
- **Tokens only.** Colors, spacing, fonts come from `@theme` tokens / Tailwind
  utilities — no hardcoded hex/px in components. (Raw color/width constants that
  the JS engine needs are mirrored in `src/config/slides.ts`; keep them in sync
  with the tokens.)
- **Extract long Tailwind class clusters** into components.
- **Keyframe animations** (block reveal, etc.) go in `src/styles/keyframes.css`,
  not crammed into Tailwind utility chains.

## Design tokens (`@theme` in `src/index.css`)

| Token                    | Value                   | Utility example       |
| ------------------------ | ----------------------- | --------------------- |
| `--color-bg-dark`        | `#171717`               | `bg-bg-dark`          |
| `--color-bg-light`       | `#ffffff`               | `bg-bg-light`         |
| `--color-accent`         | `#FB3640`               | `text-accent`         |
| `--color-title-on-dark`  | `#ffffff`               | `text-title-on-dark`  |
| `--color-text-on-dark`   | `#a3a3a3`               | `text-text-on-dark`   |
| `--color-title-on-light` | `#111111`               | `text-title-on-light` |
| `--color-text-on-light`  | `#666666`               | `text-text-on-light`  |
| `--font-sans`            | Montserrat → Pretendard | `font-sans`           |
| `--container-frame`      | `1440px`                | `max-w-frame`         |

- **Fonts:** Montserrat (Google Fonts) for Latin, Pretendard (jsDelivr CDN) for
  Korean. Both linked in `index.html`. Default stack is Montserrat → Pretendard.
- `::selection` uses the accent color.

## Scroll engine

The single source of truth is one `slide` motion value (`0, 1, 2 …`); every
animation derives from it via `useTransform`.

- **`useSlideController`** (`src/hooks/useSlideController.ts`) owns it. It hijacks
  wheel / touch / keyboard and snaps **one gesture = one section** (with a
  cooldown so fast scrolls don't skip), keeps both desktop and mobile snapping,
  locks body scroll, and toggles `body.is-dark` (for the video blend). It returns
  `{ slide, index, goTo }`. `index` is the rounded slide for scroll-spy; `goTo`
  is used by the header nav.
- **Track:** vertical stack, `transform: translateY(-slide * 100dvh)` (`Slides`).
- **Background crossfade:** `slide` → light/dark via `useTransform`. The
  light/dark sequence is config-driven (`BG_STOPS` / `BG_COLORS` derived from
  `SLIDES`), so adding sections extends it automatically.

### Adding / reordering sections

Edit `SLIDES` in `src/config/slides.ts` (id, label, `theme: 'dark' | 'light'`).
That array drives the background crossfade, scroll-spy, and section order. Update
`NAV_ITEMS` if the new section belongs in the header. Then add the section
component to the track in `src/App.tsx`.

## Central video (hero → about)

- Source `public/bg.mp4`, `<video autoplay muted loop playsinline>`. **No alpha.**
- It's composited onto dark slides with `mix-blend-mode`. Because the clip has no
  alpha, **both** the full-bleed bg layer and the 1440 frame layer paint the same
  background color (in `Frame`) so the blend resolves in one stacking context —
  this is what prevents a white flash when the blend mode swaps.
- `body.is-dark` (toggled when `slide > 0.55`) switches the blend mode
  (`.central-video` rules in `index.css`).
- Slide 0 → 1: the video shrinks + moves toward the upper-right, then fades out
  just before the Philosophy slide (`useTransform` mappings in `App.tsx`).

## Header / nav

- Logo `OPENFLOOR` + links: **About Us, Philosophy, Vision, Portfolio** (no Team,
  no Work).
- Clicking a link snaps to that slide (`goTo`); the active slide's link shows in
  the accent color (scroll-spy via `index`). Text color adapts to the current
  slide theme.

## Sections (order)

6 slides: **Hero, About, Philosophy, Vision, Portfolio, Contact (+ Footer)**.
Currently placeholders showing only the section name.

## Folder structure

```
src/
  components/
    layout/    Frame, Slides, Container, Header, CentralVideo
    sections/  Hero, About, Philosophy, Vision, Portfolio, Contact
    ui/        shared UI (PlaceholderSection)
  hooks/       useSlideController, useFrameSize
  lib/         cn.ts
  config/      slides.ts (slide order, themes, nav, engine timing)
  styles/      keyframes.css (tokens live in index.css @theme)
  index.css    Tailwind import + @theme tokens + base
```

Path alias: `@/` → `src/`.
