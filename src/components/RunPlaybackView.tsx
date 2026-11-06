import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Award, ChevronLeft, MapPin, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';
import CityImage from './CityImage';
import type { CityRouteListItem } from './CityRoutesView';
import Modal from './journey/Modal';
import styles from './RunPlaybackView.module.css';

const sceneryVideoSource = `${import.meta.env.BASE_URL}video/routes/hangzhou-city-mobile.mp4`;
const sceneryLoadTimeoutMs = 8000;

const MEDALS = [
  { id: 'm1', name: '首航·星际启程', text: '🏯' },
  { id: 'm2', name: '江潮·古道点亮', text: '⛩️' },
  { id: 'm3', name: '中轴·紫禁之巅', text: '🏰' },
  { id: 'm4', name: '星火·光能复苏', text: '🗼' },
  { id: 'm5', name: '超越·时空引力', text: '🛸' },
  { id: 'm6', name: '不朽·地球倒影', text: '🌍' },
];

interface RunPlaybackViewProps {
  cityId: string;
  routeIndex: number;
  image: string;
  cityName?: string;
  routeOverride?: CityRouteListItem;
  onExit: () => void;
  requireFullRoute?: boolean;
  demoCompleteSignal?: number;
  onComplete: (stats: { distance: number; duration: number; calories: number }) => void;
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

export default function RunPlaybackView({ cityId, routeIndex, image, cityName: cityNameOverride, routeOverride, onExit, onComplete, requireFullRoute = false, demoCompleteSignal = 0 }: RunPlaybackViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showRunActions, setShowRunActions] = useState(false);
  const runActionsTitleId = useId();
  const runSummaryTitleId = useId();
  const sceneryVideoRef = useRef<HTMLVideoElement>(null);
  const [sceneryVisible, setSceneryVisible] = useState(false);
  const [sceneryMuted, setSceneryMuted] = useState(true);
  const [sceneryStatus, setSceneryStatus] = useState<'loading' | 'playing' | 'retry'>('loading');
  const reduceMotion = useReducedMotion();

  const city = CITIES.find(item => String(item.id) === String(cityId));
  const route = routeOverride ?? getRouteData(cityId, routeIndex);
  const cityName = cityNameOverride ?? city?.name ?? '城市';
  const plannedDistance = Number(route.distance) || 0;
  const plannedDuration = parsePlannedDuration(route.duration);
  const routeFinished = !requireFullRoute || distance >= plannedDistance;
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

  const playScenery = useCallback((retry = false) => {
    const video = sceneryVideoRef.current;
    if (!video) return;
    if (video.paused || retry) setSceneryStatus('loading');
    if (retry && (video.error || video.readyState < video.HAVE_FUTURE_DATA)) {
      const position = video.currentTime;
      video.load();
      video.currentTime = position;
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
    if (!runActive || sceneryStatus !== 'loading') return;
    const timer = window.setTimeout(() => setSceneryStatus('retry'), sceneryLoadTimeoutMs);
    return () => window.clearTimeout(timer);
  }, [runActive, sceneryStatus]);

  const result = useMemo(() => {
    const resultDistance = requireFullRoute ? distance : distance >= 0.05 ? distance : plannedDistance;
    const resultDuration = requireFullRoute ? time : time >= 20 ? time : plannedDuration;
    return {
      distance: Number(resultDistance.toFixed(2)),
      duration: resultDuration,
      calories: Math.max(1, Math.round(resultDistance * 65))
    };
  }, [distance, plannedDistance, plannedDuration, time, requireFullRoute]);

  const pace = distance > 0.01
    ? `${Math.floor(time / 60 / distance)}'${String(Math.floor(((time / 60 / distance) % 1) * 60)).padStart(2, '0')}\"`
    : '--';
  const todayDateStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');

  const finishRun = () => {
    setIsPlaying(false);
    setShowRunActions(false);
    setShowSummary(true);
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
      <video
        ref={sceneryVideoRef}
        src={sceneryVideoSource}
        className="pointer-events-none absolute inset-0 h-full w-full bg-black object-contain"
        autoPlay={runActive && sceneryMuted}
        muted={sceneryMuted}
        playsInline
        loop
        preload="metadata"
        aria-hidden="true"
        onPlaying={() => {
          setSceneryVisible(true);
          setSceneryStatus('playing');
        }}
        onWaiting={() => setSceneryStatus(status => status === 'playing' ? 'loading' : status)}
        onError={() => {
          setSceneryVisible(false);
          setSceneryStatus('retry');
        }}
      />
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
        {!isPlaying && !showSummary && <p className={styles.pausedLabel} role="status">运动已暂停</p>}
        <dl className={styles.metrics} aria-label="运动数据">
          <div><dt>时间</dt><dd>{formatTime(time)}</dd></div>
          <div><dt>配速</dt><dd>{pace}</dd></div>
          <div><dt>千卡</dt><dd>{Math.round(distance * 65)}</dd></div>
        </dl>
        {runActive && sceneryStatus === 'loading' && (
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
              <p className={styles.summaryKicker}>运动结算</p>
              <h2 id={runSummaryTitleId}>{routeFinished ? '路线已完成' : '路线尚未完成'}</h2>
              <p className={styles.summaryRoute}>{cityName} · {route.title}</p>
            </div>
            <span className={styles.summaryDate}>{todayDateStr}</span>
          </header>

          <div className={styles.summaryBody} tabIndex={0} role="region" aria-label="运动结算明细">
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

            <section className={styles.summaryMedals} aria-label="获得勋章">
              <h3><Award size={14} aria-hidden="true" /> 获得勋章</h3>
              <ul>
                {MEDALS.slice(0, 3).map(medal => (
                  <li key={medal.id} title={medal.name} aria-label={medal.name}>
                    <span aria-hidden="true">{medal.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <footer className={styles.summaryFooter}>
            <div className={styles.summaryButtons}>
              <button type="button" onClick={() => routeFinished ? onComplete(result) : onExit()}>
                {routeFinished ? '完成并返回' : '返回路线详情'}
              </button>
              <button type="button" onClick={() => {
                if (routeFinished) onComplete(result);
                else { setShowSummary(false); setIsPlaying(true); }
              }}>
                {routeFinished ? '继续下一路线' : '继续这条路线'} <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </footer>
        </Modal>
      )}
    </div>
  );
}
