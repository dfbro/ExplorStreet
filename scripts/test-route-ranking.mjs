import assert from 'node:assert/strict';
import { test } from 'node:test';
import { routeRepository } from '../src/features/routes/repository.ts';
import { rankRoutes } from '../src/features/routes/ranking.ts';

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
