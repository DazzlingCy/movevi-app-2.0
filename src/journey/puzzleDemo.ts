import { createPuzzle, emptyPuzzleState, finishPuzzle, joinPuzzle, openPuzzleTeams, ownPieces, periodParticipation, type PuzzleCity, type PuzzleRoute, type PuzzleState } from './puzzleTeam';
import { weekendPeriod, periodOpen } from './weekendRelay';

export const PUZZLE_DEMO_CLOCK='movevi-weekend-relay-demo-clock-v1';
export const PUZZLE_LOBBY_LIMIT=10;

/** The prototype previews an open activity by default, without changing its landing page. */
export function getPuzzlePreviewMode(search:string):{enabled:boolean;openOnLoad:boolean} {
  const params=new URLSearchParams(search),keys=['puzzleDemo','relayDemo'];
  const enabled=!keys.some(key=>params.get(key)==='0');
  return {enabled,openOnLoad:enabled&&keys.some(key=>params.get(key)==='1')};
}

export function joinPuzzleDemoPartner(state:PuzzleState,now:number):PuzzleState {
  const team=periodParticipation(state,weekendPeriod(now).id);
  return team&&team.members.length===1?joinPuzzle(state,team.id,{
    id:'runner-0',name:'小林',avatarUrl:'https://i.pravatar.cc/100?img=11',joinedAt:now,
  }):state;
}

/** Invoked explicitly by the preview's partner-completion button. */
export function finishPuzzleDemoPartner(state:PuzzleState,now:number,selectedRoute?:PuzzleRoute):PuzzleState {
  const team=periodParticipation(state,weekendPeriod(now).id);
  if(!team||team.archived||team.members.length!==2||!periodOpen(team.period,now)||team.pieces.length>=3)return state;
  const partner=team.members.find(member=>member.id!=='self');
  if(!partner||ownPieces(team,partner.id).length)return state;
  const route=selectedRoute;
  if(!route)return state;
  return finishPuzzle(state,team.id,{
    id:'demo-partner-finish-'+team.id,memberId:partner.id,slot:team.pieces.length,route,
    startedAt:now,finishedAt:now,distanceKm:route.distanceKm,
  },now);
}

/** Each new preview entry starts a fresh local flow in an open weekend. */
export function createPuzzlePreviewSession(cities:PuzzleCity[],realNow:number):{state:PuzzleState;now:number} {
  const period=weekendPeriod(realNow),now=periodOpen(period,realNow)?realNow:period.startsAt+3600000;
  return {state:seedPuzzleDemoLobby(emptyPuzzleState(),cities,now),now};
}

/** Explicit preview accounts get joinable, persisted teams without enrolling the viewer. */
export function seedPuzzleDemoLobby(state:PuzzleState,cities:PuzzleCity[],now:number):PuzzleState {
  const period=weekendPeriod(now);
  if(!cities.length||!periodOpen(period,now))return state;
  const cityIds=new Set(cities.map(city=>city.id));
  let missing=PUZZLE_LOBBY_LIMIT-openPuzzleTeams(state,now).filter(t=>cityIds.has(t.city.id)).length,next=state;
  const names=['小林','阿禾','小川','小岚','阿杰','南风','柚子','木木','小满','可乐'];
  for(let index=0;missing>0;index++) {
    const hostId='demo-host-'+index,id='demo-lobby-'+period.id+'-'+index;
    if(next.teams.some(t=>t.id===id)||periodParticipation(next,period.id,hostId))continue;
    next=createPuzzle(next,cities[index%cities.length],id,now,{id:hostId,name:names[index%names.length],avatarUrl:'https://i.pravatar.cc/100?img='+(11+index%3)});
    missing--;
  }
  return next;
}

/** Move only the preview clock, preserving participation history and once-per-period rules. */
export function unjoinedPuzzleWeekend(state:PuzzleState,now:number):number {
  let period=weekendPeriod(now);
  while(periodParticipation(state,period.id))period=weekendPeriod(period.startsAt+7*86400000);
  return periodOpen(period,now)?now:period.startsAt+3600000;
}

/** Period controls follow the selected preview weekend, never an older team's period. */
export function puzzleDemoPeriodTime(state:PuzzleState,now:number,open:boolean):number {
  const upcoming=weekendPeriod(now),previous=weekendPeriod(now-3*86400000);
  const period=!periodOpen(upcoming,now)&&now>=previous.endsAt&&now<previous.endsAt+86400000?previous:upcoming;
  if(!open)return period.endsAt+1000;
  const recordedTimes=state.teams.filter(t=>t.period.id===period.id).flatMap(t=>[t.createdAt,...t.members.map(m=>m.joinedAt),...t.pieces.map(p=>p.finishedAt),...t.draws.map(d=>d.createdAt)]).filter(time=>periodOpen(period,time));
  return Math.max(period.startsAt+3600000,...recordedTimes.map(time=>time+1));
}
