import test from 'node:test';
import assert from 'node:assert/strict';
import { bindFirstCity, claimFirstCityReward, completeFirstCityRoute, emptyFirstCityRewards, FIRST_CITY_REWARDS, FIRST_CITY_TOTAL_CENTS, formatRewardCents, observeFirstCityRewards, readFirstCityRewards, restoreFirstCityJourney, type FirstCityTaskId } from './firstCityRewards';
import { getJourneyCity } from './data';
import { getCityRouteSequence } from './routeList';
import { createDemoJourneyState, getRouteStatus } from './state';

const tokyo = getJourneyCity('tokyo')!;
const routes = getCityRouteSequence(tokyo).map(route => route.id);
const now = Date.parse('2026-11-04T12:00:00+08:00');

test('newcomer preview keeps eight Tokyo routes without crediting seeded progress as first-route reward', () => {
  const initial = emptyFirstCityRewards();
  const journey = restoreFirstCityJourney(initial);
  assert.equal(journey.currentCityId, 'tokyo');
  assert.equal(journey.completedRouteIdsByCity.tokyo.length, 8);
  const rewards = bindFirstCity(initial, journey.currentCityId, journey.completedRouteIdsByCity.tokyo);
  assert.deepEqual(observeFirstCityRewards(rewards, false, 'tokyo', []).achievedTaskIds, []);
  for (const id of ['activation','firstRoute','firstCity'] as const) assert.equal(claimFirstCityReward(rewards, id).success, false);
  const connected = observeFirstCityRewards(rewards, true, 'tokyo', []);
  assert.deepEqual(connected.achievedTaskIds, ['activation']);
  const ran = completeFirstCityRoute(connected, 'tokyo', routes[8]);
  assert.deepEqual(ran.achievedTaskIds, ['activation', 'firstRoute']);
  assert.equal(claimFirstCityReward(ran, 'firstCity').success, false);
});

test('three fixed rewards total exactly 500 cents', () => {
  assert.deepEqual(FIRST_CITY_REWARDS, { activation:80, firstRoute:160, firstCity:260 });
  assert.equal(FIRST_CITY_TOTAL_CENTS, 500);
  assert.equal(formatRewardCents(80), '¥0.80');
  assert.equal(formatRewardCents(160), '¥1.60');
  assert.equal(formatRewardCents(260), '¥2.60');
});

test('the prototype target is Tokyo at eight routes; other preset completed cities do not satisfy first-city task', () => {
  const journey = createDemoJourneyState();
  assert.ok(journey.completedCityIds.length > 0);
  const rewards = bindFirstCity(emptyFirstCityRewards(), journey.currentCityId, journey.completedRouteIdsByCity.tokyo);
  assert.equal(rewards.firstCityId, 'tokyo');
  assert.equal(rewards.completedRouteIds.length, 8);
  assert.ok(!rewards.achievedTaskIds.includes('firstRoute'));
  assert.ok(!rewards.achievedTaskIds.includes('firstCity'));
  assert.strictEqual(observeFirstCityRewards(rewards, false, 'beijing', getJourneyCity('beijing')!.routes.map(r => r.id)), rewards);
});

test('eight and nine routes cannot claim the city reward; ten unique routes unlock it', () => {
  let state = bindFirstCity(emptyFirstCityRewards(), 'tokyo', routes.slice(0,8));
  assert.equal(claimFirstCityReward(state, 'firstCity', now).success, false);
  state = observeFirstCityRewards(state, false, 'tokyo', [...routes.slice(0,8), routes[7], 'unknown']);
  assert.equal(state.completedRouteIds.length, 8);
  state = observeFirstCityRewards(state, false, 'tokyo', routes.slice(0,9));
  assert.equal(state.completedRouteIds.length, 9);
  assert.equal(claimFirstCityReward(state, 'firstCity', now).success, false);
  state = observeFirstCityRewards(state, false, 'tokyo', routes);
  assert.equal(claimFirstCityReward(state, 'firstCity', now).claim?.amountCents, 260);
  assert.strictEqual(observeFirstCityRewards(state, false, 'tokyo', routes), state);
});

test('each task pays only once, repeated callbacks and second cities cannot exceed five yuan', () => {
  let state = bindFirstCity(emptyFirstCityRewards(), 'tokyo', routes);
  state = observeFirstCityRewards(state, true, 'tokyo', routes);
  state = completeFirstCityRoute(state, 'tokyo', routes[0]);
  for (const id of ['activation','firstRoute','firstCity'] as const) {
    const result = claimFirstCityReward(state, id, now);
    assert.equal(result.success, true); state = result.state;
    const duplicate = claimFirstCityReward(state, id, now + 1);
    assert.equal(duplicate.success, false); assert.strictEqual(duplicate.state, state);
  }
  assert.strictEqual(bindFirstCity(state, 'paris'), state);
  assert.strictEqual(observeFirstCityRewards(state, true, 'paris', getJourneyCity('paris')!.routes.map(r => r.id)), state);
  assert.equal(state.claims.length, 3);
  assert.equal(state.claims.reduce((sum, record) => sum + record.amountCents, 0), 500);
  assert.equal(claimFirstCityReward(state, 'not-a-task' as FirstCityTaskId, now).success, false);
});

test('achievements survive disconnects, elapsed time and lower live progress after reload', () => {
  let state = bindFirstCity(emptyFirstCityRewards(), 'tokyo', routes);
  state = observeFirstCityRewards(state, true, 'tokyo', routes);
  state = readFirstCityRewards(JSON.stringify(state));
  assert.strictEqual(observeFirstCityRewards(state, false, 'tokyo', []), state);
  assert.equal(claimFirstCityReward(state, 'activation', now + 40 * 86_400_000).success, true);
  assert.equal(claimFirstCityReward(state, 'firstCity', now + 40 * 86_400_000).success, true);
});

test('refresh restores first-city route progression rather than returning to the default eight routes', () => {
  const saved = readFirstCityRewards(JSON.stringify(bindFirstCity(emptyFirstCityRewards(), 'tokyo', routes.slice(0,9))));
  const journey = restoreFirstCityJourney(saved);
  assert.equal(journey.currentCityId, 'tokyo');
  assert.equal(journey.completedRouteIdsByCity.tokyo.length, 9);
  assert.equal(getRouteStatus(journey, 'tokyo', routes[9]), 'discoverable');
  const completed = restoreFirstCityJourney(observeFirstCityRewards(saved, true, 'tokyo', routes));
  assert.ok(completed.completedCityIds.includes('tokyo'));
  assert.equal(completed.completedRouteIdsByCity.tokyo.length, 10);
});

test('a different first selected city stays bound and does not inherit its preset completion', () => {
  const beijing = getJourneyCity('beijing')!;
  const ids = getCityRouteSequence(beijing).slice(0,8).map(r => r.id);
  const saved = bindFirstCity(emptyFirstCityRewards(), beijing.id, ids);
  const restored = restoreFirstCityJourney(saved);
  assert.equal(restored.currentCityId, 'beijing');
  assert.equal(restored.completedRouteIdsByCity.beijing.length, 8);
  assert.ok(!restored.completedCityIds.includes('beijing'));
  assert.strictEqual(bindFirstCity(saved, 'tokyo', routes), saved);
});

test('bad storage and tampered amounts cannot create extra rewards', () => {
  assert.deepEqual(readFirstCityRewards('broken'), emptyFirstCityRewards());
  const source = observeFirstCityRewards(bindFirstCity(emptyFirstCityRewards(), 'tokyo', routes), true, 'tokyo', routes);
  const valid = { taskId:'activation', amountCents:80, claimedAt:new Date(now).toISOString() };
  const saved = readFirstCityRewards(JSON.stringify({ ...source, completedRouteIds:[...routes, routes[0], 'bad'], claims:[valid, valid, {...valid, taskId:'firstRoute', amountCents:999}, {...valid,taskId:'missing'}, {...valid, taskId:'firstCity', amountCents:260, claimedAt:'invalid'}] }));
  assert.deepEqual(saved.claims, [valid]);
  assert.equal(saved.completedRouteIds.length, 10);
});

test('only valid completed routes in the bound city satisfy the first-route task, including reruns', () => {
  const state = bindFirstCity(emptyFirstCityRewards(), 'tokyo', routes.slice(0,8));
  assert.strictEqual(completeFirstCityRoute(state, 'paris', routes[0]), state);
  assert.strictEqual(completeFirstCityRoute(state, 'tokyo', 'unknown'), state);
  const next = completeFirstCityRoute(state, 'tokyo', routes[0]);
  assert.equal(next.completedRouteIds.length, 8);
  assert.ok(next.achievedTaskIds.includes('firstRoute'));
  assert.strictEqual(completeFirstCityRoute(next, 'tokyo', routes[0]), next);
  assert.equal(claimFirstCityReward(next, 'firstRoute', now).success, true);
});
