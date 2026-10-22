interface RouteFocusState {
  isCompleted: boolean;
  isUnlocked: boolean;
}

export function getInitialRouteIndex(routes: readonly RouteFocusState[]): number {
  const unlockedIndex = routes.findIndex(route => route.isUnlocked && !route.isCompleted);
  if (unlockedIndex >= 0) return unlockedIndex;
  if (routes.length > 0 && routes.every(route => route.isCompleted)) return routes.length - 1;
  return 0;
}
