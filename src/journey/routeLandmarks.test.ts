import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEY_CITIES } from './data';

test('every route contains three distinct landmarks and a matching introduction', () => {
  for (const city of JOURNEY_CITIES) {
    for (const route of city.routes) {
      assert.equal(route.landmarks.length, 3, route.name);
      assert.equal(new Set(route.landmarks).size, 3, route.name);
      for (const landmark of route.landmarks) {
        assert.ok(route.description.includes(landmark), route.name);
      }
    }
  }
});

test('Seine loop preserves existing landmarks and appends a third', () => {
  const route = JOURNEY_CITIES.find(city => city.id === 'paris')!.routes[9];
  assert.deepEqual(route.landmarks, ['塞纳河环线', '卢浮宫', '塞纳河左岸']);
});
