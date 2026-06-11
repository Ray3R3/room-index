# Replace EditorialMap with GoogleMapPanel

Drop the hand-drawn SVG map and use Google Maps JS API as the base + pin layer, wrapped in the same dark/glass Room Index panel. Everything else in the MVP stays as-is.

## Files

**New: `src/components/GoogleMapPanel.tsx**`

- Props: `rooms: LondonRoom[]`, `highlightedId?: string | null`, `onHover?: (id: string | null) => void`, `singlePin?: boolean`, `showRankBadges?: boolean` (default true on list, false on detail).
- Loads Maps JS API once via a module-level promise:
  - URL: `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY}&loading=async&callback=__roomIndexInitMap${import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID` 
      `? &channel=${import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID}` 
      `: ''}`
  - Resolves a singleton promise from the global callback. Subsequent panels reuse it.
  - If the key env var is missing, render a graceful dark fallback panel ("Map unavailable — set Google Maps connector") instead of crashing.
- Creates `new google.maps.Map(div, { center: { lat: 51.5074, lng: -0.1278 }, zoom: 13, disableDefaultUI: false, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, zoomControl: true, clickableIcons: false, backgroundColor: '#0a0f14', styles: ROOM_INDEX_DARK_STYLE, gestureHandling: 'cooperative' })`. No `mapId`.
- `ROOM_INDEX_DARK_STYLE`: dark desaturated style (deep navy water ~#0e1722, charcoal land ~#141b22, muted ivory labels at low opacity, hairline roads, POIs hidden, transit hidden). All Google brand colours suppressed.
- Pins: `google.maps.Marker` with inline SVG `icon` (data URL or `path`):
  - Inactive: 6px ivory-on-dark dot, 1px ring.
  - Active (id === highlightedId, or `singlePin`): 11px muted red (#e11d48) dot with soft outer glow ring, white hairline border, slight z-index bump.
  - When `showRankBadges` and rank ≤ 10: layered SVG icon with a small numbered label.
- Hover: `mouseover`/`mouseout` on marker → `onHover(room.id | null)`. `click` → `onHover(room.id)` (selection sticks until next hover).
- Tooltip: custom DOM `OverlayView` (not `InfoWindow`) anchored above the active pin, dark glass card with: neighbourhood eyebrow, hotel name (Qidea serif), room name (italic), composite score, and a `<Link to="/room/$id">View room</Link>`. Only one shown at a time, for `highlightedId` or `singlePin`.
- Bounds: on mount and whenever `rooms` changes, build a `LatLngBounds` from visible rooms and `map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })`. If only one room (`singlePin`), `setCenter` + `setZoom(15)` instead.
- Internal chrome inside the panel: top-left badge "London / Index Map" (uppercase, tracked), bottom-right footer "Map · Central London", both as absolutely-positioned divs over the map.
- Cleanup: clear markers on unmount and when `rooms` change; remove overlay.

**Edit: `src/routes/london.tsx**`

- Replace `import EditorialMap` with `import GoogleMapPanel`.
- Grid changes to `lg:grid-cols-[1fr_minmax(440px,44%)]` so the map takes ~40–45%.
- Right column becomes sticky and tall: `sticky top-24 h-[calc(100vh-7rem)]`, panel fills full height. Inner map div: `h-full w-full rounded-2xl overflow-hidden`.
- Filter/category state already filters the `rooms` list — pass the same filtered `rooms` to the map so only matching pins render and fitBounds reflows.
- Mobile: hide the sticky panel, add a "Show map" toggle below the filter pills that reveals a `h-[60vh]` GoogleMapPanel above the list.
- Drop the "Editorial map · Central London" caption (replaced by in-map footer).

**Edit: `src/routes/room.$id.tsx**`

- Replace `EditorialMap` with `<GoogleMapPanel rooms={[room]} singlePin showRankBadges={false} />`.
- Keep the existing dark panel wrapper.

**Delete: `src/components/EditorialMap.tsx**` (no fallback retained).

## Technical notes

- Env vars used (browser-safe, per Google Maps connector knowledge):
  - `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` — referrer-restricted browser key.
  - `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID` — appended as `channel` for usage tracking.
- No Geocoding, Routes, Places, or server-side Maps calls — rooms already have `lat`/`lng`.
- Use classic `google.maps.Marker` (not `AdvancedMarkerElement`) — no `mapId` required.
- Loader pattern uses `loading=async` + a global `__roomIndexInitMap` callback to satisfy the async loading contract; the singleton promise prevents duplicate script tags across `/london` ↔ `/room/$id` navigations.
- Custom map style applied via the `styles` option; this works without a cloud `mapId`.
- The dark style + custom pins + custom OverlayView tooltip keep the surface visually consistent with the rest of the Room Index (no default Google InfoWindow chrome).
- No new npm packages.

## Out of scope

No booking links, no Places autocomplete, no geocoding, no other cities, no persistence — strictly a visual/structural map swap.