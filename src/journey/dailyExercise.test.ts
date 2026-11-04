import test from 'node:test';
import assert from 'node:assert/strict';
import { addDailyExercise, createPreviewDailyExercise, dailyExerciseTotals, dailyGoalPercentage, emptyDailyExercise, exerciseDay, isValidDailyGoal, readDailyExercise, readDailyGoal } from './dailyExercise';

const noon = Date.parse('2026-11-03T12:00:00+08:00');
const run = { distanceKm: 3.2, durationSeconds: 1380, calories: 205 };
test('editable goals default to five km and accept only supported positive values', () => {
  assert.equal(readDailyGoal(null), 5); assert.equal(readDailyGoal('broken'), 5);
  assert.equal(readDailyGoal('10'), 10); assert.equal(readDailyGoal('0.1'), .1);
  for (const value of [0,-1,100.1,NaN,Infinity,2.55]) assert.equal(isValidDailyGoal(value), false);
  assert.equal(dailyGoalPercentage(3.75,5), 75);
  assert.equal(dailyGoalPercentage(3.75,10), 37);
});
test('preview starts at one km without changing real empty-day records', () => {
  const preview = createPreviewDailyExercise(noon);
  assert.equal(dailyExerciseTotals(preview,noon).distanceKm, 1);
  assert.equal(dailyGoalPercentage(dailyExerciseTotals(preview,noon).distanceKm), 20);
  assert.equal(dailyExerciseTotals(readDailyExercise(null,noon),noon).distanceKm, 0);
});

test('daily goal shows partial progress and caps completed goals at 100 percent', () => {
  assert.equal(dailyGoalPercentage(0), 0);
  assert.equal(dailyGoalPercentage(2.5), 50);
  assert.equal(dailyGoalPercentage(4.999), 99);
  assert.equal(dailyGoalPercentage(5), 100);
  assert.equal(dailyGoalPercentage(7.1), 100);
  assert.equal(dailyGoalPercentage(-1), 0);
  assert.equal(dailyGoalPercentage(NaN), 0);
  assert.equal(dailyGoalPercentage(3, 0), 0);
});
test('daily totals count separate runs, including reruns, and ignore repeated callbacks', () => {
  let state = addDailyExercise(emptyDailyExercise(noon), 'run-1', run, noon);
  assert.strictEqual(addDailyExercise(state, 'run-1', run, noon), state);
  state = addDailyExercise(state, 'run-2', run, noon);
  assert.deepEqual(dailyExerciseTotals(state, noon), { distanceKm: 6.4, durationSeconds: 2760, calories: 410 });
  assert.deepEqual(readDailyExercise(JSON.stringify(state), noon), state);
});
test('today resets at Shanghai midnight and never includes historical city completion data', () => {
  const before = Date.parse('2026-11-03T23:59:59+08:00'), after = before + 1000;
  const state = addDailyExercise(emptyDailyExercise(before), 'run-1', run, before);
  assert.equal(exerciseDay(after), '2026-11-04');
  assert.deepEqual(dailyExerciseTotals(state, after), { distanceKm: 0, durationSeconds: 0, calories: 0 });
  assert.deepEqual(addDailyExercise(state, 'run-2', run, after).runs, [{ id: 'run-2', ...run }]);
  assert.deepEqual(readDailyExercise(JSON.stringify(state), after), emptyDailyExercise(after));
});
test('invalid saved data and non-finite or negative results cannot corrupt today totals', () => {
  const empty = emptyDailyExercise(noon);
  assert.deepEqual(readDailyExercise('broken', noon), empty);
  assert.strictEqual(addDailyExercise(empty, 'bad', { ...run, calories: -1 }, noon), empty);
  assert.strictEqual(addDailyExercise(empty, 'bad', { ...run, distanceKm: NaN }, noon), empty);
  assert.deepEqual(readDailyExercise(JSON.stringify({ day: empty.day, runs: [null, { id: 'same', ...run }, { id: 'same', ...run }] }), noon).runs, [{ id: 'same', ...run }]);
});
