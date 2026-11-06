import type { RunResult } from './types';

export interface DailyExercise { day: string; runs: (RunResult & { id: string })[] }
export const DAILY_EXERCISE_STORAGE = 'movevi-daily-exercise-v1';
export const DAILY_EXERCISE_PREVIEW_STORAGE = 'movevi-daily-exercise-preview-v2';
export const DEFAULT_DAILY_GOAL_KM = 5;
export const DAILY_GOAL_STORAGE = 'movevi-daily-goal-km-v2';
export const isValidDailyGoal = (goalKm: number) => Number.isFinite(goalKm) && goalKm >= .1 && goalKm <= 100 && Math.abs(goalKm * 10 - Math.round(goalKm * 10)) < 1e-7;
export const readDailyGoal = (raw: string | null) => isValidDailyGoal(Number(raw)) ? Number(raw) : DEFAULT_DAILY_GOAL_KM;
export function dailyGoalPercentage(distanceKm: number, goalKm = DEFAULT_DAILY_GOAL_KM) {
  if (!Number.isFinite(distanceKm) || !Number.isFinite(goalKm) || goalKm <= 0) return 0;
  return Math.min(100, Math.max(0, Math.floor(distanceKm / goalKm * 100)));
}
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });
export const exerciseDay = (now = Date.now()) => dayFormatter.format(now);
const validResult = (result: RunResult) => [result.distanceKm, result.durationSeconds, result.calories].every(value => Number.isFinite(value) && value >= 0);
export const emptyDailyExercise = (now = Date.now()): DailyExercise => ({ day: exerciseDay(now), runs: [] });
export function createPreviewDailyExercise(now = Date.now()): DailyExercise {
  const distanceKm = 2.5;
  return { day: exerciseDay(now), runs: [{ id:'preview-today', distanceKm, durationSeconds:Math.round(distanceKm * 480), calories:Math.round(distanceKm * 65) }] };
}

export function readDailyExercise(raw: string | null, now = Date.now()): DailyExercise {
  try {
    const saved = JSON.parse(raw ?? 'null');
    if (saved?.day !== exerciseDay(now) || !Array.isArray(saved.runs)) return emptyDailyExercise(now);
    const ids = new Set<string>();
    return { day: saved.day, runs: saved.runs.filter((run: DailyExercise['runs'][number]) => {
      if (!run || typeof run.id !== 'string' || !run.id || ids.has(run.id) || !validResult(run)) return false;
      ids.add(run.id); return true;
    }) };
  } catch { return emptyDailyExercise(now); }
}

export function addDailyExercise(state: DailyExercise, id: string, result: RunResult, now = Date.now()): DailyExercise {
  if (!id || !validResult(result)) return state;
  const current = state.day === exerciseDay(now) ? state : emptyDailyExercise(now);
  if (current.runs.some(run => run.id === id)) return current;
  return { ...current, runs: [...current.runs, { id, ...result }] };
}

export function dailyExerciseTotals(state: DailyExercise, now = Date.now()): RunResult {
  return (state.day === exerciseDay(now) ? state.runs : []).reduce((total, run) => ({
    distanceKm: total.distanceKm + run.distanceKm,
    durationSeconds: total.durationSeconds + run.durationSeconds,
    calories: total.calories + run.calories
  }), { distanceKm: 0, durationSeconds: 0, calories: 0 });
}
