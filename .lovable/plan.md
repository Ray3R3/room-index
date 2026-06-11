## Goal
Make `/` visually match the `/home` hero (background, title, subtitle), while keeping the countdown module and "LAUNCHING SOON" label. No search, chips, or CTAs added.

## Changes (only `src/routes/index.tsx`)

1. **Background** — Replace the inline `backgroundImage` + two gradient overlays with the shared `CinematicBackdrop` wrapper used by `/home`, so the ocean image, vignette, and cinematic overlay match exactly.

2. **Title** — Match `/home` typography:
   - Font: `'Qidea','Cormorant Garamond',serif`, weight 400
   - Size: `clamp(48px, 8vw, 96px)`, line-height 1.05, letter-spacing 0.005em
   - "The Room" white, "Index" in muted red `#e11d48`

3. **Subtitle** — Match `/home`:
   - `'Poppins'`, weight 300
   - Size `clamp(13px, 1.4vw, 18px)`, letter-spacing `0.22em`, uppercase
   - Color `rgba(255,255,255,0.78)`, `marginTop: 18px`
   - Text: "The end of hotel search"

4. **Layout** — Use a centered flex column (like `/home`'s `<main>` shell) with title + subtitle stacked, then a spacer, then the existing "LAUNCHING SOON" label + `<Countdown />` block beneath. Tune vertical spacing so the hero feels like `/home` but with countdown replacing the search form.

5. **Preserve**:
   - `<Countdown />` component and its props/logic — untouched
   - "LAUNCHING SOON" label above countdown
   - Route, meta/head tags, font preconnects
   - Hamburger menu (rendered by `__root.tsx`, not touched)

## Out of scope
- No edits to `/home`, `/london`, `/room/$id`, `/submit`, map, or `CinematicBackdrop`.
- No search input, prompt chips, or CTA buttons on `/`.
- No countdown logic changes.
