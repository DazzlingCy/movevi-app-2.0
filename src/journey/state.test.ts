import assert from 'node:assert/strict';
import test from 'node:test';
import { JOURNEY_CITIES } from './data';
import {
  createDemoJourneyState,
  createPrototypeJourneyState,
  getCandidateCityIds,
  getCityStatus,
  getCompletedRouteIds,
  getCountryLevelProgress,
  getHomeJourneyCityIds,
  getRouteStatus,
  journeyReducer,
  validateJourneyCatalogue
} from './state';
import type { JourneyState, RunResult } from './types';

const result: RunResult = { distanceKm: 5, durationSeconds: 2_100, calories: 320 };

const blankTokyoState = (): JourneyState => {
  const demo = createDemoJourneyState();
  return {
    ...demo,
    completedRouteIdsByCity: { ...demo.completedRouteIdsByCity, tokyo: [] },
    revealedRouteIdsByCity: { ...demo.revealedRouteIdsByCity, tokyo: [] }
  };
};

const revealAndComplete = (state: JourneyState, order: number) => {
  const routeId = JOURNEY_CITIES.find(city => city.id === 'tokyo')!.routes[order - 1].id;
  const revealed = journeyReducer(state, { type: 'REVEAL_ROUTE', cityId: 'tokyo', routeId });
  return journeyReducer(revealed, { type: 'COMPLETE_ROUTE', cityId: 'tokyo', routeId, result });
};

test('prototype journey starts selected city at 9/10 with five completed cities', () => {
  const state = createPrototypeJourneyState('paris');
  assert.equal(state.currentCityId, 'paris');
  assert.deepEqual(state.completedCityIds, ['beijing', 'shanghai', 'cairo', 'los-angeles', 'singapore']);
  assert.equal(getCompletedRouteIds(state, 'paris').length, 9);
  state.completedCityIds.forEach(cityId => assert.equal(getCompletedRouteIds(state, cityId).length, 10));
  assert.ok(state.discoveredSpotKeys.length > 0);
  assert.equal(state.currentPage, 'home');
  assert.equal(getHomeJourneyCityIds(state)[5], 'paris');
});

test('home journey order never places a locked city before the current city', () => {
  const freshShanghai = createPrototypeJourneyState('shanghai');
  assert.equal(getHomeJourneyCityIds(freshShanghai)[4], 'shanghai');
  assert.ok(getHomeJourneyCityIds(freshShanghai).slice(0, 4).every(cityId => getCityStatus(freshShanghai, cityId) === 'completed'));

  const demo = createDemoJourneyState();
  assert.deepEqual(getHomeJourneyCityIds(demo).slice(0, 6), ['beijing', 'shanghai', 'cairo', 'los-angeles', 'singapore', 'tokyo']);
});

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

test('every journey city maps to a three-digit country region code', () => {
  assert.ok(JOURNEY_CITIES.every(city => /^\d{3}$/.test(city.countryCode)));
  assert.equal(
    JOURNEY_CITIES.find(city => city.id === 'beijing')?.countryCode,
    JOURNEY_CITIES.find(city => city.id === 'shanghai')?.countryCode
  );
});

test('demo state completes five cities with Tokyo in progress', () => {
  const state = createDemoJourneyState();
  assert.equal(state.currentCityId, 'tokyo');
  assert.deepEqual(state.completedCityIds, ['beijing', 'shanghai', 'cairo', 'los-angeles', 'singapore']);
  state.completedCityIds.forEach(cityId => assert.equal(getCompletedRouteIds(state, cityId).length, 10));
  assert.equal(getCompletedRouteIds(state, 'tokyo').length, 9);
  assert.equal(state.discoveredSpotKeys.length, 128);
});

test('country level de-duplicates completed cities in the same country and caps at 195', () => {
  const fourCountries = createDemoJourneyState();
  assert.deepEqual(getCountryLevelProgress(fourCountries), {
    level: 4,
    completedCountries: 4,
    maxLevel: 195
  });

  const fiveCountries = { ...fourCountries, completedCityIds: [...fourCountries.completedCityIds, 'tokyo'] };
  assert.equal(getCountryLevelProgress(fiveCountries).level, 5);
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
  const route = JOURNEY_CITIES.find(city => city.id === 'tokyo')!.routes[9];
  assert.equal(getRouteStatus(state, 'tokyo', route.id), 'discoverable');
  const next = journeyReducer(state, { type: 'REVEAL_ROUTE', cityId: 'tokyo', routeId: route.id });
  assert.equal(getRouteStatus(next, 'tokyo', route.id), 'revealed');
  assert.equal(getCompletedRouteIds(next, 'tokyo').length, 9);
});

test('repeated route completion is idempotent', () => {
  const initial = createDemoJourneyState();
  const route = JOURNEY_CITIES.find(city => city.id === 'tokyo')!.routes[0];
  const once = journeyReducer(initial, { type: 'COMPLETE_ROUTE', cityId: 'tokyo', routeId: route.id, result });
  const twice = journeyReducer(once, { type: 'COMPLETE_ROUTE', cityId: 'tokyo', routeId: route.id, result });
  assert.equal(getCompletedRouteIds(twice, 'tokyo').length, 9);
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
