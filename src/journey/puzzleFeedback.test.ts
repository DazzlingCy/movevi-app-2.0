import test from 'node:test';
import assert from 'node:assert/strict';
import { puzzleProgressFeedback } from './puzzleFeedback';
import { createPuzzle, emptyPuzzleState, joinPuzzle, finishPuzzle, drawPuzzle, type PuzzlePiece } from './puzzleTeam';

const now=Date.parse('2026-10-30T01:00:00+08:00');
const city={id:'tokyo',name:'东京',image:'/tokyo.jpg'};
function paired() {
  return joinPuzzle(createPuzzle(emptyPuzzleState(),city,'team',now),'team',{id:'friend',name:'小林',joinedAt:now});
}
function piece(index:number,memberId='self'):PuzzlePiece {
  return {id:'finish-'+index,memberId,slot:index,route:{...city,routeId:'route-'+index,routeIndex:index+1,title:'路线'+index,distanceKm:3,minutes:20},startedAt:now,finishedAt:now,distanceKm:3};
}

test('feedback follows credited routes through self 2 + partner 1 and ignores retries and draws',()=>{
  let state=paired(),previous=state.teams[0];
  assert.equal(puzzleProgressFeedback(undefined,previous),undefined,'restoring a team must not announce old completions');
  assert.equal(puzzleProgressFeedback(previous,previous),undefined);
  state=finishPuzzle(state,'team',piece(0),now);
  assert.equal(puzzleProgressFeedback(previous,state.teams[0]),'路线完成！小队进度 1/3。');
  previous=state.teams[0];
  const retry=finishPuzzle(state,'team',piece(0),now);
  assert.equal(puzzleProgressFeedback(previous,retry.teams[0]),undefined);
  state=finishPuzzle(state,'team',piece(1),now);
  assert.equal(puzzleProgressFeedback(previous,state.teams[0]),'你已完成 2 条路线，下一棒交给搭子。');
  previous=state.teams[0];
  const blocked=finishPuzzle(state,'team',piece(2),now);
  assert.equal(puzzleProgressFeedback(previous,blocked.teams[0]),undefined,'rejected third self route must not announce success');
  state=finishPuzzle(state,'team',piece(2,'friend'),now);
  assert.equal(puzzleProgressFeedback(previous,state.teams[0]),'小队任务完成！大转盘已解锁，你可抽奖 2 次。');
  previous=state.teams[0];
  state=drawPuzzle(state,'team','self','draw-1',now,0.5);
  assert.equal(puzzleProgressFeedback(previous,state.teams[0]),undefined,'drawing must not repeat task completion feedback');
});

test('partner feedback names the member and final feedback uses the one-route participant allowance',()=>{
  let state=paired(),previous=state.teams[0];
  state=finishPuzzle(state,'team',piece(0,'friend'),now);
  assert.equal(puzzleProgressFeedback(previous,state.teams[0]),'小林已完成路线，小队进度 1/3。');
  state=finishPuzzle(state,'team',piece(1,'friend'),now);
  previous=state.teams[0];
  state=finishPuzzle(state,'team',piece(2),now);
  assert.equal(puzzleProgressFeedback(previous,state.teams[0]),'小队任务完成！大转盘已解锁，你可抽奖 1 次。');
  assert.equal(puzzleProgressFeedback({...previous,id:'different-team'},state.teams[0]),undefined);
});
