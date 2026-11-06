import { exerciseDay } from './dailyExercise';
import { getJourneyCity, hasPublishedCityRoutes, JOURNEY_SEQUENCE } from './data';
import type { JourneyCity, JourneyRoute } from './types';

export interface DailyRouteRecommendation {
  city: JourneyCity;
  route: JourneyRoute;
}

const publishedCities = JOURNEY_SEQUENCE
  .filter(hasPublishedCityRoutes)
  .map(getJourneyCity)
  .filter((city): city is JourneyCity => !!city?.routes.length);

export function getDailyRouteRecommendations(day = exerciseDay()): DailyRouteRecommendation[] {
  if (!publishedCities.length) return [];

  const start = Math.floor(Date.parse(day) / 86_400_000);
  // Keep the first three selections and fill the gaps with additional cities.
  const slots = [0, 2, 4, 1, 3, 5];
  const recommendations: DailyRouteRecommendation[] = [];
  for (const slot of slots) {
    const cityOffset = Math.floor(slot * publishedCities.length / slots.length);
    const city = publishedCities[(start + cityOffset) % publishedCities.length];
    if (recommendations.some(pick => pick.city.id === city.id)) continue;

    const ordered = [...city.routes].sort((a, b) => a.distanceKm - b.distanceKm);
    const offset = Math.floor(slot * ordered.length / slots.length);
    const route = ordered[(start + offset) % ordered.length];
    recommendations.push({ city, route });
    if (recommendations.length === 5) break;
  }
  return recommendations;
}
