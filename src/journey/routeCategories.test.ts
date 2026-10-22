import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEY_CITIES } from './data';
import { getRouteCategory, ROUTE_CATEGORIES } from '../data/routeCategories';

test('every city route has an explicitly configured category', () => {
  const validCategories = new Set(['自然类', '历史类', '文化类', '生活类']);
  for (const city of JOURNEY_CITIES) {
    assert.equal(ROUTE_CATEGORIES[city.name]?.length, city.routes.length, city.name);
    for (const route of city.routes) {
      assert.ok(validCategories.has(getRouteCategory(city.name, route.order)), route.name);
    }
  }
});

test('categories reflect landmarks rather than a repeated route-number pattern', () => {
  assert.equal(getRouteCategory('东京', 1), '历史类');
  assert.equal(getRouteCategory('东京', 2), '自然类');
  assert.equal(getRouteCategory('东京', 6), '生活类');
  assert.equal(getRouteCategory('东京', 7), '文化类');
  assert.equal(getRouteCategory('悉尼', 6), '自然类');
  assert.equal(getRouteCategory('巴黎', 1), '文化类');
});
