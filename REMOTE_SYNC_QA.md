# Remote integration QA — 2026-10-10

## Integration provenance

- Repository: `~/workspace/ExplorStreet`, branch `master`.
- Remote: `origin/master` from `https://github.com/dfbro/ExplorStreet`.
- Previous remote commit: `a02e12e`.
- New remote commit fetched: `f1cbdbe` — `fix: make bottom navigation sticky`.
- Local pre-sync commit: `d5deac8`.
- Rollback branch created **before** integrating:
  `backup/pre-remote-sync-20261010` → `d5deac8`.
- Non-fast-forward merge: `ff25fbb`, merges remote changes
  **without rewriting** the four local feature commits.
- No Git conflict occurred, and this integration has **not been pushed**
  to GitHub. Push only on the user's request.

## Feature reconciliation

The remote commit modifies:
- `src/components/app-nav.tsx`: bottom tab bar is positioned
  absolutely at the bottom edge within its app screen.
- `src/components/app-page.tsx`: shared pages reserve additional
  bottom scroll padding so the last content isn't obscured.
- `src/screens/route-search.tsx`: search home reserves more padding
  for the fixed bottom bar.

Local feature commits preserved:
- `30a21b9` — versioned route/checkpoint JSON model and validation
- `b317d29` — Studio Rute editor, distance estimate, export and import
- `3b1fd78` — default preset manifest
- `d5deac8` — category-specific checkpoint pins and promoted-draft badge

The Studio Rute route `/studio` is a Stack screen and retains its
own header/back navigation; the five-tab bottom bar belongs to
Rute, Navigasi, Buddy, Pit-stop and Feed.

## Visual QA — real Edge browser window

Used `~/workspace/AI/.bin/explorstreet-browser-visible`
(visible Fedora Niri Edge session; isolated CDP port 9344).

- Screens: home (`/`), Pit-stop (`/stops`), Feed (`/feed`),
  Navigasi (`/nav`).
- Viewports: **280×720, 320×780, 390×844, 428×926**.
- Inspected top, middle and end scroll positions: **48 combinations**.
- In all cases: 5 tabs visible, bottom of tab bar aligned with
  viewport bottom, zero horizontal overflow.
- At the end of every scroll, the last visible text is **above**
  the tab bar; additional scroll padding prevents overlap.
- Verified all 4 tab transitions and sticky placement while navigating.
  Functional follow-up passed **13/13** assertions.
- After merge, Studio Rute map initializes and both JSON export
  actions remain present. Screenshot checked.

Evidence in
`~/workspace/AI/.browser-use/explorstreet-qa/`:
- `git-merge-sticky-qa.json`
- `git-merge-sticky-{home,stops,feed,nav}-{320,390}-{top,middle,end}.png`
- `git-merge-interactions.json`
- `git-merge-studio-390.png`

## Code and dependency validation

- TypeScript: pass.
- ESLint: pass.
- Route tests: **9/9**.
- Map tests: **8/8**.
- Editor/JSON tests: **6/6**.
- Expo Doctor: **21/21**.
- Local Expo Metro remains in attachable tmux session
  `explorstreet-dev`; web preview on port 8084 returns HTTP 200.

Android native build was not run. Actual device safe area behavior
and keyboard overlays still require a device test.
