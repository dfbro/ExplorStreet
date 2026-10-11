import assert from 'node:assert/strict';
import { test } from 'node:test';
import { routeRepository,buildRouteCatalog } from '../src/features/routes/repository.ts';
import {getDefaultPresets} from '../src/features/map/presets.ts';
import {makeRouteJson} from '../src/features/map/editor-json.ts';
import { rankRoutes } from '../src/features/routes/ranking.ts';
import { parseCustomDistance } from '../src/features/routes/custom-distance.ts';

const routes = await routeRepository.list();
const baseline = {
  sport: 'run',
  distance: 'all',
  weights: { quiet: 3, flat: 2, stops: 1 },
  query: '',
  savedOnly: false,
};

test('Ijen Morning Loop replaces the old demo, without duplicate cards', () => {
  assert.equal(routes.length, 6);
  assert.equal(new Set(routes.map((route) => route.id)).size, 6);
  assert.equal(routes.filter(route=>route.verification==='sample').length,5);
  const ijen=routes.find(route=>route.bundledDefault);
  assert.equal(ijen.id,'ijen-run');
  assert.equal(ijen.name,'Ijen Morning Loop');
  assert.equal(ijen.area,'Ijen');
  assert.equal(ijen.sport,'run');
  assert.equal(ijen.distanceKm,3.553);
  assert.equal(ijen.durationMin,undefined);
  assert.equal(ijen.ascentM,undefined);
  assert.equal(ijen.verification,'unverified');
});
test('shared storage route updates override existing IDs and add independent user copies',()=>{
 const base=getDefaultPresets().routes;
 const copy=makeRouteJson({id:'user-123',title:'Ijen Morning Loop (versiku)',area:'Ijen',
  activity:'run',coordinates:[[112.6217,-7.972],[112.624,-7.974]]});
 const catalog=buildRouteCatalog([...base,copy]);
 assert.equal(catalog.filter(x=>x.id==='ijen-run').length,1);
 assert.equal(catalog.filter(x=>x.id==='user-123').length,1);
 assert.equal(catalog.length,7);
 assert.equal(catalog.find(x=>x.id==='user-123')?.verification,'unverified');
 assert.equal(catalog.find(x=>x.id==='user-123')?.manualSketch,true);
 assert.equal(catalog.find(x=>x.id==='user-123')?.bundledDefault,false);
 assert.equal(catalog.find(x=>x.id==='ijen-run')?.name,'Ijen Morning Loop');
});

test('filters activity and recommends quiet routes first', () => {
  const result = rankRoutes(routes, baseline, new Set());
  assert.equal(result.length, 3);
  assert.ok(result.every((route) => route.sport === 'run'));
  assert.equal(result[0].id, 'ijen-run');
});

test('distance filter is a real filter, not just a sort hint', () => {
  assert.deepEqual(
    rankRoutes(routes, { ...baseline, distance: 'short' }, new Set()).map((route) => route.id),
    ['ijen-run', 'kayu-run'],
  );
  assert.equal(rankRoutes(routes, { ...baseline, distance: 'long' }, new Set()).length, 1);
  assert.equal(rankRoutes(routes, { ...baseline, sport: 'bike', distance: 'long' }, new Set()).length, 3);
});

test('saved mode includes favorites of either activity', () => {
  const saved = rankRoutes(
    routes, { ...baseline, savedOnly: true, distance: 'short' },
    new Set(['ijen-run', 'blimbing-bike']),
  );
  assert.deepEqual(new Set(saved.map((route) => route.id)), new Set(['ijen-run', 'blimbing-bike']));
});

test('search filters by area and name without changing inputs', () => {
  const query = rankRoutes(routes, { ...baseline, query: 'kayutangan' }, new Set());
  assert.deepEqual(query.map((route) => route.id), ['kayu-run']);
  assert.equal(routes.length, 6);
});

test('unknown route resolves to null', async () => {
  assert.equal(await routeRepository.find('does-not-exist'), null);
});

test('custom distance constrains results inclusively and allows one-sided limits', () => {
 const custom = rankRoutes(routes,{...baseline,distance:'custom',minKm:3.5,maxKm:4},new Set());
 assert.deepEqual(custom.map(route=>route.id),['ijen-run']);
 assert.equal(rankRoutes(routes,{...baseline,distance:'custom',minKm:7,maxKm:null},new Set()).length,1);
 assert.equal(rankRoutes(routes,{...baseline,distance:'custom',minKm:null,maxKm:3.5},new Set()).length,1);
});

test('selected area reorders suggestions without inventing GPS location', () => {
 const selected=rankRoutes(routes,{...baseline,area:'Kayutangan'},new Set());
 assert.equal(selected[0].area,'Kayutangan');
 assert.equal(selected.length,3);
});

test('custom distance input validates range, decimals, and blank bounds', () => {
 assert.deepEqual(parseCustomDistance('3,5','8'),{ok:true,minKm:3.5,maxKm:8});
 assert.deepEqual(parseCustomDistance('','6'),{ok:true,minKm:null,maxKm:6});
 assert.equal(parseCustomDistance('','').ok,false);
 assert.equal(parseCustomDistance('9','3').ok,false);
 assert.equal(parseCustomDistance('-1','5').ok,false);
 assert.equal(parseCustomDistance('abc','5').ok,false);
 assert.equal(parseCustomDistance('1','101').ok,false);
});
