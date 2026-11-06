import { useCallback, useEffect, useRef, useState } from 'react';
import { bindFirstCity, claimFirstCityReward, completeFirstCityRoute, emptyFirstCityRewards, FIRST_CITY_REWARDS_STORAGE, observeFirstCityRewards, type FirstCityRewardsState, type FirstCityTaskId } from './firstCityRewards';
import type { JourneyState } from './types';

export function useFirstCityRewards(initial: FirstCityRewardsState, journey: JourneyState, connected: boolean, ready: boolean) {
  const [state, setState] = useState(initial);
  const latest = useRef(initial);
  const [storageFailed, setStorageFailed] = useState(false);
  const commit = useCallback((next: FirstCityRewardsState) => {
    if (next === latest.current) return;
    latest.current = next;
    setState(next);
    try { localStorage.setItem(FIRST_CITY_REWARDS_STORAGE, JSON.stringify(next)); setStorageFailed(false); }
    catch { setStorageFailed(true); }
  }, []);
  useEffect(() => {
    if (!ready) return;
    let next = latest.current;
    if (!next.firstCityId) next = bindFirstCity(next, journey.currentCityId, journey.completedRouteIdsByCity[journey.currentCityId] ?? []);
    const id = next.firstCityId!;
    next = observeFirstCityRewards(next, connected, id, journey.completedRouteIdsByCity[id] ?? []);
    commit(next);
  }, [journey, connected, ready, commit]);
  return {
    state, storageFailed,
    bind(cityId: string, routeIds: readonly string[]) { commit(bindFirstCity(latest.current, cityId, routeIds)); },
    completeRoute(cityId: string, routeId: string) { commit(completeFirstCityRoute(latest.current, cityId, routeId)); },
    claim(taskId: FirstCityTaskId) {
      const result = claimFirstCityReward(latest.current, taskId);
      if (!result.success) return result;
      // Persist before acknowledging a claim; duplicate clicks within this run remain idempotent.
      try { localStorage.setItem(FIRST_CITY_REWARDS_STORAGE, JSON.stringify(result.state)); }
      catch { setStorageFailed(true); return { state:latest.current, success:false, message:'暂时无法保存领取记录，请检查浏览器存储后重试' }; }
      latest.current = result.state; setState(result.state); setStorageFailed(false);
      return result;
    },
    reset() { commit(emptyFirstCityRewards()); }
  };
}
