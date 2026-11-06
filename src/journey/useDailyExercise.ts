import { useEffect, useRef, useState } from 'react';
import { addDailyExercise, createPreviewDailyExercise, DAILY_EXERCISE_STORAGE, DAILY_GOAL_STORAGE, DEFAULT_DAILY_GOAL_KM, dailyExerciseTotals, isValidDailyGoal, readDailyExercise, readDailyGoal } from './dailyExercise';
import type { RunResult } from './types';

export function useDailyExercise(preview = false) {
  const [goalKm, setGoal] = useState(() => {
    if (preview) return DEFAULT_DAILY_GOAL_KM;
    try { return readDailyGoal(localStorage.getItem(DAILY_GOAL_STORAGE)); }
    catch { return readDailyGoal(null); }
  });
  const [state, setState] = useState(() => {
    // Every preview load starts at 2.5/5 km; only runs in this visit add to the fixture.
    if (preview) return createPreviewDailyExercise();
    try { return readDailyExercise(localStorage.getItem(DAILY_EXERCISE_STORAGE)); }
    catch { return readDailyExercise(null); }
  });
  const latest = useRef(state);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return {
    goalKm,
    setGoalKm(value: number) {
      if (!isValidDailyGoal(value)) return false;
      setGoal(value);
      if (!preview) try { localStorage.setItem(DAILY_GOAL_STORAGE, String(value)); } catch { /* Keep the goal for this session. */ }
      return true;
    },
    totals: dailyExerciseTotals(state, now),
    record(id: string, result: RunResult) {
      const time = Date.now(), next = addDailyExercise(latest.current, id, result, time);
      if (next === latest.current) return;
      latest.current = next; setState(next); setNow(time);
      if (!preview) try { localStorage.setItem(DAILY_EXERCISE_STORAGE, JSON.stringify(next)); } catch { /* Session totals remain available. */ }
    }
  };
}
