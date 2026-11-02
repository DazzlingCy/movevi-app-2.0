import { weekendPeriod, periodOpen, WEEKEND_PRIZES, type WeekendPeriod } from './weekendRelay';
export interface PuzzleCity { id: string; name: string; image: string }
export interface PuzzleRoute extends PuzzleCity { routeId: string; routeIndex: number; title: string; distanceKm: number; minutes: number }
export interface PuzzleMember { id: string; name: string; joinedAt: number; avatarUrl?: string }
export interface PuzzlePiece {
  id: string; memberId: string; slot: number; startedAt: number; finishedAt: number;
  route: PuzzleRoute; distanceKm: number;
}
export interface PuzzleTeam {
  id: string; city: PuzzleCity; createdAt: number; members: PuzzleMember[]; pieces: PuzzlePiece[];
  period: WeekendPeriod; draws: RelayDraw[]; archived?: boolean;
}
export interface RelayDraw { id: string; memberId: string; cents: number; createdAt: number }
export interface PuzzleState { version: 4; teams: PuzzleTeam[] }
export const PUZZLE_STORAGE = 'movevi-weekend-relay-v4';
export const PUZZLE_DEMO_STORAGE = 'movevi-weekend-relay-demo-account-v1';
export const emptyPuzzleState = (): PuzzleState => ({ version: 4, teams: [] });
export const currentPuzzle = (state: PuzzleState) => state.teams.slice().reverse().find(t => !t.archived && t.members.some(m=>m.id==='self'));
export const periodParticipation = (state: PuzzleState, periodId: string, memberId='self') => state.teams.find(t=>t.period.id===periodId && t.members.some(m=>m.id===memberId));
export const puzzleComplete = (team: PuzzleTeam) => team.pieces.length === 3 && (team.archived || team.members.length === 2) && new Set(team.pieces.map(p => p.memberId)).size >= 2;
export const ownPieces = (team: PuzzleTeam, memberId = 'self') => team.pieces.filter(p => p.memberId === memberId);
export function openPuzzleTeams(state:PuzzleState,now:number):PuzzleTeam[] {
  const period=weekendPeriod(now);
  return state.teams.filter(t=>!t.archived&&t.period.id===period.id&&periodOpen(t.period,now)&&t.members.length===1&&!t.members.some(m=>m.id==='self')&&!puzzleComplete(t));
}
export function puzzleRouteChoices(team: PuzzleTeam | undefined, routes: PuzzleRoute[], cityId?: string): PuzzleRoute[] {
  const completed = team?.pieces ?? [];
  const selectedCityId = team?.city.id ?? cityId;
  return routes.filter(r => (!selectedCityId || r.id === selectedCityId) && Number.isFinite(r.minutes) && r.minutes > 0 && Number.isFinite(r.distanceKm) && r.distanceKm > 0
    && !completed.some(p => p.route.id === r.id && p.route.routeId === r.routeId))
    .sort((a,b) => a.minutes - b.minutes || a.routeIndex - b.routeIndex);
}
export function createPuzzle(state: PuzzleState, city: PuzzleCity, id: string, now: number, creator:Pick<PuzzleMember,'id'|'name'|'avatarUrl'>={id:'self',name:'你'}): PuzzleState {
  const period=weekendPeriod(now);
  if(!id||!city.id||!creator.id||!creator.name||!Number.isFinite(now)||state.teams.some(t=>t.id===id)
    ||!periodOpen(period,now)||periodParticipation(state,period.id,creator.id))return state;
  return {...state,teams:[...state.teams,{id,city,createdAt:now,members:[{...creator,joinedAt:now}],pieces:[],period,draws:[]}]};
}
export function joinPuzzle(state: PuzzleState, teamId: string, member: PuzzleMember): PuzzleState {
  const team=state.teams.find(t=>t.id===teamId);
  if(!team||team.archived||team.members.length!==1||!member.id||!member.name||!Number.isFinite(member.joinedAt)
    ||member.joinedAt<team.createdAt||!periodOpen(team.period,member.joinedAt)||puzzleComplete(team)
    ||periodParticipation(state,team.period.id,member.id))return state;
  return {...state,teams:state.teams.map(t=>t.id===teamId?{...t,members:[...t.members,member]}:t)};
}
export function finishPuzzle(state: PuzzleState, teamId: string, piece: PuzzlePiece, receivedAt = piece.finishedAt): PuzzleState {
  const team=state.teams.find(t=>t.id===teamId);
  if(!team||team.archived||team.members.length!==2||piece.route.id!==team.city.id||!periodOpen(team.period,receivedAt)||!periodOpen(team.period,piece.startedAt)||!periodOpen(team.period,piece.finishedAt)
    ||piece.startedAt<Math.max(...team.members.map(m=>m.joinedAt))||piece.finishedAt>receivedAt||puzzleComplete(team)||!piece.id||!piece.route.routeId
    ||![piece.startedAt,piece.finishedAt,piece.distanceKm,piece.route.distanceKm].every(Number.isFinite)
    ||piece.finishedAt<piece.startedAt||piece.route.distanceKm<=0||piece.distanceKm<piece.route.distanceKm
    ||!Number.isInteger(piece.slot)||piece.slot<0||piece.slot>2
    ||!team.members.some(m=>m.id===piece.memberId)||ownPieces(team,piece.memberId).length>=2
    ||state.teams.some(t=>t.pieces.some(p=>p.id===piece.id))
    ||team.pieces.some(p=>p.route.id===piece.route.id&&p.route.routeId===piece.route.routeId))return state;
  return {...state,teams:state.teams.map(t=>t.id===teamId?{...t,pieces:[...t.pieces,{...piece,slot:t.pieces.length}]}:t)};
}
export function drawsLeft(team:PuzzleTeam,memberId='self'):number {
  return puzzleComplete(team)?Math.max(0,ownPieces(team,memberId).length-team.draws.filter(d=>d.memberId===memberId).length):0;
}
export function drawPuzzle(state:PuzzleState,teamId:string,memberId:string,id:string,now:number,random:number):PuzzleState {
  const team=state.teams.find(t=>t.id===teamId);
  if(!team||!drawsLeft(team,memberId)||!id||!Number.isFinite(now)||now<Math.max(...team.pieces.map(p=>p.finishedAt))
    ||!Number.isFinite(random)||random<0||random>=1||state.teams.some(t=>t.draws.some(d=>d.id===id)))return state;
  const periodDraws=state.teams.filter(t=>t.period.id===team.period.id).flatMap(t=>t.draws);
  const pool=WEEKEND_PRIZES.flatMap(p=>Array(Math.max(0,p.count-periodDraws.filter(d=>d.cents===p.cents).length)).fill(p.cents));
  if(!pool.length)return state;
  const draw={id,memberId,cents:pool[Math.floor(random*pool.length)],createdAt:now};
  return {...state,teams:state.teams.map(t=>t.id===teamId?{...t,draws:[...t.draws,draw]}:t)};
}
export function readPuzzle(storage?:Pick<Storage,'getItem'>, key=PUZZLE_STORAGE):PuzzleState {
  try {
    const state=JSON.parse((storage??localStorage).getItem(key)||'null');
    if(state?.version===4&&Array.isArray(state.teams)&&state.teams.every((t:PuzzleTeam)=>
      typeof t.id==='string'&&typeof t.city?.name==='string'&&typeof t.city.id==='string'&&typeof t.city.image==='string'
      &&Number.isFinite(t.createdAt)&&Array.isArray(t.members)&&t.members.length<=4
      &&t.members.every(m=>typeof m.id==='string'&&typeof m.name==='string'&&Number.isFinite(m.joinedAt))
      &&Array.isArray(t.pieces)&&t.pieces.length<=3&&new Set(t.pieces.map(p=>p.slot)).size===t.pieces.length
      &&t.pieces.every(p=>typeof p.id==='string'&&typeof p.memberId==='string'&&Number.isInteger(p.slot)&&p.slot>=0&&p.slot<=2
        &&typeof p.route?.title==='string'&&typeof p.route.name==='string'&&typeof p.route.routeId==='string'
        &&Number.isFinite(p.finishedAt)&&Number.isFinite(p.startedAt)&&Number.isFinite(p.distanceKm))
      &&typeof t.period?.id==='string'&&Number.isFinite(t.period.startsAt)&&Number.isFinite(t.period.endsAt)
      &&Array.isArray(t.draws)&&t.draws.every(d=>typeof d.id==='string'&&typeof d.memberId==='string'&&Number.isFinite(d.createdAt)&&WEEKEND_PRIZES.some(p=>p.cents===d.cents))))
      return {...state,teams:state.teams.map((t:PuzzleTeam)=>t.members.length>2?{...t,archived:true}:t)};
  } catch { /* Keep the app usable if browser storage is unavailable. */ }
  return emptyPuzzleState();
}
