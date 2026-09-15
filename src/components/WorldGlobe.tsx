import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import { CityData } from '../data/cities';
import { cn } from '../lib/utils';

interface WorldGlobeProps {
  cities: CityData[];
  appearance?: 'default' | 'aurora' | 'night';
  focusCityId?: string;
  focusAltitude?: number;
  targetFlight?: { fromCityId: string; toCityId: string } | null;
  onCityClick: (city: CityData) => void;
  onFlightComplete?: () => void;
}

type CityPoint = CityData & {
  altitude: number;
  color: string;
  radius: number;
  labelColor: string;
};

type FlightArc = {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
};

type FlightMarker = {
  kind: 'flight-plane';
  id: string;
  lat: number;
  lng: number;
  bearing: number;
};

type GlobeHtmlElement = CityPoint | FlightMarker;

const viteBaseUrl = ((import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/');
const GLOBE_TEXTURE_URL = `${viteBaseUrl}globe/earth-dark.svg`;
const NATURAL_EARTH_TEXTURE_URL = `${viteBaseUrl}globe/earth-natural.webp`;
const NIGHT_EARTH_TEXTURE_URL = `${viteBaseUrl}globe/earth-night.webp`;
const COUNTRIES_TOPOLOGY_URL = `${viteBaseUrl}globe/countries-110m.json`;
const CAMERA_ALTITUDE = 1.78;
const REDUCED_CAMERA_ALTITUDE = 1.95;
const HOME_CAMERA_ALTITUDE = 2.55;
const GLOBE_BOOTSTRAP_RETRY_MS = 120;

type CountryPolygon = {
  type: string;
  geometry: unknown;
  properties?: Record<string, unknown>;
};

function isFlightMarker(point: GlobeHtmlElement): point is FlightMarker {
  return 'kind' in point && point.kind === 'flight-plane';
}

function toRadians(degrees: number) {
  return degrees * Math.PI / 180;
}

function toDegrees(radians: number) {
  return radians * 180 / Math.PI;
}

function interpolateGreatCircle(from: CityData, to: CityData, progress: number) {
  const lat1 = toRadians(from.lat);
  const lng1 = toRadians(from.lng);
  const lat2 = toRadians(to.lat);
  const lng2 = toRadians(to.lng);
  const delta = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
  ));

  if (!Number.isFinite(delta) || delta === 0) {
    return { lat: from.lat, lng: from.lng };
  }

  const a = Math.sin((1 - progress) * delta) / Math.sin(delta);
  const b = Math.sin(progress * delta) / Math.sin(delta);
  const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
  const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
  const z = a * Math.sin(lat1) + b * Math.sin(lat2);

  return {
    lat: toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lng: toDegrees(Math.atan2(y, x))
  };
}

function getBearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

function getScreenBearing(
  globe: GlobeMethods | undefined,
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  altitude = 0.2
) {
  if (!globe) return getBearing(from, to);

  try {
    const current = globe.getScreenCoords(from.lat, from.lng, altitude);
    const next = globe.getScreenCoords(to.lat, to.lng, altitude);
    const deltaX = next.x - current.x;
    const deltaY = next.y - current.y;

    if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY) || (Math.abs(deltaX) + Math.abs(deltaY) < 0.01)) {
      return getBearing(from, to);
    }

    return toDegrees(Math.atan2(deltaX, -deltaY));
  } catch {
    return getBearing(from, to);
  }
}

const supportsWebGL = () => {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
};

function useContainerSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height))
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

function getPointStyle(city: CityData): Pick<CityPoint, 'altitude' | 'color' | 'radius' | 'labelColor'> {
  if (city.status === 'lit') {
    return {
      altitude: 0.018,
      color: 'rgba(52, 211, 153, 0.96)',
      radius: 0.43,
      labelColor: 'rgba(167, 243, 208, 0.98)'
    };
  }

  if (city.status === 'in-progress') {
    return {
      altitude: 0.024,
      color: 'rgba(250, 204, 21, 0.98)',
      radius: 0.5,
      labelColor: 'rgba(254, 240, 138, 0.98)'
    };
  }

  if (city.status === 'upcoming') {
    return {
      altitude: 0.01,
      color: 'rgba(100, 116, 139, 0.38)',
      radius: 0.28,
      labelColor: 'rgba(148, 163, 184, 0.45)'
    };
  }

  return {
    altitude: 0.012,
    color: 'rgba(96, 165, 250, 0.58)',
    radius: 0.32,
    labelColor: 'rgba(191, 219, 254, 0.68)'
  };
}

function getCityIconSvg(city: CityData) {
  const icons: Record<string, string> = {
    Hangzhou: '<path d="M4 13c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M4 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
    Beijing: '<path d="M4 20h18"/><path d="M6 18V9l7-4 7 4v9"/><path d="M9 18v-6"/><path d="M15 18v-6"/><path d="M5 9h16"/>',
    Shanghai: '<path d="M5 20V9h5v11"/><path d="M10 20V5h4v15"/><path d="M14 20V11h5v9"/><path d="M3 20h18"/>',
    "Xi'an": '<path d="M4 20h16V9l-3 2-3-2-3 2-3-2-4 3z"/><path d="M8 20v-5a4 4 0 0 1 8 0v5"/><path d="M6 6h2"/><path d="M11 6h2"/><path d="M16 6h2"/>',
    Tokyo: '<path d="M12 3l4 18H8z"/><path d="M9 11h6"/><path d="M8 16h8"/><path d="M10 7h4"/>',
    Paris: '<path d="M12 3l5 18H7z"/><path d="M9 13h6"/><path d="M8 21h8"/><path d="M10 8h4"/>',
    London: '<circle cx="12" cy="12" r="7"/><path d="M12 8v4l3 2"/><path d="M12 2v3"/><path d="M12 19v3"/>',
    'New York': '<path d="M12 3v18"/><path d="M8 9l4-6 4 6"/><path d="M8 21h8"/><path d="M6 13h12"/><path d="M9 6h6"/>',
    Sydney: '<path d="M3 18c4-7 7-7 10 0"/><path d="M8 18c4-8 8-8 13 0"/><path d="M3 21h18"/>',
    Rio: '<path d="M12 4v16"/><path d="M8 8l4-4 4 4"/><path d="M7 12h10"/><path d="M6 20h12"/>',
    Cairo: '<path d="M3 20h18"/><path d="M5 20 12 6l7 14"/><path d="M9 20l3-6 3 6"/>',
    Bangkok: '<path d="M4 20h16"/><path d="M7 18V9l5-5 5 5v9"/><path d="M10 18v-5h4v5"/><path d="M8 10h8"/>',
    Mumbai: '<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M10 20v-5a2 2 0 0 1 4 0v5"/><path d="M8 10h8"/>',
    Singapore: '<path d="M5 18c3-7 11-7 14 0"/><path d="M8 18c2-4 6-4 8 0"/><path d="M7 12h10"/><path d="M12 6v6"/>',
    Moscow: '<path d="M5 20h14"/><path d="M7 20V10l5-5 5 5v10"/><path d="M10 20v-5h4v5"/><path d="M12 5V2"/><path d="M10 3h4"/>',
    'Los Angeles': '<path d="m12 3 2.7 5.4 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.3-4.2 6-.9z"/>'
  };

  return icons[city.englishName] || '<circle cx="12" cy="12" r="7"/><path d="M12 5v14"/><path d="M5 12h14"/>';
}

function FlatMapFallback({ cities, appearance, onCityClick }: { cities: CityData[]; appearance: 'default' | 'aurora' | 'night'; onCityClick: (city: CityData) => void }) {
  const fallbackBackground = appearance === 'aurora' ? 'bg-[#061421]' : appearance === 'night' ? 'bg-[#020712]' : 'bg-[#071827]';
  const fallbackLand = appearance === 'aurora' ? '#48654e' : appearance === 'night' ? '#172c43' : '#02070c';
  const fallbackStroke = appearance === 'aurora' ? '#9bc6d3' : appearance === 'night' ? '#70a4c2' : '#0b5b73';
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[28px] ${fallbackBackground}`}>
      <svg viewBox="0 0 1200 800" className="absolute inset-0 h-full w-full opacity-80" aria-hidden="true">
        <g fill={fallbackLand} stroke={fallbackStroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M88 178L143 120L230 95L307 118L358 166L382 230L345 282L290 315L215 330L145 306L86 255L60 205Z" />
          <path d="M245 96L282 70L345 82L386 116L350 150L298 132Z" />
          <path d="M366 332L430 365L470 435L452 548L410 655L350 710L318 620L300 520L323 420Z" />
          <path d="M498 204L548 163L632 152L700 190L715 248L654 296L565 285L510 250Z" />
          <path d="M610 306L690 328L742 410L735 520L694 624L625 604L575 520L550 430Z" />
          <path d="M680 184L790 128L930 118L1062 160L1134 230L1110 320L1018 386L875 374L750 325L705 252Z" />
          <path d="M780 330L830 358L812 410L750 390Z" />
          <path d="M915 516L1025 538L1102 605L1074 665L980 684L910 638Z" />
        </g>
      </svg>
      {cities.map(city => {
        const style = getPointStyle(city);
        return (
          <button
            key={city.id}
            type="button"
            aria-label={`查看${city.name}`}
            onClick={() => onCityClick(city)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-200"
            style={{ left: `${city.x}%`, top: `${city.y}%` }}
          >
            <span
              className="block h-3 w-3 rounded-full border border-white/35 shadow-[0_0_14px_currentColor]"
              style={{ color: style.color, backgroundColor: style.color }}
            />
            <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-bold text-cyan-100">
              {city.name}
            </span>
          </button>
        );
      })}
      <div className="absolute left-4 top-4 rounded-full border border-amber-200/20 bg-black/40 px-3 py-1 text-[10px] font-bold text-amber-100 backdrop-blur-md">
        WebGL 不可用，已切换平面地图
      </div>
    </div>
  );
}

export default function WorldGlobe({ cities, appearance = 'default', focusCityId, focusAltitude = HOME_CAMERA_ALTITUDE, targetFlight, onCityClick, onFlightComplete }: WorldGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const idleTimerRef = useRef<number | null>(null);
  const flightTimersRef = useRef<number[]>([]);
  const flightAnimationRef = useRef<number | null>(null);
  const activeFlightKeyRef = useRef<string | null>(null);
  const homeFocusCityIdRef = useRef<string | null>(null);
  const citiesRef = useRef(cities);
  const onCityClickRef = useRef(onCityClick);
  const onFlightCompleteRef = useRef(onFlightComplete);
  const controlHandlersRef = useRef<{ start?: () => void; end?: () => void }>({});
  const readyRef = useRef(false);
  const configuringRef = useRef(false);
  const { ref: containerRef, size } = useContainerSize();
  const reducedMotion = useReducedMotion();
  const [isReady, setIsReady] = useState(false);
  const [webglAvailable] = useState(() => supportsWebGL());
  const [flightArc, setFlightArc] = useState<FlightArc | null>(null);
  const [flightMarker, setFlightMarker] = useState<FlightMarker | null>(null);
  const [countryPolygons, setCountryPolygons] = useState<CountryPolygon[]>([]);

  const cityStatusKey = cities.map(city => `${city.id}:${city.status}:${city.completed}`).join('|');
  const cityPoints = useMemo(() => cities.map(city => ({
    ...city,
    ...getPointStyle(city)
  })), [cities, cityStatusKey]);

  const ringPoints = useMemo(
    () => cityPoints.filter(city => city.status === 'lit' || city.status === 'in-progress'),
    [cityPoints]
  );

  const htmlElements = useMemo<GlobeHtmlElement[]>(
    () => flightMarker ? [...cityPoints, flightMarker] : cityPoints,
    [cityPoints, flightMarker]
  );

  const flightKey = targetFlight ? `${targetFlight.fromCityId}->${targetFlight.toCityId}` : null;

  useEffect(() => {
    citiesRef.current = cities;
  }, [cities]);

  useEffect(() => {
    onCityClickRef.current = onCityClick;
  }, [onCityClick]);

  useEffect(() => {
    onFlightCompleteRef.current = onFlightComplete;
  }, [onFlightComplete]);

  const starPoints = useMemo(() => Array.from({ length: 46 }, (_, index) => {
    const angle = (index * 137.5) % 360;
    const radius = 12 + (index % 9) * 9;
    return {
      id: index,
      left: `${50 + Math.cos(angle * Math.PI / 180) * radius}%`,
      top: `${46 + Math.sin(angle * Math.PI / 180) * radius * 0.62}%`,
      opacity: 0.18 + (index % 5) * 0.08,
      size: 1 + (index % 3) * 0.7
    };
  }), []);

  const auroraOceanMaterial = useMemo(() => new THREE.MeshPhongMaterial({
    color: new THREE.Color('#ffffff'),
    emissive: new THREE.Color('#06131d'),
    emissiveIntensity: 0.2,
    specular: new THREE.Color('#a7cedd'),
    shininess: 18
  }), []);

  useEffect(() => () => auroraOceanMaterial.dispose(), [auroraOceanMaterial]);

  const nightEarthMaterial = useMemo(() => new THREE.MeshPhongMaterial({
    color: new THREE.Color('#f6f7fb'),
    emissive: new THREE.Color('#101521'),
    emissiveIntensity: 0.46,
    specular: new THREE.Color('#a0a8ba'),
    shininess: 7
  }), []);

  useEffect(() => () => nightEarthMaterial.dispose(), [nightEarthMaterial]);

  const applyGlobeLighting = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    if (appearance === 'aurora') {
      const ambient = new THREE.AmbientLight(0x8fb8c9, 0.7);
      const sunlight = new THREE.DirectionalLight(0xfff4dc, 1.5);
      sunlight.position.set(-2.2, 1.6, 2.8);
      const skyFill = new THREE.DirectionalLight(0x6ea6cc, 0.32);
      skyFill.position.set(0.4, -1.6, 1.1);
      const atmosphericRim = new THREE.DirectionalLight(0x8dd8f2, 0.46);
      atmosphericRim.position.set(2.5, 0.4, -1.8);
      globe.lights([ambient, sunlight, skyFill, atmosphericRim]);
      return;
    }

    if (appearance === 'night') {
      const ambient = new THREE.AmbientLight(0x8f96a6, 0.6);
      const moonlight = new THREE.DirectionalLight(0xd7deef, 0.42);
      moonlight.position.set(-1.8, 1.5, 2.6);
      const cityRim = new THREE.DirectionalLight(0x8f96d8, 0.28);
      cityRim.position.set(2.4, 0.3, -1.6);
      globe.lights([ambient, moonlight, cityRim]);
      return;
    }

    const ambient = new THREE.AmbientLight(0x7dd3fc, 1.35);
    const key = new THREE.DirectionalLight(0xdff7ff, 1.7);
    key.position.set(-1.6, 1.2, 2.4);
    const rim = new THREE.DirectionalLight(0x2dd4bf, 0.85);
    rim.position.set(2.2, -0.8, -1.1);
    globe.lights([ambient, key, rim]);
  }, [appearance]);

  useEffect(() => {
    let cancelled = false;

    fetch(COUNTRIES_TOPOLOGY_URL)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load country topology');
        return response.json();
      })
      .then(worldAtlas => {
        if (cancelled) return;
        const countries = feature(worldAtlas, worldAtlas.objects.countries) as unknown as { features: CountryPolygon[] };
        setCountryPolygons(countries.features);
      })
      .catch(() => {
        if (!cancelled) setCountryPolygons([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const setAutoRotate = useCallback((enabled: boolean) => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = !reducedMotion && enabled;
    controls.autoRotateSpeed = 0.22;
  }, [reducedMotion]);

  const scheduleAutoRotate = useCallback(() => {
    clearIdleTimer();
    if (reducedMotion) return;
    idleTimerRef.current = window.setTimeout(() => setAutoRotate(true), 4000);
  }, [clearIdleTimer, reducedMotion, setAutoRotate]);

  const focusCity = useCallback((city: CityData, transitionMs = 900, altitude = CAMERA_ALTITUDE) => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView(
      {
        lat: city.lat,
        lng: city.lng,
        altitude: reducedMotion ? Math.max(altitude, REDUCED_CAMERA_ALTITUDE) : altitude
      },
      reducedMotion ? Math.min(transitionMs, 120) : transitionMs
    );
  }, [reducedMotion]);

  const configureGlobe = useCallback(() => {
    const globe = globeRef.current;
    if (!globe || readyRef.current || configuringRef.current) return false;

    configuringRef.current = true;
    try {
      const renderer = globe.renderer();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);

      const controls = globe.controls();
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.52;
      controls.zoomSpeed = 0.72;
      controls.minDistance = 190;
      controls.maxDistance = 520;

      const previousHandlers = controlHandlersRef.current;
      if (previousHandlers.start) controls.removeEventListener('start', previousHandlers.start);
      if (previousHandlers.end) controls.removeEventListener('end', previousHandlers.end);

      const handleControlStart = () => {
        setAutoRotate(false);
        clearIdleTimer();
      };
      const handleControlEnd = () => scheduleAutoRotate();
      controlHandlersRef.current = { start: handleControlStart, end: handleControlEnd };
      controls.addEventListener('start', handleControlStart);
      controls.addEventListener('end', handleControlEnd);

      applyGlobeLighting();

      const city = cities.find(item => item.id === focusCityId)
        || cities.find(item => item.status === 'in-progress')
        || cities.find(item => item.status === 'lit')
        || cities[0];
      if (city) {
        focusCity(city, 850, focusAltitude);
        homeFocusCityIdRef.current = city.id;
      }
      clearIdleTimer();
      setAutoRotate(false);
      scheduleAutoRotate();
      readyRef.current = true;
      setIsReady(true);
      return true;
    } catch {
      return false;
    } finally {
      configuringRef.current = false;
    }
  }, [applyGlobeLighting, cities, clearIdleTimer, focusAltitude, focusCity, focusCityId, scheduleAutoRotate, setAutoRotate]);

  useEffect(() => {
    if (!isReady) return;
    applyGlobeLighting();
  }, [applyGlobeLighting, isReady]);

  useEffect(() => {
    if (!webglAvailable || isReady || size.width <= 1 || size.height <= 1) return;

    let cancelled = false;
    let retryTimer: number | null = null;

    const attemptBootstrap = () => {
      if (cancelled || readyRef.current) return;
      if (!configureGlobe()) {
        retryTimer = window.setTimeout(attemptBootstrap, GLOBE_BOOTSTRAP_RETRY_MS);
      }
    };

    const animationFrame = window.requestAnimationFrame(attemptBootstrap);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [configureGlobe, isReady, size.height, size.width, webglAvailable]);

  useEffect(() => {
    if (!isReady || !readyRef.current || targetFlight || !focusCityId) return;
    if (homeFocusCityIdRef.current === focusCityId) return;

    const city = citiesRef.current.find(item => item.id === focusCityId);
    if (!city) return;

    clearIdleTimer();
    setAutoRotate(false);
    focusCity(city, 720, focusAltitude);
    homeFocusCityIdRef.current = city.id;
    scheduleAutoRotate();
  }, [clearIdleTimer, focusAltitude, focusCity, focusCityId, isReady, scheduleAutoRotate, setAutoRotate, targetFlight]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !readyRef.current) return;
    const controls = globe.controls();
    controls.autoRotate = false;
    scheduleAutoRotate();
  }, [scheduleAutoRotate]);

  useEffect(() => {
    return () => {
      clearIdleTimer();
      flightTimersRef.current.forEach(timer => window.clearTimeout(timer));
      flightTimersRef.current = [];
      if (flightAnimationRef.current) {
        window.cancelAnimationFrame(flightAnimationRef.current);
        flightAnimationRef.current = null;
      }
      setFlightMarker(null);
      const globe = globeRef.current;
      if (globe) {
        const controls = globe.controls();
        const { start, end } = controlHandlersRef.current;
        if (start) controls.removeEventListener('start', start);
        if (end) controls.removeEventListener('end', end);
        controls.autoRotate = false;
      }
    };
  }, [clearIdleTimer]);

  useEffect(() => {
    flightTimersRef.current.forEach(timer => window.clearTimeout(timer));
    flightTimersRef.current = [];
    if (flightAnimationRef.current) {
      window.cancelAnimationFrame(flightAnimationRef.current);
      flightAnimationRef.current = null;
    }
    setFlightArc(null);
    setFlightMarker(null);

    if (!flightKey || !targetFlight || !isReady || !readyRef.current) {
      activeFlightKeyRef.current = null;
      return;
    }

    if (activeFlightKeyRef.current === flightKey) return;
    activeFlightKeyRef.current = flightKey;

    const fromCity = citiesRef.current.find(city => city.id === targetFlight.fromCityId);
    const toCity = citiesRef.current.find(city => city.id === targetFlight.toCityId);
    if (!fromCity || !toCity) return;

    clearIdleTimer();
    setAutoRotate(false);
    focusCity(fromCity, reducedMotion ? 120 : 900);

    const showArcTimer = window.setTimeout(() => {
      const initialNext = interpolateGreatCircle(fromCity, toCity, 0.02);
      const initialBearing = getScreenBearing(globeRef.current, fromCity, initialNext);
      setFlightArc({
        id: `${fromCity.id}-${toCity.id}-${Date.now()}`,
        startLat: fromCity.lat,
        startLng: fromCity.lng,
        endLat: toCity.lat,
        endLng: toCity.lng
      });
      setFlightMarker({
        kind: 'flight-plane',
        id: `plane-${fromCity.id}-${toCity.id}-${Date.now()}`,
        lat: fromCity.lat,
        lng: fromCity.lng,
        bearing: initialBearing
      });
      focusCity(toCity, reducedMotion ? 160 : 3800);

      if (!reducedMotion) {
        const duration = 3800;
        const startedAt = performance.now();

        const tick = (now: number) => {
          const rawProgress = Math.min(1, (now - startedAt) / duration);
          const easedProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
          const current = interpolateGreatCircle(fromCity, toCity, easedProgress);
          const next = interpolateGreatCircle(fromCity, toCity, Math.min(1, easedProgress + 0.012));
          setFlightMarker(marker => marker ? {
            ...marker,
            lat: current.lat,
            lng: current.lng,
            bearing: getScreenBearing(globeRef.current, current, next)
          } : marker);

          if (rawProgress < 1) {
            flightAnimationRef.current = window.requestAnimationFrame(tick);
          }
        };

        flightAnimationRef.current = window.requestAnimationFrame(tick);
      }
    }, reducedMotion ? 120 : 720);

    const finishTimer = window.setTimeout(() => {
      if (flightAnimationRef.current) {
        window.cancelAnimationFrame(flightAnimationRef.current);
        flightAnimationRef.current = null;
      }
      setFlightMarker(null);
      setFlightArc(null);
      focusCity(toCity, 360);
      onCityClickRef.current(toCity);
      onFlightCompleteRef.current?.();
      activeFlightKeyRef.current = null;
      scheduleAutoRotate();
    }, reducedMotion ? 650 : 5300);

    flightTimersRef.current = [showArcTimer, finishTimer];
    return () => {
      flightTimersRef.current.forEach(timer => window.clearTimeout(timer));
      flightTimersRef.current = [];
      if (flightAnimationRef.current) {
        window.cancelAnimationFrame(flightAnimationRef.current);
        flightAnimationRef.current = null;
      }
      setFlightMarker(null);
      setFlightArc(null);
    };
  }, [clearIdleTimer, flightKey, focusCity, isReady, reducedMotion, scheduleAutoRotate, setAutoRotate]);

  const handlePointClick = useCallback((point: object) => {
    const city = point as CityPoint;
    clearIdleTimer();
    setAutoRotate(false);
    focusCity(city, 900);
    window.setTimeout(() => {
      onCityClick(city);
      scheduleAutoRotate();
    }, reducedMotion ? 80 : 260);
  }, [clearIdleTimer, focusCity, onCityClick, reducedMotion, scheduleAutoRotate, setAutoRotate]);

  const createCityLabel = useCallback((point: object) => {
    const globeElement = point as GlobeHtmlElement;

    if (isFlightMarker(globeElement)) {
      const plane = document.createElement('div');
      plane.setAttribute('aria-label', '城市航线飞行动画');
      plane.innerHTML = `
        <span class="plane-rotor">
          <span class="plane-glow"></span>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.2c.4 0 .74.28.82.67l2.06 9.62 5.33 3.52c.26.17.4.47.35.78l-.2 1.24a.78.78 0 0 1-1.02.62l-4.02-1.36.7 3.21c.06.28-.04.57-.26.75l-2.17 1.78a.92.92 0 0 1-1.18 0l-2.17-1.78a.78.78 0 0 1-.26-.75l.7-3.21-4.02 1.36a.78.78 0 0 1-1.02-.62l-.2-1.24c-.05-.31.09-.61.35-.78l5.33-3.52 2.06-9.62c.08-.39.42-.67.82-.67z"/>
            <path d="M12 4.9v14.4" fill="none" stroke="rgba(255,255,255,.58)" stroke-width="1.15" stroke-linecap="round"/>
          </svg>
        </span>
      `;

      Object.assign(plane.style, {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: '999px',
        color: '#fef3c7',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 12px rgba(250, 204, 21, 0.42))'
      });

      const rotor = plane.querySelector<HTMLElement>('.plane-rotor');
      if (rotor) {
        Object.assign(rotor.style, {
          position: 'absolute',
          left: '50%',
          top: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          transform: `translate(-50%, -50%) rotate(${globeElement.bearing}deg)`,
          transformOrigin: '50% 50%',
          transition: reducedMotion ? 'none' : 'transform 120ms linear'
        });
      }

      const glow = plane.querySelector<HTMLElement>('.plane-glow');
      if (glow) {
        Object.assign(glow.style, {
          position: 'absolute',
          inset: '8px',
          borderRadius: '999px',
          background: 'rgba(250, 204, 21, 0.24)',
          boxShadow: '0 0 20px rgba(250, 204, 21, 0.42), 0 0 34px rgba(45, 212, 191, 0.20)'
        });
      }

      const svg = plane.querySelector<SVGElement>('svg');
      if (svg) {
        Object.assign(svg.style, {
          position: 'relative',
          width: '25px',
          height: '25px'
        });
      }

      return plane;
    }

    const city = globeElement;
    const label = document.createElement('button');
    label.type = 'button';
    label.setAttribute('aria-label', `查看${city.name}`);

    const isLit = city.status === 'lit';
    const isCurrent = city.status === 'in-progress';
    const isUpcoming = city.status === 'upcoming';
    const markerSize = isCurrent ? 42 : isLit ? 40 : isUpcoming ? 30 : 34;
    const borderColor = isCurrent
      ? 'rgba(250, 204, 21, 0.72)'
      : isLit
        ? 'rgba(94, 234, 212, 0.46)'
        : isUpcoming
          ? 'rgba(100, 116, 139, 0.34)'
          : 'rgba(147, 197, 253, 0.34)';
    const textColor = isCurrent
      ? '#fde68a'
      : isLit
        ? '#a7f3d0'
        : isUpcoming
          ? 'rgba(203, 213, 225, 0.52)'
          : '#bfdbfe';
    const labelBackground = isCurrent
      ? 'rgba(64, 38, 6, 0.78)'
      : isLit
        ? 'rgba(8, 47, 42, 0.54)'
        : isUpcoming
          ? 'rgba(15, 23, 42, 0.48)'
          : 'rgba(15, 31, 52, 0.52)';
    const iconBackground = isCurrent
      ? 'radial-gradient(circle at 35% 25%, rgba(254, 240, 138, 0.92), rgba(234, 179, 8, 0.88) 58%, rgba(92, 52, 4, 0.78))'
      : isLit
        ? 'radial-gradient(circle at 35% 25%, rgba(204, 251, 241, 0.72), rgba(45, 212, 191, 0.52) 58%, rgba(6, 95, 70, 0.38))'
        : isUpcoming
          ? 'radial-gradient(circle at 35% 25%, rgba(148, 163, 184, 0.34), rgba(51, 65, 85, 0.42) 60%, rgba(15, 23, 42, 0.52))'
          : 'radial-gradient(circle at 35% 25%, rgba(191, 219, 254, 0.50), rgba(59, 130, 246, 0.34) 60%, rgba(30, 41, 59, 0.42))';

    label.innerHTML = `
      <span class="city-name">${city.name}</span>
      <span class="city-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round">
          ${getCityIconSvg(city)}
        </svg>
      </span>
    `;

    Object.assign(label.style, {
      transform: 'translate(-50%, -112%)',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      width: `${Math.max(markerSize + 18, 52)}px`,
      padding: '0',
      border: '0',
      background: 'transparent',
      color: textColor,
      fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif',
      letterSpacing: '0',
      cursor: 'pointer',
      userSelect: 'none',
      outline: 'none',
      pointerEvents: 'auto'
    });

    const nameNode = label.querySelector<HTMLElement>('.city-name');
    if (nameNode) {
      Object.assign(nameNode.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '92px',
        padding: '3px 7px',
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        background: labelBackground,
        boxShadow: isCurrent
          ? '0 0 18px rgba(250, 204, 21, 0.22)'
          : isLit
            ? '0 0 14px rgba(45, 212, 191, 0.14)'
            : '0 0 10px rgba(96, 165, 250, 0.08)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontSize: isLit || isCurrent ? '11px' : '10px',
        fontWeight: '800',
        lineHeight: '1.15',
        whiteSpace: 'nowrap'
      });
    }

    const iconNode = label.querySelector<HTMLElement>('.city-icon');
    if (iconNode) {
      Object.assign(iconNode.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${markerSize}px`,
        height: `${markerSize}px`,
        borderRadius: '999px',
        border: `1px solid ${borderColor}`,
        background: iconBackground,
        boxShadow: isCurrent
          ? '0 0 24px rgba(250, 204, 21, 0.38), inset 0 0 12px rgba(255,255,255,0.20)'
          : isLit
            ? '0 0 18px rgba(45, 212, 191, 0.22), inset 0 0 12px rgba(255,255,255,0.13)'
            : '0 0 12px rgba(96, 165, 250, 0.14), inset 0 0 10px rgba(255,255,255,0.06)',
        color: isUpcoming ? 'rgba(226, 232, 240, 0.68)' : '#ecfeff'
      });
    }

    const svgNode = label.querySelector<SVGElement>('svg');
    if (svgNode) {
      Object.assign(svgNode.style, {
        width: `${Math.round(markerSize * 0.54)}px`,
        height: `${Math.round(markerSize * 0.54)}px`,
        filter: isUpcoming ? 'none' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.34))'
      });
    }

    label.addEventListener('click', event => {
      event.stopPropagation();
      handlePointClick(city);
    });
    label.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        handlePointClick(city);
      }
    });

    return label;
  }, [handlePointClick, reducedMotion]);

  if (!webglAvailable) {
    return (
      <div ref={containerRef} className="absolute inset-0 z-10">
        <FlatMapFallback cities={cities} appearance={appearance} onCityClick={onCityClick} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 touch-none select-none overflow-hidden"
      aria-label="可交互 3D 地球地图，拖动旋转，滚轮或双指缩放，点击城市查看详情"
      role="application"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 ${appearance === 'aurora' ? 'bg-[radial-gradient(circle_at_43%_31%,rgba(147,197,220,0.14),transparent_32%),radial-gradient(circle_at_58%_46%,rgba(56,189,248,0.07),transparent_46%)]' : appearance === 'night' ? 'bg-[radial-gradient(circle_at_47%_35%,rgba(210,216,232,0.08),transparent_34%),radial-gradient(circle_at_62%_48%,rgba(126,134,243,0.035),transparent_45%)]' : 'bg-[radial-gradient(circle_at_50%_38%,rgba(20,184,166,0.14),transparent_34%),radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.10),transparent_42%)]'}`} />
        {starPoints.map(star => (
          <span
            key={star.id}
            className="absolute rounded-full bg-cyan-100"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 5}px rgba(125, 211, 252, 0.45)`
            }}
          />
        ))}
      </div>

      {!isReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-cyan-200/10 bg-cyan-200/[0.025] shadow-[0_0_80px_rgba(34,211,238,0.12)]">
            <div className="absolute inset-5 rounded-full border border-cyan-100/10" />
            <div className="absolute inset-10 animate-pulse rounded-full bg-cyan-200/10 blur-2xl" />
            <div className="relative font-mono text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/70">
              Loading Globe
            </div>
          </div>
        </div>
      )}

      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={appearance === 'aurora' ? NATURAL_EARTH_TEXTURE_URL : appearance === 'night' ? NIGHT_EARTH_TEXTURE_URL : GLOBE_TEXTURE_URL}
        globeMaterial={appearance === 'aurora' ? auroraOceanMaterial : appearance === 'night' ? nightEarthMaterial : undefined}
        showAtmosphere
        atmosphereColor={appearance === 'aurora' ? '#9bd7ee' : appearance === 'night' ? '#b9c1d8' : '#67e8f9'}
        atmosphereAltitude={appearance === 'aurora' ? 0.13 : appearance === 'night' ? 0.085 : 0.16}
        globeCurvatureResolution={5}
        polygonsData={countryPolygons}
        polygonAltitude={appearance === 'default' ? 0.003 : 0.0015}
        polygonCapColor={() => appearance === 'default' ? 'rgba(31, 63, 76, 0.72)' : 'rgba(255, 255, 255, 0)'}
        polygonSideColor={() => appearance === 'aurora' ? 'rgba(34, 70, 86, 0.08)' : appearance === 'night' ? 'rgba(90, 98, 118, 0.045)' : 'rgba(8, 24, 39, 0.12)'}
        polygonStrokeColor={() => appearance === 'aurora' ? 'rgba(185, 219, 228, 0.15)' : appearance === 'night' ? 'rgba(190, 198, 216, 0.085)' : 'rgba(125, 211, 252, 0.16)'}
        polygonsTransitionDuration={isReady ? 450 : 0}
        pointsData={[]}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="altitude"
        pointRadius={(point: object) => (point as CityPoint).radius}
        pointColor={(point: object) => (point as CityPoint).color}
        pointResolution={18}
        pointsMerge={false}
        pointsTransitionDuration={reducedMotion ? 0 : 500}
        pointLabel={(point: object) => {
          const city = point as CityPoint;
          return `${city.name} · ${city.status === 'lit' ? '已点亮' : city.status === 'in-progress' ? '正在点亮' : city.status === 'upcoming' ? '未开放' : '待点亮'}`;
        }}
        onPointClick={handlePointClick}
        htmlElementsData={htmlElements}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={(point: object) => {
          const element = point as GlobeHtmlElement;
          if (isFlightMarker(element)) return 0.2;
          return element.status === 'lit' || element.status === 'in-progress' ? 0.088 : 0.072;
        }}
        htmlElement={createCityLabel}
        htmlElementVisibilityModifier={(element: HTMLElement, isVisible: boolean) => {
          element.style.opacity = isVisible ? '1' : '0';
          element.style.pointerEvents = isVisible ? 'auto' : 'none';
        }}
        htmlTransitionDuration={reducedMotion ? 0 : 220}
        labelsData={[]}
        labelLat="lat"
        labelLng="lng"
        labelAltitude={(label: object) => ((label as CityPoint).status === 'lit' ? 0.058 : 0.048)}
        labelText={(label: object) => (label as CityPoint).name}
        labelColor={(label: object) => (label as CityPoint).labelColor}
        labelSize={(label: object) => {
          const city = label as CityPoint;
          if (city.status === 'lit') return 0.86;
          if (city.status === 'in-progress') return 0.78;
          return 0.62;
        }}
        labelDotRadius={0}
        labelIncludeDot={false}
        labelResolution={3}
        labelLabel={(label: object) => (label as CityPoint).name}
        onLabelClick={handlePointClick}
        ringsData={ringPoints}
        ringLat="lat"
        ringLng="lng"
        ringAltitude={0.022}
        ringColor={(ring: object) => {
          const city = ring as CityPoint;
          if (city.status === 'in-progress') return (t: number) => `rgba(250, 204, 21, ${0.34 * (1 - t)})`;
          return (t: number) => `rgba(45, 212, 191, ${0.26 * (1 - t)})`;
        }}
        ringMaxRadius={(ring: object) => ((ring as CityPoint).status === 'lit' ? 3.4 : 2.8)}
        ringPropagationSpeed={reducedMotion ? 0.01 : 1.15}
        ringRepeatPeriod={reducedMotion ? 100000000 : 2200}
        arcsData={flightArc ? [flightArc] : []}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcAltitude={0.32}
        arcStroke={0.72}
        arcColor={() => ['rgba(103,232,249,0.62)', 'rgba(250,204,21,0.72)']}
        arcDashLength={1}
        arcDashGap={0}
        arcDashInitialGap={0}
        arcDashAnimateTime={0}
        arcsTransitionDuration={reducedMotion ? 0 : 350}
        onGlobeReady={configureGlobe}
      />

      {appearance === 'aurora' && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute left-[17%] top-[20%] h-24 w-[66%] -rotate-6 rounded-[50%] bg-[linear-gradient(105deg,transparent_10%,rgba(186,230,253,0.025)_34%,rgba(125,211,252,0.055)_52%,rgba(186,230,253,0.025)_70%,transparent_90%)] blur-2xl mix-blend-screen" />
        </div>
      )}

      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t ${appearance === 'aurora' ? 'from-[#04101a] via-[#04101a]/58' : appearance === 'night' ? 'from-[#020813] via-[#020813]/62' : 'from-[#081827] via-[#081827]/62'} to-transparent`} />
      <div className={cn(
        'pointer-events-none absolute inset-0 rounded-[36px] border',
        appearance === 'aurora'
          ? 'border-sky-100/[0.045] shadow-[inset_0_0_96px_rgba(2,18,30,0.58)]'
          : appearance === 'night'
          ? 'border-blue-100/[0.04] shadow-[inset_0_0_100px_rgba(1,8,20,0.72)]'
          : 'border-cyan-100/[0.03] shadow-[inset_0_0_90px_rgba(8,24,39,0.68)]'
      )} />
    </div>
  );
}
