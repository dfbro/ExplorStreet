# ExplorStreet project setup

## Baseline (10 October 2026)

- Expo SDK 57, React Native 0.86, TypeScript, Expo Router.
- Generated with `create-expo-app --template default` and npm.
- Route Discovery and Route Detail are now implemented as native React Native
  screens, migrating the visual direction and demo data from
  `../lifestyle-app-prototype/index.html`.
- Available interactions: sport/distance filters, keyword search, preference
  ranking, favorites persisted with AsyncStorage, route details, Leaflet
  OpenStreetMap route sketch editing, opt-in search of OSM cafe POIs,
  and the local Live Nav simulator.
- Five user modules and the partner B2B demo now share local AsyncStorage demo
  state; these flows have no live backend, account system or transactions.

## Product boundaries

ExplorStreet is a working project name for the Kota Malang recreational route
concept. Potential screens include route discovery, route reports, organizer-led
Pace Buddy groups, pit-stop promotions, workout recap, and a B2B partner portal.

The problem, route quality, merchant interest, and business model require
real-world validation. Route and voucher demo data must never be presented as
verified geographic, safety, or financial records.

## Agent skills (project-scoped)

All instructions are under `.agents/skills/`:

- Design: `ui-ux-pro-max`, `frontend-design`, `design`,
  `design-system`, `ui-styling`, `brand`.
- Expo: `expo-project-structure`, `expo-router`, `expo-native-ui`,
  `expo-animation`, `expo-data-fetching`.
- Product management: `product-manager`, `product-roadmap`,
  `product-requirements`.
- Engineering: `planning-and-task-breakdown`,
  `incremental-implementation`, `test-driven-development`,
  `react-native-best-practices`.
- The UI UX Pro Max CLI also generated `banner-design` and `slides`.

`ui-ux-pro-max` was initialized using the already-installed CLI:
`uipro init --ai codex`. The other third-party installations are recorded
in `skills-lock.json`.

These skills are installed in this repo, not in global user skill directories.
Read `AGENTS.md` before working on Expo APIs.

## Commands (Fish compatible)

```fish
cd ~/workspace/ExplorStreet
npx expo start
npx tsc --noEmit
npm run lint
npm run test:routes
npm run test:map
npx expo-doctor
```

For packages that integrate with Expo, use `npx expo install <package>` so
the chosen version is compatible with the installed Expo SDK.

## Quality and security

After the native UI and map slices: TypeScript and ESLint pass, Expo Doctor
21/21, six local route-ranking tests pass, and five map/geodata unit tests
pass. Browser Use verified 19/19 map/sketch/POI-error-path and layout checks.
An Android/iOS device build has **not** been executed.
Two compatibility fixes were needed in the generated starter code:
CSS type declarations and React web hydration via `useSyncExternalStore`.

Initial npm audit reports 29 dependency advisories (11 moderate, 18 high),
including upstream Expo/React Native packages. These have not been force-fixed;
triage them against supported SDK versions before deploying publicly.

## OpenStreetMap route sketch and cafes

The earlier static screenshot and official iframe embed were replaced with
a reusable **Leaflet** document in `src/features/map/explorer-document.ts`.
It renders via `MapSurface` (WebView on mobile, srcDoc iframe on web),
shows OSM attribution, and provides map-click editing, undo, and reset.

The previous randomized square-like sketches have been superseded:
`road-route-data.ts` now stores **six deterministic street-following
route snapshots**, calculated with FOSSGIS OSRM's routed-foot and routed-bike
profiles. `scripts/generate-road-samples.py` refreshes those snapshots.
They are represented by solid green polylines and Material-style location
pins. The manual editing mode is still an amber, unsnapped concept sketch.
Distance matches the routing graph, but terrain, access, surface, actual
hazards and durations remain unverified. See `ROAD_SAMPLE_QA.md`.

`cafe-parser.ts` validates named real OSM POI records obtained from
Overpass. `cafes.ts` performs **user-triggered** retrieval with an
approximately 1.3-km geographic radius, six-hour local cache, limit,
20-second timeout and a visible failure state. Kafe OSM data is
**independent of fictional merchant promotions** in the Pit-stop demo.
POI existence and opening status have not been field-verified.

Public OpenStreetMap tile and Overpass services do not offer SLAs.
Follow tile attribution, cache and identifiable User-Agent requirements
and Overpass fair-use guidance. A backend or contracted/self-hosted map
provider will be required before scaling:
https://operations.osmfoundation.org/policies/tiles/
https://dev.overpass-api.de/overpass-doc/en/preface/commons.html

Icons are now Google's Material Icons via `@expo/vector-icons/MaterialIcons`
with a centralized semantic mapping in `src/components/icons.tsx`.
`lucide-react-native`, `react-native-maps` and `expo-location` have
been removed. Web and native require connectivity to load Leaflet and tiles; no
turn-by-turn navigation or GPS tracking is implemented.

## Next development slice

Inspect the current app on a physical phone, validate accessibility/scroll
behavior, and conduct a map/location integration spike before committing to
full navigation or background tracking.
