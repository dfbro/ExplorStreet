# Search-first home redesign — ExplorStreet

Date: 2026-10-10
Primary device target: Android-sized mobile screen.
Design input: user-provided hand-drawn search → map → bookmark → advanced filter
wireframe, plus reference screenshots of two mobile designs and a comic-directory
filter disclosure pattern. No reference-brand assets or logos were copied.

## Git rollback checkpoint

**Baseline before changes:** `621835a` —
`checkpoint: current ExplorStreet alpha before search redesign`.

The repository already existed but had no commits. We recorded its complete
working-tree state before redesign. Use `git show 621835a:src/app/index.tsx`
to inspect the old entry; compare against the redesign commit to review
changes. Avoid resetting a dirty worktree without saving your current changes.

## New home information architecture

1. Header with brand and partner access
2. Visible **Cari rute atau area...** text input
3. **Peta & tujuan**: area chips, OpenStreetMap/Leaflet map,
   explicit **Pilih tujuan** interaction and a removable temporary pin
4. One-tap **Bookmark rute** with saved count and state
5. Collapsed **Advanced filter**
6. Dynamic **Rekomendasi rute**, search results, or bookmarked routes

On a clean profile, recommendations come from route preference scores.
User-selected area increases ranking for that area; the area choice and
route preferences are stored in AsyncStorage. It is **not inferred from
GPS or private home/school coordinates**. Previously saved sport and
favorite preferences also affect results. All six route records remain
demo content rather than verified trails.

## Advanced filters

- Activity: running or cycling
- Distance presets: all, 2–4, 4–7, or >7 km
- **Custom minimum and/or maximum distance**: accepts decimal comma/dot,
  0–100 km, at most two decimals, requires one bound, rejects min > max
- Priority sliders, each 0–3: quiet roads, flatter profile, pit-stops
- Reset filter

Custom ranges constrain the *demo record distances*, not actual measured
OpenStreetMap route length.

## Destination selection

The home map adds an explicit destination-picking state in the Leaflet
overlay. The selected coordinate is sent from the embedded document to
React Native Web/React Native WebView via the platform messaging bridge.
The parent shows an acknowledgment and permits clearing the pin.

This is a **temporary map point only**. It does not imply the selected
destination is reachable by foot, produces a complete street-following
route, or stores a person's exact GPS location.

## Verification

- Checkpoint made before changing the UI
- `npx tsc --noEmit` passes
- `npm run lint` passes
- Route test suite expanded from 6 to **9 checks** for custom ranges,
  validation, and area-based recommendation ordering
- Map test suite: **5/5** remains green
- Browser Use on Edge from `~/workspace/AI/.bin/browser-use`
  - 3 viewport sizes (320×720, 390×844, 428×926)
  - top/middle/bottom screenshots at each width
  - Leaflet ready and search visible
  - horizontal overflow: zero
  - **24/24 functional assertions passed** for destination selecting/clearing,
    filter expansion, 6–9 km custom range, run/bike switching, search,
    reset, bookmarking, and saved-only results
  - expanded-filter screenshot inspected separately

Files:
`~/workspace/AI/.browser-use/explorstreet-qa/search-redesign-*-sheet.png`
`~/workspace/AI/.browser-use/explorstreet-qa/search-redesign-advanced-open.png`
`~/workspace/AI/.browser-use/explorstreet-qa/search-redesign-functional.json`

## Remaining validation

This is browser-size mobile testing, not an Android device build. Real
Android WebView map gestures, keyboard insets, map-to-native postMessage,
and accessibility need a physical device test. The OSM map requires
internet access. Overpass POI availability is best-effort, and this alpha
has no backend or actual routing engine.

Metro remains on the attachable session:
`tmux attach -t explorstreet-dev`.
No `expo run:android` or EAS build was run.
