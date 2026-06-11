# The Room Index — MVP Build Plan

Keep `/` (countdown) visually untouched. Build the functional MVP behind it, starting at `/home`. Reuse the cinematic ocean backdrop, dark lower gradient, serif/editorial typography, and hamburger treatment so every page reads as one luxury index.

## Routes

```text
/                            Countdown landing (unchanged)
/home                        Product entry + search
/london                      London Room Index (cards + static map)
/vote/london/$category       Category voting (campaign page)
/room/$id                    Room detail
/submit                      Submit a room
```

Files (TanStack file-route convention):
`src/routes/home.tsx`, `src/routes/london.tsx`,
`src/routes/vote.london.$category.tsx`, `src/routes/room.$id.tsx`,
`src/routes/submit.tsx`.

## Shared shell

- **SiteMenu** (`src/components/SiteMenu.tsx`): fixed top-left hamburger over a backdrop-blurred slide-in panel. Subtle, restrained, matches the muted red accent. Links: Landing `/`, Home `/home`, London Index `/london`, Vote: Best View `/vote/london/view`, Submit `/submit`. Rendered from `__root.tsx` so it appears on every page, including `/`.
- **CinematicBackdrop** (`src/components/CinematicBackdrop.tsx`): reusable wrapper that paints the existing hero-ocean image, top vignette, and dark lower gradient. Used by `/home`, `/london`, `/vote/...`, `/room/$id`, `/submit`. `/` keeps its current inline implementation untouched.
- **Typography**: continue using `Qidea` / `Cormorant Garamond` for display and `Poppins` for UI. No new families. Move the Google Fonts `<link>` from `/`'s `head()` into `__root.tsx` so every page inherits it.

## `/` — Countdown landing (preserve)

No visual changes. Only fix: countdown hydration mismatch. In `Countdown.tsx`, initialise `timeLeft` to `null`, compute in `useEffect` after mount, and render `--` placeholders on first paint so SSR HTML matches first client paint.

## `/home` — Product entry

- Same backdrop + gradients.
- Wordmark **The Room** + red **Index** (matches landing).
- Subtitle: *The end of hotel search*.
- Large central search input, placeholder *"Ask for the stay you actually want…"*; on Enter, parse the query and navigate to `/london` with `q` and (when matched) `category` params per the keyword rules in the brief.
- Prompt chips: Best view in London, Best bath in London, Best value in Shoreditch, Best sleep in Mayfair — each navigates with the parsed category.
- Primary CTA **Explore the London Index** → `/london`.
- Secondary ghost CTA **Submit a room** → `/submit`.

## `/london` — London Room Index

Reads `?category=` and `?q=` via TanStack `validateSearch` (zod + fallback).

- Header **London Room Index**, subheader *Seeded by us. Corrected by travellers.*, support line listing the seven categories.
- Category pills: All · View · Value · Sleep · Space · Bathroom · Food & Drink · Location. "All" sorts by composite score (mean of all 7); any other category sorts by that score and shows a small score chip on each card.
- If `q` is present, render *Showing results for "…"* above the list.
- If `q` mentions a city other than London, show a small notice: *Only London is live in this MVP.*
- Two-column layout (`lg:grid-cols-[1fr_minmax(360px,440px)]`), stacks on mobile.

**Left** — scrollable ranked list. Card contents: hero image, rank badge, hotel name, room name, neighbourhood, category tags, price band + £ price, one-line verdict, composite score (large), active-category chip, **IndexStatusBadge** (Seeded / Vote open / Traveller nominated / Traveller verified), action row: **Vote**, **View room**, **Submit correction**, **Check hotel**.

Action behaviour:
- Vote → local React state; toast "Vote recorded for this session."
- View room → `/room/$id`
- Submit correction → `/submit`
- Check hotel → external `hotelUrl` in a new tab, or disabled state *"Booking links coming soon."* when missing.

**Right** — sticky **EditorialMap** panel (see below). Hovering a card highlights the corresponding pin; hovering a pin highlights the card (purely visual, no scroll-into-view in MVP).

## `/vote/london/$category` — Category vote campaign

- Param validates against the seven categories; unknown → `notFound()`.
- Header **Vote: Best {Category} in London**, subheader *We seeded the shortlist. Travellers decide what ranks.*
- Shows top ~8 candidates for that category, sorted by category score. Larger, more focused cards: image, hotel, room, neighbourhood, one-line verdict, category score, big **Vote** button.
- Vote (local) → toast *"Vote recorded. Want to submit a better room?"* and reveal CTA *"Stayed somewhere better? Submit it."* → `/submit`.
- Secondary CTA **See full London Index** → `/london?category=$category`.
- Visually more campaign-like than the index (centred, narrower column, more whitespace).

## `/room/$id` — Room detail

- `notFound()` for unknown id.
- Back link to `/london`.
- Large hero image, hotel name, room name, neighbourhood, category tag row, price, IndexStatusBadge, composite seed score.
- Score breakdown: seven horizontal bars (View / Value / Sleep / Space / Bathroom / Food & Drink / Location), 0–10.
- **Why it ranks** (`whyItRanks` bullets), **Why it might not** (`whyItMight` bullets), short **What to verify before booking** line.
- Single-pin EditorialMap for that room.
- Vote row: **Worth it** · **Overrated** · **Stayed here** (local state + toast).
- CTAs: **Submit correction** → `/submit`, **Back to London Index** → `/london`.
- og:image set from the room's hero image.

## `/submit` — Submit a room

react-hook-form + zod, fields per brief (hotel, city, room type, did you stay, category nomination multi-select, best/worst category, rating slider 1–10, would book again, verdict ≤140, photo/video URL, Instagram handle, permission checkbox*). On submit, no network call — show editorial success state:
*"Thanks — we'll review your nomination."* + *"If we feature it, we'll credit your handle unless you ask us not to."*

## Sample data

`src/data/londonRooms.ts` exports `Category`, `IndexStatus`, `SourceType`, `LondonRoom` types and `londonRooms: LondonRoom[]` with 30 entries spanning Mayfair, Shoreditch, Marylebone, Soho, Notting Hill, Bloomsbury, Belgravia, Southbank, King's Cross, Chelsea, Covent Garden, London Bridge, Holborn, Westminster.

Helpers in `src/data/categories.ts`:
- `CATEGORIES` ordered list with labels (`foodDrink` → "Food & Drink").
- `compositeScore(room)` = mean of the 7 sub-scores.
- `sortRooms(rooms, category | "all")`.

Score distribution follows the brief (8 strong View, 6 Value, 5 Bathroom, 4 Space, 3 Sleep, 2 Food & Drink, 2 Location). Rooms have realistic spread — not every room scores high on everything. Verdicts are short and slightly opinionated, in the brief's voice. Images are Unsplash hotel/interior URLs.

## EditorialMap component

`src/components/EditorialMap.tsx` — pure SVG, no external API.

- Fixed central-London bounding box (`lat 51.49–51.535`, `lng -0.20–-0.05`); normalise pin positions into the viewBox.
- Style: ivory/off-white base, hairline streets (a handful of hand-drawn paths for the Thames, Hyde Park outline, and a few key arteries — abstract, editorial, not a real map render), thin labelled neighbourhood markers, gold/red pins matching the design tokens.
- Props: `rooms`, `highlightedId`, `onHover(id)`, `singlePin?` mode for the room detail page.

This deliberately favours feel over geographic precision; it should read as an editorial illustration of London, not Google Maps.

## Design system additions (`src/styles.css`)

Add semantic tokens (OKLCH) and matching Tailwind utilities:
- `--accent-gold` (editorial gold), `--accent-red` (= existing #e11d48 ported to oklch), `--score-bar`, `--surface-glass`, `--surface-glass-border`, `--pill-selected`, `--overlay-dark`.
- `editorial` button variant in `src/components/ui/button.tsx`: thin 1px border, uppercase tracking-wider, restrained hover (border + subtle bg), no gradients.
- Card primitive `EditorialCard`: 1px hairline border, `backdrop-blur-md`, soft inner shadow, rounded-xl, generous padding.

All new tokens semantic — no hardcoded colours in components.

## Route metadata

Each route sets unique `title`, `description`, `og:title`, `og:description`. `/london` and `/room/$id` also set `og:image` (London hero / per-room hero). Move the shared Google Fonts `<link>` to `__root.tsx`.

## Hydration fix (the only change to `/`)

In `src/components/Countdown.tsx`: `useState<TimeLeft | null>(null)`; compute inside `useEffect`; render `--` blocks until non-null. No visual redesign.

## Build order

1. Countdown hydration fix; add fonts link to `__root.tsx`.
2. `SiteMenu` + `CinematicBackdrop` + design tokens + `editorial` button variant.
3. `src/data/londonRooms.ts` + `categories.ts`.
4. `/home`.
5. `EditorialMap` + `/london` (cards, filters, search-param wiring, map).
6. `/vote/london/$category`.
7. `/room/$id`.
8. `/submit`.
9. Mobile pass, metadata pass, editorial tone polish.

## Out of scope

No auth, no payments, no persistence, no real search/AI, no booking, no other cities, no external maps. Structured so each can slot in later without redesign.