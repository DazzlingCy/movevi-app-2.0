import test from 'node:test';
import assert from 'node:assert/strict';
import { createPuzzlePreviewSession, finishPuzzleDemoPartner, getPuzzlePreviewMode, puzzleDemoPeriodTime, seedPuzzleDemoLobby, unjoinedPuzzleWeekend } from './puzzleDemo';
import { createPuzzle, drawsLeft, emptyPuzzleState, finishPuzzle, joinPuzzle, openPuzzleTeams, ownPieces, periodParticipation, puzzleComplete, readPuzzle } from './puzzleTeam';
import { weekendPeriod, periodOpen } from './weekendRelay';

const FRIDAY=Date.parse('2026-10-30T01:00:00+08:00'),WEEK=7*86400000;
const city={id:'tokyo',name:'东京',image:'/tokyo.jpg'};

for(const ownCompleted of [0,1,2])test(`partner can finish after ${ownCompleted} own routes and preserves 2+1 rewards`,()=>{
  let state=createPuzzle(emptyPuzzleState(),city,'free-order',FRIDAY);
  const thirdRoute={...city,routeId:'partner-route',routeIndex:3,title:'搭子路线',distanceKm:4,minutes:30};
  assert.equal(finishPuzzleDemoPartner(state,FRIDAY,thirdRoute),state);
  state=joinPuzzle(state,'free-order',{id:'partner',name:'小林',joinedAt:FRIDAY});
  const finishSelf=(index:number)=>{
    const route={...city,routeId:'own-route-'+index,routeIndex:index+1,title:'本人路线'+index,distanceKm:3,minutes:20};
    state=finishPuzzle(state,'free-order',{id:'own-'+index,memberId:'self',slot:state.teams[0].pieces.length,route,startedAt:FRIDAY,finishedAt:FRIDAY,distanceKm:3});
  };
  for(let i=0;i<ownCompleted;i++)finishSelf(i);
  if(ownCompleted)assert.equal(finishPuzzleDemoPartner(state,FRIDAY,state.teams[0].pieces[0].route),state,'simulated partner cannot reuse a self-completed route');
  assert.equal(finishPuzzleDemoPartner(state,weekendPeriod(FRIDAY).endsAt,thirdRoute),state);
  assert.equal(finishPuzzleDemoPartner(state,FRIDAY,{...thirdRoute,id:'another-city'}),state);
  state=finishPuzzleDemoPartner(state,FRIDAY,thirdRoute);
  assert.equal(ownPieces(state.teams[0],'partner').length,1);
  assert.equal(finishPuzzleDemoPartner(state,FRIDAY,thirdRoute),state);
  assert.equal(drawsLeft(state.teams[0]),ownCompleted===2?2:0);
  for(let i=ownCompleted;i<2;i++)finishSelf(i);
  assert.equal(puzzleComplete(state.teams[0]),true);
  assert.equal(drawsLeft(state.teams[0]),2);
  assert.equal(drawsLeft(state.teams[0],'partner'),1);
});

test('ordinary prototype links preview an open unjoined activity while only explicit deep links open the activity on load',()=>{
  assert.deepEqual(getPuzzlePreviewMode(''),{enabled:true,openOnLoad:false});
  assert.deepEqual(getPuzzlePreviewMode('?puzzleDemo=1'),{enabled:true,openOnLoad:true});
  assert.deepEqual(getPuzzlePreviewMode('?relayDemo=1'),{enabled:true,openOnLoad:true});
  assert.deepEqual(getPuzzlePreviewMode('?puzzleDemo=0'),{enabled:false,openOnLoad:false});
  assert.deepEqual(getPuzzlePreviewMode('?puzzleDemo=1&relayDemo=0'),{enabled:false,openOnLoad:false});
  const session=createPuzzlePreviewSession([city],Date.parse('2026-10-28T12:00:00+08:00'));
  assert.equal(periodOpen(weekendPeriod(session.now),session.now),true);
  assert.equal(periodParticipation(session.state,weekendPeriod(session.now).id),undefined);
  assert.equal(openPuzzleTeams(session.state,session.now).slice(0,3).length,3);
  assert.equal(openPuzzleTeams(session.state,session.now).length,10);
});

test('explicit partner action completes the selected third route and awards exactly 2+1 draws',()=>{
  let state=createPuzzle(emptyPuzzleState(),city,'preview-pair',FRIDAY);
  state=joinPuzzle(state,'preview-pair',{id:'partner',name:'小林',joinedAt:FRIDAY});
  assert.equal(finishPuzzleDemoPartner(state,FRIDAY),state);
  for(let i=0;i<2;i++) {
    const route={...city,routeId:'route-'+i,routeIndex:i+1,title:'路线'+i,distanceKm:3,minutes:20};
    state=finishPuzzle(state,'preview-pair',{id:'mine-'+i,memberId:'self',slot:i,route,startedAt:FRIDAY,finishedAt:FRIDAY,distanceKm:3});
    if(i===0)assert.equal(finishPuzzleDemoPartner(state,FRIDAY),state);
  }
  assert.equal(finishPuzzleDemoPartner(state,weekendPeriod(FRIDAY).endsAt),state);
  const thirdRoute={...city,routeId:'route-3',routeIndex:3,title:'好友的第三条路线',distanceKm:4,minutes:30};
  const completed=finishPuzzleDemoPartner(state,FRIDAY,thirdRoute),team=completed.teams[0];
  assert.equal(puzzleComplete(team),true);
  assert.equal(ownPieces(team,'partner').length,1);
  assert.equal(ownPieces(team,'partner')[0].route.routeId,thirdRoute.routeId);
  assert.equal(drawsLeft(team),2);assert.equal(drawsLeft(team,'partner'),1);
  assert.equal(finishPuzzleDemoPartner(completed,FRIDAY+1),completed);
  const restored=readPuzzle({getItem:()=>JSON.stringify(completed)});
  assert.equal(finishPuzzleDemoPartner(restored,FRIDAY+2),restored);
  assert.equal(drawsLeft(restored.teams[0]),2);
});

test('each preview entry starts an active unjoined session with ten teams',()=>{
  for(const now of [FRIDAY,Date.parse('2026-10-28T12:00:00+08:00')]) {
    const session=createPuzzlePreviewSession([city],now);
    assert.equal(periodOpen(weekendPeriod(session.now),session.now),true);
    assert.equal(periodParticipation(session.state,weekendPeriod(session.now).id),undefined);
    assert.equal(openPuzzleTeams(session.state,session.now).length,10);
  }
});

test('re-entering preview resets the flow while the current entry keeps its once-per-period lock',()=>{
  const first=createPuzzlePreviewSession([city],FRIDAY);
  let state=createPuzzle(first.state,city,'my-team',first.now);
  state=joinPuzzle(state,'my-team',{id:'friend',name:'小林',joinedAt:first.now+1});
  assert.equal(createPuzzle(state,city,'duplicate',first.now+2),state);
  const second=createPuzzlePreviewSession([city],FRIDAY+2000);
  assert.equal(periodParticipation(second.state,weekendPeriod(second.now).id),undefined);
  assert.equal(second.state.teams.flatMap(t=>t.pieces).length,0);
  assert.equal(second.state.teams.flatMap(t=>t.draws).length,0);
  assert.equal(periodParticipation(state,weekendPeriod(first.now).id)?.id,'my-team');
});

test('unjoined preview opens a weekend with signup available and preserves records and period locks',()=>{
  let state=createPuzzle(emptyPuzzleState(),city,'first',FRIDAY);
  state=createPuzzle(state,city,'second',FRIDAY+WEEK);
  const before=JSON.stringify(state),time=unjoinedPuzzleWeekend(state,FRIDAY);
  assert.equal(time,FRIDAY+2*WEEK);
  assert.equal(periodOpen(weekendPeriod(time),time),true);
  assert.equal(periodParticipation(state,weekendPeriod(time).id),undefined);
  assert.equal(JSON.stringify(state),before);
  assert.equal(createPuzzle(state,city,'duplicate',FRIDAY),state);
  const restored=readPuzzle({getItem:()=>before});
  assert.equal(unjoinedPuzzleWeekend(restored,FRIDAY),time);
  assert.equal(unjoinedPuzzleWeekend(state,time),time);
});

test('unjoined preview retains an already free weekend and opens upcoming Friday outside the period',()=>{
  const state=emptyPuzzleState();
  assert.equal(unjoinedPuzzleWeekend(state,FRIDAY),FRIDAY);
  const monday=Date.parse('2026-11-02T12:00:00+08:00');
  const time=unjoinedPuzzleWeekend(state,monday);
  assert.equal(time,Date.parse('2026-11-06T01:00:00+08:00'));
  assert.equal(periodOpen(weekendPeriod(time),time),true);
});

test('preview lobby provides ten persistent joinable teams and never enrolls the current account automatically',()=>{
  const cities=[city,{id:'shanghai',name:'上海',image:'/shanghai.jpg'}];
  const empty=emptyPuzzleState(),seeded=seedPuzzleDemoLobby(empty,cities,FRIDAY);
  const lobby=openPuzzleTeams(seeded,FRIDAY);
  assert.equal(empty.teams.length,0);assert.equal(lobby.length,10);
  assert.equal(new Set(lobby.map(t=>t.members[0].id)).size,10);
  assert.equal(new Set(lobby.map(t=>t.city.id)).size,2);
  assert.equal(periodParticipation(seeded,weekendPeriod(FRIDAY).id),undefined);
  assert.equal(seedPuzzleDemoLobby(seeded,cities,FRIDAY),seeded);
  const restored=readPuzzle({getItem:()=>JSON.stringify(seeded)});
  assert.equal(openPuzzleTeams(restored,FRIDAY).length,10);
  const joined=joinPuzzle(restored,lobby[0].id,{id:'self',name:'你',joinedAt:FRIDAY+1});
  assert.equal(periodParticipation(joined,weekendPeriod(FRIDAY).id)?.members.length,2);
  const replenished=seedPuzzleDemoLobby(joined,cities,FRIDAY+2);
  assert.equal(openPuzzleTeams(replenished,FRIDAY+2).length,10);
  assert.equal(periodParticipation(replenished,weekendPeriod(FRIDAY).id)?.id,lobby[0].id);
  assert.equal(seedPuzzleDemoLobby(empty,cities,weekendPeriod(FRIDAY).endsAt),empty);
});

test('weekend controls keep the selected unjoined period rather than returning to an older team',()=>{
  const state=createPuzzle(emptyPuzzleState(),city,'old-team',FRIDAY);
  const next=unjoinedPuzzleWeekend(state,FRIDAY);
  const ended=puzzleDemoPeriodTime(state,next,false);
  assert.equal(ended,weekendPeriod(next).endsAt+1000);
  const reopened=puzzleDemoPeriodTime(state,ended,true);
  assert.equal(weekendPeriod(reopened).id,weekendPeriod(next).id);
  assert.equal(periodParticipation(state,weekendPeriod(reopened).id),undefined);
});
