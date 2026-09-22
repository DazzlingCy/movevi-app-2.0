import { useMemo } from 'react';
import WorldGlobe from '../WorldGlobe';
import type { CityData } from '../../data/cities';
import { getJourneyCity, JOURNEY_CITIES } from '../../journey/data';
import { getCityStatus, getCompletedRouteIds } from '../../journey/state';
import type { JourneyState } from '../../journey/types';

interface JourneyGlobeProps {
  state: JourneyState;
  onOpenCity: (cityId: string) => void;
}

const COUNTRY_HIGHLIGHT_REGIONS: Record<string, string[]> = {
  '156': ['158']
};

export default function JourneyGlobe({ state, onOpenCity }: JourneyGlobeProps) {
  const highlightedCountryIds = useMemo(() => {
    const completedCountryIds = state.completedCityIds
      .map(cityId => getJourneyCity(cityId)?.countryCode)
      .filter((countryCode): countryCode is string => Boolean(countryCode));

    return [...new Set(completedCountryIds.flatMap(countryCode => [
      countryCode,
      ...(COUNTRY_HIGHLIGHT_REGIONS[countryCode] ?? [])
    ]))];
  }, [state.completedCityIds]);

  const cities = useMemo<CityData[]>(() => JOURNEY_CITIES.map(city => {
    const journeyStatus = getCityStatus(state, city.id);
    const completed = getCompletedRouteIds(state, city.id).length;
    return {
      id: city.id,
      name: city.name,
      englishName: city.englishName,
      continent: city.continent,
      x: ((city.longitude + 180) / 360) * 100,
      y: ((90 - city.latitude) / 180) * 100,
      lat: city.latitude,
      lng: city.longitude,
      image: '',
      routes: 10,
      spots: new Set(city.routes.flatMap(route => route.landmarks)).size,
      completed,
      status: journeyStatus === 'completed'
        ? 'lit'
        : journeyStatus === 'current'
          ? 'in-progress'
          : journeyStatus === 'candidate'
            ? 'unlit'
            : 'upcoming',
      completedRouteIndices: city.routes
        .filter(route => getCompletedRouteIds(state, city.id).includes(route.id))
        .map(route => route.order),
      description: city.description
    };
  }), [state]);

  return (
    <WorldGlobe
      cities={cities}
      appearance="night"
      focusCityId={state.currentCityId}
      focusAltitude={2.16}
      highlightedCountryIds={highlightedCountryIds}
      onCityClick={city => onOpenCity(city.id)}
    />
  );
}
