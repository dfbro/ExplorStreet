# Studio Rute visual and JSON QA — 2026-10-10

## Verified implementation

- Dedicated `/studio` editor linked from Home, route detail and Pit-stop.
- Route title, run/bike activity, explicit Malang area choice.
- Leaflet/OpenStreetMap point placement and 0.001 km resolution
  Haversine distance estimate summed over straight point-to-point
  segments. This is **not** the actual length of the road network.
- Checkpoint category: cafe/store/rest. Manual coordinates, optional
  promoted **draft** flag, promo text, notes, and removal from editor.
- Follow-up marker update: blue **storefront**, brown **coffee**, green
  **rest** glyphs within location pins; `promoted:true` adds an amber
  star badge without changing the category icon. The popup labels the
  promotional offer as an unverified draft. Leaflet auto-pan reserves
  space for the editing controls at the top of the map.
- Local draft persistence with AsyncStorage, no backend or location tracking.
- Exported two independent versioned JSON files:
  `explorstreet.route` (GeoJSON `LineString` lon/lat order) and
  `explorstreet.checkpoints` keyed by matching `routeId`.
- Browser: direct file downloads. Android/iOS: locally created JSON
  files shared through `expo-sharing` (not yet device-tested).
- JSON paste-in import validates schema, bounds, version, duplicate IDs
  and checkpoint-route compatibility. Imported distance is recomputed.
- Bundled preset manifest is currently **empty** until user-authored
  route and checkpoint JSON is submitted; the editor will list imported
  default routes, while Pit-stop will show their checkpoint pins by area.
  Existing six demo route cards remain unchanged until the user
  supplies replacements and validates the data.

## QA results

Browser Use ran through the **visible Fedora Wayland Edge Beta** in the
dedicated `EdgeProfileVisible` profile (port 9344), not only headless
DOM tests. Screenshots at 280, 320, 390 and 428 CSS pixels were
captured at top, middle and bottom scroll positions (12 passes).

All checked sizes: Leaflet loaded; two export actions visible;
one saved checkpoint restored as a pin; no horizontal overflow.
The Home page retained **search → map → bookmark → Studio CTA**
rather than placing a new CTA above the search bar.

Behavioral verification:
- Point taps changed the route estimate (2 points ≈ 0.36 km).
- Map checkpoint selection opened the editable form; promoted
  draft metadata and notes were preserved.
- A temporary checkpoint pin was removed on save to prevent
  double marker rendering.
- A downloaded route JSON and checkpoint JSON both parsed as
  valid documents from the local Downloads directory.
- Copy-paste import of both documents and reload persisted;
  import roundtrip passed **9/9** browser assertions.
- Studio mobile screenshot at 280px showed the distance wrapping
  onto two lines. Font sizing and single-line ellipsizing were fixed;
  post-fix screenshots show `0.36 km` on one line.
- Removed the irrelevant OSM cafe help text from the editor map
  to keep the overlay smaller.

Evidence is saved under
`~/workspace/AI/.browser-use/explorstreet-qa/`:
- `studio-json-roundtrip.json`
- `studio-final-audit.json`
- `studio-final-{280,320,390,428}-{top,middle,bottom}.png`
- `studio-distance-fixed-{280,320,390}.png`
- `studio-import-roundtrip.png`

## Checks

```fish
npx tsc --noEmit
npm run lint
npm run test:routes
npm run test:map
npm run test:editor
npx expo-doctor
```

Native Android build/test was intentionally left to the user.
Map touch gesture competition with scrolling, Android keyboard
insets, native sharing permissions and device WebView rendering
remain to be verified on a real device.

No automatic route snapping, public-road race guidance,
real merchant approval, advertised discounts or GPS tracking is
implemented here.
