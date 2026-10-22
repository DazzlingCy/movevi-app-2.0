import test from 'node:test';
import assert from 'node:assert/strict';
import { getInitialRouteIndex } from './routeFocus';

const completed = { isCompleted: true, isUnlocked: true };
const unlocked = { isCompleted: false, isUnlocked: true };
const locked = { isCompleted: false, isUnlocked: false };

test('route page focuses the unlocked route, not a completed route', () => {
  assert.equal(getInitialRouteIndex([completed, completed, unlocked, locked]), 2);
  assert.equal(getInitialRouteIndex([...Array(9).fill(completed), unlocked]), 9);
});

test('route page focuses the next route after completing the current one', () => {
  assert.equal(getInitialRouteIndex([unlocked, locked, locked]), 0);
  assert.equal(getInitialRouteIndex([completed, unlocked, locked]), 1);
});

test('completed cities focus the last route; empty or all-locked lists stay safe', () => {
  assert.equal(getInitialRouteIndex([completed, completed]), 1);
  assert.equal(getInitialRouteIndex([locked, locked]), 0);
  assert.equal(getInitialRouteIndex([]), 0);
});
