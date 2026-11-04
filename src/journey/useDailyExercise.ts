import { useEffect, useRef, useState } from 'react';
import { addDailyExercise, createPreviewDailyExercise, DAILY_EXERCISE_STORAGE, DAILY_EXERCISE_PREVIEW_STORAGE, DAILY_GOAL_STORAGE, dailyExerciseTotals, isValidDailyGoal, readDailyExercise, readDailyGoal } from './dailyExercise';
import type { RunResult } from './types';

export function useDailyExercise(preview = false) {
  const storageKey = preview ? DAILY_EXERCISE_PREVIEW_STORAGE : DAILY_EXERCISE_STORAGE;
  const [goalKm, setGoal] = useState(() => {
    try { return readDailyGoal(localStorage.getItem(DAILY_GOAL_STORAGE)); }
    catch { return readDailyGoal(null); }
  });
  const [state, setState] = useState(() => {
    let saved;
    try { saved = readDailyExercise(localStorage.getItem(storageKey)); }
    catch { saved = readDailyExercise(null); }
    if (!preview) return saved;
    const seed = createPreviewDailyExercise();
    if (saved.runs.length === 0) return seed;
    // Refresh the preview fixture while retaining runs completed in the prototype.
    return { ...saved, runs:saved.runs.map(run => run.id === 'preview-today' ? seed.runs[0] : run) };
  });
  const latest = useRef(state);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (preview) try { localStorage.setItem(storageKey, JSON.stringify(latest.current)); } catch { /* Preview remains available in this session. */ }
  }, [preview, storageKey]);
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
      try { localStorage.setItem(DAILY_GOAL_STORAGE, String(value)); } catch { /* Keep the goal for this session. */ }
      return true;
    },
    totals: dailyExerciseTotals(state, now),
    record(id: string, result: RunResult) {
      const time = Date.now(), next = addDailyExercise(latest.current, id, result, time);
      if (next === latest.current) return;
      latest.current = next; setState(next); setNow(time);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Session totals remain available. */ }
    }
  };
}
