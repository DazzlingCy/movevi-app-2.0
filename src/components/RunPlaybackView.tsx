import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Award, ChevronLeft, MapPin, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';
import { reloadRunSceneryVideo } from '../lib/runScenery';
import { coinMileageCounter, isCoinRouteComplete, type CoinExerciseEvidence } from '../journey/coinRewards';
import { getJourneyCity } from '../journey/data';
import { getMedalLandmarks } from '../journey/medalLottery';
import CityImage from './CityImage';
import CoinRewardBadge from './CoinRewardBadge';
import type { CityRouteListItem } from './CityRoutesView';
import Modal from './journey/Modal';
import styles from './RunPlaybackView.module.css';

const sceneryLoadTimeoutMs = 8000;

interface RunPlaybackViewProps {
  cityId: string;
  routeIndex: number;
  image: string;
  cityName?: string;
  routeOverride?: CityRouteListItem;
  prepareScenery?: () => HTMLVideoElement;
  onExit: () => void;
  requireFullRoute?: boolean;
  useActualStats?: boolean;
  demoCompleteSignal?: number;
  coinRewards?: {
    demo: boolean;
    tracking: boolean;
  };
  onComplete: (stats: { distance: number; duration: number; calories: number }, evidence?: CoinExerciseEvidence) => void;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
};

const parsePlannedDuration = (value: string) => {
  const [minutes = 0, seconds = 0] = value.split(':').map(Number);
  return minutes * 60 + seconds;
};

export default function RunPlaybackView({ cityId, routeIndex, image, cityName: cityNameOverride, routeOverride, prepareScenery, onExit, onComplete, requireFullRoute = false, useActualStats = false, demoCompleteSignal = 0, coinRewards }: RunPlaybackViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showRunActions, setShowRunActions] = useState(false);
  const [coinEvidence, setCoinEvidence] = useState<CoinExerciseEvidence>();
  const runActionsTitleId = useId();
  const runSummaryTitleId = useId();
  const sceneryHostRef = useRef<HTMLDivElement>(null);
  const sceneryVideoRef = useRef<HTMLVideoElement>(null);
  const [sceneryVisible, setSceneryVisible] = useState(false);
  const [sceneryMuted, setSceneryMuted] = useState(true);
  const [sceneryStatus, setSceneryStatus] = useState<'loading' | 'playing' | 'retry'>('loading');
  const reduceMotion = useReducedMotion();

  const city = CITIES.find(item => String(item.id) === String(cityId));
  const route = routeOverride ?? getRouteData(cityId, routeIndex);
  const journeyRoute = getJourneyCity(cityId)?.routes.find(item => item.order === routeIndex);
  const medalNames = journeyRoute ? getMedalLandmarks(journeyRoute) : [];
  const cityName = cityNameOverride ?? city?.name ?? '城市';
  const plannedDistance = Number(route.distance) || 0;
  const plannedDuration = parsePlannedDuration(route.duration);
  const routeFinished = !requireFullRoute || distance >= plannedDistance;
  const manuallySimulated = !!coinEvidence && coinEvidence.source !== 'playback';
  const simulatedPartial = manuallySimulated && !isCoinRouteComplete({ ...coinEvidence, plannedMeters: Math.round(plannedDistance * 1000) });
  const earnsMedals = routeFinished && !!coinEvidence && !!coinRewards?.tracking
    && isCoinRouteComplete({ ...coinEvidence, plannedMeters: Math.round(plannedDistance * 1000) });
  const liveEvidence: CoinExerciseEvidence = {
    meters: Math.round(distance * 1000), activeSeconds: time, endedAt: Date.now(), source: 'playback',
  };
  const runActive = isPlaying && !showRunActions && !showSummary;
  useEffect(() => {
    if (!demoCompleteSignal) return;
    setDistance(plannedDistance); setTime(plannedDuration); setIsPlaying(false); setShowRunActions(false); setShowSummary(true);
  }, [demoCompleteSignal, plannedDistance, plannedDuration]);

  useEffect(() => {
    if (!runActive) return;
    const timer = window.setInterval(() => {
      setTime(value => value + 1);
      setDistance(value => Math.min(plannedDistance, value + 0.003));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [runActive, plannedDistance]);

  useLayoutEffect(() => {
    const host = sceneryHostRef.current;
    if (!host || !prepareScenery) return;
    const video = prepareScenery();
    const showScenery = () => {
      setSceneryVisible(true);
      setSceneryStatus('playing');
    };
    const showBuffering = () => setSceneryStatus(status => status === 'playing' ? 'loading' : status);
    const showRetry = () => {
      setSceneryVisible(false);
      setSceneryStatus('retry');
    };
    video.addEventListener('playing', showScenery);
    video.addEventListener('waiting', showBuffering);
    video.addEventListener('error', showRetry);
    host.append(video);
    sceneryVideoRef.current = video;
    if (video.error) showRetry();
    else if (!video.paused && video.readyState >= video.HAVE_FUTURE_DATA) showScenery();
    return () => {
      video.removeEventListener('playing', showScenery);
      video.removeEventListener('waiting', showBuffering);
      video.removeEventListener('error', showRetry);
      video.pause();
      if (video.readyState !== video.HAVE_NOTHING) video.currentTime = 0;
      video.muted = true;
      video.preload = 'metadata';
      video.remove();
      sceneryVideoRef.current = null;
    };
  }, [prepareScenery]);

  const playScenery = useCallback((retry = false) => {
    const video = sceneryVideoRef.current;
    if (!video) return;
    if (video.paused || retry) setSceneryStatus('loading');
    if (video.error || (retry && video.readyState < video.HAVE_FUTURE_DATA)) {
      reloadRunSceneryVideo(video);
    }
    void video.play().catch(error => {
      if (error.name !== 'AbortError') setSceneryStatus('retry');
    });
  }, []);

  useEffect(() => {
    const video = sceneryVideoRef.current;
    if (!video || !runActive) return;
    playScenery();
    return () => video.pause();
  }, [playScenery, runActive]);

  useEffect(() => {
    if (!prepareScenery || !runActive || sceneryStatus !== 'loading') return;
    const timer = window.setTimeout(() => setSceneryStatus('retry'), sceneryLoadTimeoutMs);
    return () => window.clearTimeout(timer);
  }, [prepareScenery, runActive, sceneryStatus]);

  const result = useMemo(() => {
    const resultDistance = requireFullRoute || useActualStats || distance >= 0.05 ? distance : plannedDistance;
    const resultDuration = requireFullRoute || useActualStats || time >= 20 ? time : plannedDuration;
    return {
      distance: Number(resultDistance.toFixed(2)),
      duration: resultDuration,
      calories: Math.max(1, Math.round(resultDistance * 65))
    };
  }, [distance, plannedDistance, plannedDuration, time, requireFullRoute, useActualStats]);

  const pace = distance > 0.01
    ? `${Math.floor(time / 60 / distance)}'${String(Math.floor(((time / 60 / distance) % 1) * 60)).padStart(2, '0')}\"`
    : '--';
  const todayDateStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');

  const finishRun = () => {
    if (coinRewards?.tracking && liveEvidence.meters > 0 && liveEvidence.activeSeconds > 0) setCoinEvidence(liveEvidence);
    setIsPlaying(false);
    setShowRunActions(false);
    setShowSummary(true);
  };

  const simulateCoinWorkout = (complete: boolean) => {
    const meters = complete ? Math.round(plannedDistance * 1000) : 1000;
    const activeSeconds = complete ? Math.max(plannedDuration, 15 * 60) : 8 * 60;
    setDistance(meters / 1000);
    setTime(activeSeconds);
    setCoinEvidence({ meters, activeSeconds, endedAt: Date.now() });
  };

  const toggleRunPause = () => {
    setShowRunActions(isPlaying);
    setIsPlaying(!isPlaying);
  };

  const toggleScenerySound = () => {
    const video = sceneryVideoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setSceneryMuted(video.muted);
  };

  return (
    <div className={`${styles.player} relative h-full w-full overflow-hidden bg-[#05070A] font-sans text-white`} aria-label={`${cityName}${route.title}跑步界面`}>
      <div ref={sceneryHostRef} className={styles.sceneryVideo} aria-hidden="true" />
      {!sceneryVisible && (
        <motion.div
          className="absolute inset-0 bg-[#05070A]"
          animate={reduceMotion || !runActive ? { scale: 1 } : { scale: [1, 1.035, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          <CityImage src={image} alt={`${cityName}路线风景`} fallbackLabel={cityName} className="h-full w-full object-cover opacity-70" />
        </motion.div>
      )}
      <div className={styles.shade} aria-hidden="true" />
      <header className={`${styles.header} absolute inset-x-0 top-0 z-10`}>
        <button type="button" onClick={finishRun} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 backdrop-blur-md active:scale-95" aria-label="返回并查看结算" aria-haspopup="dialog">
          <ChevronLeft size={23} />
        </button>
        <div className="min-w-0 flex-1 px-3 text-center">
          <p className="truncate text-sm font-black">{route.title}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-cyan-100/70"><MapPin size={11} /> {cityName} · 路线 {routeIndex}{sceneryVisible ? ' · 杭州示例' : ''}</p>
        </div>
      </header>

      <main className={styles.hud} id="main-content">
        {!showSummary && !showRunActions && coinRewards?.tracking && (
          <CoinRewardBadge {...coinMileageCounter(liveEvidence.meters)} className={styles.coinFloat} variant="live" />
        )}
        {!isPlaying && !showSummary && <p className={styles.pausedLabel} role="status">运动已暂停</p>}
        <dl className={styles.metrics} aria-label="运动数据">
          <div><dt>时间</dt><dd>{formatTime(time)}</dd></div>
          <div><dt>配速</dt><dd>{pace}</dd></div>
          <div><dt>千卡</dt><dd>{Math.round(distance * 65)}</dd></div>
        </dl>
        {prepareScenery && runActive && sceneryStatus === 'loading' && (
          <p className={styles.sceneryNotice} role="status">正在加载视频…</p>
        )}
        {runActive && sceneryStatus === 'retry' && (
          <button className={styles.sceneryNotice} type="button" onClick={() => playScenery(true)}>
            <Play size={16} aria-hidden="true" /> 点按播放视频
          </button>
        )}
        {!showSummary && (
          <div className={styles.playbackControls}>
            {sceneryVisible && (
              <button
                type="button"
                aria-label={sceneryMuted ? '开启视频声音' : '关闭视频声音'}
                onClick={toggleScenerySound}
              >
                {sceneryMuted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
              </button>
            )}
            <button
              type="button"
              className={styles.quickPause}
              aria-label={isPlaying ? '暂停跑步' : '继续跑步'}
              aria-haspopup={isPlaying ? 'dialog' : undefined}
              onClick={toggleRunPause}
            >
              {isPlaying ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
            </button>
          </div>
        )}
      </main>

      {showRunActions && !showSummary && (
        <Modal labelId={runActionsTitleId} onClose={() => setShowRunActions(false)} className={styles.runActions} backdropClassName={styles.runActionsBackdrop}>
          <header className={styles.pauseHeader}>
            <span className={styles.pauseMark} aria-hidden="true"><Pause size={18} /></span>
            <div>
              <h2 id={runActionsTitleId}>运动已暂停</h2>
              <p>{cityName} · {route.title}</p>
            </div>
            <button type="button" className={styles.closePause} aria-label="关闭暂停提示" onClick={() => setShowRunActions(false)}>
              <X size={18} aria-hidden="true" />
            </button>
          </header>
          <div className={styles.decisionButtons}>
            <button type="button" className={styles.endDecision} onClick={finishRun}>结束运动</button>
            <button type="button" className={styles.primaryDecision} onClick={toggleRunPause}><Play size={15} aria-hidden="true" />继续跑步</button>
          </div>
        </Modal>
      )}

      {showSummary && (
        <Modal labelId={runSummaryTitleId} className={styles.summaryDialog} backdropClassName={styles.summaryBackdrop}>
          <header className={styles.summaryHeader}>
            <div className={styles.summaryHeading}>
              <h2 id={runSummaryTitleId}>{simulatedPartial ? '运动已结束' : routeFinished ? '路线已完成' : '路线尚未完成'}</h2>
              <p className={styles.summaryRoute}>{cityName} · {route.title}</p>
            </div>
            <span className={styles.summaryDate}>{todayDateStr}</span>
          </header>

          <div className={styles.summaryBody} tabIndex={0} role="region" aria-label="运动明细">
            <dl className={styles.summaryStats}>
              <div>
                <dt>实际里程</dt>
                <dd>{result.distance.toFixed(2)} <small>km</small></dd>
              </div>
              <div>
                <dt>路线时长</dt>
                <dd>{formatTime(result.duration)}</dd>
              </div>
              <div>
                <dt>实际消耗</dt>
                <dd>{result.calories} <small>kcal</small></dd>
              </div>
            </dl>

            {coinRewards?.demo && !requireFullRoute && (manuallySimulated
              ? <small className={styles.coinDemoNote}>本次为模拟有效运动</small>
              : <div className={styles.coinDemoActions}>
                <button type="button" onClick={() => simulateCoinWorkout(false)}>模拟运动 1 km</button>
                <button type="button" onClick={() => simulateCoinWorkout(true)}>模拟通关</button>
              </div>)}
            {earnsMedals && medalNames.length > 0 && <section className={styles.summaryMedals} aria-label="获得景点勋章">
              <h3><Award size={14} aria-hidden="true" /> 获得景点勋章</h3>
              <ul>
                {medalNames.map(name => (
                  <li key={name}>
                    <Award size={13} aria-hidden="true" />{name}
                  </li>
                ))}
              </ul>
            </section>}
          </div>

          <footer className={styles.summaryFooter}>
            <div className={styles.summaryButtons}>
              <button type="button" onClick={() => routeFinished ? onComplete(result, coinEvidence) : onExit()}>
                {routeFinished ? '完成' : '返回路线详情'}
              </button>
              {!routeFinished && !simulatedPartial && <button type="button" onClick={() => {
                setShowSummary(false);
                setIsPlaying(true);
              }}>
                继续这条路线 <ArrowRight size={15} aria-hidden="true" />
              </button>}
            </div>
          </footer>
        </Modal>
      )}
    </div>
  );
}
