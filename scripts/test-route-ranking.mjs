import assert from 'node:assert/strict';
import { test } from 'node:test';
import { routeRepository } from '../src/features/routes/repository.ts';
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

test('demo repository returns six unique route records', () => {
  assert.equal(routes.length, 6);
  assert.equal(new Set(routes.map((route) => route.id)).size, 6);
  assert.ok(routes.every((route) => route.verification === 'sample'));
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
    ['kayu-run'],
  );
  assert.equal(rankRoutes(routes, { ...baseline, distance: 'long' }, new Set()).length, 0);
  assert.equal(rankRoutes(routes, { ...baseline, sport: 'bike', distance: 'long' }, new Set()).length, 2);
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
 const custom = rankRoutes(routes,{...baseline,distance:'custom',minKm:4,maxKm:6},new Set());
 assert.deepEqual(custom.map(route=>route.id),['ijen-run']);
 assert.equal(rankRoutes(routes,{...baseline,distance:'custom',minKm:7,maxKm:null},new Set()).length,0);
 assert.equal(rankRoutes(routes,{...baseline,distance:'custom',minKm:null,maxKm:4},new Set()).length,1);
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
