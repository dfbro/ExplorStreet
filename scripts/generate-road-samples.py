#!/usr/bin/env python3
"""Refresh curated, road-graph-derived *sample* geometries.
Educational, noncommercial use of FOSSGIS OSRM demos; <= 1 request/sec.
Resulting geometries are still unverified in the field, not safety-rated.
"""
from __future__ import annotations
import json
import math
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROUTES = {
    "ijen-run": ("foot", [
        (-7.9728, 112.6214), (-7.9707, 112.6169), (-7.9669, 112.6190),
        (-7.9694, 112.6261), (-7.9742, 112.6245), (-7.9728, 112.6214),
    ]),
    "kayu-run": ("foot", [
        (-7.9788, 112.6308), (-7.9751, 112.6340),
        (-7.9724, 112.6317), (-7.9762, 112.6280), (-7.9788, 112.6308),
    ]),
    "sukun-run": ("foot", [
        (-7.9960, 112.6080), (-7.9990, 112.6020), (-7.9930, 112.6000),
        (-7.9900, 112.6080), (-7.9950, 112.6130), (-7.9960, 112.6080),
    ]),
    "lowok-bike": ("bike", [
        (-7.9480, 112.6140), (-7.9450, 112.6050), (-7.9360, 112.6040),
        (-7.9350, 112.6160), (-7.9410, 112.6230), (-7.9500, 112.6200),
        (-7.9480, 112.6140),
    ]),
    "blimbing-bike": ("bike", [
        (-7.9530, 112.6390), (-7.9500, 112.6320), (-7.9440, 112.6340),
        (-7.9420, 112.6450), (-7.9490, 112.6500), (-7.9530, 112.6390),
    ]),
    "ijen-bike": ("bike", [
        (-7.9728, 112.6214), (-7.9650, 112.6080), (-7.9560, 112.6080),
        (-7.9500, 112.6230), (-7.9610, 112.6330), (-7.9760, 112.6340),
        (-7.9728, 112.6214),
    ]),
}

def meters(a, b):
    lat1, lon1 = a
    lat2, lon2 = b
    k = math.pi / 180
    h = math.sin((lat2-lat1)*k/2)**2 + math.cos(lat1*k)*math.cos(lat2*k)*math.sin((lon2-lon1)*k/2)**2
    return 12742000*math.atan2(math.sqrt(h),math.sqrt(max(0,1-h)))

def simplify_route(points, tolerance_m=2.25):
    # Keep network waypoints where they bend meaningfully, without making
    # coarse shapes or fabricating new off-road segments.
    if len(points)<3: return points
    l, r=points[0], points[-1]
    xfactor=111195*math.cos(l[0]*math.pi/180)
    yfactor=111195
    x0,y0=l[1]*xfactor,l[0]*yfactor
    x1,y1=r[1]*xfactor,r[0]*yfactor
    max_dist=-1.0; index=0
    for i,pt in enumerate(points[1:-1],1):
        x,y=pt[1]*xfactor,pt[0]*yfactor
        vx,vy=x1-x0,y1-y0
        u=max(0,min(1,((x-x0)*vx+(y-y0)*vy)/max(1e-8,vx*vx+vy*vy)))
        dist=math.hypot(x-(x0+u*vx),y-(y0+u*vy))
        if dist>max_dist:max_dist,index=dist,i
    if max_dist>tolerance_m:
        a=simplify_route(points[:index+1],tolerance_m)
        b=simplify_route(points[index:],tolerance_m)
        return a[:-1]+b
    return [l,r]

all_results={}
for index,(route_id,(profile,anchors)) in enumerate(ROUTES.items()):
    coords=';'.join(f'{lon:.6f},{lat:.6f}' for lat,lon in anchors)
    url=(f'https://routing.openstreetmap.de/routed-{profile}/route/v1/driving/{coords}'
         '?overview=full&geometries=geojson&steps=false')
    request=urllib.request.Request(url,headers={
        'User-Agent':'ExplorStreetPrototype/0.1 (educational noncommercial data snapshot)',
        'Accept':'application/json',
    })
    with urllib.request.urlopen(request,timeout=35) as response:
        raw=json.load(response)
    if raw.get('code')!='Ok' or not raw.get('routes'):
        raise RuntimeError(f'{route_id} failed routing: {raw.get("code")}')
    route=raw['routes'][0]
    original=[(round(lat,6),round(lon,6)) for lon,lat in route['geometry']['coordinates']]
    # Snap distances must be reasonably near requested anchor points.
    snapped=[(wp['location'][1],wp['location'][0]) for wp in raw['waypoints']]
    max_snap=max(meters(a,b) for a,b in zip(anchors,snapped))
    if max_snap>200:
        raise RuntimeError(f'{route_id} nearest segment too far: {max_snap:.0f}m')
    selected=simplify_route(original)
    approx=sum(meters(x,y) for x,y in zip(selected,selected[1:]))
    true=route['distance']
    if true<=0 or true>35000 or len(original)<15 or approx/true < .88:
        raise RuntimeError(f'{route_id} seems invalid or severely simplified: {approx:.0f}/{true:.0f}m')
    all_results[route_id]={
        'profile':profile,
        'distanceKm':round(true/1000,2),
        'source':'FOSSGIS OSRM routed-'+profile,
        'points':[list(p) for p in selected],
    }
    print(f'{route_id}: {profile} {true/1000:.2f}km; {len(original)} raw -> {len(selected)} points; max snap {max_snap:.0f}m')
    if index<len(ROUTES)-1:time.sleep(1.2)

stamp=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
out=Path('src/features/map/road-route-data.ts')
header=f'''// Geometries computed from OSM road graph using FOSSGIS OSRM (snapshot {stamp}).
// Not surveyed: legal access, traffic conditions, obstructions and surfaces unverified.
// Data refresh script: scripts/generate-road-samples.py. Do not randomize.
export const roadRouteData = '''
out.write_text(header+json.dumps(all_results,ensure_ascii=False,separators=(',',':'))+' as const;\n',encoding='utf-8')
print('Wrote',out,out.stat().st_size,'bytes')
