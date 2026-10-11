# Ijen default preset integration QA — 2026-10-11

## Input and provenance

This import uses **two user-authored export files**, preserved without
modifying their bytes under `src/features/map/presets/source/`:

- `ijen-default-route.json` — SHA-256
  `33b3d42cc1befe12704aa0b5b036abc74b816a41f4694267085013c9ec6a8d47`
- `ijen-default-checkpoints.json` — SHA-256
  `0b106bd531af0be136d95e57e95905ebebf573b5ecc577691795a5c2352d2b75`

The bundled `manifest.json` contains full v1 route and checkpoint
documents. The id and routeId remain `draft-1791640851016` so original
JSON round-trip references are preserved.

- Title: `Ijen default route`, Ijen area, `run` activity.
- Ten `[longitude, latitude]` GeoJSON vertices.
- **3.553 km** user-supplied and recomputed Haversine estimate
  (rounded to 3.6 km in the app's small card display).
- `method: straight-segment-haversine`; `roadSnapped: false`.
- One user-specified checkpoint: `Warung bakso Mas Aji`, `kind:cafe`,
  `promoted:false`, `verification:unverified`.
- Route and checkpoint **have not been checked for route suitability,
  business location or safe pedestrian access.**

No road-snapping was added or inferred. No fabricated promotional
offer, duration, climbing metric or traffic/safety score was assigned.

## App behavior

- Search: built-in Ijen preset appears in running recommendations at
  the top under default preferences, tagged `Preset default`.
- Detail: shows original ten-point geometry with a **dashed purple**
  manual line, light outline, start/end markers and a cafe checkpoint.
  The map warning explicitly states that the line is not road-snapped.
  Displays straight-segment distance without an invented duration
  or ascent.
- Studio: user preset remains selectable for editing and export.
- Pit-stop: selecting Ijen shows the checkpoint map pin and a
  **named, non-promoted** place entry.
- Other demo routes: all **six** earlier OSRM road-graph samples remain
  available and are distinguished from the user sketch.
- Generic navigation simulator remains generic; user-generated JSON
  checkpoints do not drive its virtual playback sequence.

## Automated verification

- 9 route tests (including catalog priority and regression).
- 9 map tests (including violet line and checkpoint payload).
- 8 editor/JSON tests (including identity, version, the unchanged
  source documents and recomputed length).
- TypeScript and ESLint: pass.
- Expo Doctor: **21 / 21** pass.

## Visual review

Used the **visible Edge browser** on Fedora with Expo web preview
(`http://localhost:8084`), at 320 × 720, 390 × 844, and
428 × 926 CSS px. Checked search, route details and Pit-stop.
No horizontal overflow. Ijen was found in search, map loads with
`__explorstreetGeometrySource='manual-sketch'`, and the checkpoint
pin title/popup appeared:

`Kafe: Warung bakso Mas Aji`, `Kafe • Lokasi belum diverifikasi`.

The first map screenshot exposed an orange sketch route difficult to
differentiate from OSM road colors. Subsequent screenshot at 390px
verified the legible dashed purple outline.

Evidence was saved outside Git under
`~/workspace/AI/.browser-use/explorstreet-qa/`, notably:
- `ijen-default-real-mobile-390-home.png`
- `ijen-default-real-mobile-390-pit-stop.png`
- `ijen-default-purple-390.png`
- `ijen-real-mobile-qa.json`

No native Android build or real-world route survey was performed.
