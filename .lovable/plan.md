# /london — Full-height side map + scroll-sync

Scope: only `/london` and a small additive change to `GoogleMapPanel`. Nothing else changes.

## 1. Layout: fixed full-height map pane (desktop only)

In `src/routes/london.tsx`:

- Replace the current `lg:grid-cols-[1fr_minmax(440px,44%)]` grid with a single-column flow.
- The page container keeps its current `mx-auto max-w-7xl px-6 ...` for the **left/content** column on mobile, but on `lg+` switch to a layout where:
  - The outer page wrapper gets `lg:pr-[44vw]` so content never sits under the map.
  - The `max-w-7xl` constraint is relaxed on `lg+` (use `lg:max-w-none` on the inner wrapper, keep an inner `lg:max-w-[860px]` on the content column so cards keep a comfortable measure).
- Add a new sibling **outside** the content wrapper (still inside `CinematicBackdrop`):
  ```tsx
  <aside className="hidden lg:block fixed right-0 top-0 z-10 h-screen w-[44vw]">
    <GoogleMapPanel rooms={rooms} highlightedId={activeId} onHover={setHoverId} />
  </aside>
  ```
- `z-10` keeps it under `SiteMenu` (hamburger sits at a higher z in `__root.tsx`) — verify and bump only if needed.
- Mobile/tablet (`<lg`): keep the existing "Show map" toggle and inline `h-[60vh]` panel exactly as today. Remove only the now-redundant desktop `<aside className="hidden lg:block">…sticky…</aside>` block.

## 2. Map panel chrome adjustments

In `src/components/GoogleMapPanel.tsx`, add an optional `variant?: "card" | "pane"` prop (default `"card"`, used by `/room/$id` and the mobile toggle).

When `variant === "pane"`:

- Outer wrapper: drop `rounded-2xl` and the left border becomes a hairline divider (`border-left: 1px solid rgba(255,255,255,0.1)`), other borders removed; full-bleed to screen edges.
- Keep the "London / Index Map" top-left badge.
- Soften the bottom-right "Map · Central London" footer (lower opacity / smaller) so it doesn't compete with map UI; keep it.
- Tooltip card, pin styling, dark map style, fallback "Map unavailable" panel: **unchanged**.

Pass `variant="pane"` from the fixed desktop aside. The mobile toggle uses default `"card"`.

## 3. Scroll-sync (desktop only)

State in `LondonPage`:

- Keep `hoverId` for hover-driven highlight.
- Add `scrollActiveId: string | null`.
- Derived `activeId = hoverId ?? scrollActiveId` — hover wins over scroll, exactly as the spec asks.

Implementation:

- Wrap each room `<li>` in the `<ol>` with a ref registered into a `Map<string, HTMLLIElement>` (via a callback ref).
- One `IntersectionObserver` per mount (recreated when `rooms` identity changes) with:
  - `root: null` (viewport)
  - `rootMargin: "-40% 0px -50% 0px"` so the "active band" is roughly the vertical centre of the viewport
  - `threshold: 0`
- On each callback: among currently-intersecting entries pick the one whose bounding rect centre is closest to viewport centre, then `setScrollActiveId(id)` only if changed.
- Debounce updates with a small `requestAnimationFrame` + 80ms trailing timer to avoid jitter during fast scrolls.
- Gate the whole observer behind a `matchMedia("(min-width: 1024px)")` check; on mobile/tablet do nothing and leave `scrollActiveId` null.
- Clean up the observer and timers on unmount / when `rooms` changes.

Map reaction:

- Pass `highlightedId={activeId}` to `GoogleMapPanel` (already supported).
- Add a new optional prop `panToHighlighted?: boolean` (default `false`, opt-in from `/london`).
- In `GoogleMapPanel`, **separate effects**:
  - Existing rooms/build-markers effect: still rebuilds markers, but only calls `fitBounds()` when `rooms` identity changes (i.e. category filter). Track previous `rooms` reference in a `ref` so re-renders from `highlightedId` changes don't re-fit.
  - New effect keyed on `[highlightedId]` only: if `panToHighlighted` and a matching room exists, call `map.panTo({lat,lng})`. No `setZoom`, no `fitBounds`.
- Keep `setZoom(15)` for `singlePin` mode (unchanged for `/room/$id`).

Pin click behaviour:

- `onHover(id)` on click stays as-is; this updates `hoverId` and so the active room. **No scroll** of the left list — matches "do not aggressively scroll".
- Tooltip "View room" link unchanged.

## 4. What stays exactly the same

- `/`, countdown, hamburger menu, copy, data, room cards, voting, routing, `/room/$id`, pin SVGs, tooltip design, dark map style, fallback panel.
- Mobile/tablet stacked layout + "Show map" toggle.
- `GoogleMapPanel` default behaviour for `/room/$id` (`singlePin`, no `panToHighlighted`).

## Technical notes

- Files touched:
  - `src/routes/london.tsx` — layout swap, scroll-sync hook, refs, `activeId` derivation.
  - `src/components/GoogleMapPanel.tsx` — `variant` prop, `panToHighlighted` prop, split fit-bounds vs pan effects.
- No new deps. No route changes. No data changes.
- Guard against React render loops: `setScrollActiveId` only when the id actually changes; observer is created in a `useEffect` keyed on `[rooms]`.
- SSR-safe: `IntersectionObserver` and `matchMedia` accessed only inside `useEffect`.
- When scroll-sync first initialises, default `scrollActiveId` to the first visible/first ranked room after the rooms list loads, so the map has an active pin/tooltip before the user scrolls. After that, IntersectionObserver can take over.
- z-index: the fixed map sits at `z-10`; `SiteMenu`/hamburger must remain above — will verify in `__root.tsx` and bump map down or menu up by one step if needed (no visual redesign).

## Out of scope

No new pages, no AdvancedMarkers/`mapId`, no booking changes, no map style redesign, no changes to room cards, vote flow, or `/room/$id`.