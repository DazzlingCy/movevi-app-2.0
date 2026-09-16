import assert from 'node:assert/strict';
import test from 'node:test';
import { JOURNEY_CITIES } from './data';
import {
  createDemoJourneyState,
  getCandidateCityIds,
  getCityStatus,
  getCompletedRouteIds,
  getRouteStatus,
  journeyReducer,
  validateJourneyCatalogue
} from './state';
import type { JourneyState, RunResult } from './types';

const result: RunResult = { distanceKm: 5, durationSeconds: 2_100, calories: 320 };

const blankTokyoState = (): JourneyState => ({
  ...createDemoJourneyState(),
  completedCityIds: ['beijing', 'shanghai'],
  completedRouteIdsByCity: {
    beijing: createDemoJourneyState().completedRouteIdsByCity.beijing,
    shanghai: createDemoJourneyState().completedRouteIdsByCity.shanghai,
    tokyo: []
  },
  revealedRouteIdsByCity: {
    beijing: createDemoJourneyState().revealedRouteIdsByCity.beijing,
    shanghai: createDemoJourneyState().revealedRouteIdsByCity.shanghai,
    tokyo: []
  }
});

const revealAndComplete = (state: JourneyState, order: number) => {
  const routeId = JOURNEY_CITIES.find(city => city.id === 'tokyo')!.routes[order - 1].id;
  const revealed = journeyReducer(state, { type: 'REVEAL_ROUTE', cityId: 'tokyo', routeId });
  return journeyReducer(revealed, { type: 'COMPLETE_ROUTE', cityId: 'tokyo', routeId, result });
};

test('catalogue contains exactly 20 cities and 200 complete unique routes', () => {
  assert.deepEqual(validateJourneyCatalogue(), {
    cityCount: 20,
    uniqueCityCount: 20,
    routeCount: 200,
    uniqueRouteCount: 200,
    sequenceIsComplete: true,
    everyCityHasTenRoutes: true,
    everyRouteComplete: true
  });
});

test('demo state points to Beijing, Shanghai and Tokyo data', () => {
  const state = createDemoJourneyState();
  assert.equal(state.currentCityId, 'tokyo');
  assert.deepEqual(state.completedCityIds, ['beijing', 'shanghai']);
  assert.equal(getCompletedRouteIds(state, 'tokyo').length, 8);
  assert.equal(state.discoveredSpotKeys.length, 128);
});

test('routes open at 3, 6 and 10 thresholds in arbitrary order', () => {
  let state = blankTokyoState();
  const tokyo = JOURNEY_CITIES.find(city => city.id === 'tokyo')!;
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[2].id), 'discoverable');
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[3].id), 'locked');

  state = revealAndComplete(state, 3);
  state = revealAndComplete(state, 1);
  state = revealAndComplete(state, 2);
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[5].id), 'discoverable');
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[6].id), 'locked');

  state = revealAndComplete(state, 6);
  state = revealAndComplete(state, 4);
  state = revealAndComplete(state, 5);
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[6].id), 'discoverable');
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[7].id), 'locked');

  state = revealAndComplete(state, 7);
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[7].id), 'discoverable');
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[8].id), 'locked');

  state = revealAndComplete(state, 8);
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[8].id), 'discoverable');
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[9].id), 'locked');

  state = revealAndComplete(state, 9);
  assert.equal(getRouteStatus(state, 'tokyo', tokyo.routes[9].id), 'discoverable');
});

test('revealing an unknown route exposes it without completing it', () => {
  const state = createDemoJourneyState();
  const route = JOURNEY_CITIES.find(city => city.id === 'tokyo')!.routes[8];
  assert.equal(getRouteStatus(state, 'tokyo', route.id), 'discoverable');
  const next = journeyReducer(state, { type: 'REVEAL_ROUTE', cityId: 'tokyo', routeId: route.id });
  assert.equal(getRouteStatus(next, 'tokyo', route.id), 'revealed');
  assert.equal(getCompletedRouteIds(next, 'tokyo').length, 8);
});

test('repeated route completion is idempotent', () => {
  const initial = createDemoJourneyState();
  const route = JOURNEY_CITIES.find(city => city.id === 'tokyo')!.routes[0];
  const once = journeyReducer(initial, { type: 'COMPLETE_ROUTE', cityId: 'tokyo', routeId: route.id, result });
  const twice = journeyReducer(once, { type: 'COMPLETE_ROUTE', cityId: 'tokyo', routeId: route.id, result });
  assert.equal(getCompletedRouteIds(twice, 'tokyo').length, 8);
  assert.equal(twice.discoveredSpotKeys.length, initial.discoveredSpotKeys.length);
  assert.equal(twice.lastRun?.isFirstCompletion, false);
});

test('tenth route enters city completion and offers four expected candidates', () => {
  let state = createDemoJourneyState();
  state = revealAndComplete(state, 9);
  state = revealAndComplete(state, 10);
  assert.equal(state.currentPage, 'cityComplete');
  assert.ok(state.completedCityIds.includes('tokyo'));
  assert.equal(getCityStatus(state, 'tokyo'), 'completed');
  assert.deepEqual(getCandidateCityIds(state), ['paris', 'new-york', 'london', 'rome']);
});

test('selecting and arriving changes the unique current city with zero progress', () => {
  let state = createDemoJourneyState();
  state = revealAndComplete(state, 9);
  state = revealAndComplete(state, 10);
  state = journeyReducer(state, { type: 'SELECT_NEXT_CITY', cityId: 'paris' });
  assert.equal(state.currentPage, 'travel');
  state = journeyReducer(state, { type: 'ARRIVE_NEXT_CITY' });
  assert.equal(state.currentCityId, 'paris');
  assert.equal(getCompletedRouteIds(state, 'paris').length, 0);
  assert.equal(state.currentPage, 'home');
});
