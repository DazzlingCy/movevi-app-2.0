import { getJourneyCity, getJourneyRoute, JOURNEY_CITIES, JOURNEY_SEQUENCE } from './data';
import type {
  CityJourneyStatus,
  JourneyAction,
  JourneyState,
  RouteJourneyStatus
} from './types';

const routeIdsFor = (cityId: string, count: number) =>
  getJourneyCity(cityId)?.routes.slice(0, count).map(route => route.id) ?? [];

const initialCompletedRoutes: Record<string, string[]> = {
  beijing: routeIdsFor('beijing', 10),
  shanghai: routeIdsFor('shanghai', 10),
  tokyo: routeIdsFor('tokyo', 6)
};

const initialRevealedRoutes: Record<string, string[]> = {
  beijing: [...initialCompletedRoutes.beijing],
  shanghai: [...initialCompletedRoutes.shanghai],
  tokyo: [...initialCompletedRoutes.tokyo]
};

export const createDemoJourneyState = (): JourneyState => ({
  currentCityId: 'tokyo',
  completedCityIds: ['beijing', 'shanghai'],
  completedRouteIdsByCity: Object.fromEntries(
    Object.entries(initialCompletedRoutes).map(([cityId, routeIds]) => [cityId, [...routeIds]])
  ),
  revealedRouteIdsByCity: Object.fromEntries(
    Object.entries(initialRevealedRoutes).map(([cityId, routeIds]) => [cityId, [...routeIds]])
  ),
  discoveredSpotKeys: Array.from({ length: 128 }, (_, index) => `demo-spot-${index + 1}`),
  pendingNextCityId: null,
  currentPage: 'home',
  lastRun: null
});

export const getCompletedRouteIds = (state: JourneyState, cityId: string) =>
  state.completedRouteIdsByCity[cityId] ?? [];

export const getRevealedRouteIds = (state: JourneyState, cityId: string) =>
  state.revealedRouteIdsByCity[cityId] ?? [];

export const getOpenRouteCount = (completedCount: number) => {
  if (completedCount < 3) return 3;
  if (completedCount < 6) return 6;
  return 10;
};

export const getRouteStatus = (
  state: JourneyState,
  cityId: string,
  routeId: string
): RouteJourneyStatus => {
  if (getCompletedRouteIds(state, cityId).includes(routeId)) return 'completed';
  const city = getJourneyCity(cityId);
  const routeIndex = city?.routes.findIndex(route => route.id === routeId) ?? -1;
  if (routeIndex < 0) return 'locked';
  if (routeIndex >= getOpenRouteCount(getCompletedRouteIds(state, cityId).length)) return 'locked';
  if (getRevealedRouteIds(state, cityId).includes(routeId)) return 'revealed';
  return 'discoverable';
};

export const getCandidateCityIds = (state: JourneyState, limit = 4): string[] => {
  const startIndex = JOURNEY_SEQUENCE.indexOf(state.currentCityId as (typeof JOURNEY_SEQUENCE)[number]);
  if (startIndex < 0) return [];

  const completed = new Set(state.completedCityIds);
  const candidates: string[] = [];
  for (let offset = 1; offset < JOURNEY_SEQUENCE.length && candidates.length < limit; offset += 1) {
    const cityId = JOURNEY_SEQUENCE[(startIndex + offset) % JOURNEY_SEQUENCE.length];
    if (cityId !== state.currentCityId && !completed.has(cityId)) candidates.push(cityId);
  }
  return candidates;
};

export const getCityStatus = (state: JourneyState, cityId: string): CityJourneyStatus => {
  if (cityId === state.currentCityId) return 'current';
  if (state.completedCityIds.includes(cityId)) return 'completed';
  if (getCandidateCityIds(state).includes(cityId)) return 'candidate';
  return 'locked';
};

const unique = (values: string[]) => [...new Set(values)];

const completeCity = (state: JourneyState, cityId: string): JourneyState => {
  const city = getJourneyCity(cityId);
  if (!city || getCompletedRouteIds(state, cityId).length < city.routes.length) return state;
  return {
    ...state,
    completedCityIds: unique([...state.completedCityIds, cityId]),
    currentPage: cityId === state.currentCityId ? 'cityComplete' : state.currentPage
  };
};

export const journeyReducer = (state: JourneyState, action: JourneyAction): JourneyState => {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentPage: action.page, pendingNextCityId: null };

    case 'REVEAL_ROUTE': {
      if (getRouteStatus(state, action.cityId, action.routeId) !== 'discoverable') return state;
      return {
        ...state,
        revealedRouteIdsByCity: {
          ...state.revealedRouteIdsByCity,
          [action.cityId]: unique([
            ...getRevealedRouteIds(state, action.cityId),
            action.routeId
          ])
        }
      };
    }

    case 'COMPLETE_ROUTE': {
      const route = getJourneyRoute(action.cityId, action.routeId);
      const routeStatus = getRouteStatus(state, action.cityId, action.routeId);
      if (!route || routeStatus === 'locked' || routeStatus === 'discoverable') return state;

      const previousRouteIds = getCompletedRouteIds(state, action.cityId);
      const isFirstCompletion = !previousRouteIds.includes(action.routeId);
      const completedRouteIds = unique([...previousRouteIds, action.routeId]);
      const discoveredSpotKeys = isFirstCompletion
        ? unique([
            ...state.discoveredSpotKeys,
            ...route.landmarks.map(landmark => `${action.cityId}:${landmark}`)
          ])
        : state.discoveredSpotKeys;
      const nextState: JourneyState = {
        ...state,
        completedRouteIdsByCity: {
          ...state.completedRouteIdsByCity,
          [action.cityId]: completedRouteIds
        },
        revealedRouteIdsByCity: {
          ...state.revealedRouteIdsByCity,
          [action.cityId]: unique([...getRevealedRouteIds(state, action.cityId), action.routeId])
        },
        discoveredSpotKeys,
        lastRun: {
          cityId: action.cityId,
          routeId: action.routeId,
          isFirstCompletion,
          ...action.result
        },
        currentPage: 'routeComplete'
      };

      if (action.cityId === state.currentCityId && completedRouteIds.length === 10) {
        return completeCity(nextState, action.cityId);
      }
      return nextState;
    }

    case 'COMPLETE_CITY':
      return completeCity(state, action.cityId);

    case 'SELECT_NEXT_CITY': {
      if (!getCandidateCityIds(state).includes(action.cityId)) return state;
      return { ...state, pendingNextCityId: action.cityId, currentPage: 'travel' };
    }

    case 'ARRIVE_NEXT_CITY': {
      if (!state.pendingNextCityId) return state;
      return {
        ...state,
        currentCityId: state.pendingNextCityId,
        pendingNextCityId: null,
        currentPage: 'home',
        lastRun: null
      };
    }

    case 'RESET_DEMO':
      return createDemoJourneyState();

    default:
      return state;
  }
};

export const getJourneyTotals = (state: JourneyState) => ({
  completedCities: state.completedCityIds.length,
  completedRoutes: Object.values(state.completedRouteIdsByCity).reduce(
    (total, routeIds) => total + routeIds.length,
    0
  ),
  discoveredSpots: state.discoveredSpotKeys.length
});

export const getCityPlanTotals = (cityId: string) => {
  const routes = getJourneyCity(cityId)?.routes ?? [];
  return routes.reduce(
    (totals, route) => ({
      distanceKm: totals.distanceKm + route.distanceKm,
      durationMinutes: totals.durationMinutes + route.durationMinutes,
      landmarks: unique([...totals.landmarks, ...route.landmarks])
    }),
    { distanceKm: 0, durationMinutes: 0, landmarks: [] as string[] }
  );
};

export const validateJourneyCatalogue = () => {
  const cityIds = JOURNEY_CITIES.map(city => city.id);
  const routeIds = JOURNEY_CITIES.flatMap(city => city.routes.map(route => route.id));
  return {
    cityCount: JOURNEY_CITIES.length,
    uniqueCityCount: new Set(cityIds).size,
    routeCount: routeIds.length,
    uniqueRouteCount: new Set(routeIds).size,
    sequenceIsComplete: JOURNEY_SEQUENCE.length === JOURNEY_CITIES.length
      && JOURNEY_SEQUENCE.every(cityId => cityIds.includes(cityId)),
    everyCityHasTenRoutes: JOURNEY_CITIES.every(city => city.routes.length === 10),
    everyRouteComplete: JOURNEY_CITIES.every(city => city.routes.every(route =>
      Boolean(route.id && route.cityId && route.name && route.description)
      && route.landmarks.length > 0
      && route.distanceKm > 0
      && route.durationMinutes > 0
      && route.calories > 0
    ))
  };
};
