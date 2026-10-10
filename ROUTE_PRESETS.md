# ExplorStreet JSON Presets — version 1

The **Studio Rute** screen is available at `/studio`. Use the button on
the route-search home, a route's detail screen or Pit-stop to open it.

## Export and import

1. In Studio Rute, choose the activity, area and route title.
2. Tap the map to place **at least two** custom route points. The shown
   distance is a Haversine sum between adjacent points, **not a road-network
   distance** or confirmed safe running/biking route.
3. Select **Tandai checkpoint** on the map, tap the desired point, fill in
   the place name and category (cafe, store, rest), and optionally mark
   `promoted` as a **draft** with `promoText`. The promotion is not an
   endorsed business agreement.
4. Click **Ekspor rute (.json)** and **Ekspor checkpoint (.json)**.
   Web downloads two JSON files. On Android, each file is prepared locally
   and opened with the native share sheet (not a cloud upload).
5. You can paste either JSON document in **Import JSON untuk diedit**.
   Import the route first; then import the checkpoints with a matching
   `routeId`. Any missing or malformed document is rejected.
6. Drafts are stored in AsyncStorage on the local device; app backend and
   cloud sync are not available.

## Route schema

```json
{
  "schema": "explorstreet.route",
  "version": 1,
  "id": "draft-example",
  "title": "Nama contoh",
  "area": "Ijen",
  "activity": "run",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [112.6214, -7.9728],
      [112.6220, -7.9718]
    ]
  },
  "distance": {
    "estimatedKm": 0.13,
    "method": "straight-segment-haversine",
    "roadSnapped": false
  },
  "verification": "unverified"
}
```

The coordinates follow **GeoJSON order**: longitude first, latitude
second. Distance will be **recomputed on import**, so the illustrative
distance above need not be exact. At least 2 and at most 120 coordinates
are allowed. Only `run` or `bike` activity is supported.

## Checkpoint / store schema

```json
{
  "schema": "explorstreet.checkpoints",
  "version": 1,
  "routeId": "draft-example",
  "checkpoints": [
    {
      "id": "stop-example",
      "name": "Tempat contoh (bukan bisnis nyata)",
      "kind": "cafe",
      "coordinates": [112.6220, -7.9718],
      "promoted": false,
      "promoText": "",
      "notes": "Titik rehat contoh",
      "verification": "unverified"
    }
  ]
}
```

`kind` may be `cafe`, `store`, or `rest`; `promoted` is a boolean
draft marker. `promoText` is always user-authored and does not authorize
a live commercial offer. Checkpoint coordinates are manually chosen,
not independently verified addresses. A route may have 0-50 checkpoints.

### Marker design

All default and Studio checkpoint markers are **Material-style location pins**
with an interior category symbol, rather than generic ovals:
`store` uses a blue storefront, `cafe` uses a brown coffee cup,
and `rest` uses a green bench. A `promoted:true` checkpoint retains its
category glyph and receives a small amber **star badge**. The badge means
**promotion draft only**, not verified business participation, discounts,
opening hours, or paid placement. Popup text explicitly communicates
the unverified status. Blue storefront and brown coffee pins are distinct
from the existing OpenStreetMap cafe markers.

## Default preset manifest (awaiting user-supplied JSON)

`src/features/map/presets/manifest.json` has two arrays:

```json
{"routes":[],"checkpointSets":[]}
```

Both arrays are intentionally empty until actual route and store JSON
files are supplied. When the user sends exported files for Ijen and
other areas, validate each document and add them to the manifest.
Checkpoint documents must reference an existing route ID. A route ID
is unique, and one checkpoint document may be attached to each route.

The app's `getDefaultPresets()` validates entries. When populated,
Studio will show the route presets to edit; Pit-stop will show the
matching checkpoint pins by area. Pins use a distinct color and the
app does not claim their location, opening hours or promotion terms
are verified. The existing six route cards are still the old demo
catalog until replacement routes are approved and integrated.
There is **no fabricated default promoted cafe**.

A new preset import should receive its **own Git commit** after the
unit tests, visual screenshots at mobile widths, and route/marker
behavior are revalidated.

## Validation and QA

- `npm run test:editor`
- `npm run test:routes`
- `npm run test:map`
- `npx tsc --noEmit`
- `npm run lint`
- `npx expo-doctor`

Important limitations: the editor does not road-snap handmade lines,
track GPS, guarantee physical access, or confirm road safety.
Do not mark private homes, private individuals, or inaccessible
locations as publicly promoted stops.
