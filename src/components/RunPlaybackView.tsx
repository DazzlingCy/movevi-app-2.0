import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronLeft, Clock3, Flame, MapPin, Pause, Play, Route, Square, Wifi } from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';
import CityImage from './CityImage';
import type { CityRouteListItem } from './CityRoutesView';

interface RunPlaybackViewProps {
  cityId: string;
  routeIndex: number;
  image: string;
  cityName?: string;
  routeOverride?: CityRouteListItem;
  onExit: () => void;
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

export default function RunPlaybackView({ cityId, routeIndex, image, cityName: cityNameOverride, routeOverride, onExit, onComplete }: RunPlaybackViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const reduceMotion = useReducedMotion();

  const city = CITIES.find(item => String(item.id) === String(cityId));
  const route = routeOverride ?? getRouteData(cityId, routeIndex);
  const cityName = cityNameOverride ?? city?.name ?? '城市';
  const plannedDistance = Number(route.distance) || 0;
  const plannedDuration = parsePlannedDuration(route.duration);

  useEffect(() => {
    if (!isPlaying || showSummary) return;
    const timer = window.setInterval(() => {
      setTime(value => value + 1);
      setDistance(value => Math.min(plannedDistance, value + 0.003));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying, plannedDistance, showSummary]);

  const result = useMemo(() => {
    const resultDistance = distance >= 0.05 ? distance : plannedDistance;
    const resultDuration = time >= 20 ? time : plannedDuration;
    return {
      distance: Number(resultDistance.toFixed(2)),
      duration: resultDuration,
      calories: Math.max(1, Math.round(resultDistance * 65))
    };
  }, [distance, plannedDistance, plannedDuration, time]);

  const pace = distance > 0.01
    ? `${Math.floor(time / 60 / distance)}'${String(Math.floor(((time / 60 / distance) % 1) * 60)).padStart(2, '0')}\"`
    : '--';

  const finishRun = () => {
    setIsPlaying(false);
    setShowSummary(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070A] font-sans text-white" aria-label={`${cityName}${route.title}跑步界面`}>
      <motion.div
        className="absolute inset-0"
        animate={reduceMotion || !isPlaying ? { scale: 1 } : { scale: [1, 1.035, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <CityImage src={image} alt={`${cityName}路线风景`} fallbackLabel={cityName} className="h-full w-full object-cover opacity-70" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,12,.78)_0%,rgba(2,6,12,.12)_36%,rgba(2,6,12,.93)_100%)]" />
      <div className="absolute inset-x-0 top-[39%] h-40 -translate-y-1/2 bg-cyan-300/10 blur-3xl" aria-hidden="true" />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pb-5 pt-safet">
        <button onClick={onExit} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 backdrop-blur-md active:scale-95" aria-label="返回路线详情">
          <ChevronLeft size={23} />
        </button>
        <div className="min-w-0 flex-1 px-3 text-center">
          <p className="truncate text-sm font-black">{route.title}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-cyan-100/70"><MapPin size={11} /> {cityName} · 路线 {routeIndex}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200/15 bg-emerald-300/10 text-emerald-200" aria-label="跑步机已连接">
          <Wifi size={18} />
        </div>
      </header>

      <main className="relative z-[1] flex h-full flex-col justify-between px-5 pb-[max(26px,env(safe-area-inset-bottom))] pt-28">
        <section className="flex flex-1 flex-col items-center justify-center pb-12" aria-live="polite">
          <motion.div
            className="relative flex h-64 w-64 items-center justify-center rounded-full border border-cyan-100/15 bg-black/20 backdrop-blur-[2px]"
            animate={reduceMotion || !isPlaying ? undefined : { boxShadow: ['0 0 0 rgba(34,211,238,0)', '0 0 54px rgba(34,211,238,.2)', '0 0 0 rgba(34,211,238,0)'] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <div className="absolute inset-3 rounded-full border border-dashed border-cyan-100/15" />
            <div className="text-center">
              <p className="font-mono text-[70px] font-black leading-none tracking-[-0.08em] tabular-nums">{distance.toFixed(2)}</p>
              <p className="mt-3 text-[10px] font-black tracking-[0.3em] text-cyan-100/65">公里</p>
            </div>
          </motion.div>
        </section>

        <section className="rounded-[28px] border border-white/12 bg-black/35 p-4 backdrop-blur-xl">
          <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
            <div><Clock3 size={15} className="mx-auto text-cyan-200" /><b className="mt-2 block font-mono text-xl tabular-nums">{formatTime(time)}</b><span className="text-[10px] text-slate-400">时间</span></div>
            <div><Route size={15} className="mx-auto text-cyan-200" /><b className="mt-2 block font-mono text-xl tabular-nums">{pace}</b><span className="text-[10px] text-slate-400">配速</span></div>
            <div><Flame size={15} className="mx-auto text-cyan-200" /><b className="mt-2 block font-mono text-xl tabular-nums">{Math.round(distance * 65)}</b><span className="text-[10px] text-slate-400">千卡</span></div>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_2fr] gap-3">
            <button onClick={finishRun} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] text-sm font-black text-slate-200 active:scale-[.98]">
              <Square size={15} className="fill-rose-400 text-rose-400" /> 结束
            </button>
            <button onClick={() => setIsPlaying(value => !value)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#2ecc71] text-base font-black text-[#042012] shadow-[0_12px_35px_rgba(46,204,113,.26)] active:scale-[.98]">
              {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
              {isPlaying ? '暂停跑步' : '继续跑步'}
            </button>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showSummary && (
          <motion.div className="absolute inset-0 z-50 flex items-end bg-black/72 p-3 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="run-summary-title"
              className="w-full overflow-hidden rounded-[30px] border border-cyan-100/15 bg-[#0b1119] p-5 shadow-[0_30px_100px_rgba(0,0,0,.65)]"
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 32, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.28 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-300 text-[#042012]"><Check size={25} strokeWidth={3} /></div>
                <div><p className="text-[10px] font-black tracking-[0.2em] text-cyan-200/70">路线已完成</p><h2 id="run-summary-title" className="mt-1 text-xl font-black">本次跑步已保存</h2></div>
              </div>

              <p className="mt-4 text-sm font-bold text-slate-300">{cityName} · {route.title}</p>
              <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] py-4 text-center">
                <div><b className="block font-mono text-xl">{result.distance.toFixed(2)}</b><span className="text-[10px] text-slate-400">公里</span></div>
                <div><b className="block font-mono text-xl">{formatTime(result.duration)}</b><span className="text-[10px] text-slate-400">用时</span></div>
                <div><b className="block font-mono text-xl">{result.calories}</b><span className="text-[10px] text-slate-400">千卡</span></div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-cyan-300/10 px-4 py-3 text-xs font-bold text-cyan-100">
                <span>路线进度已更新</span><span className="font-mono">+1 光迹值</span>
              </div>

              <button onClick={() => onComplete(result)} className="mt-5 min-h-14 w-full rounded-2xl bg-[#2ecc71] text-base font-black text-[#042012] active:scale-[.98]">完成并返回</button>
              <button onClick={() => { setShowSummary(false); setIsPlaying(true); }} className="mt-2 min-h-11 w-full text-sm font-bold text-slate-400">继续跑步</button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
