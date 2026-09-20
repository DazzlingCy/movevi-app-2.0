export type CityJourneyStatus = 'completed' | 'current' | 'candidate' | 'locked';

export type RouteJourneyStatus = 'completed' | 'revealed' | 'discoverable' | 'locked';

export type JourneyPage = 'home' | 'map' | 'routeComplete' | 'cityComplete' | 'travel';

export interface JourneyRoute {
  id: string;
  cityId: string;
  order: number;
  name: string;
  landmarks: string[];
  distanceKm: number;
  durationMinutes: number;
  calories: number;
  description: string;
}

export interface JourneyCity {
  id: string;
  name: string;
  englishName: string;
  continent: string;
  longitude: number;
  latitude: number;
  accent: string;
  description: string;
  routes: JourneyRoute[];
}

export interface RunResult {
  distanceKm: number;
  durationSeconds: number;
  calories: number;
}

export interface JourneyRunSummary extends RunResult {
  cityId: string;
  routeId: string;
  isFirstCompletion: boolean;
}

export interface JourneyState {
  currentCityId: string;
  completedCityIds: string[];
  completedRouteIdsByCity: Record<string, string[]>;
  revealedRouteIdsByCity: Record<string, string[]>;
  discoveredSpotKeys: string[];
  pendingNextCityId: string | null;
  currentPage: JourneyPage;
  lastRun: JourneyRunSummary | null;
}

export type JourneyAction =
  | { type: 'START_JOURNEY'; cityId: string }
  | { type: 'NAVIGATE'; page: 'home' | 'map' }
  | { type: 'REVEAL_ROUTE'; cityId: string; routeId: string }
  | { type: 'COMPLETE_ROUTE'; cityId: string; routeId: string; result: RunResult }
  | { type: 'COMPLETE_CITY'; cityId: string }
  | { type: 'SELECT_NEXT_CITY'; cityId: string }
  | { type: 'ARRIVE_NEXT_CITY' }
  | { type: 'RESET_DEMO' };
