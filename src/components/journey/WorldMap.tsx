import { useEffect, useMemo, useState } from 'react';
import { feature } from 'topojson-client';
import { Check, LoaderCircle, MapPin } from 'lucide-react';
import { JOURNEY_CITIES } from '../../journey/data';
import { getCityStatus } from '../../journey/state';
import type { CityJourneyStatus, JourneyState } from '../../journey/types';

type Position = [number, number];
type PolygonCoordinates = Position[][];
type MultiPolygonCoordinates = Position[][][];
type GeoGeometry =
  | { type: 'Polygon'; coordinates: PolygonCoordinates }
  | { type: 'MultiPolygon'; coordinates: MultiPolygonCoordinates };
type FeatureCollection = { features: Array<{ geometry: GeoGeometry | null }> };

const WIDTH = 760;
const HEIGHT = 410;

const project = ([longitude, latitude]: Position): Position => [
  ((longitude + 180) / 360) * WIDTH,
  ((90 - latitude) / 180) * HEIGHT
];

const ringPath = (ring: Position[]) => ring.map((position, index) => {
  const [x, y] = project(position);
  return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ') + ' Z';

const geometryPath = (geometry: GeoGeometry | null) => {
  if (!geometry) return '';
  if (geometry.type === 'Polygon') return geometry.coordinates.map(ringPath).join(' ');
  return geometry.coordinates.flatMap(polygon => polygon.map(ringPath)).join(' ');
};

const statusLabel: Record<CityJourneyStatus, string> = {
  completed: '已完成',
  current: '当前城市',
  candidate: '候选',
  locked: '等待探索'
};

interface WorldMapProps {
  state: JourneyState;
  onOpenCity: (cityId: string) => void;
}

export default function WorldMap({ state, onOpenCity }: WorldMapProps) {
  const [landPaths, setLandPaths] = useState<string[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.BASE_URL}globe/countries-110m.json`)
      .then(response => {
        if (!response.ok) throw new Error('Map topology unavailable');
        return response.json();
      })
      .then(topology => {
        const collection = feature(topology, topology.objects.countries) as unknown as FeatureCollection;
        if (active) setLandPaths(collection.features.map(item => geometryPath(item.geometry)).filter(Boolean));
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => { active = false; };
  }, []);

  const markers = useMemo(() => JOURNEY_CITIES.map(city => ({
    city,
    status: getCityStatus(state, city.id),
    position: project([city.longitude, city.latitude])
  })), [state]);

  return (
    <div className="world-map-frame">
      {landPaths.length === 0 && !loadFailed && (
        <div className="map-loading" role="status"><LoaderCircle aria-hidden="true" /> 正在展开世界地图</div>
      )}
      {loadFailed && <div className="map-loading" role="status">地图轮廓暂时不可用，城市坐标仍可浏览</div>}
      <svg className="world-map-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="环球旅程城市地图">
        <g className="world-land" aria-hidden="true">
          {landPaths.map((path, index) => <path d={path} key={index} />)}
        </g>
        <path className="map-equator" d={`M20 ${HEIGHT / 2} H${WIDTH - 20}`} aria-hidden="true" />
        {markers.map(({ city, status, position: [x, y] }) => {
          const clickable = status === 'current' || status === 'completed';
          return (
            <g
              key={city.id}
              className={`city-marker city-marker--${status}${clickable ? ' city-marker--clickable' : ''}`}
              transform={`translate(${x} ${y})`}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-label={`${city.name}，${statusLabel[status]}`}
              onClick={() => clickable && onOpenCity(city.id)}
              onKeyDown={event => {
                if (clickable && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onOpenCity(city.id);
                }
              }}
            >
              {status === 'current' && <circle className="marker-pulse" r="16" />}
              <circle className="marker-dot" r={status === 'current' ? 7 : 5} />
              {status === 'completed' && <Check className="marker-icon" x={-4} y={-4} width={8} height={8} />}
              {status === 'current' && <MapPin className="marker-pin" x={-7} y={-22} width={14} height={14} />}
              {(status === 'current' || status === 'candidate') && (
                <text className="marker-label" x="0" y="20" textAnchor="middle">{city.name}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="map-legend" aria-label="地图图例">
        <span><i className="legend-dot legend-dot--completed" />已完成</span>
        <span><i className="legend-dot legend-dot--current" />当前</span>
        <span><i className="legend-dot legend-dot--candidate" />下一站候选</span>
      </div>
    </div>
  );
}
