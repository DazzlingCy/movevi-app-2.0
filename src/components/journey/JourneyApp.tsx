import { lazy, Suspense, useEffect, useReducer, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, ClipboardList,
  Clock3, Compass, Flame, Footprints, Globe2, Headphones, HeadphonesIcon, LockKeyhole, Mail, Map, MapPin,
  Medal, MessageSquare, MonitorSmartphone, Navigation, Pause, Play, RotateCcw, Route,
  Settings, Sparkles, SquarePen, UserRound, Wallet, Wifi, WifiOff, X
} from 'lucide-react';
import { CITIES, type CityData } from '../../data/cities';
import { getJourneyCity, getJourneyRoute, JOURNEY_SEQUENCE } from '../../journey/data';
import {
  createDemoJourneyState, getCandidateCityIds, getCityPlanTotals, getCityStatus,
  getCompletedRouteIds, getJourneyTotals, getOpenRouteCount, getRouteStatus, journeyReducer
} from '../../journey/state';
import type { JourneyCity, JourneyRoute, JourneyState, RunResult } from '../../journey/types';
import { getWeightPlanRewardAmount, type WeightPlanRewardRecord } from '../../lib/weightPlan';
import CityRoutesView, { type CityRouteListItem } from '../CityRoutesView';
import EventsTab from '../EventsTab';
import OnlineSupportView from '../OnlineSupportView';
import RouteDetailView from '../RouteDetailView';
import RunPlaybackView from '../RunPlaybackView';
import WeightLossPlanView from '../WeightLossPlanView';
import Modal from './Modal';

const JourneyGlobe = lazy(() => import('./JourneyGlobe'));

const JOURNEY_CITY_SEQUENCE: JourneyCity[] = JOURNEY_SEQUENCE
  .map(cityId => getJourneyCity(cityId))
  .filter((city): city is JourneyCity => Boolean(city));

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

const cityStyle = (city: JourneyCity) => ({ '--city-accent': city.accent } as CSSProperties);

const cityImageFor = (city: JourneyCity) =>
  CITIES.find(item => item.name === city.name || item.englishName === city.englishName)?.image
  ?? 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200';

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

const toLegacyRouteItem = (route: JourneyRoute, state: JourneyState): CityRouteListItem => {
  const status = getRouteStatus(state, route.cityId, route.id);
  return {
    title: route.name,
    distance: route.distanceKm.toFixed(1),
    duration: `${String(route.durationMinutes).padStart(2, '0')}:00`,
    calories: String(route.calories),
    rating: '4.8',
    spots: route.landmarks.join(' — '),
    intro: route.description,
    isCompleted: status === 'completed',
    isUnlocked: status !== 'locked'
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

function ProgressSegments({ completed }: { completed: number }) {
  return (
    <div className="progress-segments" aria-label={`已完成 ${completed} / 10 条路线`}>
      {Array.from({ length: 10 }, (_, index) => <span key={index} className={index < completed ? 'is-complete' : ''} />)}
    </div>
  );
}

interface HomePageProps {
  state: JourneyState;
  city: JourneyCity;
  deviceConnected: boolean;
  onRoutes: (cityId: string) => void;
  onBrowseCity: (cityId: string) => void;
  onDevice: () => void;
  onLegacyFeature: (feature: LegacyFeature) => void;
}

type LegacyFeature = 'onlineSupport' | 'weightLossPlan';

type WeightRouteTarget = {
  cityId: string;
  routeIndex: number;
  image: string;
  day: number;
};

function HomePage({ state, city, deviceConnected, onRoutes, onBrowseCity, onDevice, onLegacyFeature }: HomePageProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);
  const cityIndex = Math.max(0, JOURNEY_CITY_SEQUENCE.findIndex(item => item.id === city.id));
  const getProgressCopy = (item: JourneyCity) => {
    const itemCompleted = getCompletedRouteIds(state, item.id).length;
    const itemStatus = getCityStatus(state, item.id);
    return itemStatus === 'completed'
    ? '这座城市的 10 段旅程已全部完成'
    : itemStatus === 'current'
      ? `还有 ${10 - itemCompleted} 段旅程等待发现`
      : itemStatus === 'candidate'
        ? `完成${getJourneyCity(state.currentCityId)?.name ?? '当前城市'}后可选择为下一站`
        : '完成前序旅程后逐步开放';
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    const target = carousel?.querySelector<HTMLElement>(`[data-city-id="${city.id}"]`);
    if (!carousel || !target) return;
    carousel.scrollTo({ left: target.offsetLeft - carousel.offsetLeft, behavior: 'auto' });
  }, [city.id]);

  const selectNearestCity = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = [...carousel.querySelectorAll<HTMLElement>('[data-city-id]')];
    const firstCard = cards[0];
    if (!firstCard) return;
    const next = cards.reduce((nearest, card) => (
      Math.abs(card.offsetLeft - carousel.offsetLeft - carousel.scrollLeft) < Math.abs(nearest.offsetLeft - carousel.offsetLeft - carousel.scrollLeft) ? card : nearest
    ), firstCard);
    if (next.dataset.cityId && next.dataset.cityId !== city.id) onBrowseCity(next.dataset.cityId);
  };

  const handleCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextCity = JOURNEY_CITY_SEQUENCE[Math.min(JOURNEY_CITY_SEQUENCE.length - 1, Math.max(0, cityIndex + direction))];
    if (nextCity) onBrowseCity(nextCity.id);
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
    const nextCity = JOURNEY_CITY_SEQUENCE[Math.min(JOURNEY_CITY_SEQUENCE.length - 1, Math.max(0, cityIndex + (deltaX < 0 ? 1 : -1)))];
    if (nextCity && nextCity.id !== city.id) {
      swipedRef.current = true;
      onBrowseCity(nextCity.id);
      window.setTimeout(() => { swipedRef.current = false; }, 80);
    }
  };
  const handleRoutesClick = (cityId: string) => {
    if (swipedRef.current) return;
    onRoutes(cityId);
  };

  return (
    <main className="page page--home" id="main-content">
      <header className="topbar">
        <button className="utility-chip" type="button" onClick={onDevice} aria-label="查看设备连接状态">
          <TreadmillIcon connected={deviceConnected} />
          <span>{deviceConnected ? '设备在线' : '未连接'}</span>
        </button>
      </header>
      <section className="home-heading">
        <h1>今天去哪里？</h1>
      </section>
      <section className="home-city-swipe-zone" aria-label="城市与旅程进度，可左右滑动切换城市" onPointerDown={handleSwipeStart} onPointerUp={handleSwipeEnd} onPointerCancel={() => { swipeStartRef.current = null; }}>
        <div className="destination-carousel" ref={carouselRef} role="region" tabIndex={0} aria-label="全球城市，可左右滑动切换" onScroll={selectNearestCity} onKeyDown={handleCarouselKeyDown}>
          {JOURNEY_CITY_SEQUENCE.map((item, index) => {
            const itemStatus = getCityStatus(state, item.id);
            const itemCompleted = getCompletedRouteIds(state, item.id).length;
            const itemCanOpenRoutes = itemStatus === 'current' || itemStatus === 'completed';
            const itemLabel = itemStatus === 'completed' ? '已完成城市' : itemStatus === 'current' ? '当前目的地' : itemStatus === 'candidate' ? '下一站候选' : '全球目的地';
            return (
              <section className="destination-journey-card" data-city-id={item.id} key={item.id} style={cityStyle(item)} aria-label={`${item.name}，${itemLabel}`}>
                <div className="destination-card">
                  <img className="destination-card__photo" src={cityImageFor(item)} alt="" aria-hidden="true" />
                  <div className="destination-card__overlay" />
                  <div className="destination-card__content">
                    <div><span className="destination-card__kicker"><MapPin /> {itemLabel}</span><h2>{item.name}</h2><p>{item.englishName}</p></div>
                  </div>
                </div>
                <div className="destination-carousel__meta" aria-hidden={item.id !== city.id}><span>{String(index + 1).padStart(2, '0')} / {JOURNEY_CITY_SEQUENCE.length}</span><span>左右滑动切换城市</span></div>
                <section className="journey-progress" aria-label={`${item.name}旅程进度`}>
                  <div className="journey-progress__topline">
                    <div><span>城市进度</span><strong>{itemCompleted}<small>/10</small></strong></div>
                    <p>{getProgressCopy(item)}</p>
                  </div>
                  <ProgressSegments completed={itemCompleted} />
                  <button className="primary-button" type="button" onClick={() => handleRoutesClick(item.id)} disabled={!itemCanOpenRoutes}>
                    {itemStatus === 'completed' ? `查看${item.name}旅程` : itemStatus === 'current' ? `继续${item.name}旅程` : itemStatus === 'candidate' ? `${item.name} · 下一站候选` : `${item.name} · 尚未开放`} {itemCanOpenRoutes ? <ArrowRight /> : <LockKeyhole />}
                  </button>
                </section>
              </section>
            );
          })}
        </div>
      </section>
      <section className="home-quick-actions" aria-label="快捷入口">
        <button type="button" onClick={() => onLegacyFeature('onlineSupport')}>
          <span><HeadphonesIcon /></span>
          <strong>在线客服</strong>
          <small>设备与路线问题</small>
        </button>
        <button type="button" onClick={() => onLegacyFeature('weightLossPlan')}>
          <span><Flame /></span>
          <strong>打卡红包</strong>
          <small>30天运动计划</small>
        </button>
      </section>
    </main>
  );
}

function CityListSheet({ state, selectedCityId, onSelect, onClose }: { state: JourneyState; selectedCityId: string; onSelect: (cityId: string) => void; onClose: () => void }) {
  const statusText = { completed: '已完成', current: '当前', candidate: '候选', locked: '未开放' } as const;
  return (
    <Modal labelId="city-list-title" onClose={onClose} className="city-list-sheet">
      <header className="sheet-header">
        <div><span>20 destinations</span><h2 id="city-list-title">全球城市列表</h2></div>
        <button className="icon-button icon-button--paper" type="button" onClick={onClose} aria-label="关闭全球城市列表"><X /></button>
      </header>
      <p className="city-list-sheet__intro">选择城市回到首页查看；当前与已完成城市可继续进入路线。</p>
      <div className="city-list-grid">
        {JOURNEY_CITY_SEQUENCE.map((item, index) => {
          const status = getCityStatus(state, item.id);
          const completed = getCompletedRouteIds(state, item.id).length;
          return (
            <button className={`city-list-card city-list-card--${status}${selectedCityId === item.id ? ' is-selected' : ''}`} type="button" key={item.id} onClick={() => { onSelect(item.id); onClose(); }} aria-pressed={selectedCityId === item.id} style={cityStyle(item)}>
              <span className="city-list-card__number">{String(index + 1).padStart(2, '0')}</span>
              <span className="city-list-card__status">{status === 'completed' ? <Check /> : status === 'current' ? <MapPin /> : status === 'locked' ? <LockKeyhole /> : <Sparkles />}{statusText[status]}</span>
              <strong>{item.name}</strong><small>{item.englishName}</small><i><span style={{ width: `${completed * 10}%` }} /></i>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function MapPage({ state, totals, onOpenCity, onCities }: { state: JourneyState; totals: ReturnType<typeof getJourneyTotals>; onOpenCity: (cityId: string) => void; onCities: () => void }) {
  const current = getJourneyCity(state.currentCityId)!;
  return (
    <main className="page page--map page--world" id="main-content">
      <header className="world-header">
        <h1>我的环球旅程</h1>
        <p>跑过的地方，都会在地球上留下光。</p>
      </header>
      <section className="world-globe-panel">
        <Suspense fallback={<div className="globe-loading" role="status"><Globe2 /><span>正在加载你的世界</span></div>}>
          <JourneyGlobe state={state} onOpenCity={onOpenCity} />
        </Suspense>
        <div className="world-globe-panel__status"><i /><span>当前</span><strong>{current.name}</strong></div>
      </section>
      <section className="journey-totals journey-totals--world" aria-label="我的旅程数字">
        <div><strong>{totals.completedCities}</strong><span>座城市</span></div>
        <div><strong>{totals.completedRoutes}</strong><span>条路线</span></div>
        <div><strong>{totals.discoveredSpots}</strong><span>处景点</span></div>
      </section>
      <button className="primary-button" type="button" onClick={onCities}>全球城市列表 <Globe2 /></button>
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
  onCollection,
  onSettings,
  onFeature
}: {
  totals: ReturnType<typeof getJourneyTotals>;
  deviceConnected: boolean;
  onDevice: () => void;
  onCollection: () => void;
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
          <div><h1>沐小六</h1><p><span>LV.3</span><strong>城市漫游者</strong></p></div>
        </div>
        <div className="legacy-profile-stats">
          {profileStats.map(item => <div key={item.label}><strong>{item.value}{item.unit && <small>{item.unit}</small>}</strong><span>{item.label}</span></div>)}
        </div>
      </section>
      <button className="legacy-collection-card" type="button" onClick={onCollection}>
        <div><span>City collection</span><strong>城市收藏</strong><small>景点勋章 · 城市卡片 · 光迹徽章</small></div>
        <div aria-hidden="true"><span><Medal /></span><span><Map /></span><span><Sparkles /></span></div>
      </button>
      <section className="legacy-menu" aria-label="个人功能">
        {menuItems.map(item => {
          const Icon = item.icon;
          return <button type="button" key={item.label} onClick={item.action}><span className="legacy-menu__icon"><Icon /></span><strong>{item.label}</strong>{item.status && <small>{item.status}</small>}<ChevronRight /></button>;
        })}
      </section>
    </main>
  );
}

type PrimaryTab = 'home' | 'world' | 'activity' | 'profile';

function BottomNavigation({ active, onChange }: { active: PrimaryTab; onChange: (tab: PrimaryTab) => void }) {
  const items = [
    { id: 'home' as const, label: '今日', icon: Compass },
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
  const completeRun = (result: RunResult) => { if (!runningRoute) return; dispatch({ type: 'COMPLETE_ROUTE', ...runningRoute, result }); setRunningRoute(null); setSelectedRouteId(null); setSelectedCandidateId(null); };
  const resetDemo = () => { dispatch({ type: 'RESET_DEMO' }); setActiveTab('home'); setHomeCityId('tokyo'); setCityListOpen(false); setUtilityMode(null); setRouteCityId(null); setSelectedRouteId(null); setRunningRoute(null); setSelectedCandidateId(null); setNotice('演示状态已恢复'); };
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
        {runningWeightRoute ? <motion.div className="screen-layer" key="running-weight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RunPlaybackView cityId={runningWeightRoute.cityId} routeIndex={runningWeightRoute.routeIndex} image={runningWeightRoute.image} onExit={() => { setRunningWeightRoute(null); setWeightRoute(runningWeightRoute); }} onComplete={() => completeWeightRoute(runningWeightRoute)} /></motion.div>
        : weightRoute ? <motion.div className="screen-layer" key="weight-route-detail" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><RouteDetailView cityId={weightRoute.cityId} routeIndex={weightRoute.routeIndex} image={weightRoute.image} onBack={() => setWeightRoute(null)} onStart={() => { setRunningWeightRoute(weightRoute); setWeightRoute(null); }} /></motion.div>
        : legacyFeature === 'onlineSupport' ? <motion.div className="screen-layer" key="online-support" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><OnlineSupportView onBack={() => setLegacyFeature(null)} /></motion.div>
        : legacyFeature === 'weightLossPlan' ? <motion.div className="screen-layer" key="weight-loss-plan" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><WeightLossPlanView started={weightPlanStarted} completedDays={weightCompletedDays} rewardBoxes={weightRewardBoxes} openedRewardDays={weightOpenedRewardDays} rewardHistory={weightRewardHistory} newbieTasks={{ treadmillActivated: deviceConnected, activationClaimed, completedRoutes: getJourneyTotals(state).completedRoutes, firstRouteClaimed }} onBack={() => setLegacyFeature(null)} onStartPlan={() => setWeightPlanStarted(true)} onOpenReward={openWeightReward} onClaimActivationTask={() => { setActivationClaimed(true); setNotice('首次激活红包已领取'); }} onClaimFirstRouteTask={() => { setFirstRouteClaimed(true); setNotice('首次路线红包已领取'); }} onNavigateToRouteDetail={openWeightRoute} /></motion.div>
        : runningCity && runningRouteData ? <motion.div className="screen-layer" key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RunPlaybackView cityId={runningCity.id} cityName={runningCity.name} routeIndex={runningRouteData.order} image={cityImageFor(runningCity)} routeOverride={toLegacyRouteItem(runningRouteData, state)} onExit={() => { setRunningRoute(null); setRouteCityId(runningCity.id); setSelectedRouteId(runningRouteData.id); }} onComplete={(stats) => completeRun({ distanceKm: stats.distance, durationSeconds: stats.duration, calories: stats.calories })} /></motion.div>
        : state.currentPage === 'routeComplete' && state.lastRun && lastRunCity && lastRunRoute ? <motion.div className="screen-layer" key="route-complete" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><RouteCompletePage city={lastRunCity} route={lastRunRoute} completed={getCompletedRouteIds(state, lastRunCity.id).length} result={state.lastRun} firstCompletion={state.lastRun.isFirstCompletion} onNext={() => { setActiveTab('home'); dispatch({ type: 'NAVIGATE', page: 'home' }); window.setTimeout(() => openCity(state.currentCityId), 0); }} onMap={() => selectPrimaryTab('world')} /></motion.div>
        : state.currentPage === 'cityComplete' ? <motion.div className="screen-layer" key="city-complete" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><CityCompletePage city={currentCity} candidates={candidateCities} selectedId={effectiveCandidateId} onSelect={setSelectedCandidateId} onContinue={() => effectiveCandidateId && dispatch({ type: 'SELECT_NEXT_CITY', cityId: effectiveCandidateId })} /></motion.div>
        : state.currentPage === 'travel' && pendingCity ? <motion.div className="screen-layer" key="travel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TravelPage from={currentCity} to={pendingCity} reduceMotion={reduceMotion} /></motion.div>
        : routeSheetCity && selectedRouteData ? <motion.div className="screen-layer" key="legacy-route-detail" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><RouteDetailView cityId={routeSheetCity.id} routeIndex={selectedRouteData.order} image={cityImageFor(routeSheetCity)} routeOverride={toLegacyRouteItem(selectedRouteData, state)} onBack={() => setSelectedRouteId(null)} onStart={startSelectedRoute} /></motion.div>
        : routeSheetCity ? <motion.div className="screen-layer" key="legacy-route-list" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><CityRoutesView city={toLegacyCity(routeSheetCity, state)} routeItems={routeSheetCity.routes.map(route => toLegacyRouteItem(route, state))} completedRouteIndices={routeSheetCity.routes.filter(route => getCompletedRouteIds(state, routeSheetCity.id).includes(route.id)).map(route => route.order)} openRouteCount={getOpenRouteCount(getCompletedRouteIds(state, routeSheetCity.id).length)} onBack={() => { setRouteCityId(null); setSelectedRouteId(null); }} onRouteClick={openLegacyRoute} /></motion.div>
        : activeTab === 'profile' ? <motion.div className="screen-layer" key="profile" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><ProfilePage totals={totals} deviceConnected={deviceConnected} onDevice={() => setUtilityMode('device')} onCollection={() => selectPrimaryTab('world')} onSettings={() => setUtilityMode('profile')} onFeature={label => setNotice(`${label} · 演示入口`)} /></motion.div>
        : activeTab === 'activity' ? <motion.div className="screen-layer" key="activity" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><EventsTab onSelectMedalLottery={() => setNotice('勋章盲盒抽奖 · 演示入口')} onSelectMedley={() => setNotice('周末城市记忆串烧 · 演示入口')} /></motion.div>
        : activeTab === 'world' ? <motion.div className="screen-layer" key="world" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><MapPage state={state} totals={totals} onOpenCity={openCity} onCities={() => setCityListOpen(true)} /></motion.div>
        : <motion.div className="screen-layer" key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><HomePage state={state} city={homeCity} deviceConnected={deviceConnected} onRoutes={openCity} onBrowseCity={setHomeCityId} onDevice={() => setUtilityMode('device')} onLegacyFeature={openLegacyFeature} /></motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {cityListOpen && !runningRoute && <motion.div className="overlay-layer" key="city-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CityListSheet state={state} selectedCityId={homeCity.id} onSelect={openCityRoutesFromList} onClose={() => setCityListOpen(false)} /></motion.div>}
        {utilityMode && <motion.div className="overlay-layer" key="utility" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><UtilityPanel mode={utilityMode} deviceConnected={deviceConnected} manualReducedMotion={manualReducedMotion} onToggleDevice={() => setDeviceConnected(value => !value)} onToggleMotion={() => setManualReducedMotion(value => !value)} onReset={resetDemo} onClose={() => setUtilityMode(null)} /></motion.div>}
      </AnimatePresence>
      {!runningRoute && !runningWeightRoute && !weightRoute && !legacyFeature && !routeSheetCity && (state.currentPage === 'home' || state.currentPage === 'map') && <BottomNavigation active={activeTab} onChange={selectPrimaryTab} />}
      <div className={`toast ${notice ? 'is-visible' : ''}`} role="status" aria-live="polite">{notice}</div>
    </div></div>
  );
}
