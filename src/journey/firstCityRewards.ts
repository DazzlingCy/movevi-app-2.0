import { getJourneyCity } from './data';
import { createDemoJourneyState, createPrototypeJourneyState } from './state';
import type { JourneyState } from './types';

export const FIRST_CITY_REWARDS_STORAGE = 'movevi-first-city-rewards-v3';
export const FIRST_CITY_REWARDS = { activation:80, firstRoute:160, firstCity:260 } as const;
export type FirstCityTaskId = keyof typeof FIRST_CITY_REWARDS;
export const FIRST_CITY_TASK_IDS = Object.keys(FIRST_CITY_REWARDS) as FirstCityTaskId[];
export const FIRST_CITY_TOTAL_CENTS = Object.values(FIRST_CITY_REWARDS).reduce((sum, cents) => sum + cents, 0);
export interface FirstCityRewardClaim { taskId: FirstCityTaskId; amountCents: number; claimedAt: string }
export interface FirstCityRewardsState {
  version:1;
  firstCityId: string | null;
  completedRouteIds: string[];
  achievedTaskIds: FirstCityTaskId[];
  claims: FirstCityRewardClaim[];
}
const isTaskId = (id: unknown): id is FirstCityTaskId => typeof id === 'string' && Object.hasOwn(FIRST_CITY_REWARDS, id);
export const formatRewardCents = (cents: number) => `¥${(cents / 100).toFixed(2)}`;
export const emptyFirstCityRewards = (): FirstCityRewardsState => ({ version:1, firstCityId:null, completedRouteIds:[], achievedTaskIds:[], claims:[] });

export function readFirstCityRewards(raw: string | null): FirstCityRewardsState {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (!value || value.version !== 1) return emptyFirstCityRewards();
    const city = typeof value.firstCityId === 'string' ? getJourneyCity(value.firstCityId) : undefined;
    const routeIds = new Set(city?.routes.map(route => route.id) ?? []);
    const completedRouteIds = [...new Set<string>(Array.isArray(value.completedRouteIds) ? value.completedRouteIds.filter((id: unknown) => typeof id === 'string' && routeIds.has(id)) : [])];
    const achieved = new Set<FirstCityTaskId>(Array.isArray(value.achievedTaskIds) ? value.achievedTaskIds.filter(isTaskId) : []);
    if (!city) { achieved.delete('firstRoute'); achieved.delete('firstCity'); }
    const claimed = new Set<FirstCityTaskId>();
    const claims: FirstCityRewardClaim[] = [];
    for (const record of Array.isArray(value.claims) ? value.claims : []) {
      if (!record || !isTaskId(record.taskId) || claimed.has(record.taskId) || (!city && record.taskId !== 'activation')
        || record.amountCents !== FIRST_CITY_REWARDS[record.taskId] || typeof record.claimedAt !== 'string' || !Number.isFinite(Date.parse(record.claimedAt))) continue;
      claimed.add(record.taskId); achieved.add(record.taskId);
      claims.push({ taskId:record.taskId, amountCents:record.amountCents, claimedAt:record.claimedAt });
    }
    return { version:1, firstCityId:city?.id ?? null, completedRouteIds, achievedTaskIds:[...achieved], claims };
  } catch { return emptyFirstCityRewards(); }
}

export function loadFirstCityRewards() {
  try { return readFirstCityRewards(localStorage.getItem(FIRST_CITY_REWARDS_STORAGE)); }
  catch { return emptyFirstCityRewards(); }
}

export function bindFirstCity(state: FirstCityRewardsState, cityId: string, completedRouteIds: readonly string[] = []): FirstCityRewardsState {
  if (state.firstCityId || !getJourneyCity(cityId)) return state;
  return observeFirstCityRewards({ ...state, firstCityId:cityId }, false, cityId, completedRouteIds);
}

export function observeFirstCityRewards(state: FirstCityRewardsState, connected: boolean, cityId: string, routeIds: readonly string[]): FirstCityRewardsState {
  const achieved = new Set(state.achievedTaskIds);
  if (connected) achieved.add('activation');
  const city = state.firstCityId ? getJourneyCity(state.firstCityId) : undefined;
  const valid = new Set(city?.routes.map(route => route.id) ?? []);
  const completed = new Set(state.completedRouteIds);
  if (city && cityId === city.id) routeIds.forEach(id => { if (valid.has(id)) completed.add(id); });
  // Seeded city progress is display data; first-route rewards need an actual completion event.
  if (city && city.routes.length > 0 && completed.size >= city.routes.length) achieved.add('firstCity');
  if (achieved.size === state.achievedTaskIds.length && completed.size === state.completedRouteIds.length) return state;
  return { ...state, completedRouteIds:[...completed], achievedTaskIds:[...achieved] };
}

export function claimFirstCityReward(state: FirstCityRewardsState, taskId: FirstCityTaskId, now = Date.now()) {
  if (!isTaskId(taskId)) return { state, success:false, message:'奖励任务不存在' };
  if (state.claims.some(claim => claim.taskId === taskId)) return { state, success:false, message:'这项奖励已领取' };
  if (!state.achievedTaskIds.includes(taskId)) return { state, success:false, message:'完成任务后即可领取奖励' };
  const claim: FirstCityRewardClaim = { taskId, amountCents:FIRST_CITY_REWARDS[taskId], claimedAt:new Date(now).toISOString() };
  return { state:{ ...state, claims:[...state.claims, claim] }, success:true, message:`已领取 ${formatRewardCents(claim.amountCents)}`, claim };
}

export function completeFirstCityRoute(state: FirstCityRewardsState, cityId: string, routeId: string): FirstCityRewardsState {
  if (state.firstCityId !== cityId || !getJourneyCity(cityId)?.routes.some(route => route.id === routeId)) return state;
  const next = observeFirstCityRewards(state, false, cityId, [routeId]);
  if (next.achievedTaskIds.includes('firstRoute')) return next;
  return { ...next, achievedTaskIds:[...next.achievedTaskIds, 'firstRoute'] };
}

// Restore only the bound city's saved route progress. Other prototype cities stay unchanged.
export function restoreFirstCityJourney(saved: FirstCityRewardsState): JourneyState {
  const city = saved.firstCityId ? getJourneyCity(saved.firstCityId) : undefined;
  if (!city) return createDemoJourneyState();
  const initial = createPrototypeJourneyState(city.id);
  const completed = saved.achievedTaskIds.includes('firstCity') ? city.routes.map(route => route.id) : saved.completedRouteIds;
  return {
    ...initial,
    completedRouteIdsByCity:{ ...initial.completedRouteIdsByCity, [city.id]:[...completed] },
    revealedRouteIdsByCity:{ ...initial.revealedRouteIdsByCity, [city.id]:[...completed] },
    completedCityIds:completed.length >= city.routes.length ? [...initial.completedCityIds, city.id] : initial.completedCityIds
  };
}
