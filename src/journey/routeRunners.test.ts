import test from 'node:test';
import assert from 'node:assert/strict';
import { getRouteRunners } from '../data/routeRunners';

test('route list and detail share the existing prototype participant fixture', () => {
  const runners = getRouteRunners();
  assert.equal(runners.count, 29);
  assert.equal(runners.label, '29 人跑过');
  assert.equal(runners.avatars.length, 3);
});

test('real participant totals never inherit fake demo portraits', () => {
  assert.deepEqual(getRouteRunners(1890), { count: 1890, label: '1,890 人跑过', avatars: [] });
  assert.deepEqual(getRouteRunners(0, ['one.jpg']).avatars, []);
  assert.deepEqual(getRouteRunners(1, ['one.jpg', 'two.jpg']).avatars, ['one.jpg']);
  assert.equal(getRouteRunners(200, ['1', '2', '3', '4']).avatars.length, 3);
});

test('invalid participant totals remain safe and non-negative', () => {
  for (const count of [-1, NaN, Infinity]) assert.equal(getRouteRunners(count).count, 0);
  assert.equal(getRouteRunners(2.8).count, 2);
});
