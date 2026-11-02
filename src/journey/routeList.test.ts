import test from 'node:test';
import assert from 'node:assert/strict';
import { findVisibleRouteGroup, groupCityRoutes } from './routeList';
import type { RouteCategory } from '../data/routeCategories';

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
