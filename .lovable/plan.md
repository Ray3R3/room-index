Apply the provided `Index()` JSX replacement to `src/routes/index.tsx`.

Changes:
- Replace the current `Index()` component body with the exact JSX provided by the user.
- Layout becomes: hero title/subtitle → Vote Now button → Launching Soon label + Countdown.
- Increases vertical spacing (`py-24`, `mt-14`, `mt-16`, `mb-7`) so the page is less bunched.
- No imports, routes, metadata, countdown logic, or other files touched.

After applying, preview `/` and confirm:
- Countdown still works.
- Vote Now links to `/vote/london/view`.
- No search bar, prompt chips, or CTAs added.
- Spacing is visibly less bunched.