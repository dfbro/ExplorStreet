# ExplorStreet

**Mobile-first route discovery and community activity prototype for Kota Malang.**
Explore running/cycling routes, draft a custom route on OpenStreetMap, and
prepare cafe/store/rest checkpoints as portable JSON. Built with
[Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), React Native,
Expo Router, and TypeScript.

> **Alpha / demonstration only.** This project has no production backend,
> GPS tracking, live turn-by-turn navigation, verified route safety, or
> verified merchant promotions. Do not use sample routes as safety guidance.

## What you can try

| Feature | Current behavior |
| --- | --- |
| Route search | Search local route records, choose a Malang area, set activity, apply preset/custom distance and preference filters |
| Map preview | Pan/zoom OpenStreetMap, select a temporary destination pin, and view six cached OSRM road-network route examples |
| Studio Rute (`/studio`) | Draw a manual polyline, estimate straight-segment distance, and add cafe/store/rest checkpoints |
| JSON workflow | Export separate route and checkpoint documents; paste JSON back into Studio for validation/import |
| Bookmarks | Save route preferences and favorites locally on the device |
| Pit-stop | Request nearby cafe points from OSM/Overpass and preview distinct checkpoint or promoted-*draft* markers |
| Other screens | Live Nav **simulator**, Pace Buddy, Recap/Feed, and B2B partner **demo** |

The home screen follows **search → map & destination → bookmarks → advanced
filters → suggestions**. Suggestions use explicitly selected areas and local
preferences, **not** automatic GPS location. Manual sketch lines connect
points directly; they are **not** snapped to streets. Road-aligned examples
are a separate, cached routing-model dataset.

## Run locally

Requirements: Node.js, npm, and internet access for the web map tiles.

```fish
git clone https://github.com/dfbro/ExplorStreet.git
cd ExplorStreet
npm install
npm run web
```

The web preview is the quickest way to review UI changes without a native
build. For Expo's device/emulator connection, start Metro instead:

```fish
npx expo start --host lan
```

Expo offers development build, emulator, and (when compatible with the
installed SDK/dependencies) Expo Go workflows. **A native Android build has
not yet been validated for this prototype.** The existing development
session on the project machine can be viewed with:

```fish
tmux attach -t explorstreet-dev
```

Detach using `Ctrl+B`, then `D`. This does not stop Metro.

## Build your own route and checkpoint preset

1. Open **Studio Rute** from the home screen or navigate to `/studio`.
2. Choose an area and activity, then tap the map to add at least two points.
   The estimate adds geographic distances between points; **it does not
   measure the street-following distance**.
3. Tap **Tandai checkpoint** on the map, select a location, and choose
   `cafe`, `store`, or `rest`. An optional `promoted` flag adds a
   promotional **draft** badge, not a verified offer.
4. Export **route JSON** and **checkpoint JSON**. On web these are downloads;
   on a supported native device the app invokes its share sheet.
5. To revise the files, paste them into **Import JSON untuk diedit**,
   loading the route first and then checkpoints with the same `routeId`.

Both formats have explicit `schema` and `version: 1` fields. Route geometry
uses GeoJSON `LineString` with **[longitude, latitude]** coordinate order.
See [ROUTE_PRESETS.md](ROUTE_PRESETS.md) for example documents and validation.

Default user-authored presets are configured in
`src/features/map/presets/manifest.json`. The first user-submitted Ijen
route has been imported with ten manual vertices (3.553 km straight-
segment estimate) and a single unpromoted cafe checkpoint, **Warung bakso
Mas Aji**. It is available in route search, detail map, Studio, and
Ijen Pit-stop. The six previous road-model examples remain separate;
the uploaded sketch is **not road-snapped or field-verified**. See
[ROUTE_PRESETS.md](ROUTE_PRESETS.md) for its raw JSON sources.
The Ijen import's data provenance, unit tests and mobile map screenshots
are documented in [IJEN_PRESET_QA.md](IJEN_PRESET_QA.md).

## Validate changes

```fish
npx tsc --noEmit
npm run lint
npm run test:routes
npm run test:map
npm run test:editor
npx expo-doctor
```

**Visual QA is required for UI work:** inspect rendered screenshots at
mobile widths (including 320px and 390px), review scroll positions, and
check for clipped labels, overlay collisions, and bottom-tab overlap.
Unit tests and clickable controls alone do not establish visual correctness.

## Project layout

| Path | Responsibility |
| --- | --- |
| `src/app/` | File-based routes via Expo Router |
| `src/screens/` | Search, route details, Studio, Pit-stop, Feed, and other screens |
| `src/components/` | Shared UI and mobile/web map surfaces |
| `src/features/routes/` | Example route catalog, ranking, and local preferences |
| `src/features/map/` | OpenStreetMap view, JSON schemas, saved model geometry, and checkpoint logic |
| `scripts/` | Route snapshot generator and local unit tests |

## Map experience

- **Leaflet 1.9.4** renders an interactive OpenStreetMap basemap in
  `react-native-webview` on Android/iOS and a local `srcDoc` iframe on web.
  The WebView identifies the app with `ExplorStreetPrototype/0.1`.
- All six route samples show a **solid green street-following polyline**
  calculated from the OSM road network by FOSSGIS OSRM. Foot and bicycle
  samples use their respective routing profiles. Geometry is cached in
  `src/features/map/road-route-data.ts`, without any randomized polygons.
- Start and finish markers use the Material `place` vector pin rather
  than oval circles. If the sample is a loop, start/end share one pin.
- Tap **Gambar konsep** to temporarily draw a manual *amber dashed* line
  which does **not** snap to roads; **Urung titik** and **Reset** work,
  and Reset restores the road-derived sample geometry.
- Route distance reflects the OSRM road-network model. Duration,
  ascent, road safety and opening/access status remain unverified.
- Sample snapshots are not active turn-by-turn navigation or tested safe
  running/cycling courses.
- Tap **Cari kafe OSM** to fetch nearby named `amenity=cafe` POIs from
  Overpass (approx. 1.3 km around the selected area center). Results become
  clickable pins and a short list linking to the OSM object. Search is
  **on demand** with a six-hour local cache and timeout. If Overpass fails,
  no fabricated cafe names or coordinates are substituted.
- All basemap tiles include visible `© OpenStreetMap contributors`
  attribution. Public community services are **best-effort only**.
  Review the [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/)
  and [Overpass fair-use documentation](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html)
  before shipping. Migrate production traffic to contracted/self-hosted
  tile and POI infrastructure with proper caching and rate limits.
- No GPS tracking, live routing in the app, traffic data, on-site
  verification or turn-by-turn guidance is implemented.

## Icons

- All application icons render from Google's **Material Icons** using the
  Expo-compatible `@expo/vector-icons/MaterialIcons` package.
- Semantic icon exports are centralized in `src/components/icons.tsx`;
  `lucide-react-native` has been removed.

## Limitations

- No production backend, authentication, route directions or road verification.
- Leaflet assets, OSM tiles and Overpass requests need internet connectivity.
  The manual editor remains an interactive **conceptual sketch** rather than
  a route snapped to roads. Cached model routes are not a safety review.
- OSM POIs are community-maintained. Presence in OSM does not verify that a
  cafe is operating, reachable, open, or participating in any offer.
- Route distances are sourced from the FOSSGIS routing graph; duration,
  elevation and difficulty scores are still illustrative estimates.
- Reports, community interests, posts, vouchers and partner statistics are
  local-only examples, not real-world transactions or shared public data.

## Design and verification notes

- [PROJECT_SETUP.md](PROJECT_SETUP.md) — product scope, technology, and setup.
- [SEARCH_HOME_QA.md](SEARCH_HOME_QA.md) — search-first design and mobile behavior.
- [ROAD_SAMPLE_QA.md](ROAD_SAMPLE_QA.md) — origin and limits of road-network samples.
- [MAP_FEATURE_QA.md](MAP_FEATURE_QA.md) — map/POI interactions and availability.
- [ROUTE_PRESETS.md](ROUTE_PRESETS.md) — JSON contracts and bundled presets.
- [STUDIO_JSON_QA.md](STUDIO_JSON_QA.md) — JSON roundtrip and mobile Studio QA.
- [MOBILE_UX_QA.md](MOBILE_UX_QA.md) — visual regression checks.
- [REMOTE_SYNC_QA.md](REMOTE_SYNC_QA.md) — remote-merge and bottom-navigation QA.

## References

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [OpenStreetMap contributors and copyright](https://www.openstreetmap.org/copyright)
