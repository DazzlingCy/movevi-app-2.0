import { periodOpen, weekendPeriod } from '../../journey/weekendRelay';
import { Fragment, lazy, Suspense, useCallback, useEffect, useReducer, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, ClipboardList,
  Clock3, Compass, Flame, Footprints, GalleryHorizontalEnd, Globe2, Headphones, HeadphonesIcon, LockKeyhole, Mail, Map, MapPin,
  Medal, MessageSquare, MonitorSmartphone, Navigation, Pause, Play, RotateCcw, Route,
  Settings, Sparkles, SquarePen, Target, Trophy, UserRound, UsersRound, Wallet, Wifi, WifiOff, X
} from 'lucide-react';
import { CITIES, type CityData } from '../../data/cities';
import { getRouteCover } from '../../data/routeCovers';
import { getCityRouteSequence } from '../../journey/routeList';
import { getCityRouteReleaseDate, getJourneyCity, getJourneyRoute, hasPublishedCityRoutes, JOURNEY_SEQUENCE } from '../../journey/data';
import {
  createPrototypeJourneyState, getCandidateCityIds, getCityPlanTotals, getCityStatus,
  getCompletedRouteIds, getCountryLevelProgress, getHomeJourneyCityIds, getJourneyTotals, getOpenRouteCount, getRouteStatus, journeyReducer
} from '../../journey/state';
import type { JourneyCity, JourneyRoute, JourneyState, RunResult } from '../../journey/types';
import { FIRST_CITY_REWARDS, formatRewardCents, loadFirstCityRewards, restoreFirstCityJourney } from '../../journey/firstCityRewards';
import { useFirstCityRewards } from '../../journey/useFirstCityRewards';
import CityRoutesView, { type CityRouteListItem } from '../CityRoutesView';
import CityImage from '../CityImage';
import EventsTab from '../EventsTab';
import JourneyLevelView from '../JourneyLevelView';
import LeaderboardView from '../LeaderboardView';
import MedalLotteryView from '../MedalLotteryView';
import OnlineSupportView from '../OnlineSupportView';
import MyDevicesView from '../MyDevicesView';
import DeviceConnectedPrompt from '../DeviceConnectedPrompt';
import { resolveLocalImage, resolveRecommendationCover } from '../../lib/localImages';
import { createRunSceneryVideo } from '../../lib/runScenery';
import RouteDetailView from '../RouteDetailView';
import RunPlaybackView from '../RunPlaybackView';
import TeamRelayView from '../TeamRelayView';
import { usePuzzleTeam } from '../../journey/usePuzzleTeam';
import { getPuzzlePreviewMode } from '../../journey/puzzleDemo';
import { createCarouselSettler, hasMeaningfulCarouselScroll } from '../../journey/homeCarousel';
import { CityRunProgress, DailyGoalEditor, HomeSportStats, RunIcon, TodayExerciseSummary } from './HomeRunElements';
import { useDailyExercise } from '../../journey/useDailyExercise';
import { exerciseDay } from '../../journey/dailyExercise';
import { getDailyRouteRecommendations, type DailyRouteRecommendation } from '../../journey/routeRecommendations';
import DailyRouteRecommendationsView from '../DailyRouteRecommendationsView';
import homeRunStyles from './HomeRunElements.module.css';
import { periodParticipation, ownPieces, puzzleComplete, type PuzzleRoute } from '../../journey/puzzleTeam';
import FirstCityRewardsView from '../FirstCityRewardsView';
import WeekendMedleyView from '../WeekendMedleyView';
import Modal from './Modal';

const JourneyGlobe = lazy(() => import('./JourneyGlobe'));

const JOURNEY_CITY_SEQUENCE: JourneyCity[] = JOURNEY_SEQUENCE
  .map(cityId => getJourneyCity(cityId))
  .filter((city): city is JourneyCity => Boolean(city));
const PUBLISHED_CITY_IDS = JOURNEY_CITY_SEQUENCE.map(city => city.id).filter(hasPublishedCityRoutes);

const CITY_CONTINENT_FILTERS = ['全部', '亚洲', '欧洲', '非洲', '北美洲', '南美洲', '大洋洲', '南极洲'] as const;
type CityContinentFilter = (typeof CITY_CONTINENT_FILTERS)[number];

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

const cityStyle = (city: JourneyCity) => ({ '--city-accent': city.accent } as CSSProperties);

const JOURNEY_CITY_IMAGES: Record<string, string> = {
  hangzhou: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_4_%28cropped%29.jpg/1280px-%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_4_%28cropped%29.jpg',
  beijing: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg/1280px-Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg',
  shanghai: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg/1280px-Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg',
  xian: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg/1280px-City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg',
  tokyo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1200',
  london: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/1280px-London_Skyline_%28125508655%29.jpeg',
  'new-york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200',
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1200',
  rio: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1200',
  cairo: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1200',
  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=1200',
  mumbai: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gateway_of_India_%28cropped%29.jpg/1280px-Gateway_of_India_%28cropped%29.jpg',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=1200',
  moscow: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&q=80&w=1200',
  'los-angeles': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Los_Angeles%2C_Winter_2016.jpg/1280px-Los_Angeles%2C_Winter_2016.jpg',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1200',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1200',
  berlin: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&q=80&w=1200',
  toronto: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&q=80&w=1200'
};

const JOURNEY_CITY_VIDEOS: Partial<Record<string, string>> = {
  tokyo: 'https://videos.pexels.com/video-files/11720138/11720138-hd_1280_720_30fps.mp4',
  paris: 'https://videos.pexels.com/video-files/20046743/20046743-hd_1280_720_60fps.mp4',
  'new-york': 'https://videos.pexels.com/video-files/37898785/16079913_4094_2160_30fps.mp4'
};

const CITY_RUNNER_COUNTS: Record<string, number> = {
  hangzhou: 18642,
  beijing: 28376,
  shanghai: 25819,
  xian: 14208,
  tokyo: 31486,
  paris: 27905,
  london: 24613,
  'new-york': 29740,
  sydney: 16386,
  rio: 12948,
  cairo: 11672,
  bangkok: 15931,
  mumbai: 19284,
  singapore: 13756,
  moscow: 10843,
  'los-angeles': 21567,
  rome: 17429,
  dubai: 18906,
  berlin: 16752,
  toronto: 14635
};

const DEFAULT_JOURNEY_CITY_VIDEO = JOURNEY_CITY_VIDEOS.tokyo!;

const cityImageFor = (city: JourneyCity) => resolveLocalImage(
  JOURNEY_CITY_IMAGES[city.id]
  ?? CITIES.find(item => item.name === city.name || item.englishName === city.englishName)?.image
  ?? 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200')!;

const cityVideoFor = (city: JourneyCity) => JOURNEY_CITY_VIDEOS[city.id] ?? DEFAULT_JOURNEY_CITY_VIDEO;

const toLegacyCity = (city: JourneyCity, state: JourneyState): CityData => {
  const completed = getCompletedRouteIds(state, city.id).length;
  return {
    id: city.id,
    name: city.name,
    englishName: city.englishName,
    continent: city.continent,
    x: 0,
    y: 0,
    lat: city.latitude,
    lng: city.longitude,
    image: cityImageFor(city),
    routes: city.routes.length,
    spots: city.routes.flatMap(route => route.landmarks).length,
    completed,
    status: completed >= city.routes.length ? 'lit' : completed > 0 ? 'in-progress' : 'unlit',
    completedRouteIndices: city.routes.filter(route => getCompletedRouteIds(state, city.id).includes(route.id)).map(route => route.order),
    description: city.description
  };
};

const getRouteListOpenCount = (state: JourneyState, cityId: string) => {
  const city = getJourneyCity(cityId);
  const completedCount = getCompletedRouteIds(state, cityId).length;
  if (!city) return 0;
  if (completedCount >= city.routes.length || getCityStatus(state, cityId) === 'completed') return city.routes.length;
  return getOpenRouteCount(completedCount);
};

const toLegacyRouteItem = (route: JourneyRoute, state: JourneyState, fromRecommendation = false): CityRouteListItem => {
  const status = getRouteStatus(state, route.cityId, route.id);
  return {
    title: route.name,
    coverImage: getRouteCover(getJourneyCity(route.cityId)?.name ?? '', route.order)?.src,
    distance: route.distanceKm.toFixed(1),
    duration: `${String(route.durationMinutes).padStart(2, '0')}:00`,
    calories: String(route.calories),
    rating: '4.8',
    spots: route.landmarks.join(' — '),
    intro: route.description,
    isCompleted: status === 'completed',
    isUnlocked: fromRecommendation || status !== 'locked'
  };
};

function TreadmillIcon({ connected = true }: { connected?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="treadmill-icon">
      <path d="M5 17.5h10.4c1.4 0 2.6-.9 3-2.2l1.2-3.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.8 19.5h13.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 17.5 13 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.2 7.5h5.3c.7 0 1.2.5 1.2 1.2v1.1c0 .7-.5 1.2-1.2 1.2h-6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.1 8.9h.1" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      {connected && <circle cx="20" cy="5" r="2" fill="currentColor" />}
    </svg>
  );
}

function CityArtwork({ city, compact = false }: { city: JourneyCity; compact?: boolean }) {
  return (
    <div className={`city-artwork${compact ? ' city-artwork--compact' : ''}`} style={cityStyle(city)} aria-hidden="true">
      <div className="city-artwork__sun" />
      <div className="city-artwork__contours" />
      <span className="city-artwork__code">{city.latitude.toFixed(1)}°N / {city.longitude.toFixed(1)}°E</span>
      <strong>{city.englishName}</strong>
      <div className="city-artwork__skyline"><i /><i /><i /><i /><i /><i /><i /></div>
    </div>
  );
}

function ProgressSegments({ completed, showRunner = false }: { completed: number; showRunner?: boolean }) {
  const progress = Math.min(10, Math.max(0, completed)) * 10;
  return (
    <div className={`progress-segments${completed >= 10 ? ' is-finished' : ''}${showRunner ? ' has-runner' : ''}`} aria-label={`已完成 ${completed} / 10 条路线`} style={{ '--completed-progress': `${progress}%` } as CSSProperties}>
      {showRunner && completed > 0 && <b className="progress-segments__runner" aria-hidden="true"><Footprints /></b>}
      {Array.from({ length: 10 }, (_, index) => {
        const complete = index < completed;
        const latest = complete && index === completed - 1;
        return <span key={index} className={`${complete ? 'is-complete' : ''}${latest ? ' is-latest' : ''}`} style={{ '--segment-index': index } as CSSProperties} />;
      })}
    </div>
  );
}

interface HomePageProps {
  state: JourneyState;
  newCityIds: readonly string[];
  recommendations: DailyRouteRecommendation[];
  todayExercise: RunResult;
  dailyGoalKm: number;
  allowGoalAnimation: boolean;
  onEditDailyGoal: () => void;
  city: JourneyCity;
  deviceConnected: boolean;
  onRoutes: (cityId: string) => void;
  onRecommendations: () => void;
  onBrowseCity: (cityId: string) => void;
  onSelectNextCity: (cityId: string) => void;
  focusNextStation: boolean;
  onNextStationFocused: () => void;
  onDevice: () => void;
  onLegacyFeature: (feature: LegacyFeature) => void;
  onCarouselEnd: () => void;
}

type LegacyFeature = 'onlineSupport' | 'firstCityRewards' | 'leaderboard' | 'level' | 'medalLottery' | 'weekendMedley' | 'teamRelay';

type ActivityRouteTarget = {
  source: 'medley';
  cityId: string;
  routeIndex: number;
  image: string;
} | {
  source: 'teamRelay';
  cityId: string;
  routeIndex: number;
  image: string;
  taskId: string;
};

function HomePage({ state, newCityIds, recommendations, todayExercise, dailyGoalKm, allowGoalAnimation, onEditDailyGoal, city, deviceConnected, onRoutes, onRecommendations, onBrowseCity, onSelectNextCity, focusNextStation, onNextStationFocused, onDevice, onLegacyFeature, onCarouselEnd }: HomePageProps) {
  const hasNewCity = newCityIds.length > 0;
  const carouselRef = useRef<HTMLDivElement>(null);
  const cityVideoRef = useRef<HTMLVideoElement>(null);
  const hasAlignedCarouselRef = useRef(false);
  const programmaticScrollRef = useRef(false);
  const carouselSettlerRef = useRef<ReturnType<typeof createCarouselSettler> | null>(null);
  const restingScrollLeftRef = useRef(0);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const cardMeasurementsRef = useRef<{ card: HTMLElement; center: number }[]>([]);
  const settleCarouselRef = useRef<() => void>(() => {});
  const afterScrollRef = useRef<(() => void) | null>(null);
  const mouseDragRef = useRef<{ pointerId: number; startX: number; scrollLeft: number; dragged: boolean; lastX: number; lastTime: number; velocity: number } | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);
  const endGestureRef = useRef<{ x: number; y: number; atEnd: boolean } | null>(null);
  const endNoticeTimeRef = useRef(-Infinity);
  const endWheelRef = useRef({ time: -Infinity, distance: 0, atEnd: false, notified: false });
  const isAtCarouselEnd = () => {
    const rail = carouselRef.current;
    return !!rail && rail.scrollWidth > rail.clientWidth && rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4;
  };
  const notifyCarouselEnd = () => {
    const now = performance.now();
    if (now - endNoticeTimeRef.current < 2000) return;
    endNoticeTimeRef.current = now;
    onCarouselEnd();
  };
  const finishEndGesture = (x: number, y: number) => {
    const start = endGestureRef.current;
    endGestureRef.current = null;
    if (!start?.atEnd || !isAtCarouselEnd()) return;
    const distance = start.x - x;
    if (distance >= 48 && distance > Math.abs(start.y - y) * 1.2) notifyCarouselEnd();
  };
  const [videoNeedsTap, setVideoNeedsTap] = useState(false);
  const featuredRecommendation = recommendations[0];
  const [candidateBatchIndex, setCandidateBatchIndex] = useState(0);
  const homeJourneyCities = getHomeJourneyCityIds(state).map(cityId => getJourneyCity(cityId)!).filter(Boolean);
  const cityIndex = Math.max(0, homeJourneyCities.findIndex(item => item.id === city.id));
  const nextStationCandidatePool = getCandidateCityIds(state, JOURNEY_CITY_SEQUENCE.length).map(cityId => getJourneyCity(cityId)!).filter(Boolean);
  const candidateBatchCount = Math.max(1, Math.ceil(nextStationCandidatePool.length / 3));
  const nextStationCandidates = Array.from(
    { length: Math.min(3, nextStationCandidatePool.length) },
    (_, offset) => nextStationCandidatePool[(candidateBatchIndex * 3 + offset) % nextStationCandidatePool.length]
  ).filter(Boolean);
  const currentCityCompleted = getCompletedRouteIds(state, state.currentCityId).length >= 10 || state.completedCityIds.includes(state.currentCityId);

  const updateCarouselCardVisuals = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    const influenceDistance = Math.max(1, carousel.clientWidth * 0.58);
    const viewportWidth = carousel.clientWidth;

    const measurements = cardMeasurementsRef.current.map(({ card, center }) => {
      const signedDistance = center - viewportCenter;
      const distanceRatio = Math.min(1, Math.abs(signedDistance) / influenceDistance);
      const closeness = 1 - distanceRatio;
      const eased = closeness * closeness * (3 - 2 * closeness);
      return { card, signedDistance, distanceRatio, eased };
    });

    measurements.forEach(({ card, signedDistance, eased }) => {
      const nearby = Math.abs(signedDistance) <= viewportWidth * 2;
      const willChange = nearby ? 'transform, translate, opacity' : 'auto';
      if (card.style.willChange !== willChange) card.style.willChange = willChange;
      if (!nearby) return;
      // Compress the visual spacing together with the cards, without changing snap geometry.
      const browseShift = -signedDistance * .26;
      card.style.setProperty('--journey-card-browse-x', `${browseShift.toFixed(2)}px`);
      card.style.setProperty('--journey-card-browse-opacity', (.7 + eased * .28).toFixed(3));
    });
  }, []);

  const requestCarouselVisualUpdate = useCallback(() => {
    if (scrollAnimationFrameRef.current) return;
    scrollAnimationFrameRef.current = window.requestAnimationFrame(() => {
      scrollAnimationFrameRef.current = null;
      updateCarouselCardVisuals();
    });
  }, [updateCarouselCardVisuals]);

  const setCarouselBrowsing = useCallback((browsing: boolean) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    if (!browsing) restingScrollLeftRef.current = carousel.scrollLeft;
    if (carousel.classList.contains('is-browsing') !== browsing) carousel.classList.toggle('is-browsing', browsing);
    requestCarouselVisualUpdate();
  }, [requestCarouselVisualUpdate]);

  const holdCarouselBrowsing = useCallback(() => {
    carouselSettlerRef.current?.cancel();
  }, []);

  const armCarouselSettle = useCallback(() => {
    if (!carouselSettlerRef.current) carouselSettlerRef.current = createCarouselSettler({
      delay:(callback,ms)=>window.setTimeout(callback,ms),
      clearDelay:id=>window.clearTimeout(id),
      frame:callback=>window.requestAnimationFrame(callback),
      cancelFrame:id=>window.cancelAnimationFrame(id),
    },()=>{
      carouselRef.current?.classList.remove('is-settling');
    },()=>{
      if (mouseDragRef.current?.dragged) return;
      programmaticScrollRef.current = false;
      settleCarouselRef.current();
      afterScrollRef.current?.();
      afterScrollRef.current = null;
    });
    carouselSettlerRef.current.arm();
  }, []);

  const carouselCityOrder = homeJourneyCities.map(item => item.id).join(',');
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const measureCards = () => {
      cardMeasurementsRef.current = [...carousel.querySelectorAll<HTMLElement>('[data-city-id], [data-next-station]')]
        .map(card => ({ card, center: card.offsetLeft + card.clientWidth / 2 }));
      requestCarouselVisualUpdate();
    };
    measureCards();
    const observer = new ResizeObserver(measureCards);
    observer.observe(carousel);
    return () => observer.disconnect();
  }, [carouselCityOrder, currentCityCompleted, requestCarouselVisualUpdate]);

  useEffect(() => () => {
    carouselSettlerRef.current?.cancel();
    if (scrollAnimationFrameRef.current) {
      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    const target = carousel?.querySelector<HTMLElement>(`[data-city-id="${city.id}"]`);
    if (!carousel || !target) return;
    const targetLeft = target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;
    if (Math.abs(carousel.scrollLeft - targetLeft) < 3) {
      programmaticScrollRef.current = false;
      hasAlignedCarouselRef.current = true;
      setCarouselBrowsing(false);
      requestCarouselVisualUpdate();
      return;
    }
    setCarouselBrowsing(true);
    programmaticScrollRef.current = true;
    carousel.scrollTo({
      left: targetLeft,
      behavior: hasAlignedCarouselRef.current ? 'smooth' : 'auto'
    });
    hasAlignedCarouselRef.current = true;
    armCarouselSettle();
  }, [city.id, armCarouselSettle, requestCarouselVisualUpdate, setCarouselBrowsing]);

  useEffect(() => {
    if (!focusNextStation) return;
    const carousel = carouselRef.current;
    const target = carousel?.querySelector<HTMLElement>('[data-next-station]');
    if (!carousel || !target) return;

    const targetLeft = target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;
    setCarouselBrowsing(true);
    programmaticScrollRef.current = true;
    carousel.scrollTo({ left: targetLeft, behavior: 'smooth' });
    hasAlignedCarouselRef.current = true;

    afterScrollRef.current = onNextStationFocused;
    armCarouselSettle();
  }, [focusNextStation, onNextStationFocused, armCarouselSettle, setCarouselBrowsing]);

  const selectNearestCity = () => {
    if (programmaticScrollRef.current) return false;
    const carousel = carouselRef.current;
    if (!carousel) return false;
    const cards = [...carousel.querySelectorAll<HTMLElement>('[data-city-id], [data-next-station]')];
    const firstCard = cards[0];
    if (!firstCard) return false;
    const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    const next = cards.reduce((nearest, card) => (
      Math.abs(card.offsetLeft + card.clientWidth / 2 - viewportCenter) < Math.abs(nearest.offsetLeft + nearest.clientWidth / 2 - viewportCenter) ? card : nearest
    ), firstCard);
    if (next.dataset.cityId && next.dataset.cityId !== city.id) {
      onBrowseCity(next.dataset.cityId);
      return true;
    }
    return false;
  };

  useEffect(() => {
    settleCarouselRef.current = () => {
      const cityChanged = selectNearestCity();
      if (!cityChanged) setCarouselBrowsing(false);
    };
  });

  const scheduleNearestCitySelection = () => {
    setCarouselBrowsing(true);
    armCarouselSettle();
  };

  const handleCarouselScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    if (!carousel.classList.contains('is-browsing') && !hasMeaningfulCarouselScroll(restingScrollLeftRef.current,carousel.scrollLeft)) return;
    scheduleNearestCitySelection();
  };

  const handleCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (event.key === 'ArrowRight' && isAtCarouselEnd()) {
      if (!event.repeat) notifyCarouselEnd();
      return;
    }
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextCity = homeJourneyCities[Math.min(homeJourneyCities.length - 1, Math.max(0, cityIndex + direction))];
    if (nextCity) onBrowseCity(nextCity.id);
  };

  const handleCarouselPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    holdCarouselBrowsing();
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    endGestureRef.current = { x: event.clientX, y: event.clientY, atEnd: isAtCarouselEnd() };
    mouseDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      dragged: false,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0
    };
  };

  const handleCarouselPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = mouseDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    if (!drag.dragged && Math.abs(deltaX) > 5) {
      drag.dragged = true;
      programmaticScrollRef.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.remove('is-settling');
      event.currentTarget.classList.add('is-dragging');
      setCarouselBrowsing(true);
    }
    if (!drag.dragged) return;

    event.preventDefault();
    const now = performance.now();
    const elapsed = Math.max(8, now - drag.lastTime);
    const instantaneousVelocity = (drag.lastX - event.clientX) / elapsed;
    drag.velocity = drag.velocity * .68 + instantaneousVelocity * .32;
    drag.lastX = event.clientX;
    drag.lastTime = now;
    event.currentTarget.scrollLeft = drag.scrollLeft - deltaX;
    requestCarouselVisualUpdate();
    holdCarouselBrowsing();
  };

  const finishCarouselPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') {
      if (event.type === 'pointerup') finishEndGesture(event.clientX, event.clientY);
      else endGestureRef.current = null;
    }
    event.currentTarget.classList.remove('is-dragging');
    const drag = mouseDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      const start = swipeStartRef.current;
      const moved = start ? Math.abs(event.clientX - start.x) > 8 : false;
      // Touch scrolling hands control to the browser through pointercancel.
      if (moved || event.type === 'pointercancel') scheduleNearestCitySelection();
      else if (carouselRef.current?.classList.contains('is-browsing')) armCarouselSettle();
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    mouseDragRef.current = null;

    if (drag.dragged) {
      swipedRef.current = true;
      window.setTimeout(() => { swipedRef.current = false; }, 180);
      const carousel = event.currentTarget;
      // Keep native snap disabled until this single momentum animation finishes.
      carousel.classList.add('is-settling');
      const cards = [...carousel.querySelectorAll<HTMLElement>('[data-city-id], [data-next-station]')];
      if (cards.length > 0) {
        const velocity = performance.now() - drag.lastTime < 100 ? drag.velocity : 0;
        const momentum = Math.max(-carousel.clientWidth * .52, Math.min(carousel.clientWidth * .52, velocity * 170));
        const projectedCenter = carousel.scrollLeft + momentum + carousel.clientWidth / 2;
        const target = cards.reduce((nearest, card) => (
          Math.abs(card.offsetLeft + card.clientWidth / 2 - projectedCenter) < Math.abs(nearest.offsetLeft + nearest.clientWidth / 2 - projectedCenter) ? card : nearest
        ), cards[0]);
        carousel.scrollTo({
          left: target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2,
          behavior: 'smooth'
        });
      }
      scheduleNearestCitySelection();
    } else {
      if (carouselRef.current?.classList.contains('is-browsing')) armCarouselSettle();
    }
  };

  const handleSwipeStart = (event: PointerEvent<HTMLElement>) => {
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
    swipedRef.current = false;
  };
  const handleSwipeEnd = (event: PointerEvent<HTMLElement>) => {
    if (!swipeStartRef.current) return;
    const deltaX = event.clientX - swipeStartRef.current.x;
    const deltaY = event.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    swipedRef.current = true;
    window.setTimeout(() => { swipedRef.current = false; }, 180);
  };
  const handleRoutesClick = (cityId: string) => {
    if (swipedRef.current || !hasPublishedCityRoutes(cityId)) return;
    onRoutes(cityId);
  };
  const handleCityCardClick = (cityId: string) => {
    if (swipedRef.current || cityId === city.id) return;
    onBrowseCity(cityId);
  };
  const handleCtaPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    swipeStartRef.current = null;
    mouseDragRef.current = null;
    swipedRef.current = false;
  };
  const handleDailyGoalEdit = () => {
    const carousel = carouselRef.current;
    const selected = carousel?.querySelector<HTMLElement>(`[data-city-id="${city.id}"]`);
    carouselSettlerRef.current?.cancel();
    swipeStartRef.current = null;
    mouseDragRef.current = null;
    swipedRef.current = false;
    if (carousel && selected) {
      carousel.classList.remove('is-dragging', 'is-settling');
      setCarouselBrowsing(false);
      const left = selected.offsetLeft - (carousel.clientWidth - selected.clientWidth) / 2;
      carousel.scrollTo({ left, behavior:'instant' });
      restingScrollLeftRef.current = carousel.scrollLeft;
      programmaticScrollRef.current = false;
    }
    onEditDailyGoal();
  };
  const handleNextCitySelect = (cityId: string) => {
    if (swipedRef.current || !currentCityCompleted) return;
    onSelectNextCity(cityId);
  };
  const showNextCandidateBatch = () => {
    if (!currentCityCompleted || candidateBatchCount <= 1) return;
    setCandidateBatchIndex(index => (index + 1) % candidateBatchCount);
  };
  const playCityVideo = useCallback(() => {
    const video = cityVideoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play()
      .then(() => setVideoNeedsTap(false))
      .catch(() => setVideoNeedsTap(true));
  }, []);

  useEffect(() => {
    setVideoNeedsTap(false);
    let cancelled = false;

    const tryPlayback = () => {
      if (cancelled || document.visibilityState === 'hidden') return;
      const video = cityVideoRef.current;
      if (!video || !video.paused) return;
      video.muted = true;
      void video.play()
        .then(() => {
          if (!cancelled) setVideoNeedsTap(false);
        })
        .catch(() => {
          if (!cancelled) setVideoNeedsTap(true);
        });
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tryPlayback();
    };
    const handleUserActivation = () => tryPlayback();
    const initialRetry = window.setTimeout(tryPlayback, 80);
    const readinessRetry = window.setTimeout(tryPlayback, 650);
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled && cityVideoRef.current?.paused) setVideoNeedsTap(true);
    }, 1200);

    window.addEventListener('pageshow', tryPlayback);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('pointerdown', handleUserActivation, { capture: true });
    document.addEventListener('touchstart', handleUserActivation, { capture: true, passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(initialRetry);
      window.clearTimeout(readinessRetry);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('pageshow', tryPlayback);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('pointerdown', handleUserActivation, { capture: true });
      document.removeEventListener('touchstart', handleUserActivation, { capture: true });
    };
  }, [city.id]);

  useEffect(() => {
    setCandidateBatchIndex(0);
  }, [state.currentCityId, state.completedCityIds.length]);

  return (
    <main className="page page--home" id="main-content">
      <header className="home-commandbar">
        <div className="home-commandbar-title">
          <h1>今天跑哪里？</h1>
          <button className="home-city-list-entry" type="button" aria-label="浏览城市列表" aria-description={hasNewCity ? '有新开放的城市' : undefined} aria-controls="home-city-carousel" onPointerDown={handleCtaPointerDown} onClick={() => {
            scheduleNearestCitySelection();
            carouselRef.current?.focus({ preventScroll: true });
          }}>
            <GalleryHorizontalEnd aria-hidden="true"/><span>城市列表</span>
            {hasNewCity && <span className="city-new-badge home-city-list-entry__new" aria-hidden="true">NEW</span>}
          </button>
        </div>
        <nav className="home-quick-actions" aria-label="首页快捷入口">
          <button className="home-quick-action home-quick-action--support" type="button" onClick={() => onLegacyFeature('onlineSupport')} aria-label="打开在线客服" title="在线客服">
            <HeadphonesIcon />
          </button>
          <button className="home-reward-chip" type="button" onClick={() => onLegacyFeature('firstCityRewards')} aria-label="打开新手任务">
            <Flame />
            <span>奖励</span>
          </button>
          <button
            className={`home-quick-action home-quick-action--device ${deviceConnected ? 'is-online' : 'is-offline'}`}
            type="button"
            onClick={onDevice}
            aria-label="我的设备"
            title="我的设备"
          >
            <TreadmillIcon connected={deviceConnected} />
          </button>
        </nav>
      </header>
      <section className="home-city-swipe-zone" aria-label="城市与旅程进度，可左右滑动切换城市" onPointerDown={handleSwipeStart} onPointerUp={handleSwipeEnd} onPointerCancel={() => { swipeStartRef.current = null; }}>
        <div
          id="home-city-carousel"
          className="destination-carousel"
          ref={carouselRef}
          role="region"
          tabIndex={0}
          aria-label="全球城市，可左右滑动切换"
          onScroll={handleCarouselScroll}
          onKeyDown={handleCarouselKeyDown}
          onPointerDown={handleCarouselPointerDown}
          onPointerMove={handleCarouselPointerMove}
          onPointerUp={finishCarouselPointerDrag}
          onPointerCancel={finishCarouselPointerDrag}
          onTouchStart={event => {
            const touch = event.touches[0];
            endGestureRef.current = event.touches.length === 1 && touch
              ? { x: touch.clientX, y: touch.clientY, atEnd: isAtCarouselEnd() } : null;
          }}
          onTouchEnd={event => {
            const touch = event.changedTouches[0];
            if (touch) finishEndGesture(touch.clientX, touch.clientY);
          }}
          onTouchCancel={() => { endGestureRef.current = null; }}
          onWheel={event => {
            const now = performance.now();
            const wheel = endWheelRef.current;
            if (now - wheel.time > 300) {
              wheel.atEnd = isAtCarouselEnd();
              wheel.distance = 0;
              wheel.notified = false;
            }
            wheel.time = now;
            if (!wheel.atEnd || wheel.notified || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
            wheel.distance += event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? event.currentTarget.clientWidth : 1);
            if (wheel.distance >= 48 && isAtCarouselEnd()) {
              wheel.notified = true;
              notifyCarouselEnd();
            }
          }}
        >
          {homeJourneyCities.map((item) => {
            const itemStatus = getCityStatus(state, item.id);
            const releaseDate = getCityRouteReleaseDate(item.id);
            if (!hasPublishedCityRoutes(item.id) && releaseDate) {
              return (
                <section
                  className={`destination-journey-card destination-upcoming-card${item.id === city.id ? ' is-active' : ' is-side'}`}
                  data-city-id={item.id}
                  key={item.id}
                  style={cityStyle(item)}
                  aria-label={`${item.name}，尚未开放，预计${releaseDate}开放`}
                  onClick={() => handleCityCardClick(item.id)}
                >
                  <img className="destination-upcoming-card__photo" src={cityImageFor(item)} alt="" aria-hidden="true" />
                  <span className="destination-upcoming-card__shade" aria-hidden="true" />
                  <span className="destination-upcoming-card__status"><Clock3 />尚未开放</span>
                  <div className="destination-upcoming-card__copy">
                    <h2>{item.name}</h2>
                    <p>{item.englishName}</p>
                    <span><CalendarDays />预计 {releaseDate} 开放</span>
                  </div>
                </section>
              );
            }
            const itemCompletedRouteIds = getCompletedRouteIds(state, item.id);
            const itemCompleted = itemCompletedRouteIds.length;
            const itemCompletedRouteIdSet = new Set(itemCompletedRouteIds);
            const itemExerciseTotals = item.routes.reduce((summary, route) => {
              if (!itemCompletedRouteIdSet.has(route.id)) return summary;
              summary.distance += route.distanceKm;
              summary.duration += route.durationMinutes;
              summary.calories += route.calories;
              return summary;
            }, { distance: 0, duration: 0, calories: 0 });
            const itemHasJourneyProgress = itemStatus === 'current' || itemStatus === 'completed';
            const itemLabel = itemStatus === 'completed' ? '已完成城市' : itemStatus === 'current' ? '当前目的地' : '全球目的地';
            const isNew = newCityIds.includes(item.id);
            return (
              <Fragment key={item.id}>
                <section className={`destination-journey-card${item.id === city.id ? ' is-active' : ' is-side'}`} data-city-id={item.id} key={item.id} style={cityStyle(item)} aria-label={`${item.name}，${itemLabel}${isNew ? '，新上线' : ''}`} onClick={() => handleCityCardClick(item.id)}>
                  <div className="destination-card">
                    <img className="destination-card__photo" src={cityImageFor(item)} alt="" aria-hidden="true" />
                    {itemStatus === 'current' && item.id === city.id && cityVideoFor(item) && (
                      <>
                        <video
                          key={cityVideoFor(item)}
                          ref={cityVideoRef}
                          className="destination-card__video"
                          src={cityVideoFor(item)}
                          poster={cityImageFor(item)}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          crossOrigin="anonymous"
                          disablePictureInPicture
                          tabIndex={-1}
                          aria-hidden="true"
                          onLoadedMetadata={event => {
                            event.currentTarget.muted = true;
                            void event.currentTarget.play().catch(() => setVideoNeedsTap(true));
                          }}
                          onLoadedData={event => {
                            event.currentTarget.classList.add('is-ready');
                            event.currentTarget.muted = true;
                            void event.currentTarget.play().catch(() => setVideoNeedsTap(true));
                          }}
                          onCanPlay={event => {
                            event.currentTarget.classList.add('is-ready');
                            event.currentTarget.muted = true;
                            void event.currentTarget.play().catch(() => setVideoNeedsTap(true));
                          }}
                          onPlaying={event => {
                            event.currentTarget.classList.add('is-ready');
                            setVideoNeedsTap(false);
                          }}
                          onError={event => {
                            event.currentTarget.style.display = 'none';
                            setVideoNeedsTap(false);
                          }}
                        />
                        {videoNeedsTap && (
                          <button
                            className="destination-card__video-play"
                            type="button"
                            onPointerDown={event => event.stopPropagation()}
                            onClick={event => { event.stopPropagation(); playCityVideo(); }}
                          >
                            <Play /> 播放城市动态
                          </button>
                        )}
                      </>
                    )}
                    <div className="destination-card__overlay" />
                    {isNew && <span className="city-new-badge destination-card__new" aria-hidden="true">NEW</span>}
                    <div className={`destination-card__content ${homeRunStyles.coverContent}`}>
                      <div>
                        <span className="destination-card__kicker"><MapPin /> {itemLabel}</span>
                        <h2>{item.name}</h2>
                        <span className={`destination-card__runners ${homeRunStyles.coverRunners}`}><UsersRound aria-hidden="true" />{(CITY_RUNNER_COUNTS[item.id] ?? 1000).toLocaleString('zh-CN')} 人跑过</span>
                      </div>
                      {item.id === state.currentCityId && <TodayExerciseSummary today={todayExercise} goalKm={dailyGoalKm} animate={allowGoalAnimation && item.id === city.id} onEdit={handleDailyGoalEdit} />}
                    </div>
                  </div>
                  <section className={`journey-progress ${homeRunStyles.panel}`} aria-label={`${item.name}旅程进度`}>
                    <div className="journey-progress__topline">
                      <span>城市进度</span><strong>{itemCompleted}<small>/{item.routes.length}</small></strong>
                    </div>
                    <CityRunProgress cityName={item.name} completed={itemCompleted} total={item.routes.length} current={itemStatus === 'current'} />
                    {itemHasJourneyProgress && (
                      <HomeSportStats cumulative={{ distanceKm:itemExerciseTotals.distance, durationSeconds:itemExerciseTotals.duration*60, calories:itemExerciseTotals.calories }} completed={itemStatus === 'completed'} />
                    )}
                    <button className={`${itemHasJourneyProgress ? 'primary-button ' : ''}journey-cta journey-cta--${itemStatus}`} type="button" aria-label={itemHasJourneyProgress ? undefined : `${item.name}，尚未解锁，查看路线`} onPointerDown={handleCtaPointerDown} onClick={(event) => { event.stopPropagation(); handleRoutesClick(item.id); }}>
                      {itemHasJourneyProgress ? (
                        <>
                          {itemStatus === 'current' && <RunIcon />}
                          {itemStatus === 'completed' ? `查看${item.name}旅程` : '开始跑步'}
                          <ArrowRight aria-hidden="true" />
                        </>
                      ) : (
                        <>
                          <span className="journey-cta__status"><LockKeyhole aria-hidden="true" />尚未解锁</span>
                          <span className="journey-cta__label">查看路线<ChevronRight aria-hidden="true" /></span>
                        </>
                      )}
                    </button>
                  </section>
                </section>
                {item.id === state.currentCityId && (
                  <section className={`destination-journey-card destination-next-card${currentCityCompleted ? ' is-ready' : ' is-locked'}`} data-next-station="true" key={`${item.id}-next-station`} aria-label="下一站选择卡片">
                    <div className="next-station-card__hero">
                      <div className="next-station-card__topline">
                        <span className="next-station-card__eyebrow"><Navigation /> 下一站</span>
                        {currentCityCompleted && candidateBatchCount > 1 && (
                          <button className="next-station-card__refresh" type="button" onPointerDown={handleCtaPointerDown} onClick={(event) => { event.stopPropagation(); showNextCandidateBatch(); }} aria-label="换一批推荐城市">
                            <RotateCcw aria-hidden="true" />换一批
                          </button>
                        )}
                      </div>
                      <h2>{currentCityCompleted ? '选择下一座城市' : '完成当前城市后开启'}</h2>
                      <p>{currentCityCompleted ? '从 3 个推荐目的地中选择你的环球旅程下一站。' : `完成${getJourneyCity(state.currentCityId)?.name ?? '当前城市'}全部 10 段路线，即可解锁下一站选择。`}</p>
                    </div>
                    <div className="next-station-card__options" role="group" aria-label="下一站候选城市">
                      {nextStationCandidates.map((candidate, candidateIndex) => (
                        <button
                          key={candidate.id}
                          className="next-station-option"
                          type="button"
                          onPointerDown={handleCtaPointerDown}
                          onClick={(event) => { event.stopPropagation(); handleNextCitySelect(candidate.id); }}
                          disabled={!currentCityCompleted}
                          aria-label={currentCityCompleted ? `选择${candidate.name}作为下一站` : `候选目的地 ${candidateIndex + 1}，完成当前城市后解锁`}
                          data-obscured={!currentCityCompleted ? 'true' : undefined}
                          style={cityStyle(candidate)}
                        >
                          <img src={cityImageFor(candidate)} alt="" aria-hidden="true" />
                          <span>{String(candidateIndex + 1).padStart(2, '0')}</span>
                          {currentCityCompleted && <><strong>{candidate.name}</strong><small>{candidate.englishName}</small></>}
                        </button>
                      ))}
                    </div>
                    {!currentCityCompleted && <div className="next-station-card__lock"><LockKeyhole /> 继续完成当前旅程</div>}
                  </section>
                )}
              </Fragment>
            );
          })}
        </div>
        {featuredRecommendation && <button
          className={homeRunStyles.browseRoute}
          type="button"
          aria-label={`每日推荐，查看 ${recommendations.length} 条路线`}
          onPointerEnter={holdCarouselBrowsing}
          onPointerLeave={armCarouselSettle}
          onFocus={holdCarouselBrowsing}
          onBlur={armCarouselSettle}
          onPointerDown={event => { handleCtaPointerDown(event); holdCarouselBrowsing(); }}
          onPointerUp={armCarouselSettle}
          onPointerCancel={armCarouselSettle}
          onClick={event => { event.stopPropagation(); selectNearestCity(); onRecommendations(); }}
        >
          <CityImage className={homeRunStyles.browseRouteCover} src={resolveRecommendationCover(getRouteCover(featuredRecommendation.city.name, featuredRecommendation.route.order)?.src, 'thumbnail') ?? cityImageFor(featuredRecommendation.city)} alt="" fallbackLabel={featuredRecommendation.route.landmarks[0]} loading="eager" />
          <span className={homeRunStyles.browseRouteBody}>
            <strong>每日推荐</strong>
            <span className={homeRunStyles.browseRouteDetail}>{recommendations.map(({ city }) => city.name).join(' · ')}</span>
          </span>
          <ChevronRight className={homeRunStyles.browseRouteArrow} aria-hidden="true" />
        </button>}
        <button
          className="home-buddy-entry"
          hidden
          type="button"
          aria-label="找搭子，打开环球搭子小队活动"
          onPointerEnter={holdCarouselBrowsing}
          onPointerLeave={armCarouselSettle}
          onFocus={holdCarouselBrowsing}
          onBlur={armCarouselSettle}
          onPointerDown={event => { handleCtaPointerDown(event); holdCarouselBrowsing(); }}
          onPointerUp={armCarouselSettle}
          onPointerCancel={armCarouselSettle}
          onClick={event => { event.stopPropagation(); onLegacyFeature('teamRelay'); }}
        >
          <UsersRound aria-hidden="true"/><span>找搭子一起跑</span><ChevronRight aria-hidden="true"/>
        </button>
      </section>
    </main>
  );
}

function CityListSheet({ state, selectedCityId, onSelect, onClose }: { state: JourneyState; selectedCityId: string; onSelect: (cityId: string) => void; onClose: () => void }) {
  const [activeContinent, setActiveContinent] = useState<CityContinentFilter>('全部');
  const statusText = { current: '正在探索', locked: '未解锁', upcoming: '尚未开放' } as const;
  const filteredCities = JOURNEY_CITY_SEQUENCE
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => activeContinent === '全部' || item.continent === activeContinent);
  const visibleCities = [
    ...filteredCities.filter(({ item }) => hasPublishedCityRoutes(item.id)),
    ...filteredCities.filter(({ item }) => !hasPublishedCityRoutes(item.id))
  ];

  return (
    <Modal labelId="city-list-title" onClose={onClose} className="city-list-sheet">
      <header className="sheet-header">
        <div><h2 id="city-list-title">全球城市收藏手册</h2></div>
        <button className="icon-button icon-button--paper" type="button" onClick={onClose} aria-label="关闭全球城市收藏手册"><X /></button>
      </header>
      <nav className="city-continent-filter" aria-label="按大洲筛选城市">
        {CITY_CONTINENT_FILTERS.map(continent => {
          const active = activeContinent === continent;
          return (
            <button
              className={active ? 'is-active' : ''}
              type="button"
              key={continent}
              aria-pressed={active}
              onClick={() => setActiveContinent(continent)}
            >
              <span>{continent}</span>
            </button>
          );
        })}
      </nav>
      <div className="city-list-grid">
        {visibleCities.map(({ item, index }) => {
          const journeyStatus = getCityStatus(state, item.id);
          const releaseDate = getCityRouteReleaseDate(item.id);
          const status = !hasPublishedCityRoutes(item.id)
            ? 'upcoming'
            : journeyStatus === 'completed' || journeyStatus === 'current' ? journeyStatus : 'locked';
          const completed = getCompletedRouteIds(state, item.id).length;
          const StatusIcon = status === 'current' ? MapPin : status === 'locked' ? LockKeyhole : status === 'upcoming' ? Clock3 : null;
          const statusLabel = status === 'completed' ? '已完成' : statusText[status];
          const isSelected = status !== 'locked' && status !== 'upcoming' && selectedCityId === item.id;
          return (
            <button className={`city-list-card city-list-card--${status}${isSelected ? ' is-selected' : ''}`} type="button" key={item.id} onClick={() => { onSelect(item.id); onClose(); }} aria-label={`${String(index + 1).padStart(2, '0')} ${item.name} ${item.englishName}，${statusLabel}${releaseDate ? `，预计${releaseDate}开放` : '，查看城市路线'}`} aria-pressed={isSelected} disabled={status === 'upcoming'} style={cityStyle(item)}>
              <img className="city-list-card__photo" src={cityImageFor(item)} alt="" aria-hidden="true" />
              <span className="city-list-card__veil" aria-hidden="true" />
              <span className="city-list-card__number">{String(index + 1).padStart(2, '0')}</span>
              {StatusIcon && <span className="city-list-card__status"><StatusIcon />{statusText[status]}</span>}
              {status === 'completed' && <span className="city-list-card__stamp" aria-hidden="true"><b>已完成</b><small>COMPLETED</small></span>}
              {status === 'locked' && <span className="city-list-card__fog-lock" aria-hidden="true"><LockKeyhole /></span>}
              <strong>{item.name}</strong><small>{item.englishName}</small>
              {status === 'upcoming' && releaseDate && <span className="city-list-card__release"><CalendarDays />预计 {releaseDate}</span>}
              {status !== 'upcoming' && <i><span style={{ width: `${completed * 10}%` }} /></i>}
            </button>
          );
        })}
      </div>
      {visibleCities.length === 0 && (
        <div className="city-list-empty" role="status">
          <Globe2 />
          <strong>南极洲旅程筹备中</strong>
          <span>新的目的地将在未来逐步开放</span>
        </div>
      )}
    </Modal>
  );
}

function MapPage({ state, totals, onOpenCity, onCities, onLeaderboard, onCountryLevel }: { state: JourneyState; totals: ReturnType<typeof getJourneyTotals>; onOpenCity: (cityId: string) => void; onCities: () => void; onLeaderboard: () => void; onCountryLevel: () => void }) {
  const reduceMotion = useReducedMotion();
  const cityGoal = 20;
  const routeGoal = 300;
  const cityProgress = Math.min(100, (totals.completedCities / cityGoal) * 100);
  const routeProgress = Math.min(100, (totals.completedRoutes / routeGoal) * 100);
  const countryLevel = getCountryLevelProgress(state);
  const exerciseTotals = Object.entries(state.completedRouteIdsByCity).reduce((summary, [cityId, routeIds]) => {
    routeIds.forEach(routeId => {
      const route = getJourneyRoute(cityId, routeId);
      if (!route) return;
      summary.distance += route.distanceKm;
      summary.duration += route.durationMinutes;
      summary.calories += route.calories;
    });
    return summary;
  }, { distance: 0, duration: 0, calories: 0 });
  const revealInitial = reduceMotion ? false : { opacity: 0, y: 18 };
  const revealTransition = { duration: reduceMotion ? 0 : .42, ease: 'easeOut' as const };
  return (
    <main className="page page--map page--world" id="main-content">
      <section className="world-hero" aria-labelledby="world-page-title">
        <header className="world-header">
          <h1 className="world-header__eyebrow" id="world-page-title"><Sparkles aria-hidden="true" />跑步版 Google Earth</h1>
        </header>
        <div className="world-globe-panel">
          <Suspense fallback={<div className="globe-loading" role="status"><Globe2 /><span>正在加载你的世界</span></div>}>
            <JourneyGlobe state={state} onOpenCity={onOpenCity} />
          </Suspense>
          <div className="world-globe-actions">
            <button className="world-globe-action world-level-entry" type="button" onClick={onCountryLevel} aria-label={`查看环球等级，当前 LV.${countryLevel.level}，最高 LV.${countryLevel.maxLevel}`}>
              <i aria-hidden="true"><Medal /></i>
              <span><small>环球等级</small><strong>LV.{countryLevel.level} <b>/{countryLevel.maxLevel}</b></strong></span>
              <ChevronRight aria-hidden="true" />
            </button>
            <button className="world-globe-action world-leaderboard-entry" type="button" onClick={onLeaderboard} aria-label="查看全球排行榜，我的排名 142">
              <i aria-hidden="true"><Trophy /></i>
              <span><small>全球榜</small><strong>142<b>名</b></strong></span>
            </button>
          </div>
        </div>
      </section>

      <div className="world-journey-content">
        <motion.section
          className="world-goal-card"
          aria-labelledby="world-progress-title"
          initial={revealInitial}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: .18 }}
          transition={revealTransition}
        >
          <header>
            <div><Target aria-hidden="true" /><strong id="world-progress-title">探索进度</strong></div>
            <span>已发现 {totals.discoveredSpots} 处景点</span>
          </header>
          <div className="world-goal-card__items">
            <div className="world-goal-item">
              <div className="world-goal-item__topline"><span>城市探索</span><strong>{totals.completedCities}<small>/{cityGoal}</small></strong></div>
              <i role="progressbar" aria-label="城市探索进度" aria-valuemin={0} aria-valuemax={cityGoal} aria-valuenow={totals.completedCities}><span style={{ width: `${cityProgress}%` }} /></i>
            </div>
            <div className="world-goal-item">
              <div className="world-goal-item__topline"><span>路线完成</span><strong>{totals.completedRoutes}<small>/{routeGoal}</small></strong></div>
              <i role="progressbar" aria-label="路线完成进度" aria-valuemin={0} aria-valuemax={routeGoal} aria-valuenow={totals.completedRoutes}><span style={{ width: `${routeProgress}%` }} /></i>
            </div>
          </div>
          <div className="world-sport-stats" aria-label="累计运动数据">
            <div className="world-sport-stat">
              <i aria-hidden="true"><Footprints /></i>
              <span><small>累计里程</small><strong>{exerciseTotals.distance.toFixed(1)}<b>km</b></strong></span>
            </div>
            <div className="world-sport-stat">
              <i aria-hidden="true"><Clock3 /></i>
              <span><small>运动时长</small><strong>{(exerciseTotals.duration / 60).toFixed(1)}<b>h</b></strong></span>
            </div>
            <div className="world-sport-stat">
              <i aria-hidden="true"><Flame /></i>
              <span><small>累计消耗</small><strong>{Math.round(exerciseTotals.calories).toLocaleString('zh-CN')}<b>kcal</b></strong></span>
            </div>
          </div>
        </motion.section>
        <button className="world-cities-button" type="button" onClick={onCities} aria-label="展开全球城市收藏手册">
          <span><BookOpen aria-hidden="true" /><b>全球城市收藏手册</b></span>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}

interface RouteSheetProps {
  city: JourneyCity;
  state: JourneyState;
  selectedRouteId: string | null;
  deviceConnected: boolean;
  onClose: () => void;
  onSelectRoute: (route: JourneyRoute) => void;
  onBackToList: () => void;
  onStart: (route: JourneyRoute) => void;
}

function RouteSheet({ city, state, selectedRouteId, deviceConnected, onClose, onSelectRoute, onBackToList, onStart }: RouteSheetProps) {
  const completed = getCompletedRouteIds(state, city.id).length;
  const selectedRoute = selectedRouteId ? getJourneyRoute(city.id, selectedRouteId) : undefined;
  return (
    <Modal labelId="route-sheet-title" onClose={onClose} className="route-sheet">
      {selectedRoute ? (
        <div className="route-detail">
          <header className="sheet-header">
            <button className="icon-button icon-button--paper" type="button" onClick={onBackToList} aria-label="返回路线列表"><ChevronLeft /></button>
            <div><span>路线 {String(selectedRoute.order).padStart(2, '0')}</span><h2 id="route-sheet-title">{selectedRoute.name}</h2></div>
            <button className="icon-button icon-button--paper" type="button" onClick={onClose} aria-label="关闭路线详情"><X /></button>
          </header>
          <CityArtwork city={city} compact />
          <div className="route-detail__stats">
            <div><Route /><strong>{selectedRoute.distanceKm.toFixed(1)}</strong><span>公里</span></div>
            <div><Clock3 /><strong>{selectedRoute.durationMinutes}</strong><span>分钟</span></div>
            <div><Footprints /><strong>{selectedRoute.calories}</strong><span>千卡</span></div>
          </div>
          <section className="route-story"><p className="eyebrow">途经地标</p><h3>{selectedRoute.landmarks.join(' → ')}</h3><p>{selectedRoute.description}</p></section>
          <div className={`device-inline ${deviceConnected ? 'is-online' : ''}`}>
            {deviceConnected ? <Wifi /> : <WifiOff />}
            <span><strong>{deviceConnected ? '跑步机已连接' : '跑步机未连接'}</strong><small>{deviceConnected ? '已准备好开始这段旅程' : '开始时将自动连接设备'}</small></span>
          </div>
          <button className="primary-button" type="button" onClick={() => onStart(selectedRoute)}>
            {getRouteStatus(state, city.id, selectedRoute.id) === 'completed' ? '再跑一次' : deviceConnected ? '开始这段旅程' : '连接跑步机并开始'} <ArrowRight />
          </button>
        </div>
      ) : (
        <div className="route-list">
          <header className="sheet-header">
            <div><span>{city.englishName}</span><h2 id="route-sheet-title">{city.name}旅程</h2></div>
            <button className="icon-button icon-button--paper" type="button" onClick={onClose} aria-label="关闭路线列表"><X /></button>
          </header>
          <div className="route-list__progress"><ProgressSegments completed={completed} /><span>{completed}/10</span></div>
          <p className="route-stage-copy">{completed < 3 ? '完成 3 条路线，开启下一章节' : completed < 6 ? '第二章节已开启，完成 6 条继续前行' : completed < 10 ? '终章已开启，完成剩余旅程' : '这座城市的十段旅程已全部完成'}</p>
          <div className="route-grid">
            {city.routes.map(route => {
              const status = getRouteStatus(state, city.id, route.id);
              const discoverable = status === 'discoverable';
              const locked = status === 'locked';
              return (
                <button className={`route-card route-card--${status}`} type="button" key={route.id} disabled={locked} onClick={() => onSelectRoute(route)} aria-label={locked ? `路线 ${route.order}，未开放` : discoverable ? `揭晓未知路线 ${route.order}` : `${route.name}，${status === 'completed' ? '已完成' : '已揭晓'}`}>
                  <span className="route-card__number">{String(route.order).padStart(2, '0')}</span>
                  <span className="route-card__icon">{status === 'completed' ? <Check /> : locked ? <LockKeyhole /> : discoverable ? <Sparkles /> : <Route />}</span>
                  <strong>{discoverable ? '未知路线' : locked ? '等待开放' : route.name}</strong>
                  <small>{discoverable ? '点击揭晓' : locked ? `完成 ${getOpenRouteCount(completed)} 条后开放` : `${route.distanceKm.toFixed(1)} km · ${route.landmarks[0]}`}</small>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

function RunPage({ city, route, reduceMotion, onCancel, onComplete }: { city: JourneyCity; route: JourneyRoute; reduceMotion: boolean; onCancel: () => void; onComplete: (result: RunResult) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [confirmExit, setConfirmExit] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setElapsed(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);
  const demoProgress = Math.min(1, elapsed / 60);
  const distance = route.distanceKm * demoProgress;
  const calories = Math.round(route.calories * demoProgress);
  const finish = () => onComplete({ distanceKm: route.distanceKm, durationSeconds: route.durationMinutes * 60, calories: route.calories });
  return (
    <main className="run-page" id="main-content" style={cityStyle(city)}>
      <div className="run-page__scene" aria-hidden="true"><CityArtwork city={city} /></div><div className="run-page__veil" />
      <header className="run-topbar">
        <button className="icon-button icon-button--dark" type="button" onClick={() => setConfirmExit(true)} aria-label="退出跑步"><ChevronLeft /></button>
        <div><strong>{route.name}</strong><span>{city.name} · 路线 {route.order}</span></div><span className="run-online"><Wifi /> 在线</span>
      </header>
      <section className="run-metric" aria-live="polite">
        <motion.div className="run-metric__ring" animate={reduceMotion || !playing ? undefined : { scale: [1, 1.025, 1] }} transition={{ duration: 2.4, repeat: Infinity }}>
          <span>已跑距离</span><strong>{distance.toFixed(2)}</strong><small>公里</small>
        </motion.div>
      </section>
      <section className="run-controls">
        <div className="run-stats">
          <div><span>时间</span><strong>{formatDuration(elapsed)}</strong></div>
          <div><span>当前配速</span><strong>{elapsed > 0 && distance > 0 ? "7'30\"" : '--'}</strong></div>
          <div><span>消耗</span><strong>{calories} <small>kcal</small></strong></div>
        </div>
        <button className="primary-button primary-button--run" type="button" onClick={() => setPlaying(value => !value)}>{playing ? <><Pause /> 暂停跑步</> : <><Play /> 继续跑步</>}</button>
        <button className="finish-run-button" type="button" onClick={finish}>演示：完成本次跑步</button>
      </section>
      <AnimatePresence>{confirmExit && (
        <motion.div className="run-confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div role="dialog" aria-modal="true" aria-labelledby="exit-run-title"><h2 id="exit-run-title">结束这次跑步？</h2><p>本次演示数据不会保存，你可以返回路线详情重新开始。</p><button className="primary-button primary-button--danger" type="button" onClick={onCancel}>结束并返回</button><button className="text-button" type="button" onClick={() => setConfirmExit(false)}>继续跑步</button></div>
        </motion.div>
      )}</AnimatePresence>
    </main>
  );
}

function RouteCompletePage({ city, route, completed, result, firstCompletion, onNext, onMap }: { city: JourneyCity; route: JourneyRoute; completed: number; result: RunResult; firstCompletion: boolean; onNext: () => void; onMap: () => void }) {
  return (
    <main className="page completion-page" id="main-content">
      <div className="completion-mark"><Check /></div><p className="eyebrow">Route complete</p><h1>路线完成</h1><p className="completion-subtitle">{city.name} · {route.name}</p>
      <section className="result-ticket"><div className="result-ticket__notch result-ticket__notch--left" /><div className="result-ticket__notch result-ticket__notch--right" /><div><strong>{result.distanceKm.toFixed(1)}</strong><span>公里</span></div><div><strong>{Math.round(result.durationSeconds / 60)}</strong><span>分钟</span></div><div><strong>{result.calories}</strong><span>千卡</span></div></section>
      <section className="new-progress"><div><span>{firstCompletion ? '城市新进度' : '再次完成'}</span><strong>{completed}<small>/10</small></strong></div><ProgressSegments completed={completed} /><p>{firstCompletion ? `下一段${city.name}旅程已开启` : '本次运动记录已保存，城市进度保持不变'}</p></section>
      <div className="completion-actions"><button className="primary-button" type="button" onClick={onNext}>发现下一段旅程 <ArrowRight /></button><button className="secondary-button" type="button" onClick={onMap}><Globe2 /> 查看我的世界</button></div>
    </main>
  );
}

function CityCompletePage({ city, candidates, selectedId, onSelect, onContinue }: { city: JourneyCity; candidates: JourneyCity[]; selectedId: string; onSelect: (cityId: string) => void; onContinue: () => void }) {
  const totals = getCityPlanTotals(city.id);
  const selected = getJourneyCity(selectedId);
  return (
    <main className="page city-complete-page" id="main-content">
      <div className="passport-stamp passport-stamp--complete"><span>已完成</span><b>{city.name}</b><small>10 routes</small></div><p className="eyebrow">City complete</p><h1>{city.name}，已完成</h1><p className="completion-subtitle">你已经跑过这座城市，也留下了一册属于自己的旅行记录。</p>
      <section className="city-recap"><div><strong>10</strong><span>条路线</span></div><div><strong>{totals.distanceKm.toFixed(1)}</strong><span>总公里</span></div><div><strong>{Math.round(totals.durationMinutes / 60)}h</strong><span>总时长</span></div><div><strong>{totals.landmarks.length}</strong><span>处景点</span></div></section>
      <section className="next-city-section"><p className="eyebrow">下一站，你想去哪里？</p><div className="candidate-grid" role="radiogroup" aria-label="选择下一站">{candidates.map((candidate, index) => (
        <button key={candidate.id} className={`candidate-card${selectedId === candidate.id ? ' is-selected' : ''}`} type="button" role="radio" aria-checked={selectedId === candidate.id} onClick={() => onSelect(candidate.id)} style={cityStyle(candidate)}>{index === 0 && <span className="recommend-tag">推荐</span>}<span className="candidate-card__dot" /><strong>{candidate.name}</strong><small>{candidate.englishName}</small></button>
      ))}</div></section>
      <button className="primary-button" type="button" onClick={onContinue} disabled={!selected}>前往{selected?.name ?? '下一站'} <Navigation /></button>
    </main>
  );
}

function TravelPage({ from, to, reduceMotion }: { from: JourneyCity; to: JourneyCity; reduceMotion: boolean }) {
  return (
    <main className="travel-page" id="main-content" style={cityStyle(to)}><div className="travel-grid" aria-hidden="true" /><div className="travel-copy"><p className="eyebrow">Next destination</p><h1>下一站，{to.name}</h1><p>{from.name} → {to.englishName}</p></div>
      <svg className="travel-route" viewBox="0 0 360 280" aria-hidden="true"><path className="travel-route__base" d="M42 214 Q178 30 320 98" /><motion.path className="travel-route__active" d="M42 214 Q178 30 320 98" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduceMotion ? 0 : 1.35, ease: 'easeInOut' }} /><circle cx="42" cy="214" r="7" className="travel-route__origin" /><motion.g initial={{ offsetDistance: '0%' }} animate={{ offsetDistance: '100%' }} transition={{ duration: reduceMotion ? 0 : 1.35, ease: 'easeInOut' }} style={{ offsetPath: "path('M42 214 Q178 30 320 98')" }}><Navigation x="-10" y="-10" width="20" height="20" className="travel-plane" /></motion.g><circle cx="320" cy="98" r="10" className="travel-route__destination" /></svg>
      <motion.div className="passport-stamp passport-stamp--arrival" initial={{ opacity: 0, scale: 1.6, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: -8 }} transition={{ delay: reduceMotion ? 0 : 1.15, type: 'spring', stiffness: 240, damping: 16 }}><span>Arriving</span><b>{to.name}</b><small>{to.englishName}</small></motion.div>
    </main>
  );
}

function ProfilePage({
  totals,
  countryLevel,
  onDevice,
  onLevel,
  onSettings,
  onFeature
}: {
  totals: ReturnType<typeof getJourneyTotals>;
  countryLevel: ReturnType<typeof getCountryLevelProgress>;
  onDevice: () => void;
  onLevel: () => void;
  onSettings: () => void;
  onFeature: (label: string) => void;
}) {
  const profileStats = [
    { label: '完成城市', value: totals.completedCities },
    { label: '完成路线', value: totals.completedRoutes },
    { label: '运动里程', value: '62.0', unit: 'km' },
    { label: '运动时长', value: '12.0', unit: 'h' }
  ];
  const menuItems = [
    { icon: ClipboardList, label: '运动记录', action: () => onFeature('运动记录') },
    { icon: MonitorSmartphone, label: '我的设备', action: onDevice },
    { icon: Wallet, label: '我的钱包', action: () => onFeature('我的钱包') },
    { icon: MessageSquare, label: '问题反馈', action: () => onFeature('问题反馈') },
    { icon: Headphones, label: '添加企微', action: () => onFeature('添加企微') },
    { icon: BookOpen, label: '使用说明', action: () => onFeature('使用说明') },
    { icon: Settings, label: '设置', action: onSettings }
  ];
  return (
    <main className="page profile-page profile-page--legacy" id="main-content">
      <header className="legacy-profile-actions">
        <div>
          <button type="button" onClick={() => onFeature('消息')} aria-label="消息"><Mail /></button>
          <button type="button" onClick={() => onFeature('编辑资料')} aria-label="编辑资料"><SquarePen /></button>
        </div>
      </header>
      <section className="legacy-profile-card">
        <div className="legacy-profile-card__identity">
          <button type="button" className="legacy-avatar" onClick={() => onFeature('编辑资料')} aria-label="查看或编辑资料">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200" alt="沐小六的头像" />
          </button>
          <div><h1>沐小六</h1><button className="legacy-profile-level" type="button" onClick={onLevel} aria-label={`查看环球等级，当前 LV.${countryLevel.level}，最高 LV.${countryLevel.maxLevel}`}><span>LV.{countryLevel.level}</span><strong>/ {countryLevel.maxLevel}</strong><ChevronRight /></button></div>
        </div>
        <div className="legacy-profile-stats">
          {profileStats.map(item => <div key={item.label}><strong>{item.value}{item.unit && <small>{item.unit}</small>}</strong><span>{item.label}</span></div>)}
        </div>
      </section>
      <section className="legacy-collection-actions" aria-label="城市收藏">
        <button className="legacy-collection-action legacy-collection-action--cards" type="button" onClick={() => onFeature('城市卡片')}>
          <span className="legacy-collection-action__icon" aria-hidden="true"><Map /></span>
          <span className="legacy-collection-action__copy"><strong>城市卡片</strong><b>收藏跑过的城市</b></span>
          <ChevronRight aria-hidden="true" />
        </button>
        <button className="legacy-collection-action legacy-collection-action--medals" type="button" onClick={() => onFeature('景点勋章')}>
          <span className="legacy-collection-action__icon" aria-hidden="true"><Medal /></span>
          <span className="legacy-collection-action__copy"><strong>景点勋章</strong><b>记录发现的景点</b></span>
          <ChevronRight aria-hidden="true" />
        </button>
      </section>
      <section className="legacy-menu" aria-label="个人功能">
        {menuItems.map(item => {
          const Icon = item.icon;
          return <button type="button" key={item.label} onClick={item.action}><span className="legacy-menu__icon"><Icon /></span><strong>{item.label}</strong><ChevronRight /></button>;
        })}
      </section>
    </main>
  );
}

function FirstCitySelectionPage({ selectedId, onSelect, onContinue }: { selectedId: string | null; onSelect: (cityId: string | null) => void; onContinue: () => void }) {
  const selectableCities = JOURNEY_CITY_SEQUENCE.filter(city => hasPublishedCityRoutes(city.id));
  const batchSize = 6;
  const batchCount = Math.ceil(selectableCities.length / batchSize);
  const [batchIndex, setBatchIndex] = useState(0);
  const batchStart = batchIndex * batchSize;
  const starterCities = Array.from({ length: Math.min(batchSize, selectableCities.length) }, (_, offset) => selectableCities[(batchStart + offset) % selectableCities.length]);
  const selectedCity = selectedId ? getJourneyCity(selectedId) : undefined;
  const showNextBatch = () => {
    setBatchIndex(index => (index + 1) % batchCount);
    onSelect(null);
  };
  return (
    <main className="first-city-page" id="main-content">
      <header className="first-city-hero">
        <span><Compass />首次启程</span>
        <h1>从哪座城市出发？</h1>
        <p>选择你的第一站，城市路线将从第 1 段开始依次解锁。</p>
      </header>
      <section className="first-city-picker" aria-labelledby="first-city-title">
        <div className="first-city-picker__heading">
          <div><h2 id="first-city-title">选择第一站</h2><p>之后可在世界页继续探索其他城市</p></div>
          <div className="first-city-picker__actions">
            <button type="button" onClick={showNextBatch} aria-label="换一批推荐城市"><RotateCcw />换一批</button>
          </div>
        </div>
        <div className="first-city-grid">
          {starterCities.map((item, index) => {
            const selected = item.id === selectedId;
            const totals = getCityPlanTotals(item.id);
            return (
              <button
                className={`first-city-card${selected ? ' is-selected' : ''}`}
                type="button"
                key={item.id}
                aria-pressed={selected}
                onClick={() => onSelect(item.id)}
                style={{ ...cityStyle(item), '--city-choice-index': index } as CSSProperties}
              >
                <img src={cityImageFor(item)} alt="" aria-hidden="true" />
                <span className="first-city-card__shade" aria-hidden="true" />
                <span className="first-city-card__number">{String(index + 1).padStart(2, '0')}</span>
                {selected && <span className="first-city-card__check" aria-hidden="true"><Check /></span>}
                <span className="first-city-card__copy">
                  <strong>{item.name}</strong>
                  <small>{item.englishName}</small>
                  <b><Route />10 段路线 · {totals.distanceKm.toFixed(1)} km</b>
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <footer className="first-city-footer">
        <button className="primary-button" type="button" disabled={!selectedCity} onClick={onContinue}>
          {selectedCity ? `从${selectedCity.name}出发` : '请选择一座城市'} <ArrowRight />
        </button>
      </footer>
    </main>
  );
}

function FirstJourneyIntroPage({ onStart }: { onStart: () => void }) {
  const previewCities = ['tokyo', 'paris', 'new-york']
    .map(cityId => getJourneyCity(cityId))
    .filter((city): city is JourneyCity => Boolean(city));

  return (
    <main className="first-journey-intro" id="main-content">
      <div className="first-journey-intro__glow" aria-hidden="true" />
      <header className="first-journey-intro__header">
        <span className="first-journey-intro__brand">
          <span className="first-journey-intro__brand-mark"><i aria-hidden="true" />MV</span>
          <span className="first-journey-intro__wordmark"><strong>木卫六</strong><small>MOVEVI</small></span>
        </span>
      </header>

      <section className="first-journey-intro__visual" aria-label="在运动中探索世界城市">
        <div className="first-journey-intro__orbit" aria-hidden="true">
          <span /><i /><b><Globe2 /></b>
        </div>
        <div className="first-journey-intro__city-stack" aria-hidden="true">
          {previewCities.map((city, index) => (
            <figure key={city.id} style={{ '--intro-city-index': index } as CSSProperties}>
              <img src={cityImageFor(city)} alt="" />
              <figcaption><MapPin />{city.name}</figcaption>
            </figure>
          ))}
        </div>
        <span className="first-journey-intro__route-dot first-journey-intro__route-dot--one" aria-hidden="true" />
        <span className="first-journey-intro__route-dot first-journey-intro__route-dot--two" aria-hidden="true" />
      </section>

      <section className="first-journey-intro__copy">
        <p><Sparkles />你的环球运动旅程</p>
        <h1>让你足不出户<br />跑遍全球</h1>
        <span>选择一座城市作为起点，在运动中解锁路线、探索景点，留下属于你的城市足迹。</span>
      </section>

      <div className="first-journey-intro__features" aria-label="旅程特色">
        <span><Route /><b>城市路线</b></span>
        <span><MapPin /><b>沿途景点</b></span>
        <span><Footprints /><b>运动记录</b></span>
      </div>

      <footer className="first-journey-intro__footer">
        <button className="primary-button" type="button" onClick={onStart}>
          开启运动之旅 <ArrowRight />
        </button>
      </footer>
    </main>
  );
}

function CurrentJourneyDialog({ city, completedRoutes, onContinue, onReselect }: { city: JourneyCity; completedRoutes: number; onContinue: () => void; onReselect: () => void }) {
  const progress = Math.min(10, Math.max(0, completedRoutes));

  return (
    <motion.div
      className="current-journey-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="current-journey-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="current-journey-dialog__panel"
        initial={{ opacity: 0, y: 28, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: .98 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      >
        <header className="current-journey-dialog__header">
          <span><Navigation />继续旅程</span>
          <h2 id="current-journey-title">你有一座城市正在探索</h2>
          <p>已为你选中上次的运动城市，可以从当前进度继续。</p>
        </header>

        <div className="current-journey-card is-selected" style={cityStyle(city)}>
          <img src={cityImageFor(city)} alt="" aria-hidden="true" />
          <span className="current-journey-card__shade" aria-hidden="true" />
          <span className="current-journey-card__selected"><Check />已选择</span>
          <div className="current-journey-card__copy">
            <span>正在探索</span>
            <strong>{city.name}</strong>
            <small>{city.countryName} · {city.englishName}</small>
          </div>
          <div className="current-journey-card__progress">
            <span><b>{progress}</b>/10 路线</span>
            <i aria-hidden="true"><b style={{ width: `${progress * 10}%` }} /></i>
          </div>
        </div>

        <div className="current-journey-dialog__actions">
          <button className="primary-button" type="button" onClick={onContinue} autoFocus>
            继续当前城市 <ArrowRight />
          </button>
          <button className="current-journey-dialog__reselect" type="button" onClick={onReselect}>
            <RotateCcw />重新选择城市
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}

function FirstJourneyExperience({ selectedId, currentCity, currentCityCompletedRoutes, hasExistingJourney, onSelect, onContinue, onResume }: {
  selectedId: string | null;
  currentCity: JourneyCity;
  currentCityCompletedRoutes: number;
  hasExistingJourney: boolean;
  onSelect: (cityId: string | null) => void;
  onContinue: () => void;
  onResume: () => void;
}) {
  const [stage, setStage] = useState<'intro' | 'resume' | 'choose'>('intro');
  const isChoosingCity = stage === 'choose';
  const startJourney = () => setStage(hasExistingJourney ? 'resume' : 'choose');
  const reselectCity = () => {
    onSelect(null);
    setStage('choose');
  };

  return (
    <div className="first-journey-stage">
      <div className={`first-journey-flip${isChoosingCity ? ' is-flipped' : ''}`}>
        <div className="first-journey-face first-journey-face--front" aria-hidden={stage !== 'intro'}>
          <FirstJourneyIntroPage onStart={startJourney} />
        </div>
        <div className="first-journey-face first-journey-face--back" aria-hidden={!isChoosingCity}>
          <FirstCitySelectionPage selectedId={selectedId} onSelect={onSelect} onContinue={onContinue} />
        </div>
      </div>
      <AnimatePresence>
        {stage === 'resume' && (
          <CurrentJourneyDialog city={currentCity} completedRoutes={currentCityCompletedRoutes} onContinue={onResume} onReselect={reselectCity} />
        )}
      </AnimatePresence>
    </div>
  );
}

type PrimaryTab = 'home' | 'world' | 'activity' | 'profile';

function BottomNavigation({ active, onChange }: { active: PrimaryTab; onChange: (tab: PrimaryTab) => void }) {
  const items = [
    { id: 'home' as const, label: '首页', icon: Compass },
    { id: 'world' as const, label: '世界', icon: Globe2 },
    { id: 'activity' as const, label: '活动', icon: CalendarDays },
    { id: 'profile' as const, label: '我的', icon: UserRound }
  ];
  return (
    <nav className={`bottom-nav${active === 'home' ? ' bottom-nav--home' : ''}`} aria-label="主要导航">
      {items.map(item => {
        const Icon = item.icon;
        const selected = active === item.id;
        return (
          <button key={item.id} type="button" className={selected ? 'is-active' : ''} aria-current={selected ? 'page' : undefined} onClick={() => onChange(item.id)}>
            <span><Icon /></span><small>{item.label}</small>
          </button>
        );
      })}
    </nav>
  );
}

function UtilityPanel({ mode, deviceConnected, manualReducedMotion, onToggleDevice, onToggleMotion, onReset, onClose }: { mode: 'device' | 'profile'; deviceConnected: boolean; manualReducedMotion: boolean; onToggleDevice: () => void; onToggleMotion: () => void; onReset: () => void; onClose: () => void }) {
  return (
    <Modal labelId="utility-title" onClose={onClose} className="utility-panel">
      <header className="sheet-header"><div><span>{mode === 'device' ? 'Device' : 'Account'}</span><h2 id="utility-title">{mode === 'device' ? '我的设备' : '个人与设置'}</h2></div><button className="icon-button icon-button--paper" type="button" onClick={onClose} aria-label="关闭面板"><X /></button></header>
      {mode === 'device' ? <><section className={`device-card ${deviceConnected ? 'is-online' : ''}`}><div className="device-card__icon"><TreadmillIcon connected={deviceConnected} /></div><div><strong>MOVEVI Runner S1</strong><span>{deviceConnected ? '已连接 · 信号良好' : '当前未连接'}</span></div><i /></section><button className="secondary-button" type="button" onClick={onToggleDevice}>{deviceConnected ? '断开设备' : '连接设备'}</button><div className="help-note"><CircleHelp /><p><strong>连接遇到问题？</strong><span>确认跑步机已开机，并让手机靠近设备。</span></p></div></> : <><section className="account-card"><span className="account-avatar">沐</span><div><strong>沐小六</strong><small>MOVEVI ID · MV-3026</small></div></section><div className="settings-list"><div><Settings /><span><strong>减少动效</strong><small>直接呈现旅程结果</small></span><button className={`switch ${manualReducedMotion ? 'is-on' : ''}`} type="button" onClick={onToggleMotion} aria-pressed={manualReducedMotion}><i /></button></div><div><Headphones /><span><strong>帮助与反馈</strong><small>设备连接、跑步与账号问题</small></span><ArrowRight /></div><button type="button" onClick={onReset}><RotateCcw /><span><strong>恢复演示状态</strong><small>重置城市进度与新手任务</small></span><ArrowRight /></button></div></>}
    </Modal>
  );
}

export default function JourneyApp() {
  const runSceneryRef = useRef<HTMLVideoElement | null>(null);
  const prepareRunScenery = useCallback(() => {
    return runSceneryRef.current ??= createRunSceneryVideo();
  }, []);
  const startRunScenery = () => {
    const video = prepareRunScenery();
    video.preload = 'auto';
    void video.play().catch(() => {
      // The run screen offers an in-page playback retry.
    });
  };
  const {enabled:puzzleDemo,openOnLoad:puzzleDeepLink}=getPuzzlePreviewMode(window.location.search);
  const dailyExercise = useDailyExercise(puzzleDemo);
  const [dailyGoalOpen, setDailyGoalOpen] = useState(false);
  const [firstCityInitial] = useState(() => {
    const saved = loadFirstCityRewards();
    return { ...saved, achievedTaskIds:saved.achievedTaskIds.filter(id => id === 'firstCity'), claims:[] };
  });
  const firstCityReturnRef = useRef(false);
  const firstCityPreviewTaskRef = useRef<'activation' | 'firstRoute' | null>(null);
  const exerciseSessionId = useRef<string | null>(null);
  const recordCompletedExercise = (result: RunResult) => {
    const id = exerciseSessionId.current;
    if (!id) return;
    exerciseSessionId.current = null;
    dailyExercise.record(id, result);
  };
  const [state, dispatch] = useReducer(journeyReducer, firstCityInitial, restoreFirstCityJourney);
  const nextStationFocusTimerRef = useRef<number | null>(null);
  // Keep onboarding available in code while the preview opens directly on home.
  const [isFirstUse, setIsFirstUse] = useState(false);
  const [firstCityChoiceId, setFirstCityChoiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PrimaryTab>('home');
  const [homeCityId, setHomeCityId] = useState(state.currentCityId);
  const [cityListOpen, setCityListOpen] = useState(false);
  const [routeCityId, setRouteCityId] = useState<string | null>(null);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const recommendationScrollTop = useRef(0);
  const recommendationDay = exerciseDay();
  const recommendations = getDailyRouteRecommendations(recommendationDay);
  const [newCityIds, setNewCityIds] = useState(() => PUBLISHED_CITY_IDS.slice(-1));
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [runningRoute, setRunningRoute] = useState<{ cityId: string; routeId: string; countsForJourney: boolean } | null>(null);
  const [utilityMode, setUtilityMode] = useState<'device' | 'profile' | null>(null);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [startupConnectionSucceeded, setStartupConnectionSucceeded] = useState(false);
  const [deviceConnectionAcknowledged, setDeviceConnectionAcknowledged] = useState(false);
  const [manualReducedMotion, setManualReducedMotion] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [focusNextStation, setFocusNextStation] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [legacyFeature, setLegacyFeature] = useState<LegacyFeature | null>(puzzleDeepLink?'teamRelay':null);
  const [medalLotteryTickets, setMedalLotteryTickets] = useState(0);
  const [activityRoute, setActivityRoute] = useState<ActivityRouteTarget | null>(null);
  const [runningActivityRoute, setRunningActivityRoute] = useState<ActivityRouteTarget | null>(null);
  const [medleySelectedRouteIds, setMedleySelectedRouteIds] = useState<string[]>([]);
  const [medleyCompletedRouteIds, setMedleyCompletedRouteIds] = useState<string[]>([]);
  const [medleyLotteryChances, setMedleyLotteryChances] = useState(5);
  const [medleyDrawHistory, setMedleyDrawHistory] = useState<number[]>([]);
  const [medleyShareBonusClaimed, setMedleyShareBonusClaimed] = useState(false);
  const [medleyActivityStarted, setMedleyActivityStarted] = useState(false);
  const [medleyCompletionRewardClaimed, setMedleyCompletionRewardClaimed] = useState(false);
  const puzzleSession = useRef<{ id: string; teamId: string; startedAt: number; slot: number; route: PuzzleRoute } | null>(null);
  const puzzleCities = [...new Set([state.currentCityId, ...state.completedCityIds])].map(getJourneyCity)
    .filter((c): c is JourneyCity => !!c && hasPublishedCityRoutes(c.id)).map(c => ({id:c.id,name:c.name,image:cityImageFor(c)}));
  const puzzleRoutes: PuzzleRoute[] = puzzleCities.flatMap(c => getJourneyCity(c.id)!.routes
    .filter(r => getRouteStatus(state,c.id,r.id) !== 'locked').map(r => ({ ...c, routeId:r.id, routeIndex:r.order,
      title:r.name, image:getRouteCover(c.name,r.order)?.src || c.image, distanceKm:r.distanceKm, minutes:r.durationMinutes })));
  const puzzle = usePuzzleTeam(puzzleDemo,puzzleCities.filter(c=>puzzleRoutes.some(r=>r.id===c.id)));
  const firstCityRewards = useFirstCityRewards(firstCityInitial, state, deviceConnected, !isFirstUse);
  const rewardCity = getJourneyCity(firstCityRewards.state.firstCityId ?? state.currentCityId)!;
  const systemReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(systemReducedMotion || manualReducedMotion);
  const currentCity = getJourneyCity(state.currentCityId)!;
  const currentCityCompletedRoutes = getCompletedRouteIds(state, state.currentCityId).length;
  const hasExistingJourney = currentCityCompletedRoutes > 0 || state.completedCityIds.length > 0;
  const homeCity = getJourneyCity(homeCityId) ?? currentCity;
  const totals = getJourneyTotals(state);
  const countryLevel = getCountryLevelProgress(state);
  const candidateCities = getCandidateCityIds(state).map(cityId => getJourneyCity(cityId)!).filter(Boolean);
  const effectiveCandidateId = selectedCandidateId ?? candidateCities[0]?.id ?? '';

  const connectPreviewDevice = () => {
    setDeviceConnected(true);
    setStartupConnectionSucceeded(true);
    setDeviceConnectionAcknowledged(false);
  };

  useEffect(() => {
    if (state.currentPage !== 'travel' || !state.pendingNextCityId) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'ARRIVE_NEXT_CITY' });
      setActiveTab('home');
    }, reduceMotion ? 250 : 2200);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, state.currentPage, state.pendingNextCityId]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => setHomeCityId(state.currentCityId), [state.currentCityId]);
  useEffect(() => {
    if (!routeCityId) return;
    setNewCityIds(ids => ids.includes(routeCityId) ? ids.filter(id => id !== routeCityId) : ids);
  }, [routeCityId]);
  useEffect(() => () => {
    if (nextStationFocusTimerRef.current) window.clearTimeout(nextStationFocusTimerRef.current);
  }, []);

  const openCity = (cityId: string) => {
    setRecommendationsOpen(false);
    setSelectedRouteId(null); setRouteCityId(cityId);
  };
  const continueCurrentJourney = () => {
    setRecommendationsOpen(false);
    setSelectedRouteId(null);
    if (getCityStatus(state, state.currentCityId) === 'completed') {
      setRouteCityId(null);
      setActiveTab('home');
      setHomeCityId(state.currentCityId);
      dispatch({ type:'NAVIGATE', page:'home' });
      setFocusNextStation(true);
    } else {
      setRouteCityId(state.currentCityId);
    }
  };
  const openRecommendations = () => {
    const featured = recommendations[0];
    const featuredCover = featured && resolveRecommendationCover(getRouteCover(featured.city.name, featured.route.order)?.src, 'feature');
    if (featuredCover) {
      const preload = new Image();
      preload.fetchPriority = 'high';
      preload.referrerPolicy = 'no-referrer';
      preload.src = featuredCover;
    }
    recommendationScrollTop.current = 0;
    setRouteCityId(null);
    setSelectedRouteId(null);
    setRecommendationsOpen(true);
  };
  const openRecommendedRoute = (route: JourneyRoute, scrollTop: number) => {
    const { cityId, id:routeId } = route;
    recommendationScrollTop.current = scrollTop;
    const cityStatus = getCityStatus(state, cityId);
    if ((cityStatus === 'current' || cityStatus === 'completed') && getRouteStatus(state, cityId, routeId) === 'discoverable') {
      dispatch({ type:'REVEAL_ROUTE', cityId, routeId });
    }
    setRouteCityId(cityId);
    setSelectedRouteId(routeId);
  };
  const openCityRoutesFromList = (cityId: string) => {
    setCityListOpen(false);
    openCity(cityId);
  };
  const openLegacyRoute = (routeIndex: number) => {
    const cityForRoutes = routeCityId ? getJourneyCity(routeCityId) : undefined;
    if (!cityForRoutes) return;
    const route = cityForRoutes.routes[routeIndex - 1];
    if (!route) return;
    const status = getRouteStatus(state, cityForRoutes.id, route.id);
    if (status === 'discoverable' && ['current', 'completed'].includes(getCityStatus(state, cityForRoutes.id))) {
      dispatch({ type: 'REVEAL_ROUTE', cityId: cityForRoutes.id, routeId: route.id });
      setNotice(`${route.name}，已揭晓`);
    }
    setSelectedRouteId(route.id);
  };
  const handleRouteSelect = (route: JourneyRoute) => {
    const status = getRouteStatus(state, route.cityId, route.id);
    if (status === 'discoverable') { dispatch({ type: 'REVEAL_ROUTE', cityId: route.cityId, routeId: route.id }); setNotice(`${route.name}，已揭晓`); return; }
    if (status === 'revealed' || status === 'completed') setSelectedRouteId(route.id);
  };
  const startRun = (route: JourneyRoute, fromRecommendation = false) => {
    const cityStatus = getCityStatus(state, route.cityId);
    const countsForJourney = (cityStatus === 'current' || cityStatus === 'completed')
      && getRouteStatus(state, route.cityId, route.id) !== 'locked';
    if (!countsForJourney && !(fromRecommendation && hasPublishedCityRoutes(route.cityId))) return;
    exerciseSessionId.current = crypto.randomUUID();
    startRunScenery();
    if (!deviceConnected) connectPreviewDevice();
    setRunningRoute({ cityId: route.cityId, routeId: route.id, countsForJourney });
    setRouteCityId(null);
  };
  const startSelectedRoute = () => {
    if (!routeCityId || !selectedRouteId) return;
    const route = getJourneyRoute(routeCityId, selectedRouteId);
    if (!route) return;
    startRun(route, recommendationsOpen);
  };
  const completeRun = (result: RunResult) => {
    if (!runningRoute) return;
    recordCompletedExercise(result);
    if (!runningRoute.countsForJourney) {
      setRunningRoute(null);
      setSelectedRouteId(null);
      setNotice('运动已完成，已计入今日运动');
      return;
    }
    firstCityRewards.completeRoute(runningRoute.cityId, runningRoute.routeId);
    const alreadyCompleted = getCompletedRouteIds(state, runningRoute.cityId).includes(runningRoute.routeId);
    const completedAfterRun = getCompletedRouteIds(state, runningRoute.cityId).length + (alreadyCompleted ? 0 : 1);
    const willCompleteCurrentCity = runningRoute.cityId === state.currentCityId && completedAfterRun >= 10;
    const completedCityId = runningRoute.cityId;
    dispatch({ type: 'COMPLETE_ROUTE', cityId: runningRoute.cityId, routeId: runningRoute.routeId, result });
    setRunningRoute(null);
    setSelectedRouteId(null);
    setSelectedCandidateId(null);
    if (firstCityReturnRef.current) {
      firstCityReturnRef.current = false;
      firstCityPreviewTaskRef.current = null;
      setRouteCityId(null);
      setLegacyFeature('firstCityRewards');
      dispatch({ type:'NAVIGATE', page:'home' });
      setNotice(willCompleteCurrentCity ? `首座城市已完成，可领取 ${formatRewardCents(FIRST_CITY_REWARDS.firstCity)} 奖励` : '路线已完成，首城进度已更新');
      return;
    }
    if (willCompleteCurrentCity) {
      setRecommendationsOpen(false);
      setActiveTab('home');
      setHomeCityId(state.currentCityId);
      setFocusNextStation(false);
      setNotice(`${getJourneyCity(state.currentCityId)?.name ?? '当前城市'}旅程已完成 · 请选择下一站`);
      dispatch({ type: 'NAVIGATE', page: 'home' });
      if (nextStationFocusTimerRef.current) window.clearTimeout(nextStationFocusTimerRef.current);
      nextStationFocusTimerRef.current = window.setTimeout(() => {
        setFocusNextStation(true);
        nextStationFocusTimerRef.current = null;
      }, reduceMotion ? 40 : 260);
    } else {
      dispatch({ type: 'NAVIGATE', page: 'home' });
      setRouteCityId(recommendationsOpen ? null : completedCityId);
      if (!alreadyCompleted && completedAfterRun < 10) setNotice(`路线 ${String(completedAfterRun + 1).padStart(2, '0')} 已解锁`);
    }
  };
  const resetDemo = () => { if (nextStationFocusTimerRef.current) window.clearTimeout(nextStationFocusTimerRef.current); nextStationFocusTimerRef.current = null; firstCityReturnRef.current = false; firstCityRewards.reset(); firstCityPreviewTaskRef.current = null; setDeviceConnected(false); setStartupConnectionSucceeded(false); setDeviceConnectionAcknowledged(false); setLegacyFeature(null); dispatch({ type: 'RESET_DEMO' }); setActiveTab('home'); setHomeCityId('tokyo'); setFocusNextStation(false); setCityListOpen(false); setUtilityMode(null); setRouteCityId(null); setSelectedRouteId(null); setRunningRoute(null); setSelectedCandidateId(null); setNotice('演示状态已恢复'); };
  const clearNextStationFocus = useCallback(() => setFocusNextStation(false), []);
  const startFirstJourney = () => {
    if (!firstCityChoiceId || !getJourneyCity(firstCityChoiceId)) return;
    if (firstCityRewards.state.firstCityId && firstCityRewards.state.firstCityId !== firstCityChoiceId && !firstCityRewards.state.achievedTaskIds.includes('firstCity')) {
      setIsFirstUse(false);
      setNotice(`请先完成${rewardCity.name}，再选择下一座城市`);
      return;
    }
    const initialJourney = createPrototypeJourneyState(firstCityChoiceId);
    firstCityRewards.bind(firstCityChoiceId, getCompletedRouteIds(initialJourney, firstCityChoiceId));
    dispatch({ type: 'START_JOURNEY', cityId: firstCityChoiceId });
    setHomeCityId(firstCityChoiceId);
    setActiveTab('home');
    setIsFirstUse(false);
    setNotice(`${getJourneyCity(firstCityChoiceId)?.name ?? '第一站'}，旅程从这里开始`);
  };
  const resumeCurrentJourney = () => {
    firstCityRewards.bind(state.currentCityId, getCompletedRouteIds(state, state.currentCityId));
    setHomeCityId(state.currentCityId);
    setActiveTab('home');
    dispatch({ type: 'NAVIGATE', page: 'home' });
    setIsFirstUse(false);
    setNotice(`继续${currentCity.name}旅程`);
  };
  const selectPrimaryTab = (tab: PrimaryTab) => {
    setActiveTab(tab);
    dispatch({ type: 'NAVIGATE', page: tab === 'world' ? 'map' : 'home' });
  };
  const openLegacyFeature = (feature: LegacyFeature) => {
    firstCityReturnRef.current = false;
    firstCityPreviewTaskRef.current = null;
    if(feature==='teamRelay'&&puzzleDemo)puzzle.restartPreview();
    setLegacyFeature(feature);
    setRouteCityId(null);
    setSelectedRouteId(null);
  };
  const drawMedalLottery = () => {
    if (medalLotteryTickets <= 0) {
      return { success: false, message: '暂无勋章盲盒券，请先兑换抽奖机会' };
    }
    const prizePool = ['2.66 元', '1.66 元', '6 分', '2.66 元', '1.66 元', '6 分'];
    const amount = prizePool[Math.floor(Math.random() * prizePool.length)];
    setMedalLotteryTickets(count => Math.max(0, count - 1));
    return { success: true, message: `抽中 ${amount}`, amount };
  };
  const openMedleyRoute = (cityId: string, routeIndex: number, image: string) => {
    setActivityRoute({ source: 'medley', cityId, routeIndex, image });
  };
  const openTeamRelayRoute = (route: PuzzleRoute, preview = false) => {
    const team = periodParticipation(puzzle.state,weekendPeriod(puzzle.now()).id);
    const available = puzzleRoutes.find(r => r.id === route.id && r.routeId === route.routeId);
    if (!team || team.archived || team.members.length !== 2 || !periodOpen(team.period,puzzle.now()) || !available || available.id !== team.city.id || puzzleComplete(team) || ownPieces(team).length >= 2
      || team.pieces.some(p => p.route.id === route.id && p.route.routeId === route.routeId)) { setNotice('路线状态已更新，请返回活动页重新选择。'); return; }
    const slot = team.pieces.length;
    const target: ActivityRouteTarget = {source:'teamRelay',cityId:available.id,routeIndex:available.routeIndex,image:available.image,taskId:String(slot)};
    dispatch({ type:'REVEAL_ROUTE',cityId:available.id,routeId:available.routeId });
    if (preview) { setActivityRoute(target); return; }
    exerciseSessionId.current = crypto.randomUUID();
    puzzleSession.current = {id:crypto.randomUUID(),teamId:team.id,startedAt:puzzle.now(),slot,route:available};
    if (puzzleDemo) {
      const source=getJourneyRoute(available.id,available.routeId);
      completeActivityRoute(target,{distance:available.distanceKm,duration:available.minutes*60,calories:source?.calories??0});
      return;
    }
    setActivityRoute(null); setRunningActivityRoute(target);
  };
  const completeActivityRoute = (target: ActivityRouteTarget, stats?: {distance:number;duration:number;calories:number}) => {
    if (stats) recordCompletedExercise({ distanceKm:stats.distance, durationSeconds:stats.duration, calories:stats.calories });
    setRunningActivityRoute(null);
    if (target.source === 'medley') {
      const routeId = `${target.cityId}-${target.routeIndex}`;
      setMedleyCompletedRouteIds(completed => {
        if (completed.includes(routeId)) return completed;
        const next = [...completed, routeId];
        if (next.length === 3 && !medleyCompletionRewardClaimed) {
          setMedleyLotteryChances(chances => chances + 5);
          setMedleyCompletionRewardClaimed(true);
        }
        return next;
      });
      setLegacyFeature('weekendMedley');
      return;
    }
    const record = puzzleSession.current; puzzleSession.current = null;
    if (record && stats) {
      const next = puzzle.finish(record.teamId, {...record, memberId:'self', finishedAt:puzzle.now(), distanceKm:stats.distance});
      const earned = next.teams.some(t => t.pieces.some(p => p.id === record.id));
      if(earned) {
        firstCityRewards.completeRoute(record.route.id, record.route.routeId);
        dispatch({type:'COMPLETE_ROUTE',cityId:record.route.id,routeId:record.route.routeId,background:true,result:{distanceKm:stats.distance,durationSeconds:stats.duration,calories:stats.calories}});
      }
      if(!puzzleDemo||!earned)setNotice(earned ? (puzzleComplete(next.teams.find(t => t.id === record.teamId)!) ? '小队已完成 3 条路线，可以去抽奖了' : '路线已完成，小队进度已更新') : '本次未计入，请完整跑完路线；每人每期最多 2 条');
    }
    setLegacyFeature('teamRelay');
  };
  const continueFirstCityTask = (task: 'firstRoute' | 'firstCity') => {
    firstCityReturnRef.current = true;
    firstCityPreviewTaskRef.current = task === 'firstRoute' ? 'firstRoute' : null;
    setLegacyFeature(null);
    setRouteCityId(rewardCity.id);
    setSelectedRouteId(null);
  };
  const openFirstCityActivation = () => {
    firstCityPreviewTaskRef.current = 'activation';
    setUtilityMode('device');
  };
  const closeDevicePage = () => {
    if (firstCityPreviewTaskRef.current === 'activation') {
      firstCityPreviewTaskRef.current = null;
      connectPreviewDevice();
      setNotice('激活已完成，可领取奖励');
    }
    setUtilityMode(null);
  };
  const closeCityRoutes = () => {
    setRouteCityId(null);
    setSelectedRouteId(null);
    if (!firstCityReturnRef.current) return;
    if (firstCityPreviewTaskRef.current === 'firstRoute') {
      const routes = getCityRouteSequence(rewardCity);
      const nextRoute = routes.find(route => {
        const status = getRouteStatus(state, rewardCity.id, route.id);
        return status === 'discoverable' || status === 'revealed';
      });
      if (nextRoute) {
        dispatch({ type:'REVEAL_ROUTE', cityId:rewardCity.id, routeId:nextRoute.id });
        dispatch({type:'COMPLETE_ROUTE',cityId:rewardCity.id,routeId:nextRoute.id,background:true,result:{distanceKm:nextRoute.distanceKm,durationSeconds:nextRoute.durationMinutes * 60,calories:nextRoute.calories}});
      }
      const previewRoute = nextRoute ?? routes.find(route => getRouteStatus(state, rewardCity.id, route.id) === 'completed');
      if (previewRoute) {
        firstCityRewards.completeRoute(rewardCity.id, previewRoute.id);
        setNotice('首条路线已完成，可领取奖励');
      }
    }
    firstCityReturnRef.current = false;
    firstCityPreviewTaskRef.current = null;
    setLegacyFeature('firstCityRewards');
  };

  const runningCity = runningRoute ? getJourneyCity(runningRoute.cityId) : undefined;
  const runningRouteData = runningRoute ? getJourneyRoute(runningRoute.cityId, runningRoute.routeId) : undefined;
  const routeSheetCity = routeCityId ? getJourneyCity(routeCityId) : undefined;
  const selectedRouteData = routeSheetCity && selectedRouteId ? getJourneyRoute(routeSheetCity.id, selectedRouteId) : undefined;
  const canWarmRunScenery = !!activityRoute || !!(routeSheetCity && selectedRouteData && (
    recommendationsOpen || (
      ['current', 'completed'].includes(getCityStatus(state, routeSheetCity.id))
      && getRouteStatus(state, routeSheetCity.id, selectedRouteData.id) !== 'locked'
    )
  ));
  useEffect(() => {
    if (canWarmRunScenery) prepareRunScenery();
  }, [canWarmRunScenery, prepareRunScenery]);
  const lastRunCity = state.lastRun ? getJourneyCity(state.lastRun.cityId) : undefined;
  const lastRunRoute = state.lastRun ? getJourneyRoute(state.lastRun.cityId, state.lastRun.routeId) : undefined;
  const pendingCity = state.pendingNextCityId ? getJourneyCity(state.pendingNextCityId) : undefined;
  const showDeviceConnectedPrompt = startupConnectionSucceeded && deviceConnected && !deviceConnectionAcknowledged
    && !isFirstUse && activeTab === 'home' && state.currentPage === 'home'
    && !routeSheetCity && !recommendationsOpen && !runningRoute && !activityRoute && !runningActivityRoute
    && !legacyFeature && !cityListOpen && !utilityMode;

  return (
    <div className="app-stage"><a className="skip-link" href="#main-content">跳到主要内容</a><div className="phone-shell" data-reduced-motion={reduceMotion}><div className="paper-grain" aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        {isFirstUse ? <motion.div className="screen-layer" key="first-city" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}><FirstJourneyExperience selectedId={firstCityChoiceId} currentCity={currentCity} currentCityCompletedRoutes={currentCityCompletedRoutes} hasExistingJourney={hasExistingJourney} onSelect={setFirstCityChoiceId} onContinue={startFirstJourney} onResume={resumeCurrentJourney} /></motion.div>
        : runningActivityRoute ? <motion.div className="screen-layer" key="running-activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RunPlaybackView prepareScenery={prepareRunScenery} cityId={runningActivityRoute.cityId} cityName={runningActivityRoute.source === 'teamRelay' ? getJourneyCity(runningActivityRoute.cityId)?.name : undefined} routeIndex={runningActivityRoute.routeIndex} image={runningActivityRoute.image} routeOverride={runningActivityRoute.source === 'teamRelay' ? toLegacyRouteItem(getJourneyCity(runningActivityRoute.cityId)!.routes[runningActivityRoute.routeIndex-1],state) : undefined} requireFullRoute={runningActivityRoute.source === 'teamRelay'} onExit={() => { puzzleSession.current=null; setActivityRoute(runningActivityRoute); setRunningActivityRoute(null); }} onComplete={stats => completeActivityRoute(runningActivityRoute,stats)} /></motion.div>
        : activityRoute ? <motion.div className="screen-layer" key="activity-route-detail" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><RouteDetailView cityId={activityRoute.cityId} routeIndex={activityRoute.routeIndex} image={activityRoute.image} routeOverride={activityRoute.source === 'teamRelay' ? toLegacyRouteItem(getJourneyCity(activityRoute.cityId)!.routes[activityRoute.routeIndex-1],state) : undefined} onBack={() => setActivityRoute(null)} onStart={() => {
          if (activityRoute.source === 'teamRelay') {
            const team = periodParticipation(puzzle.state,weekendPeriod(puzzle.now()).id); const route = puzzleRoutes.find(r => r.id === activityRoute.cityId && r.routeIndex === activityRoute.routeIndex);
            if (!team || team.archived || team.members.length !== 2 || !periodOpen(team.period,puzzle.now()) || !route || route.id !== team.city.id || puzzleComplete(team) || ownPieces(team).length >= 2 || team.pieces.some(p => p.route.id === route.id && p.route.routeId === route.routeId)) { setNotice('路线状态已更新，请返回活动页重新选择。'); return; }
            puzzleSession.current = {id:crypto.randomUUID(),teamId:team.id,startedAt:puzzle.now(),slot:Number(activityRoute.taskId),route};
            dispatch({ type:'REVEAL_ROUTE',cityId:route.id,routeId:route.routeId });
          }
          exerciseSessionId.current = crypto.randomUUID(); startRunScenery(); setRunningActivityRoute(activityRoute); setActivityRoute(null);
        }} /></motion.div>
        : legacyFeature === 'level' ? <motion.div className="screen-layer" key="journey-level" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><JourneyLevelView state={state} onBack={() => setLegacyFeature(null)} /></motion.div>
        : legacyFeature === 'leaderboard' ? <motion.div className="screen-layer" key="leaderboard" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><LeaderboardView currentLevel={countryLevel.level} onBack={() => setLegacyFeature(null)} /></motion.div>
        : legacyFeature === 'onlineSupport' ? <motion.div className="screen-layer" key="online-support" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><OnlineSupportView onBack={() => setLegacyFeature(null)} /></motion.div>
        : legacyFeature === 'medalLottery' ? <motion.div className="screen-layer" key="medal-lottery" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><MedalLotteryView tickets={medalLotteryTickets} onBack={() => setLegacyFeature(null)} onGoRun={() => { setLegacyFeature(null); setActiveTab('home'); }} onDraw={drawMedalLottery} /></motion.div>
        : legacyFeature === 'weekendMedley' ? <motion.div className="screen-layer" key="weekend-medley" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><WeekendMedleyView onBack={() => setLegacyFeature(null)} selectedRouteIds={medleySelectedRouteIds} completedRouteIds={medleyCompletedRouteIds} lotteryChances={medleyLotteryChances} drawHistory={medleyDrawHistory} shareBonusClaimed={medleyShareBonusClaimed} activityStarted={medleyActivityStarted} onUpdateState={(next) => { if (next.selectedRouteIds !== undefined) setMedleySelectedRouteIds(next.selectedRouteIds); if (next.completedRouteIds !== undefined) setMedleyCompletedRouteIds(next.completedRouteIds); if (next.lotteryChances !== undefined) setMedleyLotteryChances(next.lotteryChances); if (next.drawHistory !== undefined) setMedleyDrawHistory(next.drawHistory); if (next.shareBonusClaimed !== undefined) setMedleyShareBonusClaimed(next.shareBonusClaimed); if (next.activityStarted !== undefined) setMedleyActivityStarted(next.activityStarted); }} onNavigateToRouteDetail={openMedleyRoute} /></motion.div>
        : legacyFeature === 'teamRelay' ? <motion.div className="screen-layer" key="team-relay" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><TeamRelayView preview={puzzleDemo} state={puzzle.state} cities={puzzleCities} routes={puzzleRoutes} storageFailed={puzzle.storageFailed} onBack={() => setLegacyFeature(null)} onCreate={puzzle.create} onJoin={puzzle.join} onDraw={puzzle.draw} now={puzzle.now()} onRun={openTeamRelayRoute} onSimulatePartner={puzzleDemo?puzzle.demoFinishPartner:undefined} onSimulateJoin={puzzleDemo?puzzle.demoJoin:undefined} /></motion.div>
        : legacyFeature === 'firstCityRewards' ? <motion.div className="screen-layer" key="first-city-rewards" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><FirstCityRewardsView state={firstCityRewards.state} city={{ name:rewardCity.name, image:cityImageFor(rewardCity), total:rewardCity.routes.length }} storageFailed={firstCityRewards.storageFailed} onBack={() => setLegacyFeature(null)} onDevice={openFirstCityActivation} onContinue={continueFirstCityTask} onClaim={firstCityRewards.claim} /></motion.div>
        : runningCity && runningRouteData ? <motion.div className="screen-layer" key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RunPlaybackView prepareScenery={prepareRunScenery} cityId={runningCity.id} cityName={runningCity.name} routeIndex={runningRouteData.order} image={cityImageFor(runningCity)} routeOverride={toLegacyRouteItem(runningRouteData, state, recommendationsOpen)} onExit={() => { setRunningRoute(null); setRouteCityId(runningCity.id); setSelectedRouteId(runningRouteData.id); }} onComplete={(stats) => completeRun({ distanceKm: stats.distance, durationSeconds: stats.duration, calories: stats.calories })} /></motion.div>
        : state.currentPage === 'routeComplete' && state.lastRun && lastRunCity && lastRunRoute ? <motion.div className="screen-layer" key="route-complete" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><RouteCompletePage city={lastRunCity} route={lastRunRoute} completed={getCompletedRouteIds(state, lastRunCity.id).length} result={state.lastRun} firstCompletion={state.lastRun.isFirstCompletion} onNext={() => { setActiveTab('home'); dispatch({ type: 'NAVIGATE', page: 'home' }); window.setTimeout(() => openCity(state.currentCityId), 0); }} onMap={() => selectPrimaryTab('world')} /></motion.div>
        : state.currentPage === 'cityComplete' ? <motion.div className="screen-layer" key="city-complete" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><CityCompletePage city={currentCity} candidates={candidateCities} selectedId={effectiveCandidateId} onSelect={setSelectedCandidateId} onContinue={() => effectiveCandidateId && dispatch({ type: 'SELECT_NEXT_CITY', cityId: effectiveCandidateId })} /></motion.div>
        : state.currentPage === 'travel' && pendingCity ? <motion.div className="screen-layer" key="travel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TravelPage from={currentCity} to={pendingCity} reduceMotion={reduceMotion} /></motion.div>
        : routeSheetCity && selectedRouteData ? <motion.div className="screen-layer" key="legacy-route-detail" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><RouteDetailView cityId={routeSheetCity.id} routeIndex={selectedRouteData.order} image={cityImageFor(routeSheetCity)} routeOverride={toLegacyRouteItem(selectedRouteData, state, recommendationsOpen)} currentJourney={{ name:currentCity.name, image:cityImageFor(currentCity), completed:currentCityCompletedRoutes, total:currentCity.routes.length }} onContinueJourney={continueCurrentJourney} unselectedCityName={!recommendationsOpen && !['current', 'completed'].includes(getCityStatus(state, routeSheetCity.id)) ? routeSheetCity.name : undefined} onBack={() => { setSelectedRouteId(null); if (recommendationsOpen) setRouteCityId(null); }} onStart={startSelectedRoute} /></motion.div>
        : recommendationsOpen ? (
          <motion.div className="screen-layer" key="daily-recommendations" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <DailyRouteRecommendationsView
              cityImageFor={cityImageFor}
              day={recommendationDay}
              recommendations={recommendations}
              scrollTop={recommendationScrollTop.current}
              onBack={() => setRecommendationsOpen(false)}
              onRouteClick={openRecommendedRoute}
            />
          </motion.div>
        )
        : routeSheetCity ? <motion.div className="screen-layer" key="legacy-route-list" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><CityRoutesView city={toLegacyCity(routeSheetCity, state)} routeItems={routeSheetCity.routes.map(route => toLegacyRouteItem(route, state))} completedRouteIndices={routeSheetCity.routes.filter(route => getCompletedRouteIds(state, routeSheetCity.id).includes(route.id)).map(route => route.order)} openRouteCount={getRouteListOpenCount(state, routeSheetCity.id)} onBack={closeCityRoutes} onRouteClick={openLegacyRoute} /></motion.div>
        : activeTab === 'profile' ? <motion.div className="screen-layer" key="profile" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><ProfilePage totals={totals} countryLevel={countryLevel} onDevice={() => setUtilityMode('device')} onLevel={() => openLegacyFeature('level')} onSettings={() => setUtilityMode('profile')} onFeature={label => setNotice(`${label} · 演示入口`)} /></motion.div>
        : activeTab === 'activity' ? <motion.div className="screen-layer" key="activity" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><EventsTab onSelectMedalLottery={() => openLegacyFeature('medalLottery')} onSelectMedley={() => openLegacyFeature('weekendMedley')} onSelectFirstCityRewards={() => openLegacyFeature('firstCityRewards')} onSelectTeamRelay={() => {openLegacyFeature('teamRelay');}} onSelectHundredCities={() => setNotice('百人百城计划 · 筹备中')} /></motion.div>
        : activeTab === 'world' ? <motion.div className="screen-layer" key="world" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><MapPage state={state} totals={totals} onOpenCity={openCity} onCities={() => setCityListOpen(true)} onLeaderboard={() => openLegacyFeature('leaderboard')} onCountryLevel={() => openLegacyFeature('level')} /></motion.div>
        : <motion.div className="screen-layer" key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><HomePage state={state} newCityIds={newCityIds} recommendations={recommendations} todayExercise={dailyExercise.totals} dailyGoalKm={dailyExercise.goalKm} allowGoalAnimation={!showDeviceConnectedPrompt && !reduceMotion} onEditDailyGoal={() => { setNotice(''); setDailyGoalOpen(true); }} city={homeCity} deviceConnected={deviceConnected} onRoutes={openCity} onRecommendations={openRecommendations} onBrowseCity={setHomeCityId} onSelectNextCity={(cityId) => { setSelectedCandidateId(cityId); dispatch({ type: 'SELECT_NEXT_CITY', cityId }); }} focusNextStation={focusNextStation} onNextStationFocused={clearNextStationFocus} onDevice={() => setUtilityMode('device')} onLegacyFeature={openLegacyFeature} onCarouselEnd={() => setNotice('更多城市敬请期待')} /></motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {cityListOpen && !runningRoute && <motion.div className="overlay-layer" key="city-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CityListSheet state={state} selectedCityId={homeCity.id} onSelect={openCityRoutesFromList} onClose={() => setCityListOpen(false)} /></motion.div>}
        {utilityMode && <motion.div className="overlay-layer" key="utility" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{utilityMode === 'device' ? <MyDevicesView connected={deviceConnected} onBack={closeDevicePage} onAdd={() => { if (deviceConnected) { setNotice('当前设备已连接'); return; } connectPreviewDevice(); setNotice('设备已连接'); }} onScan={() => setNotice('扫码绑定暂未接入，当前为页面预览')} /> : <UtilityPanel mode={utilityMode} deviceConnected={deviceConnected} manualReducedMotion={manualReducedMotion} onToggleDevice={() => setDeviceConnected(value => !value)} onToggleMotion={() => setManualReducedMotion(value => !value)} onReset={resetDemo} onClose={() => setUtilityMode(null)} />}</motion.div>}
        {showDeviceConnectedPrompt && <motion.div className="overlay-layer" key="device-connected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}><DeviceConnectedPrompt onDismiss={() => setDeviceConnectionAcknowledged(true)} onViewDevice={() => { setDeviceConnectionAcknowledged(true); setUtilityMode('device'); }} /></motion.div>}
      </AnimatePresence>
      {dailyGoalOpen && <DailyGoalEditor goalKm={dailyExercise.goalKm} onClose={() => setDailyGoalOpen(false)} onSave={value => { if (dailyExercise.setGoalKm(value)) { setDailyGoalOpen(false); setNotice(`今日目标已设为 ${value} 公里`); } }} />}
      {!isFirstUse && utilityMode !== 'device' && !runningRoute && !runningActivityRoute && !activityRoute && !legacyFeature && !routeSheetCity && !recommendationsOpen && (state.currentPage === 'home' || state.currentPage === 'map') && <BottomNavigation active={activeTab} onChange={selectPrimaryTab} />}
      <div className={`toast ${notice ? 'is-visible' : ''} ${notice === '更多城市敬请期待' ? 'toast--centered' : ''}`} role="status" aria-live="polite">{notice}</div>
    </div></div>
  );
}
