import { useMemo } from 'react';
import WorldGlobe from '../WorldGlobe';
import type { CityData } from '../../data/cities';
import { JOURNEY_CITIES } from '../../journey/data';
import { getCityStatus, getCompletedRouteIds } from '../../journey/state';
import type { JourneyState } from '../../journey/types';

interface JourneyGlobeProps {
  state: JourneyState;
  onOpenCity: (cityId: string) => void;
}

export default function JourneyGlobe({ state, onOpenCity }: JourneyGlobeProps) {
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
      onCityClick={city => onOpenCity(city.id)}
    />
  );
}
