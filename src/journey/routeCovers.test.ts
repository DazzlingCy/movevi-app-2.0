import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEY_CITIES } from './data';
import { getRouteCover } from '../data/routeCovers';

test('every journey route has a distinct photographic cover and attribution', () => {
  for (const city of JOURNEY_CITIES) {
    const covers = city.routes.map(route => getRouteCover(city.name, route.order));
    assert.equal(new Set(covers.map(cover => cover?.src)).size, city.routes.length, `${city.name}: duplicate cover`);
    for (const cover of covers) {
      assert.ok(cover, `${city.name}: missing cover`);
      assert.match(cover.src, /^https:\/\//);
      assert.doesNotMatch(cover.src, /\.svg|logo|_map\./i);
      assert.ok(cover.credit);
      assert.ok(cover.license);
      assert.match(cover.source, /^https:\/\/commons.wikimedia.org\/wiki\/File:/);
      assert.match(cover.licenseUrl, /^https?:\/\//);
    }
  }
});

test('unknown cities and out-of-range routes do not reuse another route cover', () => {
  assert.equal(getRouteCover('未知城市', 1), undefined);
  assert.equal(getRouteCover('东京', 0), undefined);
  assert.equal(getRouteCover('东京', 11), undefined);
});
