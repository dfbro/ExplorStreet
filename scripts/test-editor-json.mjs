import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {makeRouteJson,makeCheckpointJson,validateRouteJson,parseEditorJson,jsonText,estimateSketchKm} from '../src/features/map/editor-json.ts';
import {validateCheckpointJson} from '../src/features/map/editor-json.ts';
import {getDefaultPresets,getRouteCheckpoints,getDefaultCheckpoints} from '../src/features/map/presets.ts';
import {roadRouteGeometry,straightLineKm} from '../src/features/map/route-sketch.ts';

const coords=[[112.6214,-7.9728],[112.6264,-7.9728],[112.6274,-7.9708]];
test('sketch length uses geographic segment lengths and is positive',()=>{
 assert.equal(estimateSketchKm([]),0);
 assert.equal(estimateSketchKm([coords[0]]),0);
 assert.ok(estimateSketchKm(coords)>0.6);
 assert.ok(estimateSketchKm(coords)<1.2);
});
test('route JSON is GeoJSON order and distance is recomputed on import',()=>{
 const route=makeRouteJson({id:'trial',title:'Ijen custom',area:'Ijen',activity:'run',coordinates:coords});
 assert.equal(route.schema,'explorstreet.route');
 assert.equal(route.geometry.coordinates[0][0],112.6214);
 const altered={...route,distance:{estimatedKm:50000,method:'road',roadSnapped:true}};
 const loaded=validateRouteJson(altered);
 assert.equal(loaded.distance.estimatedKm,route.distance.estimatedKm);
 assert.equal(loaded.distance.roadSnapped,false);
 assert.deepEqual(parseEditorJson(jsonText(route)),route);
});
test('reject invalid geometry and dangerously large payload',()=>{
 assert.throws(()=>makeRouteJson({id:'x',title:'',area:'Ijen',activity:'run',coordinates:coords}));
 assert.throws(()=>makeRouteJson({id:'x',title:'x',area:'Ijen',activity:'run',coordinates:[coords[0]]}));
 assert.throws(()=>makeRouteJson({id:'x',title:'x',area:'Ijen',activity:'run',coordinates:Array(121).fill(coords[0])}));
});
test('checkpoints export promotion data and reject malformed coordinate/name',()=>{
 const input={id:'stop-1',name:'Sample cafe',kind:'cafe',coordinates:coords[0],
  promoted:true,promoText:'Example only',notes:'Rest',verification:'unverified'};
 const data=makeCheckpointJson('trial',[input]);
 assert.equal(data.checkpoints[0].promoted,true);
 assert.deepEqual(parseEditorJson(jsonText(data)),data);
 assert.throws(()=>makeCheckpointJson('trial',[{...input,coordinates:[300,0]}]));
 assert.throws(()=>makeCheckpointJson('trial',[input,input]));
});
test('schema and version are enforced',()=>{
 assert.throws(()=>parseEditorJson('{}'));
 assert.throws(()=>parseEditorJson('not json'));
 assert.throws(()=>parseEditorJson('{"schema":"explorstreet.route","version":2}'));
});
test('default JSON manifest contains only valid, cross-referenced presets',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../src/features/map/presets/manifest.json',import.meta.url),'utf8'));
 assert.ok(Array.isArray(manifest.routes));
 assert.ok(Array.isArray(manifest.checkpointSets));
 const routes=manifest.routes.map(validateRouteJson);
 const checkpoints=manifest.checkpointSets.map(validateCheckpointJson);
 const ids=routes.map(route=>route.id);
 assert.equal(new Set(ids).size,ids.length);
 assert.ok(checkpoints.every(spot=>ids.includes(spot.routeId)));
 assert.equal(new Set(checkpoints.map(spot=>spot.routeId)).size,checkpoints.length);
});
test('bundled Ijen default preserves both user-submitted documents',()=>{
 const presets=getDefaultPresets();
 assert.equal(presets.error,undefined);
 assert.equal(presets.routes.length,1);
 assert.equal(presets.checkpointSets.length,1);
 const route=presets.routes[0];
 const checkpointDoc=presets.checkpointSets[0];
 const sourceRoute=JSON.parse(readFileSync(new URL('../src/features/map/presets/source/ijen-default-route.json',import.meta.url),'utf8'));
 const sourceCheckpoints=JSON.parse(readFileSync(new URL('../src/features/map/presets/source/ijen-default-checkpoints.json',import.meta.url),'utf8'));
 assert.deepEqual(route,validateRouteJson(sourceRoute));
 assert.deepEqual(checkpointDoc,validateCheckpointJson(sourceCheckpoints));
 assert.equal(route.id,checkpointDoc.routeId);
 assert.equal(route.distance.roadSnapped,false);
 assert.equal(route.distance.estimatedKm,3.553);
 assert.equal(route.geometry.coordinates.length,10);
 assert.equal(checkpointDoc.checkpoints[0].name,'Warung bakso Mas Aji');
 assert.equal(checkpointDoc.checkpoints[0].promoted,false);
 assert.equal(checkpointDoc.checkpoints[0].verification,'unverified');
 assert.deepEqual(getRouteCheckpoints(route.id),checkpointDoc.checkpoints);
 assert.equal(getDefaultCheckpoints('Ijen').length,1);
 assert.equal(getDefaultCheckpoints('Kayutangan').length,0);
});
test('the imported route renders as an unsnapped manual sketch (longitude to latitude order)',()=>{
 const {points,source,distanceKm}=roadRouteGeometry('draft-1791640851016');
 assert.equal(source,'manual-sketch');
 assert.equal(distanceKm,3.553);
 assert.equal(points.length,10);
 assert.deepEqual(points[0],[-7.97207,112.621708]);
 assert.equal(Number(straightLineKm(points).toFixed(3)),3.553);
 assert.equal(roadRouteGeometry('ijen-run').source,'osm-road-graph');
});
