# ExplorStreet

Mobile-first React Native alpha for exploring recreational activities in Kota Malang.
Route Discovery, map preview, Live Nav simulator, Pace Buddy, Pit-stop, Recap/Feed
and the B2B merchant demo are interactive using local device state. There is
**no live route guidance, backend, or verified trail data**.
See [PROJECT_SETUP.md](PROJECT_SETUP.md) for product scope, agent skills, and
validation status. The latest Android-sized visual and interaction audit is in
[MOBILE_UX_QA.md](MOBILE_UX_QA.md), with map and POI-specific findings in
[MAP_FEATURE_QA.md](MAP_FEATURE_QA.md). The search-first home redesign, new
custom-distance validation and Git rollback checkpoint are documented in
[SEARCH_HOME_QA.md](SEARCH_HOME_QA.md).

## Main screen

- Search-first home: **search field → map/temporary destination pin →
  bookmarks → collapsible advanced filters → recommendations**.
- Suggestions use stored sport preferences and an explicitly selected
  Kota Malang area; there is no implicit GPS tracking or geolocation.
- Advanced filters offer 2–4 km, 4–7 km, >7 km, plus custom
  minimum/maximum values (0–100 km) and quiet/flat/pit-stop priorities.
- The selected destination pin is illustrative. Neither the pin nor
  filter values create street-following navigation.

Built on [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/),
React Native, Expo Router, and TypeScript.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start Metro (no native build)

   ```bash
   npx expo start --host lan
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

The entry files in `src/app/` use [file-based routing](https://docs.expo.dev/router/introduction).
Feature logic lives in `src/features/routes/`, reusable components in
`src/components/`, and screens in `src/screens/`.

## Quality checks

```fish
npx tsc --noEmit
npm run lint
npm run test:routes
npm run test:map
npx expo-doctor
```

## Watch the development process

```fish
tmux attach -t explorstreet-dev
```

Detach with `Ctrl+B`, then `D`; Metro continues running in the terminal
session. Native Android builds have intentionally been left to the user.

## Map experience

- **Leaflet 1.9.4** renders an interactive OpenStreetMap basemap in
  `react-native-webview` on Android/iOS and a local `srcDoc` iframe on web.
  The WebView identifies the app with `ExplorStreetPrototype/0.1`.
- A **dashed amber route sketch** corresponds to each local route sample.
  Tap **Gambar sketsa** in the map, then tap map positions to compose an
  alternate conceptual line; **Urung titik** and **Reset** also work.
  The line connects raw points; **it is not snapped to streets**, must not
  be used for navigation, and is not used to compute displayed example
  distance, slope or time.
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
- No GPS tracking, waypoint-to-waypoint routing engine, verified route geometry,
  live traffic or turn-by-turn guidance has been implemented.

## Icons

- All application icons render from Google's **Material Icons** using the
  Expo-compatible `@expo/vector-icons/MaterialIcons` package.
- Semantic icon exports are centralized in `src/components/icons.tsx`;
  `lucide-react-native` has been removed.

## Limitations

- No production backend, authentication, route directions or road verification.
- Leaflet assets, OSM tiles and Overpass requests need internet connectivity.
  The editor is an interactive **conceptual sketch**, not a safety review or
  usable street-following route.
- OSM POIs are community-maintained. Presence in OSM does not verify that a
  cafe is operating, reachable, open, or participating in any offer.
- Route distance, duration, and elevation are illustrative values.
- Reports, community interests, posts, vouchers and partner statistics are
  local-only examples, not real-world transactions or shared public data.

### Additional resources

- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
