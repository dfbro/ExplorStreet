# Mobile UI/UX QA — ExplorStreet

Date: 2026-10-10
Target: Android-size viewport previews; actual browser engine: Edge Beta / React Native Web under Expo Metro.
Native Android APK/build: **not executed**.

## Screenshot audit

The workspace's required Browser Use launcher was used at
`/home/wilhelm/workspace/AI/.bin/browser-use`. In a connector session
without DISPLAY, the wrapper now starts a headless Edge instance in its
dedicated `EdgeProfile` automatically. The user's ordinary browser profile
was not used.

- 390 × 844 CSS pixels: **7 screens × 3 scroll stages** before changes and
  again after changes (Jelajah, Navigasi, Buddy, Pit-stop, Feed, Partner,
  Detail). Each stage was captured as a PNG and scroll metrics were logged.
- 320 × 720 CSS pixels at DPR 2: 3 critical screens × 3 stages, followed by
  final screenshots of Jelajah and Navigasi after narrow-width fixes.
- Extra width checks: 320, 360, 390, 428 px; no horizontal page overflow.
- The fixed bottom navigation remained inside the viewport on all
  tab-based pages. Detail uses a native-style stack header.

Evidence is saved outside the repo under:
`~/workspace/AI/.browser-use/explorstreet-qa/`

## Issues fixed by visual inspection

1. **Route discovery priority:** the map came before filters and results.
   On phones, moved the OpenStreetMap preview *after* the route list and
   collapsed optional advanced priority controls by default.
2. **Live Nav discoverability:** six route chips and the map pushed playback
   controls below the fold. Introduced the expandable **Ganti** route selector
   and moved playback controls before the map.
3. **Pit-stop card density:** repeated large illustration/status labels
   wasted vertical space. Reduced card illustration height and simplified
   demo metadata.
4. **320px hero collision:** a decorative sun covered text when the headline
   wrapped. On narrow devices, use compact heading dimensions and omit
   the decorative sticker.
5. **Secondary action contrast:** `Checkpoint lanjut` blended with the
   pale playback panel at narrow widths. Secondary actions now have a
   distinct surface and border.

## Functional checks

The Browser Use interaction runner validated **32/32 cases** after the
changes, including:
- Material icon font and five primary tabs
- run/bike filtering
- opening the Nav route chooser and selecting a route
- advancing a checkpoint, creating a recap, and seeing it in Feed
- toggling Buddy interest
- viewing/closing a non-redeemable demo voucher
- creating a partner promo and seeing it in Pit-stop
- navigating from route detail to the simulator
- no horizontal overflow at 320, 360, and 428 px

Test log: `~/workspace/AI/.browser-use/explorstreet-qa/browser-qa.json`.
Additional source checks: TypeScript, ESLint, 6/6 route unit tests, and
Expo Doctor 21/21 all passed.

## Scope and remaining risks

This was **mobile-sized browser testing**, not physical Android testing.
Screen reader behavior, system navigation, keyboard/IME, Android WebView
map gestures, font rendering and performance still need device verification.

Map previews use official OpenStreetMap embed and show approximate area
reference pins, not surveyed routes, live traffic or turn-by-turn guidance.
Community, merchant and report workflows still store local demo data only.
Do not present demo metrics as customer visits, voucher redemptions or revenue.

The native build is intentionally left to the user. To inspect Expo logs:
`tmux attach -t explorstreet-dev`.
