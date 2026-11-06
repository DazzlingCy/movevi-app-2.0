import assert from 'node:assert/strict';
import test from 'node:test';
import { hasPublishedCityRoutes } from './data';
import { getDailyRouteRecommendations } from './routeRecommendations';
import { createDemoJourneyState, getCityStatus } from './state';

const state = createDemoJourneyState();
const day = '2026-11-05';

test('each day selects five different published cities with a route from each', () => {
  const picks = getDailyRouteRecommendations(day);
  assert.equal(picks.length, 5);
  assert.equal(new Set(picks.map(({ city }) => city.id)).size, 5);
  assert.ok(picks.every(({ city, route }) => hasPublishedCityRoutes(city.id) && city.routes.includes(route)));
  assert.deepEqual(picks, getDailyRouteRecommendations(day));
  assert.notDeepEqual(picks, getDailyRouteRecommendations('2026-11-06'));
});

test('daily recommendations include published cities outside the current journey', () => {
  const picks = getDailyRouteRecommendations(day);
  assert.ok(picks.some(({ city }) => ['candidate', 'locked'].includes(getCityStatus(state, city.id))));
});
