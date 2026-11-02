import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEY_CITIES } from './data';
import { createPrototypeJourneyState, getCompletedRouteIds, getRouteStatus, journeyReducer } from './state';
import { getRouteCover } from '../data/routeCovers';
import {
  createPuzzle, currentPuzzle, drawPuzzle, drawsLeft, emptyPuzzleState,
  finishPuzzle, joinPuzzle, openPuzzleTeams, ownPieces, periodParticipation,
  puzzleComplete, readPuzzle, type PuzzlePiece, type PuzzleRoute, type PuzzleState,
} from './puzzleTeam';
import { weekendPeriod } from './weekendRelay';
import { createPuzzlePreviewSession, finishPuzzleDemoPartner, joinPuzzleDemoPartner } from './puzzleDemo';

const FRIDAY = Date.parse('2026-10-30T00:00:00+08:00');
const WEEK = 7 * 86400000;
function eligibleRoutes(cityId: string): PuzzleRoute[] {
  const city = JOURNEY_CITIES.find(item => item.id === cityId)!;
  const journey = createPrototypeJourneyState(city.id);
  return city.routes.filter(route => getRouteStatus(journey, city.id, route.id) !== 'locked').map(route => ({
    id: city.id, name: city.name, image: getRouteCover(city.name, route.order)!.src,
    routeId: route.id, routeIndex: route.order, title: route.name,
    distanceKm: route.distanceKm, minutes: route.durationMinutes,
  }));
}

test('current preview flow: create, simulated join, two own routes, explicit third partner route, then 2+1 draws',()=>{
  const routes=eligibleRoutes('tokyo'),session=createPuzzlePreviewSession([routes[0]],FRIDAY+3600000);
  let state=session.state,now=session.now;
  const team=()=>periodParticipation(state,weekendPeriod(now).id)!;
  const persist=(next:PuzzleState)=>{state=readPuzzle({getItem:()=>JSON.stringify(next)});};
  assert.equal(team(),undefined);
  persist(createPuzzle(state,routes[0],'preview-flow',now));
  assert.equal(team().members.length,1);assert.equal(drawsLeft(team()),0);
  assert.equal(drawPuzzle(state,team().id,'self','locked-draw',now,.5),state);
  const record=(index:number):PuzzlePiece=>({id:'preview-own-'+index,memberId:'self',slot:team().pieces.length,route:routes[index],startedAt:now,finishedAt:now,distanceKm:routes[index].distanceKm});
  assert.equal(finishPuzzle(state,team().id,record(0),now),state);
  assert.equal(createPuzzle(state,routes[0],'duplicate-team',now),state);
  assert.equal(joinPuzzle(state,openPuzzleTeams(state,now)[0].id,{id:'self',name:'你',joinedAt:now}),state);
  assert.equal(finishPuzzleDemoPartner(state,now,routes[2]),state,'partner completion requires a full team');
  now++;
  persist(joinPuzzleDemoPartner(state,now));
  assert.equal(team().members.length,2);assert.equal(team().members[1].name,'小林');
  assert.equal(joinPuzzleDemoPartner(state,now),state);
  for(let index=0;index<2;index++) {
    now++;const piece=record(index);persist(finishPuzzle(state,team().id,piece,now));
    assert.equal(team().pieces.length,index+1);
    assert.equal(ownPieces(team()).length,index+1);
    assert.equal(ownPieces(team(),'runner-0').length,0,'partner does not finish automatically');
    assert.equal(drawsLeft(team()),0);
    assert.equal(finishPuzzle(state,team().id,{...piece,id:'duplicate-'+index},now),state);
  }
  assert.equal(puzzleComplete(team()),false);
  now++;persist(finishPuzzleDemoPartner(state,now,routes[2]));
  assert.equal(puzzleComplete(team()),true);assert.equal(team().pieces.length,3);
  assert.equal(ownPieces(team(),'runner-0')[0].route.routeId,routes[2].routeId);
  assert.equal(drawsLeft(team()),2);assert.equal(drawsLeft(team(),'runner-0'),1);
  assert.equal(finishPuzzleDemoPartner(state,now,routes[2]),state);
  for(let index=0;index<2;index++) {
    now++;const id='preview-draw-'+index;persist(drawPuzzle(state,team().id,'self',id,now,.5));
    assert.equal(drawsLeft(team()),1-index);
    assert.equal(team().draws.filter(draw=>draw.memberId==='self').length,index+1);
    assert.equal(drawPuzzle(state,team().id,'self',id,now,.5),state);
    assert.equal(drawsLeft(team(),'runner-0'),1);
  }
  assert.equal(drawPuzzle(state,team().id,'self','excess-draw',now,.5),state);
  persist(drawPuzzle(state,team().id,'runner-0','partner-draw',++now,.5));
  assert.equal(drawsLeft(team(),'runner-0'),0);assert.equal(team().draws.length,3);
  assert.equal(drawPuzzle(state,team().id,'runner-0','partner-excess',now,.5),state);
  assert.equal(createPuzzle(state,routes[0],'repeat-after-draw',now),state);
  const restarted=createPuzzlePreviewSession([routes[0]],now);
  assert.equal(periodParticipation(restarted.state,weekendPeriod(restarted.now).id),undefined);
});

test('instant preview completions preserve route deduplication, personal quota and 2+1 draw allowances',()=>{
  const routes=eligibleRoutes('tokyo'),now=FRIDAY+3600000;
  let state=createPuzzle(emptyPuzzleState(),routes[0],'instant-preview',now);
  state=joinPuzzle(state,'instant-preview',{id:'peer',name:'搭子',joinedAt:now});
  const finish=(id:string,memberId:string,route:PuzzleRoute)=>finishPuzzle(state,'instant-preview',{
    id,memberId,slot:currentPuzzle(state)!.pieces.length,route,startedAt:now,finishedAt:now,distanceKm:route.distanceKm,
  },now);
  state=finish('first','self',routes[0]);
  assert.equal(ownPieces(currentPuzzle(state)!).length,1);
  assert.equal(drawsLeft(currentPuzzle(state)!),0);
  assert.equal(finish('repeat','self',routes[0]),state);
  state=finish('second','self',routes[1]);
  assert.equal(finish('over-quota','self',routes[2]),state);
  assert.equal(drawsLeft(currentPuzzle(state)!),0);
  assert.equal(finish('partner-repeat','peer',routes[0]),state);
  state=finish('third','peer',routes[2]);
  const restored=readPuzzle({getItem:()=>JSON.stringify(state)}),team=currentPuzzle(restored)!;
  assert.equal(puzzleComplete(team),true);
  assert.equal(drawsLeft(team,'self'),2);
  assert.equal(drawsLeft(team,'peer'),1);
});

test('a new city unlocks its next route through activity completion without leaving the activity page',()=>{
  let journey=createPrototypeJourneyState('tokyo');
  journey={...journey,completedRouteIdsByCity:{...journey.completedRouteIdsByCity,tokyo:[]},revealedRouteIdsByCity:{...journey.revealedRouteIdsByCity,tokyo:[]}};
  const city=JOURNEY_CITIES.find(c=>c.id==='tokyo')!;
  const toRoute=(index:number):PuzzleRoute=>({id:city.id,name:city.name,image:getRouteCover(city.name,index+1)!.src,routeId:city.routes[index].id,routeIndex:index+1,title:city.routes[index].name,distanceKm:city.routes[index].distanceKm,minutes:city.routes[index].durationMinutes});
  let now=FRIDAY+3600000,state=createPuzzle(emptyPuzzleState(),toRoute(0),'new-city',now);
  state=joinPuzzle(state,'new-city',{id:'peer',name:'搭子',joinedAt:now});
  for(let index=0;index<2;index++) {
    const route=toRoute(index);assert.equal(getRouteStatus(journey,city.id,route.routeId),'discoverable');
    journey=journeyReducer(journey,{type:'REVEAL_ROUTE',cityId:city.id,routeId:route.routeId});
    const startedAt=now;now+=route.minutes*60000;
    state=finishPuzzle(state,'new-city',{id:'self-'+index,memberId:'self',slot:index,route,startedAt,finishedAt:now,distanceKm:route.distanceKm},now);
    journey=journeyReducer(journey,{type:'COMPLETE_ROUTE',cityId:city.id,routeId:route.routeId,background:true,result:{distanceKm:route.distanceKm,durationSeconds:route.minutes*60,calories:200}});
    assert.equal(journey.currentPage,'home');
    assert.equal(getCompletedRouteIds(journey,city.id).length,index+1);
    assert.equal(getRouteStatus(journey,city.id,toRoute(index+1).routeId),'discoverable');
  }
  const route=toRoute(2);state=finishPuzzle(state,'new-city',{id:'peer-1',memberId:'peer',slot:2,route,startedAt:now,finishedAt:now+route.minutes*60000,distanceKm:route.distanceKm},now+route.minutes*60000);
  assert.equal(puzzleComplete(currentPuzzle(state)!),true);assert.equal(drawsLeft(currentPuzzle(state)!,'self'),2);assert.equal(drawsLeft(currentPuzzle(state)!,'peer'),1);
});

// Each transition is serialized and restored, just as leaving and reopening the
// prototype would do. No real browser data or prize service is touched.
for (const entry of ['create', 'join'] as const) {
  for (const myContribution of [1, 2] as const) {
    test(`complete persisted flow: ${entry}, my ${myContribution} routes, rewards 2+1`, () => {
      const routes = eligibleRoutes(entry === 'create' ? 'tokyo' : 'shanghai');
      const otherCityRoute = eligibleRoutes(entry === 'create' ? 'shanghai' : 'tokyo')[0];
      assert.ok(routes.length >= 2, 'use real unlocked/completed catalogue routes');
      let state = emptyPuzzleState();
      let now = FRIDAY + 3600000;
      let stored = '';
      let sequence = 0;
      const persist = (next: PuzzleState) => {
        stored = JSON.stringify(next);
        state = readPuzzle({ getItem: () => stored });
        assert.deepEqual(state, next, 'all progress must survive reopening');
      };
      const participant = (id: string) => ({ id, name: id === 'self' ? '你' : '跑友', joinedAt: now });
      const locked = (memberId = 'self') => {
        const before = state;
        assert.equal(createPuzzle(state, routes[0], `blocked-${sequence++}`, now, { id: memberId, name: memberId }), before);
        assert.equal(joinPuzzle(state, 'alternative', participant(memberId)), before);
        assert.equal(state.teams.filter(team => team.period.id === weekendPeriod(now).id && team.members.some(member => member.id === memberId)).length, 1);
      };
      persist(createPuzzle(state, routes[0], 'alternative', now, { id: 'another-host', name: '其他跑友' }));
      now += 1000;
      if (entry === 'create') {
        persist(createPuzzle(state, routes[0], 'activity', now));
        locked();
        assert.equal(currentPuzzle(state)?.members.length, 1);
        const premature: PuzzlePiece = { id: 'before-pair', memberId: 'self', slot: 0, route: routes[0], startedAt: now, finishedAt: now, distanceKm: routes[0].distanceKm };
        assert.equal(finishPuzzle(state, 'activity', premature, now), state);
        now += 1000;
        persist(joinPuzzle(state, 'activity', participant('peer')));
      } else {
        persist(createPuzzle(state, routes[0], 'activity', now, { id: 'peer', name: '跑友' }));
        assert.ok(openPuzzleTeams(state, now).some(team => team.id === 'activity'));
        now += 1000;
        persist(joinPuzzle(state, 'activity', participant('self')));
      }
      assert.equal(currentPuzzle(state)?.id, 'activity');
      assert.equal(currentPuzzle(state)?.city.id, routes[0].id);
      assert.equal(currentPuzzle(state)?.city.name, routes[0].name);
      assert.equal(currentPuzzle(state)?.members.length, 2);
      assert.ok(!openPuzzleTeams(state, now).some(team => team.id === 'activity'));
      locked(); locked('peer');
      const two = myContribution === 2 ? 'self' : 'peer';
      const one = myContribution === 1 ? 'self' : 'peer';
      const legs = [[two, routes[0]], [two, routes[1]], [one, routes[2]]] as const;
      for (const [index, [memberId, route]] of legs.entries()) {
        now += 1000;
        const startedAt = now;
        now += route.minutes * 60000;
        const record: PuzzlePiece = { id: `run-${index}`, memberId, slot: index, route, startedAt, finishedAt: now, distanceKm: route.distanceKm };
        const before = state;
        assert.equal(finishPuzzle(state, 'activity', { ...record, id: 'wrong-city-'+index, route: otherCityRoute, distanceKm: otherCityRoute.distanceKm }, now), before);
        assert.equal(finishPuzzle(state, 'activity', { ...record, id: `partial-${index}`, distanceKm: route.distanceKm / 2 }, now), before);
        persist(finishPuzzle(state, 'activity', record, now));
        assert.equal(currentPuzzle(state)?.pieces.length, index + 1);
        assert.equal(finishPuzzle(state, 'activity', record, now), state, 'retried completion cannot issue another stamp');
        locked(); locked('peer');
        if (index < 2) {
          assert.equal(drawsLeft(currentPuzzle(state)!, two), 0);
          assert.equal(drawsLeft(currentPuzzle(state)!, one), 0);
          assert.equal(drawPuzzle(state, 'activity', 'self', `early-${index}`, now, 0.5), state);
        }
      }
      assert.ok(currentPuzzle(state)!.pieces.every(piece => piece.route.id === currentPuzzle(state)!.city.id));
      assert.equal(puzzleComplete(currentPuzzle(state)!), true);
      assert.equal(ownPieces(currentPuzzle(state)!).length, myContribution);
      assert.equal(drawsLeft(currentPuzzle(state)!, two), 2);
      assert.equal(drawsLeft(currentPuzzle(state)!, one), 1);
      for (const [memberId, allowance] of [[two, 2], [one, 1]] as const) {
        for (let index = 0; index < allowance; index++) {
          now += 1000;
          const id = `draw-${memberId}-${index}`;
          persist(drawPuzzle(state, 'activity', memberId, id, now, 0.5));
          assert.equal(drawsLeft(currentPuzzle(state)!, memberId), allowance - index - 1);
          assert.equal(drawPuzzle(state, 'activity', memberId, id, now, 0.5), state, 'retry cannot deduct twice');
          locked(memberId);
        }
        assert.equal(drawPuzzle(state, 'activity', memberId, `overdraw-${memberId}`, now, 0.5), state);
      }
      assert.equal(currentPuzzle(state)?.draws.length, 3);
      assert.equal(currentPuzzle(state)?.draws.filter(draw => draw.memberId === two).length, 2);
      assert.equal(currentPuzzle(state)?.draws.filter(draw => draw.memberId === one).length, 1);
      locked(); locked('peer');
      assert.equal(periodParticipation(state, weekendPeriod(now).id)?.id, 'activity');
      const completedTeam = currentPuzzle(state)!;
      now = FRIDAY + WEEK + 3600000;
      persist(createPuzzle(state, routes[0], 'next-period', now));
      assert.equal(currentPuzzle(state)?.id, 'next-period');
      assert.deepEqual(state.teams.find(team => team.id === 'activity'), completedTeam);
      locked();
    });
  }
}
