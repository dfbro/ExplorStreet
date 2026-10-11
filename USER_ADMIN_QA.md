# User/Admin local mode and Ijen override QA — 2026-10-11

## Feature scope

- **User mode**: route search, details, bookmarks, User Studio at `/studio`.
  User Studio saves route and checkpoint data into shared device storage,
  without JSON controls or any promoted-flag editing controls.
- **Admin mode**: top-right mode toggle routes to `/admin`. Admin Studio
  loads a stored preset, supports manual checkpoint placement and editing,
  promotional **draft** flags/offer copy, JSON import/export and local save.
  The partner dashboard is also Admin-only in the prototype UI.
- Both use `explorstreet.shared-presets.v1` in AsyncStorage; the provider
  validates schema, version, route uniqueness, and checkpoint/route links
  before loading. Each mode has its own unsaved editor draft key.
- This is **UI separation, not authentication**. There is no backend,
  cross-device publishing, protected server or verified merchant program.
- Switching modes immediately reuses the shared data in search, map and
  Pit-stop. Promoted badge/offer remains labelled as an unverified draft.
- User edits to managed presets generate personal `user-*` copies, rather
  than overwriting Admin's published Ijen preset. Admin can delete a
  personal user copy from local storage.

## Ijen migration

- User-authored manifest route and checkpoint are normalized from the
  archived source files to the existing `ijen-run` ID with title
  **Ijen Morning Loop**.
- Original ten sketch vertices, 3.553 km Haversine estimate and
  checkpoint `Warung bakso Mas Aji` are preserved.
- Previous Ijen road-graph preview is **replaced**, not appended; six total
  sample/catalog routes remain, of which five use cached OSRM geometry.
- Existing `draft-1791640851016` bookmarks are migrated to `ijen-run`.
- No road snapping, elevation, timing or cafe promotion has been invented.
- The whole route card opens details, while bookmark is an independent
  sibling control (no nested buttons / accidental navigation).

## Browser interaction QA

Tested using the **visible Edge browser** on the Fedora workstation and
real Expo web app at `http://localhost:8084`.

- Click route card → `/routes/ijen-run`: verified.
- Click bookmark → no navigation: verified.
- User → Admin through header switch: verified.
- Admin has JSON import/export, user does not: verified.
- Admin toggles Ijen checkpoint `promoted`, saves: verified.
- User Pit-stop sees promoted draft and persists after reload: verified.
- Admin restores non-promoted state: verified.
- User Studio shows `Simpan rute ke perangkat`, no JSON and no promoted
  checkbox: verified.
- User saves an editable personal copy of Ijen; search shows that copy
  without deleting/overwriting `ijen-run`: verified.
- Admin removes the test personal copy; a dedicated diagnostic confirmed
  deletion and returned the test environment to User.
- Initial automated QA script had one premature assertion looking for the
  cafe before selecting a saved route (27/28 assertions passed), and the
  personal-copy script required navigation to Admin before its deletion
  assertion (7/8 passed; dedicated diagnostic confirmed deletion). These
  were **test-sequencing mistakes**, not failures in the saved data.

Mobile layouts checked in Edge at **320×720, 390×844, 428×926** CSS px.
No horizontal overflow and the switch remained inside viewport.
Visual screenshots and results are outside the repo under
`~/workspace/AI/.browser-use/explorstreet-qa/`, notably:
- `user-admin-final-320-home.png`
- `user-admin-final-320-admin.png`
- `user-admin-user-studio.png`
- `user-admin-user-pitstop-promoted.png`
- `user-admin-tests.json`, `user-admin-final-layout.json`

## Checks and limitations

Run:
```fish
npx tsc --noEmit
npm run lint
npm run test:routes
npm run test:map
npm run test:editor
npx expo-doctor
```

A native Android build and actual device share/persistence test have
**not** been performed. Map and route coordinates remain user-created,
unverified data. Do not treat the promoted flag as an authorized offer.
