import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CalendarDays,
  ChevronLeft,
  Clock3,
  Download,
  Flame,
  Footprints,
  Gauge,
  LoaderCircle,
  MapPin,
  Medal,
  Route,
  Share2,
  Sparkles,
  X
} from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';
import { createRouteMemoryPoster, posterDataUrlToFile } from '../lib/routeMemoryPoster';
import CityImage from './CityImage';

const SHARE_USER_NAME = '沐小六';
const SHARE_USER_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=90&w=160&h=160';

interface RouteMemoryViewProps {
  cityId: string;
  routeIndex: number;
  image?: string;
  onBack: () => void;
}

const parseDuration = (duration: string) => {
  const [minutes = 0, seconds = 0] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.max(0, Math.floor(seconds % 60));
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

const formatPace = (durationSeconds: number, distance: number) => {
  if (!distance) return '--';
  const paceSeconds = Math.round(durationSeconds / distance);
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = paceSeconds % 60;
  return `${minutes}'${String(seconds).padStart(2, '0')}\"`;
};

const getLandmarks = (spots: string, cityName: string) => {
  const names = spots
    .split(/\s*[—–·]\s*/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  while (names.length < 3) names.push(`${cityName}记忆点${names.length + 1}`);
  return names;
};

export default function RouteMemoryView({ cityId, routeIndex, image, onBack }: RouteMemoryViewProps) {
  const reduceMotion = useReducedMotion();
  const [showSharePoster, setShowSharePoster] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isPosterGenerating, setIsPosterGenerating] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [posterError, setPosterError] = useState<string | null>(null);
  const city = CITIES.find(item => item.id === cityId);
  const routeData = getRouteData(cityId, routeIndex);
  const completion = city?.completedRouteStats?.[routeIndex];
  const completedAt = completion?.completedAt || city?.completedRouteTimestamps?.[routeIndex] || Date.now();
  const distance = completion?.distance ?? (Number(routeData.distance) || 0);
  const durationSeconds = completion?.durationSeconds ?? parseDuration(routeData.duration);
  const calories = completion?.calories ?? (Number(routeData.calories) || Math.round(distance * 65));
  const lightValueEarned = completion?.lightValueEarned ?? 1;
  const landmarks = getLandmarks(routeData.spots, city?.name || '城市');
  const completedDate = new Date(completedAt);
  const dateLabel = completedDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
  const timeLabel = completedDate.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const posterFileName = `movevi-${city?.name || '城市'}-${routeData.title}.png`.replace(/[\\/:*?"<>|]/g, '-');

  const generatePoster = async () => {
    setIsPosterGenerating(true);
    setPosterError(null);
    setShareFeedback(null);
    try {
      const generatedPoster = await createRouteMemoryPoster({
        cityName: city?.name || '城市',
        routeTitle: routeData.title,
        routeIndex,
        routeIntro: routeData.intro,
        image: image || city?.image,
        dateLabel,
        timeLabel,
        distanceLabel: `${distance.toFixed(2)} km`,
        durationLabel: formatDuration(durationSeconds),
        paceLabel: `${formatPace(durationSeconds, distance)} /km`,
        caloriesLabel: `${Math.round(calories)} kcal`,
        lightValueEarned,
        landmarks,
        userName: SHARE_USER_NAME,
        userAvatar: SHARE_USER_AVATAR
      });
      setPosterUrl(generatedPoster);
    } catch (error) {
      console.error('生成路线回忆海报失败', error);
      setPosterError('海报生成失败，请稍后重试');
    } finally {
      setIsPosterGenerating(false);
    }
  };

  const handleOpenShare = () => {
    setShowSharePoster(true);
    setShareFeedback(null);
    if (!posterUrl && !isPosterGenerating) void generatePoster();
  };

  const handleSavePoster = () => {
    if (!posterUrl) return;
    const link = document.createElement('a');
    link.href = posterUrl;
    link.download = posterFileName;
    link.click();
    setShareFeedback('路线回忆图片已保存');
  };

  const handleSharePoster = async () => {
    if (!posterUrl) return;
    try {
      const file = await posterDataUrlToFile(posterUrl, posterFileName);
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${city?.name || '城市'} · ${routeData.title}`,
          text: `我在 MOVEVI 完成了${routeData.title}，收藏了一段城市路线回忆。`,
          files: [file]
        });
        setShareFeedback('分享完成');
        return;
      }
      handleSavePoster();
      setShareFeedback('当前设备不支持直接分享，图片已保存');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('分享路线回忆失败', error);
      setShareFeedback('分享未完成，可先保存图片');
    }
  };

  const stats = [
    { label: '完成里程', value: distance.toFixed(2), unit: 'km', icon: Footprints, tone: 'text-cyan-100' },
    { label: '运动用时', value: formatDuration(durationSeconds), unit: '', icon: Clock3, tone: 'text-indigo-100' },
    { label: '平均配速', value: formatPace(durationSeconds, distance), unit: '/km', icon: Gauge, tone: 'text-emerald-100' },
    { label: '消耗热量', value: String(Math.round(calories)), unit: 'kcal', icon: Flame, tone: 'text-amber-100' }
  ];

  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#030609] pb-10 text-slate-100 hide-scrollbar">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.2),transparent_36%),radial-gradient(circle_at_92%_12%,rgba(251,191,36,0.12),transparent_35%)]" />

      <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-white/10 bg-[#030609]/86 px-5 pt-safeb backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label="返回城市收藏"
        >
          <ChevronLeft size={21} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center text-center">
          <h1 className="text-lg font-black tracking-wide text-white">路线回忆</h1>
        </div>
        <button
          type="button"
          onClick={handleOpenShare}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-100/20 bg-cyan-300/10 text-cyan-100 transition-colors hover:bg-cyan-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label="生成并分享路线回忆图片"
        >
          <Share2 size={19} />
        </button>
      </header>

      <main className="relative z-10 px-5 pt-5">
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
          className="relative h-[260px] overflow-hidden rounded-[30px] border border-white/12 bg-[#0a1118] shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
        >
          <CityImage
            src={image || city?.image}
            alt={`${city?.name || '城市'}路线回忆`}
            fallbackLabel={city?.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,9,0.08)_0%,rgba(3,6,9,0.35)_42%,rgba(3,6,9,0.96)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-cyan-100/25 bg-cyan-950/70 px-3 py-1.5 text-[9px] font-black text-cyan-100 backdrop-blur-md">
                {city?.name || '城市'} · 路线 {String(routeIndex).padStart(2, '0')}
              </span>
              <span className="flex items-center gap-1 rounded-full border border-amber-100/20 bg-amber-300/10 px-3 py-1.5 text-[9px] font-black text-amber-100 backdrop-blur-md">
                <Sparkles size={11} /> +{lightValueEarned} 光迹值
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-white">{routeData.title}</h2>
            <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-slate-300">
              <CalendarDays size={13} className="text-cyan-100" />
              <span>{dateLabel}</span>
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              <span>{timeLabel} 完成</span>
            </div>
          </div>
        </motion.section>

        <section className="mt-4" aria-label="路线运动数据">
          <div className="grid grid-cols-2 gap-2.5">
            {stats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-[22px] border border-white/[0.08] bg-[#091019]/90 p-4">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                    <Icon size={14} className={stat.tone} />
                    {stat.label}
                  </div>
                  <p className={`mt-3 font-mono text-xl font-black tabular-nums ${stat.tone}`}>
                    {stat.value}
                    {stat.unit && <span className="ml-1 text-[9px] font-bold text-slate-600">{stat.unit}</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-white/[0.08] bg-[#091019]/90 p-4" aria-labelledby="memory-route-title">
          <div className="flex items-center gap-2">
            <Route size={16} className="text-cyan-100" />
            <h2 id="memory-route-title" className="text-sm font-black text-white">沿途记忆</h2>
          </div>
          <p className="mt-3 text-xs font-medium leading-5 text-slate-400">{routeData.intro}</p>
          <div className="mt-4 grid grid-cols-3 gap-2" aria-label="本次路线获得三枚景点勋章">
            {landmarks.map((landmark, index) => (
              <div key={`${landmark}-${index}`} className="min-w-0 rounded-2xl border border-amber-100/12 bg-amber-300/[0.035] px-2 py-3 text-center">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-amber-200/35 bg-amber-300/10 text-amber-100">
                  {index === 0 ? <Medal size={17} /> : <MapPin size={17} />}
                </div>
                <p className="mt-2 truncate text-[9px] font-black text-amber-100/80" title={landmark}>{landmark}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showSharePoster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/85 p-2 backdrop-blur-lg sm:items-center"
            onMouseDown={event => {
              if (event.target === event.currentTarget) setShowSharePoster(false);
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-poster-title"
              initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.99 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
              className="flex h-[calc(100%-12px)] w-full max-w-[430px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#070b10] shadow-[0_30px_100px_rgba(0,0,0,0.72)] sm:h-[760px] sm:max-h-[calc(100%-32px)]"
            >
              <header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div>
                  <h2 id="share-poster-title" className="text-base font-black text-white">分享路线回忆</h2>
                  <p className="mt-1 text-[10px] font-bold text-slate-500">生成图片，收藏这次城市足迹</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSharePoster(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  aria-label="关闭分享海报"
                >
                  <X size={19} />
                </button>
              </header>

              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.12),transparent_42%)] px-5 py-4">
                {isPosterGenerating ? (
                  <div className="text-center">
                    <LoaderCircle size={34} className="mx-auto animate-spin text-cyan-200" />
                    <p className="mt-3 text-xs font-black text-slate-300">正在生成路线回忆图片</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-600">城市照片与运动数据正在排版</p>
                  </div>
                ) : posterError ? (
                  <div className="text-center">
                    <p className="text-xs font-bold text-rose-200">{posterError}</p>
                    <button
                      type="button"
                      onClick={() => void generatePoster()}
                      className="mt-4 rounded-full border border-cyan-100/20 bg-cyan-300/10 px-5 py-2.5 text-xs font-black text-cyan-100"
                    >
                      重新生成
                    </button>
                  </div>
                ) : posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={`${routeData.title}路线回忆分享图`}
                    className="max-h-full max-w-full rounded-[22px] border border-white/10 object-contain shadow-[0_24px_65px_rgba(0,0,0,0.5)]"
                  />
                ) : null}
              </div>

              <footer className="shrink-0 border-t border-white/[0.07] bg-[#090e14] p-4">
                {shareFeedback && (
                  <p className="mb-3 rounded-xl border border-cyan-100/10 bg-cyan-300/[0.06] px-3 py-2 text-center text-[10px] font-bold text-cyan-100">
                    {shareFeedback}
                  </p>
                )}
                <div className="grid grid-cols-[1fr_1.35fr] gap-2.5">
                  <button
                    type="button"
                    onClick={handleSavePoster}
                    disabled={!posterUrl || isPosterGenerating}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] text-xs font-black text-slate-200 transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  >
                    <Download size={16} /> 保存图片
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSharePoster()}
                    disabled={!posterUrl || isPosterGenerating}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 text-xs font-black text-slate-950 shadow-[0_10px_28px_rgba(34,211,238,0.18)] transition-colors hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Share2 size={16} /> 分享图片
                  </button>
                </div>
              </footer>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
