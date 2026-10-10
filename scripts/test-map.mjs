import assert from 'node:assert/strict';
import {test} from 'node:test';

import {demoSketch,straightLineKm} from '../src/features/map/route-sketch.ts';
import {parseOverpassResponse} from '../src/features/map/cafe-parser.ts';
import {buildExplorerDocument} from '../src/features/map/explorer-document.ts';

test('demo sketch remains an illustration with a closed loop',()=>{
 const route=demoSketch('Ijen','ijen-run');
 assert.equal(route.source,'illustration');
 assert.equal(route.points.length,5);
 assert.deepEqual(route.points[0],route.points[4]);
 assert.ok(straightLineKm(route.points)>0);
 assert.equal(straightLineKm([[-7.97,112.62]]),0);
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

test('Leaflet HTML identifies sketch, OSM attribution and cafes',()=>{
 const html=buildExplorerDocument({area:'Ijen',latitude:-7.9728,longitude:112.6214,
  sketch:demoSketch('Ijen','ijen-run').points,showSketch:true,cafes:[]});
 assert.match(html,/leaflet@1\.9\.4/);
 assert.match(html,/OpenStreetMap contributors/);
 assert.match(html,/Gambar sketsa/);
 assert.match(html,/Bukan petunjuk navigasi/);
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
