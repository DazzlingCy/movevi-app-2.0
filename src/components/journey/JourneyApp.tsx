import { Fragment, lazy, Suspense, useCallback, useEffect, useReducer, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, ClipboardList,
  Clock3, Compass, Flame, Footprints, Globe2, Headphones, HeadphonesIcon, LockKeyhole, Mail, Map, MapPin,
  Medal, MessageSquare, MonitorSmartphone, Navigation, Pause, Play, RotateCcw, Route,
  Settings, Sparkles, SquarePen, Target, Trophy, UserRound, Wallet, Wifi, WifiOff, X
} from 'lucide-react';
import { CITIES, type CityData } from '../../data/cities';
import { getJourneyCity, getJourneyRoute, JOURNEY_SEQUENCE } from '../../journey/data';
import {
  createDemoJourneyState, getCandidateCityIds, getCityPlanTotals, getCityStatus,
  getCompletedRouteIds, getHomeJourneyCityIds, getJourneyTotals, getOpenRouteCount, getRouteStatus, journeyReducer
} from '../../journey/state';
import type { JourneyCity, JourneyRoute, JourneyState, RunResult } from '../../journey/types';
import { getWeightPlanRewardAmount, type WeightPlanRewardRecord } from '../../lib/weightPlan';
import CityRoutesView, { type CityRouteListItem } from '../CityRoutesView';
import EventsTab from '../EventsTab';
import JourneyLevelView from '../JourneyLevelView';
import LeaderboardView from '../LeaderboardView';
import OnlineSupportView from '../OnlineSupportView';
import RouteDetailView from '../RouteDetailView';
import RunPlaybackView from '../RunPlaybackView';
import WeightLossPlanView from '../WeightLossPlanView';
import Modal from './Modal';

const JourneyGlobe = lazy(() => import('./JourneyGlobe'));

const JOURNEY_CITY_SEQUENCE: JourneyCity[] = JOURNEY_SEQUENCE
  .map(cityId => getJourneyCity(cityId))
  .filter((city): city is JourneyCity => Boolean(city));

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

const DEFAULT_JOURNEY_CITY_VIDEO = JOURNEY_CITY_VIDEOS.tokyo!;

const cityImageFor = (city: JourneyCity) =>
  JOURNEY_CITY_IMAGES[city.id]
  ?? CITIES.find(item => item.name === city.name || item.englishName === city.englishName)?.image
  ?? 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200';

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

const toLegacyRouteItem = (route: JourneyRoute, state: JourneyState): CityRouteListItem => {
  const status = getRouteStatus(state, route.cityId, route.id);
  const listOpenCount = getRouteListOpenCount(state, route.cityId);
  return {
    title: route.name,
    distance: route.distanceKm.toFixed(1),
    duration: `${String(route.durationMinutes).padStart(2, '0')}:00`,
    calories: String(route.calories),
    rating: '4.8',
    spots: route.landmarks.join(' — '),
    intro: route.description,
    isCompleted: status === 'completed',
    isUnlocked: status !== 'locked' && route.order <= listOpenCount
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
  city: JourneyCity;
  deviceConnected: boolean;
  onRoutes: (cityId: string) => void;
  onBrowseCity: (cityId: string) => void;
  onSelectNextCity: (cityId: string) => void;
  focusNextStation: boolean;
  onNextStationFocused: () => void;
  onDevice: () => void;
  onLegacyFeature: (feature: LegacyFeature) => void;
}

type LegacyFeature = 'onlineSupport' | 'weightLossPlan' | 'leaderboard' | 'level';

type WeightRouteTarget = {
  cityId: string;
  routeIndex: number;
  image: string;
  day: number;
};

function HomePage({ state, city, deviceConnected, onRoutes, onBrowseCity, onSelectNextCity, focusNextStation, onNextStationFocused, onDevice, onLegacyFeature }: HomePageProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cityVideoRef = useRef<HTMLVideoElement>(null);
  const hasAlignedCarouselRef = useRef(false);
  const programmaticScrollRef = useRef(false);
  const scrollSettleTimerRef = useRef<number | null>(null);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const mouseDragRef = useRef<{ pointerId: number; startX: number; scrollLeft: number; dragged: boolean } | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);
  const [videoNeedsTap, setVideoNeedsTap] = useState(false);
  const homeJourneyCities = getHomeJourneyCityIds(state).map(cityId => getJourneyCity(cityId)!).filter(Boolean);
  const cityIndex = Math.max(0, homeJourneyCities.findIndex(item => item.id === city.id));
  const nextStationCandidates = getCandidateCityIds(state, 3).map(cityId => getJourneyCity(cityId)!).filter(Boolean);
  const currentCityCompleted = getCompletedRouteIds(state, state.currentCityId).length >= 10 || state.completedCityIds.includes(state.currentCityId);
  const getProgressCopy = (item: JourneyCity) => {
    const itemStatus = getCityStatus(state, item.id);
    return itemStatus === 'completed' || itemStatus === 'current'
      ? ''
      : '完成前序旅程后逐步开放';
  };

  const updateCarouselCardVisuals = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const cards = [...carousel.querySelectorAll<HTMLElement>('[data-city-id], [data-next-station]')];
    const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    const influenceDistance = Math.max(1, carousel.clientWidth * 0.58);

    cards.forEach(card => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distanceRatio = Math.min(1, Math.abs(cardCenter - viewportCenter) / influenceDistance);
      const closeness = 1 - distanceRatio;
      const eased = closeness * closeness * (3 - 2 * closeness);
      card.style.setProperty('--journey-card-scale', (0.92 + eased * 0.08).toFixed(3));
      card.style.setProperty('--journey-card-y', `${(8 - eased * 8).toFixed(2)}px`);
      card.style.setProperty('--journey-card-opacity', (0.62 + eased * 0.38).toFixed(3));
      card.style.setProperty('--journey-card-saturate', (0.78 + eased * 0.22).toFixed(3));
      card.style.setProperty('--journey-card-brightness', (0.68 + eased * 0.32).toFixed(3));
    });
  }, []);

  const requestCarouselVisualUpdate = useCallback(() => {
    if (scrollAnimationFrameRef.current) return;
    scrollAnimationFrameRef.current = window.requestAnimationFrame(() => {
      scrollAnimationFrameRef.current = null;
      updateCarouselCardVisuals();
    });
  }, [updateCarouselCardVisuals]);

  useEffect(() => {
    const carousel = carouselRef.current;
    const target = carousel?.querySelector<HTMLElement>(`[data-city-id="${city.id}"]`);
    if (!carousel || !target) return;
    const targetLeft = target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;
    if (Math.abs(carousel.scrollLeft - targetLeft) < 3) {
      requestCarouselVisualUpdate();
      return;
    }
    programmaticScrollRef.current = true;
    carousel.scrollTo({
      left: targetLeft,
      behavior: hasAlignedCarouselRef.current ? 'smooth' : 'auto'
    });
    hasAlignedCarouselRef.current = true;
    const releaseProgrammaticScroll = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 420);
    return () => {
      window.clearTimeout(releaseProgrammaticScroll);
      if (scrollSettleTimerRef.current) window.clearTimeout(scrollSettleTimerRef.current);
      if (scrollAnimationFrameRef.current) window.cancelAnimationFrame(scrollAnimationFrameRef.current);
    };
  }, [city.id, requestCarouselVisualUpdate]);

  useEffect(() => {
    if (!focusNextStation) return;
    const carousel = carouselRef.current;
    const target = carousel?.querySelector<HTMLElement>('[data-next-station]');
    if (!carousel || !target) return;

    const targetLeft = target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;
    programmaticScrollRef.current = true;
    carousel.scrollTo({ left: targetLeft, behavior: 'smooth' });
    hasAlignedCarouselRef.current = true;

    const releaseNextStationFocus = window.setTimeout(() => {
      programmaticScrollRef.current = false;
      requestCarouselVisualUpdate();
      onNextStationFocused();
    }, 460);
    return () => window.clearTimeout(releaseNextStationFocus);
  }, [focusNextStation, onNextStationFocused, requestCarouselVisualUpdate]);

  const selectNearestCity = () => {
    if (programmaticScrollRef.current) return;
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = [...carousel.querySelectorAll<HTMLElement>('[data-city-id], [data-next-station]')];
    const firstCard = cards[0];
    if (!firstCard) return;
    const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    const next = cards.reduce((nearest, card) => (
      Math.abs(card.offsetLeft + card.clientWidth / 2 - viewportCenter) < Math.abs(nearest.offsetLeft + nearest.clientWidth / 2 - viewportCenter) ? card : nearest
    ), firstCard);
    if (next.dataset.cityId && next.dataset.cityId !== city.id) onBrowseCity(next.dataset.cityId);
  };

  const scheduleNearestCitySelection = () => {
    requestCarouselVisualUpdate();
    if (programmaticScrollRef.current) return;
    if (scrollSettleTimerRef.current) window.clearTimeout(scrollSettleTimerRef.current);
    scrollSettleTimerRef.current = window.setTimeout(selectNearestCity, 100);
  };

  const handleCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextCity = homeJourneyCities[Math.min(homeJourneyCities.length - 1, Math.max(0, cityIndex + direction))];
    if (nextCity) onBrowseCity(nextCity.id);
  };

  const handleCarouselPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    mouseDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      dragged: false
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add('is-dragging');
  };

  const handleCarouselPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = mouseDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > 3) drag.dragged = true;
    if (!drag.dragged) return;

    event.preventDefault();
    event.currentTarget.scrollLeft = drag.scrollLeft - deltaX;
    requestCarouselVisualUpdate();
    if (scrollSettleTimerRef.current) window.clearTimeout(scrollSettleTimerRef.current);
  };

  const finishCarouselPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = mouseDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.classList.remove('is-dragging');
    mouseDragRef.current = null;

    if (drag.dragged) {
      swipedRef.current = true;
      window.setTimeout(() => { swipedRef.current = false; }, 180);
      scheduleNearestCitySelection();
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
    if (swipedRef.current) return;
    onRoutes(cityId);
  };
  const handleCtaPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    swipeStartRef.current = null;
    mouseDragRef.current = null;
    swipedRef.current = false;
  };
  const handleNextCitySelect = (cityId: string) => {
    if (swipedRef.current || !currentCityCompleted) return;
    onSelectNextCity(cityId);
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

  return (
    <main className="page page--home" id="main-content">
      <header className="topbar">
        <button className="utility-chip utility-chip--support" type="button" onClick={() => onLegacyFeature('onlineSupport')} aria-label="打开在线客服">
          <HeadphonesIcon />
          <span>在线客服</span>
        </button>
        <button
          className={`utility-chip utility-chip--device ${deviceConnected ? 'is-online' : 'is-offline'}`}
          type="button"
          onClick={onDevice}
          aria-label={deviceConnected ? '跑步机已连接，查看设备状态' : '跑步机未连接，查看连接设置'}
          title={deviceConnected ? '跑步机已连接' : '跑步机未连接'}
        >
          <TreadmillIcon connected={deviceConnected} />
        </button>
      </header>
      <section className="home-heading">
        <h1>今天去哪里？</h1>
        <button className="home-reward-chip" type="button" onClick={() => onLegacyFeature('weightLossPlan')} aria-label="打开打卡红包">
          <Flame />
          <span>打卡红包</span>
        </button>
      </section>
      <section className="home-city-swipe-zone" aria-label="城市与旅程进度，可左右滑动切换城市" onPointerDown={handleSwipeStart} onPointerUp={handleSwipeEnd} onPointerCancel={() => { swipeStartRef.current = null; }}>
        <div
          className="destination-carousel"
          ref={carouselRef}
          role="region"
          tabIndex={0}
          aria-label="全球城市，可左右滑动切换"
          onScroll={scheduleNearestCitySelection}
          onKeyDown={handleCarouselKeyDown}
          onPointerDown={handleCarouselPointerDown}
          onPointerMove={handleCarouselPointerMove}
          onPointerUp={finishCarouselPointerDrag}
          onPointerCancel={finishCarouselPointerDrag}
        >
          {homeJourneyCities.map((item) => {
            const itemStatus = getCityStatus(state, item.id);
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
            const itemCanOpenRoutes = itemStatus === 'current' || itemStatus === 'completed';
            const itemLabel = itemStatus === 'completed' ? '已完成城市' : itemStatus === 'current' ? '当前目的地' : '全球目的地';
            return (
              <Fragment key={item.id}>
                <section className={`destination-journey-card${item.id === city.id ? ' is-active' : ' is-side'}`} data-city-id={item.id} key={item.id} style={cityStyle(item)} aria-label={`${item.name}，${itemLabel}`}>
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
                        <span className="destination-card__motion-badge" aria-hidden="true"><i /> 动态城市</span>
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
                    <div className="destination-card__content">
                      <div><span className="destination-card__kicker"><MapPin /> {itemLabel}</span><h2>{item.name}</h2><p>{item.englishName}</p></div>
                    </div>
                  </div>
                  <section className="journey-progress" aria-label={`${item.name}旅程进度`}>
                    <div className="journey-progress__topline">
                      <div><span>城市进度</span><strong>{itemCompleted}<small>/10</small></strong></div>
                      {getProgressCopy(item) && <p>{getProgressCopy(item)}</p>}
                    </div>
                    <ProgressSegments completed={itemCompleted} showRunner={itemStatus === 'current'} />
                    {itemCanOpenRoutes && (
                      <div className={`city-card-sport-stats city-card-sport-stats--${itemStatus}`} aria-label={`${item.name}累计运动数据`}>
                        <div><span><Footprints />里程</span><strong>{itemExerciseTotals.distance.toFixed(1)}<small>km</small></strong></div>
                        <div><span><Clock3 />时长</span><strong>{(itemExerciseTotals.duration / 60).toFixed(1)}<small>h</small></strong></div>
                        <div><span><Flame />消耗</span><strong>{Math.round(itemExerciseTotals.calories).toLocaleString('zh-CN')}<small>kcal</small></strong></div>
                      </div>
                    )}
                    <button className={`${itemCanOpenRoutes ? 'primary-button ' : ''}journey-cta journey-cta--${itemStatus}`} type="button" onPointerDown={handleCtaPointerDown} onClick={(event) => { event.stopPropagation(); handleRoutesClick(item.id); }} disabled={!itemCanOpenRoutes}>
                      {itemStatus === 'completed' ? `查看${item.name}旅程` : itemStatus === 'current' ? `继续${item.name}旅程` : `${item.name} · 尚未开放`} {itemCanOpenRoutes ? <ArrowRight /> : <LockKeyhole />}
                    </button>
                  </section>
                </section>
                {item.id === state.currentCityId && (
                  <section className={`destination-journey-card destination-next-card${currentCityCompleted ? ' is-ready' : ' is-locked'}`} data-next-station="true" key={`${item.id}-next-station`} aria-label="下一站选择卡片">
                    <div className="next-station-card__hero">
                      <span className="next-station-card__eyebrow"><Navigation /> 下一站</span>
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
      </section>
    </main>
  );
}

function CityListSheet({ state, selectedCityId, onSelect, onClose }: { state: JourneyState; selectedCityId: string; onSelect: (cityId: string) => void; onClose: () => void }) {
  const [activeContinent, setActiveContinent] = useState<CityContinentFilter>('全部');
  const statusText = { completed: '已完成', current: '当前', candidate: '', locked: '未开放' } as const;
  const visibleCities = JOURNEY_CITY_SEQUENCE
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => activeContinent === '全部' || item.continent === activeContinent);

  return (
    <Modal labelId="city-list-title" onClose={onClose} className="city-list-sheet">
      <header className="sheet-header">
        <div><span>{visibleCities.length} destinations</span><h2 id="city-list-title">全球城市列表</h2></div>
        <button className="icon-button icon-button--paper" type="button" onClick={onClose} aria-label="关闭全球城市列表"><X /></button>
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
          const status = getCityStatus(state, item.id);
          const completed = getCompletedRouteIds(state, item.id).length;
          const StatusIcon = status === 'completed' ? Check : status === 'current' ? MapPin : status === 'locked' ? LockKeyhole : null;
          return (
            <button className={`city-list-card city-list-card--${status}${selectedCityId === item.id ? ' is-selected' : ''}`} type="button" key={item.id} onClick={() => { onSelect(item.id); onClose(); }} aria-pressed={selectedCityId === item.id} style={cityStyle(item)}>
              <img className="city-list-card__photo" src={cityImageFor(item)} alt="" aria-hidden="true" />
              <span className="city-list-card__veil" aria-hidden="true" />
              <span className="city-list-card__number">{String(index + 1).padStart(2, '0')}</span>
              {StatusIcon && <span className="city-list-card__status"><StatusIcon />{statusText[status]}</span>}
              {status === 'completed' && <span className="city-list-card__stamp" aria-hidden="true"><b>已完成</b><small>COMPLETED</small></span>}
              {status === 'current' && <span className="city-list-card__pin" aria-hidden="true"><MapPin /><b>正在探索</b></span>}
              {status === 'locked' && <span className="city-list-card__fog-lock" aria-hidden="true"><LockKeyhole /></span>}
              <strong>{item.name}</strong><small>{item.englishName}</small><i><span style={{ width: `${completed * 10}%` }} /></i>
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

function MapPage({ state, totals, onOpenCity, onCities, onLeaderboard }: { state: JourneyState; totals: ReturnType<typeof getJourneyTotals>; onOpenCity: (cityId: string) => void; onCities: () => void; onLeaderboard: () => void }) {
  const cityGoal = 20;
  const routeGoal = 300;
  const cityProgress = Math.min(100, (totals.completedCities / cityGoal) * 100);
  const routeProgress = Math.min(100, (totals.completedRoutes / routeGoal) * 100);
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
  return (
    <main className="page page--map page--world" id="main-content">
      <header className="world-header">
        <h1>跑遍全球，探索世界</h1>
        <p>继续跑，用脚步探索更多城市与风景</p>
      </header>
      <section className="world-globe-panel">
        <Suspense fallback={<div className="globe-loading" role="status"><Globe2 /><span>正在加载你的世界</span></div>}>
          <JourneyGlobe state={state} onOpenCity={onOpenCity} />
        </Suspense>
        <button className="world-leaderboard-entry" type="button" onClick={onLeaderboard} aria-label="查看全球排行榜，我的排名 142">
          <i aria-hidden="true"><Trophy /></i>
          <span><small>全球排行榜</small><strong>我的排名 142</strong></span>
          <ChevronRight aria-hidden="true" />
        </button>
      </section>
      <div className="world-summary-panel">
        <section className="world-goal-card" aria-label="环球旅程整体进度">
          <header>
            <div><Target /><strong>探索进度</strong></div>
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
        </section>
        <button className="primary-button" type="button" onClick={onCities}>全球城市列表 <Globe2 /></button>
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
  deviceConnected,
  onDevice,
  onCityCards,
  onLevel,
  onSettings,
  onFeature
}: {
  totals: ReturnType<typeof getJourneyTotals>;
  deviceConnected: boolean;
  onDevice: () => void;
  onCityCards: () => void;
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
    { icon: MonitorSmartphone, label: '我的设备', action: onDevice, status: deviceConnected ? '已连接' : '未连接' },
    { icon: Wallet, label: '我的钱包', action: () => onFeature('我的钱包') },
    { icon: MessageSquare, label: '问题反馈', action: () => onFeature('问题反馈') },
    { icon: Headphones, label: '添加企微', action: () => onFeature('添加企微') },
    { icon: BookOpen, label: '使用说明', action: () => onFeature('使用说明') },
    { icon: Settings, label: '设置', action: onSettings }
  ];
  return (
    <main className="page profile-page profile-page--legacy" id="main-content">
      <header className="legacy-profile-actions">
        <p className="movevi-wordmark"><span>MV</span><strong>MOVEVI</strong></p>
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
          <div><h1>沐小六</h1><button className="legacy-profile-level" type="button" onClick={onLevel} aria-label="查看等级"><span>LV.3</span><strong>黄金</strong><ChevronRight /></button></div>
        </div>
        <div className="legacy-profile-stats">
          {profileStats.map(item => <div key={item.label}><strong>{item.value}{item.unit && <small>{item.unit}</small>}</strong><span>{item.label}</span></div>)}
        </div>
      </section>
      <section className="legacy-collection-actions" aria-label="城市收藏">
        <button className="legacy-collection-action legacy-collection-action--cards" type="button" onClick={onCityCards}>
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
          return <button type="button" key={item.label} onClick={item.action}><span className="legacy-menu__icon"><Icon /></span><strong>{item.label}</strong>{item.status && <small>{item.status}</small>}<ChevronRight /></button>;
        })}
      </section>
    </main>
  );
}

function FirstCitySelectionPage({ selectedId, onSelect, onContinue }: { selectedId: string | null; onSelect: (cityId: string | null) => void; onContinue: () => void }) {
  const batchSize = 6;
  const batchCount = Math.ceil(JOURNEY_CITY_SEQUENCE.length / batchSize);
  const [batchIndex, setBatchIndex] = useState(0);
  const batchStart = batchIndex * batchSize;
  const starterCities = Array.from({ length: batchSize }, (_, offset) => JOURNEY_CITY_SEQUENCE[(batchStart + offset) % JOURNEY_CITY_SEQUENCE.length]);
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
        <span className="first-journey-intro__edition"><b>SATURN VI</b><small>环球运动旅程</small></span>
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
        <h1>木卫六<br />带你跑向全世界！</h1>
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

function FirstJourneyExperience({ selectedId, onSelect, onContinue }: { selectedId: string | null; onSelect: (cityId: string | null) => void; onContinue: () => void }) {
  const [isChoosingCity, setIsChoosingCity] = useState(false);

  return (
    <div className="first-journey-stage">
      <div className={`first-journey-flip${isChoosingCity ? ' is-flipped' : ''}`}>
        <div className="first-journey-face first-journey-face--front" aria-hidden={isChoosingCity}>
          <FirstJourneyIntroPage onStart={() => setIsChoosingCity(true)} />
        </div>
        <div className="first-journey-face first-journey-face--back" aria-hidden={!isChoosingCity}>
          <FirstCitySelectionPage selectedId={selectedId} onSelect={onSelect} onContinue={onContinue} />
        </div>
      </div>
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
    <nav className="bottom-nav" aria-label="主要导航">
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
      {mode === 'device' ? <><section className={`device-card ${deviceConnected ? 'is-online' : ''}`}><div className="device-card__icon"><TreadmillIcon connected={deviceConnected} /></div><div><strong>MOVEVI Runner S1</strong><span>{deviceConnected ? '已连接 · 信号良好' : '当前未连接'}</span></div><i /></section><button className="secondary-button" type="button" onClick={onToggleDevice}>{deviceConnected ? '断开设备' : '连接设备'}</button><div className="help-note"><CircleHelp /><p><strong>连接遇到问题？</strong><span>确认跑步机已开机，并让手机靠近设备。</span></p></div></> : <><section className="account-card"><span className="account-avatar">沐</span><div><strong>沐小六</strong><small>MOVEVI ID · MV-3026</small></div></section><div className="settings-list"><div><Settings /><span><strong>减少动效</strong><small>直接呈现旅程结果</small></span><button className={`switch ${manualReducedMotion ? 'is-on' : ''}`} type="button" onClick={onToggleMotion} aria-pressed={manualReducedMotion}><i /></button></div><div><Headphones /><span><strong>帮助与反馈</strong><small>设备连接、跑步与账号问题</small></span><ArrowRight /></div><button type="button" onClick={onReset}><RotateCcw /><span><strong>恢复演示状态</strong><small>回到东京 6/10</small></span><ArrowRight /></button></div></>}
    </Modal>
  );
}

export default function JourneyApp() {
  const [state, dispatch] = useReducer(journeyReducer, undefined, createDemoJourneyState);
  const nextStationFocusTimerRef = useRef<number | null>(null);
  const [isFirstUse, setIsFirstUse] = useState(true);
  const [firstCityChoiceId, setFirstCityChoiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PrimaryTab>('home');
  const [homeCityId, setHomeCityId] = useState(state.currentCityId);
  const [cityListOpen, setCityListOpen] = useState(false);
  const [routeCityId, setRouteCityId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [runningRoute, setRunningRoute] = useState<{ cityId: string; routeId: string } | null>(null);
  const [utilityMode, setUtilityMode] = useState<'device' | 'profile' | null>(null);
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [manualReducedMotion, setManualReducedMotion] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [focusNextStation, setFocusNextStation] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [legacyFeature, setLegacyFeature] = useState<LegacyFeature | null>(null);
  const [weightRoute, setWeightRoute] = useState<WeightRouteTarget | null>(null);
  const [runningWeightRoute, setRunningWeightRoute] = useState<WeightRouteTarget | null>(null);
  const [weightPlanStarted, setWeightPlanStarted] = useState(false);
  const [weightCompletedDays, setWeightCompletedDays] = useState<number[]>([]);
  const [weightRewardBoxes, setWeightRewardBoxes] = useState<number[]>([]);
  const [weightOpenedRewardDays, setWeightOpenedRewardDays] = useState<number[]>([]);
  const [weightRewardHistory, setWeightRewardHistory] = useState<WeightPlanRewardRecord[]>([]);
  const [activationClaimed, setActivationClaimed] = useState(false);
  const [firstRouteClaimed, setFirstRouteClaimed] = useState(false);
  const systemReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(systemReducedMotion || manualReducedMotion);
  const currentCity = getJourneyCity(state.currentCityId)!;
  const homeCity = getJourneyCity(homeCityId) ?? currentCity;
  const totals = getJourneyTotals(state);
  const candidateCities = getCandidateCityIds(state).map(cityId => getJourneyCity(cityId)!).filter(Boolean);
  const effectiveCandidateId = selectedCandidateId ?? candidateCities[0]?.id ?? '';

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
  useEffect(() => () => {
    if (nextStationFocusTimerRef.current) window.clearTimeout(nextStationFocusTimerRef.current);
  }, []);

  const openCity = (cityId: string) => {
    const status = getCityStatus(state, cityId);
    if (status !== 'current' && status !== 'completed') return;
    setSelectedRouteId(null); setRouteCityId(cityId);
  };
  const openCityRoutesFromList = (cityId: string) => {
    setCityListOpen(false);
    setSelectedRouteId(null);
    setRouteCityId(cityId);
  };
  const openLegacyRoute = (routeIndex: number) => {
    const cityForRoutes = routeCityId ? getJourneyCity(routeCityId) : undefined;
    if (!cityForRoutes) return;
    const route = cityForRoutes.routes[routeIndex - 1];
    if (!route) return;
    if (route.order > getRouteListOpenCount(state, cityForRoutes.id)) return;
    const status = getRouteStatus(state, cityForRoutes.id, route.id);
    if (status === 'locked') return;
    if (status === 'discoverable') {
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
  const startRun = (route: JourneyRoute) => { if (!deviceConnected) setDeviceConnected(true); setRunningRoute({ cityId: route.cityId, routeId: route.id }); setRouteCityId(null); };
  const startSelectedRoute = () => {
    if (!routeCityId || !selectedRouteId) return;
    const route = getJourneyRoute(routeCityId, selectedRouteId);
    if (!route) return;
    startRun(route);
  };
  const completeRun = (result: RunResult) => {
    if (!runningRoute) return;
    const alreadyCompleted = getCompletedRouteIds(state, runningRoute.cityId).includes(runningRoute.routeId);
    const completedAfterRun = getCompletedRouteIds(state, runningRoute.cityId).length + (alreadyCompleted ? 0 : 1);
    const willCompleteCurrentCity = runningRoute.cityId === state.currentCityId && completedAfterRun >= 10;
    const completedCityId = runningRoute.cityId;
    dispatch({ type: 'COMPLETE_ROUTE', ...runningRoute, result });
    setRunningRoute(null);
    setSelectedRouteId(null);
    setSelectedCandidateId(null);
    if (willCompleteCurrentCity) {
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
      setRouteCityId(completedCityId);
      if (!alreadyCompleted && completedAfterRun < 10) setNotice(`路线 ${String(completedAfterRun + 1).padStart(2, '0')} 已解锁`);
    }
  };
  const resetDemo = () => { if (nextStationFocusTimerRef.current) window.clearTimeout(nextStationFocusTimerRef.current); nextStationFocusTimerRef.current = null; dispatch({ type: 'RESET_DEMO' }); setActiveTab('home'); setHomeCityId('tokyo'); setFocusNextStation(false); setCityListOpen(false); setUtilityMode(null); setRouteCityId(null); setSelectedRouteId(null); setRunningRoute(null); setSelectedCandidateId(null); setNotice('演示状态已恢复'); };
  const clearNextStationFocus = useCallback(() => setFocusNextStation(false), []);
  const startFirstJourney = () => {
    if (!firstCityChoiceId || !getJourneyCity(firstCityChoiceId)) return;
    dispatch({ type: 'START_JOURNEY', cityId: firstCityChoiceId });
    setHomeCityId(firstCityChoiceId);
    setActiveTab('home');
    setIsFirstUse(false);
    setNotice(`${getJourneyCity(firstCityChoiceId)?.name ?? '第一站'}，旅程从这里开始`);
  };
  const selectPrimaryTab = (tab: PrimaryTab) => {
    setActiveTab(tab);
    dispatch({ type: 'NAVIGATE', page: tab === 'world' ? 'map' : 'home' });
  };
  const openLegacyFeature = (feature: LegacyFeature) => {
    setLegacyFeature(feature);
    setRouteCityId(null);
    setSelectedRouteId(null);
  };
  const openWeightRoute = (cityId: string, routeIndex: number, image: string, day: number) => {
    setWeightRoute({ cityId, routeIndex, image, day });
  };
  const completeWeightRoute = (target: WeightRouteTarget) => {
    setWeightCompletedDays(days => [...new Set([...days, target.day])].sort((a, b) => a - b));
    setWeightRewardBoxes(days => [...new Set([...days, target.day])].sort((a, b) => a - b));
    setRunningWeightRoute(null);
    setLegacyFeature('weightLossPlan');
  };
  const openWeightReward = (day: number) => {
    if (!weightRewardBoxes.includes(day)) return { success: false, message: '完成当天路线后即可领取红包' };
    if (weightOpenedRewardDays.includes(day)) return { success: false, message: '这一天的红包已领取' };
    const amount = getWeightPlanRewardAmount(day);
    setWeightOpenedRewardDays(days => [...new Set([...days, day])].sort((a, b) => a - b));
    setWeightRewardHistory(records => [
      { day, amount, openedAt: new Date().toLocaleString('zh-CN', { hour12: false }) },
      ...records
    ]);
    return { success: true, message: `第${day}天红包已到账`, amount };
  };

  const runningCity = runningRoute ? getJourneyCity(runningRoute.cityId) : undefined;
  const runningRouteData = runningRoute ? getJourneyRoute(runningRoute.cityId, runningRoute.routeId) : undefined;
  const routeSheetCity = routeCityId ? getJourneyCity(routeCityId) : undefined;
  const selectedRouteData = routeSheetCity && selectedRouteId ? getJourneyRoute(routeSheetCity.id, selectedRouteId) : undefined;
  const lastRunCity = state.lastRun ? getJourneyCity(state.lastRun.cityId) : undefined;
  const lastRunRoute = state.lastRun ? getJourneyRoute(state.lastRun.cityId, state.lastRun.routeId) : undefined;
  const pendingCity = state.pendingNextCityId ? getJourneyCity(state.pendingNextCityId) : undefined;

  return (
    <div className="app-stage"><a className="skip-link" href="#main-content">跳到主要内容</a><div className="phone-shell"><div className="paper-grain" aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        {isFirstUse ? <motion.div className="screen-layer" key="first-city" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}><FirstJourneyExperience selectedId={firstCityChoiceId} onSelect={setFirstCityChoiceId} onContinue={startFirstJourney} /></motion.div>
        : runningWeightRoute ? <motion.div className="screen-layer" key="running-weight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RunPlaybackView cityId={runningWeightRoute.cityId} routeIndex={runningWeightRoute.routeIndex} image={runningWeightRoute.image} onExit={() => { setRunningWeightRoute(null); setWeightRoute(runningWeightRoute); }} onComplete={() => completeWeightRoute(runningWeightRoute)} /></motion.div>
        : weightRoute ? <motion.div className="screen-layer" key="weight-route-detail" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><RouteDetailView cityId={weightRoute.cityId} routeIndex={weightRoute.routeIndex} image={weightRoute.image} onBack={() => setWeightRoute(null)} onStart={() => { setRunningWeightRoute(weightRoute); setWeightRoute(null); }} /></motion.div>
        : legacyFeature === 'level' ? <motion.div className="screen-layer" key="journey-level" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><JourneyLevelView onBack={() => setLegacyFeature(null)} /></motion.div>
        : legacyFeature === 'leaderboard' ? <motion.div className="screen-layer" key="leaderboard" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><LeaderboardView onBack={() => setLegacyFeature(null)} /></motion.div>
        : legacyFeature === 'onlineSupport' ? <motion.div className="screen-layer" key="online-support" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><OnlineSupportView onBack={() => setLegacyFeature(null)} /></motion.div>
        : legacyFeature === 'weightLossPlan' ? <motion.div className="screen-layer" key="weight-loss-plan" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><WeightLossPlanView started={weightPlanStarted} completedDays={weightCompletedDays} rewardBoxes={weightRewardBoxes} openedRewardDays={weightOpenedRewardDays} rewardHistory={weightRewardHistory} newbieTasks={{ treadmillActivated: deviceConnected, activationClaimed, completedRoutes: getJourneyTotals(state).completedRoutes, firstRouteClaimed }} onBack={() => setLegacyFeature(null)} onStartPlan={() => setWeightPlanStarted(true)} onOpenReward={openWeightReward} onClaimActivationTask={() => { setActivationClaimed(true); setNotice('首次激活红包已领取'); }} onClaimFirstRouteTask={() => { setFirstRouteClaimed(true); setNotice('首次路线红包已领取'); }} onNavigateToRouteDetail={openWeightRoute} /></motion.div>
        : runningCity && runningRouteData ? <motion.div className="screen-layer" key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RunPlaybackView cityId={runningCity.id} cityName={runningCity.name} routeIndex={runningRouteData.order} image={cityImageFor(runningCity)} routeOverride={toLegacyRouteItem(runningRouteData, state)} onExit={() => { setRunningRoute(null); setRouteCityId(runningCity.id); setSelectedRouteId(runningRouteData.id); }} onComplete={(stats) => completeRun({ distanceKm: stats.distance, durationSeconds: stats.duration, calories: stats.calories })} /></motion.div>
        : state.currentPage === 'routeComplete' && state.lastRun && lastRunCity && lastRunRoute ? <motion.div className="screen-layer" key="route-complete" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><RouteCompletePage city={lastRunCity} route={lastRunRoute} completed={getCompletedRouteIds(state, lastRunCity.id).length} result={state.lastRun} firstCompletion={state.lastRun.isFirstCompletion} onNext={() => { setActiveTab('home'); dispatch({ type: 'NAVIGATE', page: 'home' }); window.setTimeout(() => openCity(state.currentCityId), 0); }} onMap={() => selectPrimaryTab('world')} /></motion.div>
        : state.currentPage === 'cityComplete' ? <motion.div className="screen-layer" key="city-complete" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><CityCompletePage city={currentCity} candidates={candidateCities} selectedId={effectiveCandidateId} onSelect={setSelectedCandidateId} onContinue={() => effectiveCandidateId && dispatch({ type: 'SELECT_NEXT_CITY', cityId: effectiveCandidateId })} /></motion.div>
        : state.currentPage === 'travel' && pendingCity ? <motion.div className="screen-layer" key="travel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TravelPage from={currentCity} to={pendingCity} reduceMotion={reduceMotion} /></motion.div>
        : routeSheetCity && selectedRouteData ? <motion.div className="screen-layer" key="legacy-route-detail" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><RouteDetailView cityId={routeSheetCity.id} routeIndex={selectedRouteData.order} image={cityImageFor(routeSheetCity)} routeOverride={toLegacyRouteItem(selectedRouteData, state)} onBack={() => setSelectedRouteId(null)} onStart={startSelectedRoute} /></motion.div>
        : routeSheetCity ? <motion.div className="screen-layer" key="legacy-route-list" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><CityRoutesView city={toLegacyCity(routeSheetCity, state)} routeItems={routeSheetCity.routes.map(route => toLegacyRouteItem(route, state))} completedRouteIndices={routeSheetCity.routes.filter(route => getCompletedRouteIds(state, routeSheetCity.id).includes(route.id)).map(route => route.order)} openRouteCount={getRouteListOpenCount(state, routeSheetCity.id)} onBack={() => { setRouteCityId(null); setSelectedRouteId(null); }} onRouteClick={openLegacyRoute} /></motion.div>
        : activeTab === 'profile' ? <motion.div className="screen-layer" key="profile" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><ProfilePage totals={totals} deviceConnected={deviceConnected} onDevice={() => setUtilityMode('device')} onCityCards={() => selectPrimaryTab('world')} onLevel={() => openLegacyFeature('level')} onSettings={() => setUtilityMode('profile')} onFeature={label => setNotice(`${label} · 演示入口`)} /></motion.div>
        : activeTab === 'activity' ? <motion.div className="screen-layer" key="activity" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><EventsTab onSelectMedalLottery={() => setNotice('勋章盲盒抽奖 · 演示入口')} onSelectMedley={() => setNotice('周末城市记忆串烧 · 演示入口')} /></motion.div>
        : activeTab === 'world' ? <motion.div className="screen-layer" key="world" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><MapPage state={state} totals={totals} onOpenCity={openCity} onCities={() => setCityListOpen(true)} onLeaderboard={() => openLegacyFeature('leaderboard')} /></motion.div>
        : <motion.div className="screen-layer" key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><HomePage state={state} city={homeCity} deviceConnected={deviceConnected} onRoutes={openCity} onBrowseCity={setHomeCityId} onSelectNextCity={(cityId) => { setSelectedCandidateId(cityId); dispatch({ type: 'SELECT_NEXT_CITY', cityId }); }} focusNextStation={focusNextStation} onNextStationFocused={clearNextStationFocus} onDevice={() => setUtilityMode('device')} onLegacyFeature={openLegacyFeature} /></motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {cityListOpen && !runningRoute && <motion.div className="overlay-layer" key="city-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CityListSheet state={state} selectedCityId={homeCity.id} onSelect={openCityRoutesFromList} onClose={() => setCityListOpen(false)} /></motion.div>}
        {utilityMode && <motion.div className="overlay-layer" key="utility" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><UtilityPanel mode={utilityMode} deviceConnected={deviceConnected} manualReducedMotion={manualReducedMotion} onToggleDevice={() => setDeviceConnected(value => !value)} onToggleMotion={() => setManualReducedMotion(value => !value)} onReset={resetDemo} onClose={() => setUtilityMode(null)} /></motion.div>}
      </AnimatePresence>
      {!isFirstUse && !runningRoute && !runningWeightRoute && !weightRoute && !legacyFeature && !routeSheetCity && (state.currentPage === 'home' || state.currentPage === 'map') && <BottomNavigation active={activeTab} onChange={selectPrimaryTab} />}
      <div className={`toast ${notice ? 'is-visible' : ''}`} role="status" aria-live="polite">{notice}</div>
    </div></div>
  );
}
