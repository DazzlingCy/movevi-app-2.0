// Existing prototype fixtures, not live participant statistics.
const DEMO_RUNNER_COUNT = 29;
const DEMO_RUNNER_AVATARS = [11, 12, 13].map(id => `https://i.pravatar.cc/100?img=${id}`);

export function getRouteRunners(count?: number, avatars?: readonly string[]) {
  const resolvedCount = count === undefined ? DEMO_RUNNER_COUNT
    : Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  // Never present demo portraits as real people when backend counts are supplied.
  const resolvedAvatars = avatars ?? (count === undefined ? DEMO_RUNNER_AVATARS : []);
  return {
    count: resolvedCount,
    label: `${resolvedCount.toLocaleString('zh-CN')} 人跑过`,
    avatars: resolvedAvatars.filter(Boolean).slice(0, Math.min(3, resolvedCount))
  };
}
