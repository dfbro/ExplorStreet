# ExplorStreet — Interactive OSM map and cafe POI QA

**Historical audit.** The dashed randomized demo-route geometry described
below was replaced by six FOSSGIS OSRM road-derived snapshots. See
`ROAD_SAMPLE_QA.md` for the latest geometry and marker verification.

Status: implementation in `~/workspace/ExplorStreet`; browser verification on Expo
React Native Web; **no Android/iOS native build has been run**.

## Delivered

- The `AreaMap` component now embeds Leaflet 1.9.4 and OpenStreetMap
  on web (HTML iframe) and native (WebView). It has pan, zoom and attribution.
- All existing example route IDs map to a dashed amber **illustrative**
  polyline on the real OSM basemap. Neither the points nor the route length
  have been verified on the road network.
- Map buttons: **Gambar sketsa** (tap points), **Urung titik**, and
  **Reset**. These create straight connections only, with no road snapping,
  spoken guidance, GPS, pace measurements or live traffic.
- The **Cari kafe OSM** button makes an on-demand request to public
  Overpass for named `amenity=cafe` features within about 1.3 km of the
  selected area center. When successful, named POIs become clickable map
  markers and links to the source OSM record. A 6-hour local cache limits
  repeat requests; results are not auto-fetched.
- The result parser rejects malformed coordinates and out-of-region
  entries, limits output, and constructs known OSM links rather than
  inserting uncontrolled HTML. Names are placed into text nodes in Leaflet
  popups.
- Pit-stop separates **OSM cafe locations** from imaginary promotional
  merchant cards. The former do not imply any discounts or opening hours.
- Route cards continue to use Material Icons instead of decorative cyclist
  SVG art.

## Verification

- TypeScript + ESLint: pass
- `npm run test:routes`: 6/6
- `npm run test:map`: 5/5 (sketch, parser, XSS payload, attribution)
- `npx expo-doctor`: 21/21
- Browser Use from `~/workspace/AI/.bin/browser-use`: 19/19 map
  interactions and UI assertions, including Leaflet initialization,
  drawing map points, undo, reset, data request result/error, area switching,
  and no horizontal overflow at 320, 390, 428 px.
- 12 follow-up screenshots: top/middle/bottom of Jelajah, Detail, Navigasi,
  Pit-stop at 390x844. No horizontal overflow; Leaflet fully initialized.

Evidence paths in `~/workspace/AI/.browser-use/explorstreet-qa/`:
- `map-feature-qa.json`
- `map-scrolling-audit.json`
- `map-v1-{jelajah,detail,navigasi,pitstop}-{atas,tengah,bawah}.png`

## External service limitations

The desktop/network check against the public Overpass instance returned
an HTTP 504 for one small Malang query; other attempts returned 406/500.
The UI correctly handles these outcomes as an explicit failure and **does
not invent cafe names or locations**. Successful live POI response on an
Android phone has not yet been observed. Public Overpass is not a
production dependency with a guaranteed SLA.

Leaflet JS/CSS, OpenStreetMap raster tiles, and Overpass all depend on
internet access. Attribution remains visible. Before public launch,
use a provider/backend that meets caching, client identity, load and
availability requirements, rather than scaling on community endpoints.

Reference policies:
- https://operations.osmfoundation.org/policies/tiles/
- https://dev.overpass-api.de/overpass-doc/en/preface/commons.html

## Manual device testing

Run Metro and inspect logs in the pre-existing attachable session:

```fish
tmux attach -t explorstreet-dev
```

Android build/testing remains user-controlled. Verify on a real device:
WebView touch gestures inside a scrolling screen, Leaflet asset loading,
cafe fetch behavior, browser hand-off for links, attribution visibility,
font sizing and system accessibility.

Next technical milestone: choose and validate a pedestrian/cycling
routing engine with real road graph, legal access and route geometries.
Until then, the dashed line is an **editable sketch**, not a computed
running or cycling course.
