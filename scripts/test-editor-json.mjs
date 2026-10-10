import assert from 'node:assert/strict';
import {test} from 'node:test';
import {makeRouteJson,makeCheckpointJson,validateRouteJson,parseEditorJson,jsonText,estimateSketchKm} from '../src/features/map/editor-json.ts';

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
