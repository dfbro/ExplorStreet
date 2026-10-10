import assert from 'node:assert/strict';
import {test} from 'node:test';

import {roadRouteGeometry,straightLineKm} from '../src/features/map/route-sketch.ts';
import {parseOverpassResponse} from '../src/features/map/cafe-parser.ts';
import {buildExplorerDocument} from '../src/features/map/explorer-document.ts';
import {roadRouteData} from '../src/features/map/road-route-data.ts';

test('all six route IDs use static road-graph geometries rather than random polygons',()=>{
 assert.equal(Object.keys(roadRouteData).length,6);
 for(const id of Object.keys(roadRouteData)){
  const route=roadRouteGeometry(id);
  assert.equal(route.source,'osm-road-graph',id);
  assert.ok(route.profile==='foot'||route.profile==='bike',id);
  assert.ok(route.points.length>=50,id);
  assert.ok(new Set(route.points.map(point=>point.join(','))).size>=35,id);
  assert.ok(straightLineKm(route.points)>route.distanceKm*.88,id);
  assert.ok(straightLineKm(route.points)<route.distanceKm*1.015,id);
 }
 assert.equal(straightLineKm([[-7.97,112.62]]),0);
});
test('unknown route has no fabricated fallback route',()=>{
 assert.deepEqual(roadRouteGeometry('nonexistent'),{source:'none',points:[]});
 assert.deepEqual(roadRouteGeometry(),{source:'none',points:[]});
});

test('parser accepts named OSM cafes in Malang and prevents duplicates',()=>{
 const cafe={type:'node',id:42,lat:-7.97,lon:112.62,tags:{amenity:'cafe',name:'Kafe Tercatat',website:'https://example.org'}};
 const other={type:'way',id:73,center:{lat:-7.96,lon:112.63},tags:{name:'Kafe Polygon','addr:street':'Jalan Contoh'}};
 const rows=parseOverpassResponse({elements:[cafe,cafe,other]});
 assert.equal(rows.length,2);
 assert.equal(rows[0].name,'Kafe Tercatat');
 assert.equal(rows[0].osmUrl,'https://www.openstreetmap.org/node/42');
 assert.equal(rows[1].id,'way/73');
 assert.equal(rows[1].address,'Jalan Contoh');
});

test('parser discards malformed data and coordinates outside Malang',()=>{
 assert.deepEqual(parseOverpassResponse(null),[]);
 assert.deepEqual(parseOverpassResponse({elements:[
  {type:'node',id:1,lat:2,lon:101,tags:{name:'Outside'}},
  {type:'node',id:2,lat:-7.96,lon:112.62,tags:{name:''}},
  {type:'node',id:3,lat:-7.97,lon:112.62,tags:null},
 ]}),[]);
});

test('Leaflet HTML identifies road route, Material location pins, OSM attribution and cafes',()=>{
 const html=buildExplorerDocument({area:'Ijen',latitude:-7.9728,longitude:112.6214,
  sketch:roadRouteGeometry('ijen-run').points,roadAligned:true,showSketch:true,cafes:[]});
 assert.match(html,/leaflet@1\.9\.4/);
 assert.match(html,/OpenStreetMap contributors/);
 assert.match(html,/Gambar konsep/);
 assert.match(html,/osm-road-graph/);
 assert.match(html,/viewBox=\"0 0 24 24\"/);
 assert.match(html,/OSRM foot\/bike/);
 assert.match(html,/__explorstreetMapReady/);
 assert.equal(html.includes('__EXPLORER_MAP_PAYLOAD__'),false);
});

test('untrusted OSM names cannot break out of script payload',()=>{
 const attack='</script><script>alert(1)</script>';
 const html=buildExplorerDocument({area:'Ijen',latitude:-7.9728,longitude:112.6214,
  sketch:[],showSketch:false,cafes:[{id:'node/17',name:attack,latitude:-7.97,
  longitude:112.62,osmUrl:'https://www.openstreetmap.org/node/17'}]});
 assert.equal(html.includes(attack),false);
 assert.ok(html.includes('\\u003c/script\\u003e'));
 assert.match(html,/textContent=cafe\.name/);
});

test('checkpoint map offers distinct category location glyphs and promo draft badge',()=>{
 const checkpoint={
  id:'shop-1',name:'Toko simulasi',kind:'store',coordinates:[112.6214,-7.9728],
  promoted:true,promoText:'Diskon draft',notes:'Belum diverifikasi',verification:'unverified'
 };
 const html=buildExplorerDocument({area:'Ijen',latitude:-7.9728,longitude:112.6214,
  sketch:[],showSketch:false,cafes:[],editorMode:true,editorCheckpoints:[checkpoint]});
 assert.match(html,/checkpoint-pin--promoted/);
 assert.match(html,/promo-badge/);
 assert.match(html,/checkpointIcon\(kind,promoted\)/);
 assert.match(html,/store:\{/);
 assert.match(html,/cafe:\{/);
 assert.match(html,/rest:\{/);
 assert.match(html,/Toko simulasi/);
 assert.match(html,/Promosi draft, belum diverifikasi/);
});

test('checkpoint names and promo descriptions are embedded safely',()=>{
 const attack='</script><script>alert(123)</script>';
 const html=buildExplorerDocument({area:'Ijen',latitude:-7.9728,longitude:112.6214,
  sketch:[],showSketch:false,cafes:[],editorMode:true,editorCheckpoints:[{
   id:'shop-2',name:attack,kind:'store',coordinates:[112.6214,-7.9728],
   promoted:true,promoText:attack,notes:attack,verification:'unverified'
  }]});
 assert.equal(html.includes(attack),false);
 assert.ok(html.includes('\\u003c/script\\u003e'));
 assert.match(html,/promo\.textContent/);
 assert.match(html,/name\.textContent/);
});
