import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PUZZLE_STORAGE, PUZZLE_DEMO_STORAGE, drawPuzzle, drawsLeft, createPuzzle, currentPuzzle, periodParticipation, openPuzzleTeams, emptyPuzzleState, finishPuzzle, joinPuzzle, ownPieces, puzzleComplete, puzzleRouteChoices, readPuzzle, type PuzzlePiece, type PuzzleState } from './puzzleTeam';
import { weekendPeriod, periodOpen } from './weekendRelay';
const BASE=Date.parse('2026-10-30T00:00:00+08:00'),WEEK=7*86400000;
const city={id:'tokyo',name:'东京',image:'/tokyo.jpg'};
const piece=(id:string,memberId='self',routeId=id):PuzzlePiece=>({id,memberId,slot:0,startedAt:BASE+20,finishedAt:BASE+30,distanceKm:3,route:{...city,routeId,routeIndex:1,title:'浅草寺',distanceKm:3,minutes:20}});
const start=()=>createPuzzle(emptyPuzzleState(),city,'team',BASE+10);
const pair=(s=start())=>joinPuzzle(s,'team',{id:'partner',name:'小林',joinedAt:BASE+15});
const completed=(two='self',one='partner')=>[piece('a',two),piece('b',two),piece('c',one)].reduce((s,p)=>finishPuzzle(s,'team',p),pair());
const lobby=(s=emptyPuzzleState(),id='open',owner='host')=>createPuzzle(s,city,id,BASE+10,{id:owner,name:owner});

test('Beijing weekend includes Friday and ends exactly Monday',()=>{
 const p=weekendPeriod(BASE);assert.equal(p.startsAt,BASE);assert.equal(p.endsAt,BASE+3*86400000);
 assert.equal(periodOpen(p,BASE-1),false);assert.equal(periodOpen(p,BASE),true);assert.equal(periodOpen(p,p.endsAt-1),true);assert.equal(periodOpen(p,p.endsAt),false);
 assert.equal(weekendPeriod(p.endsAt).startsAt,BASE+WEEK);
});
test('creating reserves this period immediately, even while waiting or after completion',()=>{
 const empty=emptyPuzzleState();assert.equal(createPuzzle(empty,city,'early',BASE-1),empty);
 const s=start();assert.equal(createPuzzle(s,city,'again',BASE+100),s);assert.equal(periodParticipation(s,weekendPeriod(BASE).id)?.id,'team');
 const done=completed();assert.equal(createPuzzle(done,city,'again',BASE+100),done);
});
test('other waiting teams are listed without consuming my participation',()=>{
 let s=lobby();s=lobby(s,'second','other-host');assert.equal(currentPuzzle(s),undefined);
 assert.deepEqual(openPuzzleTeams(s,BASE+100).map(t=>t.id),['open','second']);
 s=createPuzzle(s,city,'mine',BASE+100);assert.equal(currentPuzzle(s)?.id,'mine');
 assert.deepEqual(openPuzzleTeams(s,BASE+100).map(t=>t.id),['open','second']);
 assert.deepEqual(openPuzzleTeams(s,BASE-1),[]);
});
test('joining someone else locks one team; cannot create, switch, or join again',()=>{
 let s=lobby(lobby(),'second','other-host');s=joinPuzzle(s,'open',{id:'self',name:'你',joinedAt:BASE+15});
 assert.equal(currentPuzzle(s)?.id,'open');assert.equal(currentPuzzle(s)?.members.length,2);
 assert.equal(createPuzzle(s,city,'mine',BASE+100),s);
 assert.equal(joinPuzzle(s,'second',{id:'self',name:'你',joinedAt:BASE+100}),s);
 assert.equal(joinPuzzle(s,'open',{id:'self',name:'你',joinedAt:BASE+100}),s);
 assert.deepEqual(openPuzzleTeams(s,BASE+100).map(t=>t.id),['second']);
});
test('creating my own waiting team also prevents joining another',()=>{
 const s=lobby(start());assert.equal(joinPuzzle(s,'open',{id:'self',name:'你',joinedAt:BASE+100}),s);
 assert.equal(currentPuzzle(s)?.id,'team');assert.equal(currentPuzzle(s)?.members.length,1);
});
test('failed join into a newly full team does not consume my qualification',()=>{
 let s=lobby();s=joinPuzzle(s,'open',{id:'last-slot',name:'跑友',joinedAt:BASE+15});
 assert.equal(joinPuzzle(s,'open',{id:'self',name:'你',joinedAt:BASE+20}),s);
 assert.equal(periodParticipation(s,weekendPeriod(BASE).id),undefined);
 assert.equal(currentPuzzle(createPuzzle(s,city,'mine',BASE+100))?.id,'mine');
});
test('waiting teams cannot run; a run started before the second member joins is rejected',()=>{
 const s=start();assert.equal(finishPuzzle(s,'team',piece('early')),s);
 const joined=joinPuzzle(s,'team',{id:'partner',name:'小林',joinedAt:BASE+25});
 assert.equal(finishPuzzle(joined,'team',piece('before-ready')),joined);
 const valid={...piece('ready'),startedAt:BASE+26};assert.equal(finishPuzzle(joined,'team',valid).teams[0].pieces.length,1);
});
test('team has exactly two slots and late or duplicate members are rejected',()=>{
 const s=pair();assert.equal(joinPuzzle(s,'team',{id:'third',name:'第三人',joinedAt:BASE+18}),s);
 assert.equal(joinPuzzle(s,'team',{id:'partner',name:'小林',joinedAt:BASE+18}),s);
 const waiting=start();assert.equal(joinPuzzle(waiting,'team',{id:'late',name:'迟到',joinedAt:BASE+3*86400000}),waiting);
});
test('2+1 unlocks two draws and one draw, with either partner doing the extra route',()=>{
 for(const [two,one]of [['self','partner'],['partner','self']]){
  let s=pair();s=finishPuzzle(s,'team',piece('a',two));s=finishPuzzle(s,'team',piece('b',two));
  assert.equal(puzzleComplete(s.teams[0]),false);assert.equal(drawsLeft(s.teams[0],two),0);assert.equal(finishPuzzle(s,'team',piece('third-by-same',two)),s);
  s=finishPuzzle(s,'team',piece('c',one));assert.equal(puzzleComplete(s.teams[0]),true);assert.equal(drawsLeft(s.teams[0],two),2);assert.equal(drawsLeft(s.teams[0],one),1);
 }
});
test('duplicate records/routes, partial runs, outsiders and late completions cannot earn another stamp',()=>{
 let s=pair();for(const invalid of [{...piece('x'),distanceKm:1},piece('x','outsider'),{...piece('x'),slot:8},{...piece('x'),distanceKm:NaN},{...piece('x'),finishedAt:BASE+3*86400000}])assert.equal(finishPuzzle(s,'team',invalid),s);
 assert.equal(finishPuzzle(s,'team',piece('late-submit'),BASE+3*86400000),s);
 s=finishPuzzle(s,'team',piece('a'));assert.equal(finishPuzzle(s,'team',piece('a')),s);assert.equal(finishPuzzle(s,'team',piece('dup-route','self','a')),s);
});
test('different members cannot credit the same route; concurrent finishes are checked against latest team state',()=>{
 let s=pair();s=finishPuzzle(s,'team',piece('a'));
 assert.equal(finishPuzzle(s,'team',piece('friend-a','partner','a')),s);
 s=finishPuzzle(s,'team',piece('friend-c','partner','c'));
 assert.equal(finishPuzzle(s,'team',piece('self-c','self','c')),s);
 s=finishPuzzle(s,'team',piece('b'));
 assert.deepEqual(s.teams[0].pieces.map(p=>p.slot),[0,1,2]);assert.equal(puzzleComplete(s.teams[0]),true);assert.equal(finishPuzzle(s,'team',piece('extra','partner')),s);
});
test('awarded contribution draws persist, cannot exceed 2+1, and survive activity expiry',()=>{
 let s=completed();s=drawPuzzle(s,'team','self','draw-0',BASE+100,0);assert.equal(drawsLeft(s.teams[0]),1);
 assert.equal(drawPuzzle(s,'team','self','draw-0',BASE+101,0.9),s);s=readPuzzle({getItem:()=>JSON.stringify(s)});
 s=drawPuzzle(s,'team','self','draw-1',BASE+WEEK,0.99999);assert.equal(drawsLeft(s.teams[0]),0);
 assert.equal(drawPuzzle(s,'team','self','extra',BASE+WEEK+1,0.5),s);assert.equal(drawsLeft(s.teams[0],'partner'),1);
 s=drawPuzzle(s,'team','partner','friend-draw',BASE+WEEK+2,0.99999);assert.equal(drawsLeft(s.teams[0],'partner'),0);
 assert.equal(drawPuzzle(s,'team','partner','friend-extra',BASE+WEEK+3,0.5),s);assert.equal(s.teams[0].draws.length,3);
});
test('noncontributors, invalid random inputs and unfinished teams cannot draw',()=>{
 const s=completed(),unfinished=pair();assert.equal(drawPuzzle(unfinished,'team','self','x',BASE+100,0),unfinished);
 for(const random of [-1,1,NaN])assert.equal(drawPuzzle(s,'team','self','x',BASE+100,random),s);
 assert.equal(drawPuzzle(s,'team','outsider','x',BASE+100,0),s);assert.equal(drawPuzzle(s,'team','self','x',BASE+29,0),s);
});
test('next period gives one fresh opportunity while keeping old contribution and draw history',()=>{
 let s=pair();s=finishPuzzle(s,'team',piece('old'));s=createPuzzle(s,city,'next',BASE+WEEK+10);
 assert.equal(currentPuzzle(s)?.id,'next');assert.equal(s.teams[0].pieces.length,1);assert.equal(currentPuzzle(s)?.members.length,1);
 assert.equal(finishPuzzle(s,'team',piece('stale','partner'),BASE+WEEK+20),s);
 assert.equal(createPuzzle(s,city,'another',BASE+WEEK+20),s);
 assert.deepEqual(readPuzzle({getItem:()=>JSON.stringify(s)}),s);
});
test('legacy results are preserved; an archived participation still consumes this period',()=>{
 const old=completed();old.teams[0].members.push({id:'old-third',name:'旧队友',joinedAt:BASE+15});old.teams[0].draws.push({id:'prior',memberId:'self',cents:18,createdAt:BASE+40});
 const loaded=readPuzzle({getItem:()=>JSON.stringify(old)});assert.equal(loaded.teams[0].archived,true);assert.equal(currentPuzzle(loaded),undefined);
 assert.deepEqual(loaded.teams[0].pieces,old.teams[0].pieces);assert.equal(drawsLeft(loaded.teams[0]),1);assert.equal(createPuzzle(loaded,city,'duo',BASE+100),loaded);
});
test('restrict recommendations to the team city, exclude completed routes and preserve source data',()=>{
 const routes=[{...piece('long').route,minutes:40},{...piece('short').route,minutes:15},{...piece('other').route,id:'paris',minutes:25}];
 const before=JSON.stringify(routes),s=finishPuzzle(pair(),'team',piece('done','self','short'));
 assert.deepEqual(puzzleRouteChoices(s.teams[0],routes,'tokyo').map(r=>r.routeId),['long']);assert.deepEqual(puzzleRouteChoices(s.teams[0],routes.slice(0,2)).map(r=>r.routeId),['long']);assert.equal(JSON.stringify(routes),before);
 const partnerDone=finishPuzzle(s,'team',piece('partner-long','partner','long'));
 assert.deepEqual(puzzleRouteChoices(partnerDone.teams[0],routes),[]);
});
test('invalid storage falls back safely',()=>{assert.deepEqual(readPuzzle({getItem:()=>'{invalid'}),emptyPuzzleState());});

test('fresh demo account starts unentered, preserves older records, and retains participation on refresh',()=>{
 const prior=completed(), priorJson=JSON.stringify(prior);
 const saved=new Map<string,string>([[PUZZLE_STORAGE,priorJson]]);
 const storage={getItem:(key:string)=>saved.get(key)??null};
 const fresh=readPuzzle(storage,PUZZLE_DEMO_STORAGE);
 assert.deepEqual(fresh,emptyPuzzleState());assert.equal(currentPuzzle(fresh),undefined);
 const created=createPuzzle(fresh,city,'demo-team',BASE+10);
 saved.set(PUZZLE_DEMO_STORAGE,JSON.stringify(created));
 const restored=readPuzzle(storage,PUZZLE_DEMO_STORAGE);
 assert.equal(currentPuzzle(restored)?.id,'demo-team');
 assert.equal(createPuzzle(restored,city,'duplicate',BASE+100),restored);
 assert.equal(saved.get(PUZZLE_STORAGE),priorJson);
 assert.deepEqual(readPuzzle(storage),prior);
});
