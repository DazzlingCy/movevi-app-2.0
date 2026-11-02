import test from 'node:test';
import assert from 'node:assert/strict';
import { findVisibleRouteGroup, getCityRouteSequence, groupCityRoutes } from './routeList';
import { getRouteCategory, type RouteCategory } from '../data/routeCategories';
import { JOURNEY_CITIES } from './data';

test('journey sequence exactly matches the grouped list for every city without changing route IDs', () => {
  for (const city of JOURNEY_CITIES) {
    const original = city.routes.map(route => route.id);
    const groups = groupCityRoutes(city.routes.map(route => ({ route, category: getRouteCategory(city.name, route.order) })));
    assert.deepEqual(getCityRouteSequence(city), groups.flatMap(group => group.routes.map(item => item.route)));
    assert.deepEqual(city.routes.map(route => route.id), original);
  }
  assert.deepEqual(getCityRouteSequence(JOURNEY_CITIES.find(city => city.id === 'tokyo')!).map(route => route.order), [2,4,9,1,3,5,7,6,8,10]);
});

test('category groups show every route once and preserve original route order and identity',()=>{
  const types:RouteCategory[]=['生活类','自然类','历史类','自然类','文化类','历史类'];
  const routes=types.map((category,index)=>({category,routeId:index+1}));
  const original=JSON.stringify(routes),groups=groupCityRoutes(routes);
  assert.deepEqual(groups.map(group=>group.category),['自然类','历史类','文化类','生活类']);
  assert.deepEqual(groups.map(group=>group.routes.map(route=>route.routeId)),[[2,4],[3,6],[5],[1]]);
  assert.equal(new Set(groups.flatMap(group=>group.routes)).size,routes.length);
  assert.equal(JSON.stringify(routes),original);
});

test('empty categories do not create tabs or empty route sections',()=>{
  assert.deepEqual(groupCityRoutes([]),[]);
  const route={category:'文化类' as const,routeId:9};
  assert.deepEqual(groupCityRoutes([route]),[{category:'文化类',routes:[route]}]);
});

test('scroll highlight tracks the section below navigation and reaches the last short group',()=>{
  const sections=[{category:'自然类',top:100},{category:'历史类',top:500},{category:'文化类',top:900},{category:'生活类',top:1300}];
  assert.equal(findVisibleRouteGroup(sections,0),'自然类');
  assert.equal(findVisibleRouteGroup(sections,132),'自然类');
  assert.equal(findVisibleRouteGroup(sections,498),'历史类');
  assert.equal(findVisibleRouteGroup(sections,750),'历史类');
  assert.equal(findVisibleRouteGroup(sections,905),'文化类');
  assert.equal(findVisibleRouteGroup(sections,1100,true),'生活类');
  assert.equal(findVisibleRouteGroup([],132),null);
});
