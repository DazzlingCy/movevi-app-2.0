import assert from 'node:assert/strict';
import test from 'node:test';
import { CITY_ROUTE_RELEASE_SCHEDULE, hasPublishedCityRoutes, JOURNEY_CITIES } from './data';
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
import { getCityRouteSequence } from './routeList';

const tokyoRoutes = () => getCityRouteSequence(JOURNEY_CITIES.find(city => city.id === 'tokyo')!);

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
  const routeId = tokyoRoutes()[order - 1].id;
  const revealed = journeyReducer(state, { type: 'REVEAL_ROUTE', cityId: 'tokyo', routeId });
  return journeyReducer(revealed, { type: 'COMPLETE_ROUTE', cityId: 'tokyo', routeId, result });
};

test('prototype journey starts selected city at 8/10 with five completed cities', () => {
  const state = createPrototypeJourneyState('paris');
  assert.equal(state.currentCityId, 'paris');
  assert.deepEqual(state.completedCityIds, ['beijing', 'shanghai', 'cairo', 'los-angeles', 'singapore']);
  assert.equal(getCompletedRouteIds(state, 'paris').length, 8);
  const routes = getCityRouteSequence(JOURNEY_CITIES.find(city => city.id === 'paris')!);
  assert.equal(getRouteStatus(state, 'paris', routes[8].id), 'discoverable');
  assert.equal(getRouteStatus(state, 'paris', routes[9].id), 'locked');
  state.completedCityIds.forEach(cityId => assert.equal(getCompletedRouteIds(state, cityId).length, 10));
  assert.ok(state.discoveredSpotKeys.length > 0);
  assert.equal(state.currentPage, 'home');
  assert.equal(getHomeJourneyCityIds(state)[0], 'paris');
});

test('home carousel starts at the current city and excludes other completed cities', () => {
  const freshShanghai = createPrototypeJourneyState('shanghai');
  const demo = createDemoJourneyState();
  for (const state of [freshShanghai, demo]) {
    const [first, ...remaining] = getHomeJourneyCityIds(state);
    assert.equal(first, state.currentCityId);
    assert.ok(remaining.every(cityId => getCityStatus(state, cityId) !== 'completed'));
  }
});

test('unpublished cities follow every route-ready city and never enter next-city candidates', () => {
  const demo = createDemoJourneyState();
  const homeCities = getHomeJourneyCityIds(demo);
  const unpublishedCityIds = Object.keys(CITY_ROUTE_RELEASE_SCHEDULE);

  assert.deepEqual(homeCities.slice(-unpublishedCityIds.length), ['toronto', 'hangzhou', 'xian']);
  assert.ok(homeCities.slice(0, -unpublishedCityIds.length).every(hasPublishedCityRoutes));
  assert.ok(getCandidateCityIds(demo, JOURNEY_CITIES.length).every(hasPublishedCityRoutes));
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
  assert.equal(getCompletedRouteIds(state, 'tokyo').length, 8);
  assert.equal(getRouteStatus(state, 'tokyo', tokyoRoutes()[8].id), 'discoverable');
  assert.equal(getRouteStatus(state, 'tokyo', tokyoRoutes()[9].id), 'locked');
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

test('routes unlock one at a time in visible category-list order', () => {
  let state = blankTokyoState();
  const routes = tokyoRoutes();
  for (let index = 0; index < routes.length; index += 1) {
    routes.forEach((route, routeIndex) => {
      assert.equal(getRouteStatus(state, 'tokyo', route.id),
        routeIndex < index ? 'completed' : routeIndex === index ? 'discoverable' : 'locked');
    });
    state = revealAndComplete(state, index + 1);
    assert.equal(getCompletedRouteIds(state, 'tokyo').length, index + 1);
    assert.equal(getRouteStatus(state, 'tokyo', routes[index].id), 'completed');
  }
  assert.ok(routes.every(route => getRouteStatus(state, 'tokyo', route.id) === 'completed'));
  assert.equal(state.currentPage, 'cityComplete');
});

test('all cities complete top to bottom with only the next displayed route available', () => {
  for (const city of JOURNEY_CITIES) {
    let state = createDemoJourneyState();
    state = { ...state, currentCityId: city.id, completedCityIds: [],
      completedRouteIdsByCity: { [city.id]: [] }, revealedRouteIdsByCity: { [city.id]: [] } };
    const routes = getCityRouteSequence(city);
    for (const [index, route] of routes.entries()) {
      assert.deepEqual(routes.map(item => getRouteStatus(state, city.id, item.id)), routes.map((_, i) =>
        i < index ? 'completed' : i === index ? 'discoverable' : 'locked'), city.name);
      if (routes[index + 1]) {
        const blocked = routes[index + 1].id;
        assert.strictEqual(journeyReducer(state, { type: 'REVEAL_ROUTE', cityId: city.id, routeId: blocked }), state);
        assert.strictEqual(journeyReducer(state, { type: 'COMPLETE_ROUTE', cityId: city.id, routeId: blocked, result }), state);
      }
      state = journeyReducer(state, { type: 'REVEAL_ROUTE', cityId: city.id, routeId: route.id });
      assert.equal(getRouteStatus(state, city.id, route.id), 'revealed');
      state = journeyReducer(state, { type: 'COMPLETE_ROUTE', cityId: city.id, routeId: route.id, result });
      assert.equal(getCompletedRouteIds(state, city.id).length, index + 1);
    }
    assert.ok(state.completedCityIds.includes(city.id));
  }
});

test('locked routes cannot be revealed or completed ahead of their predecessors', () => {
  const state = blankTokyoState();
  const route = tokyoRoutes()[2];
  assert.strictEqual(journeyReducer(state, { type: 'REVEAL_ROUTE', cityId: 'tokyo', routeId: route.id }), state);
  assert.strictEqual(journeyReducer(state, { type: 'COMPLETE_ROUTE', cityId: 'tokyo', routeId: route.id, result }), state);
  const stale = { ...state, revealedRouteIdsByCity: { ...state.revealedRouteIdsByCity, tokyo: [route.id] } };
  assert.equal(getRouteStatus(stale, 'tokyo', route.id), 'locked');
  assert.strictEqual(journeyReducer(stale, { type: 'COMPLETE_ROUTE', cityId: 'tokyo', routeId: route.id, result }), stale);
});

test('existing out-of-order completions are preserved without unlocking past gaps', () => {
  let state = blankTokyoState();
  const routes = tokyoRoutes();
  state = { ...state, completedRouteIdsByCity: { ...state.completedRouteIdsByCity, tokyo: [routes[2].id] } };
  assert.equal(getRouteStatus(state, 'tokyo', routes[0].id), 'discoverable');
  assert.equal(getRouteStatus(state, 'tokyo', routes[1].id), 'locked');
  assert.equal(getRouteStatus(state, 'tokyo', routes[2].id), 'completed');
  assert.equal(getRouteStatus(state, 'tokyo', routes[3].id), 'locked');
  state = revealAndComplete(state, 1);
  assert.equal(getRouteStatus(state, 'tokyo', routes[1].id), 'discoverable');
  assert.equal(getRouteStatus(state, 'tokyo', routes[3].id), 'locked');
  state = revealAndComplete(state, 2);
  assert.equal(getRouteStatus(state, 'tokyo', routes[3].id), 'discoverable');
});

test('revealing an unknown route exposes it without completing it', () => {
  const state = createDemoJourneyState();
  const route = tokyoRoutes()[8];
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

test('next-city selection accepts recommendations from later batches', () => {
  let state = createDemoJourneyState();
  state = revealAndComplete(state, 9);
  state = revealAndComplete(state, 10);
  assert.ok(!getCandidateCityIds(state).includes('berlin'));
  state = journeyReducer(state, { type: 'SELECT_NEXT_CITY', cityId: 'berlin' });
  assert.equal(state.pendingNextCityId, 'berlin');
  assert.equal(state.currentPage, 'travel');
});

test('background route completion marks a completed city without taking over activity navigation',()=>{
  let state=revealAndComplete(createDemoJourneyState(),9);
  state=journeyReducer(state,{type:'NAVIGATE',page:'home'});
  const route=tokyoRoutes()[9];
  state=journeyReducer(state,{type:'REVEAL_ROUTE',cityId:'tokyo',routeId:route.id});
  const next=journeyReducer(state,{type:'COMPLETE_ROUTE',cityId:'tokyo',routeId:route.id,result,background:true});
  assert.equal(next.currentPage,'home');assert.ok(next.completedCityIds.includes('tokyo'));
  assert.equal(getCompletedRouteIds(next,'tokyo').length,10);
});
