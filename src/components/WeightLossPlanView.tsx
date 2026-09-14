import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, CheckCircle2, ChevronLeft, Flame, Gift, Lock, MapPin, Play, Route, Shuffle, Sparkles, Timer, Trophy } from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';
import { getWeightPlanRewardAmount, type WeightPlanRewardRecord } from '../lib/weightPlan';
import CityImage from './CityImage';

interface WeightLossPlanViewProps {
  started: boolean;
  completedDays: number[];
  rewardBoxes: number[];
  openedRewardDays: number[];
  rewardHistory: WeightPlanRewardRecord[];
  newbieTasks?: {
    treadmillActivated: boolean;
    activationClaimed: boolean;
    completedRoutes: number;
    firstRouteClaimed: boolean;
  };
  onBack: () => void;
  onStartPlan: () => void;
  onOpenReward: (day: number) => { success: boolean; message: string; amount?: string };
  onClaimActivationTask?: () => void;
  onClaimFirstRouteTask?: () => void;
  onNavigateToRouteDetail: (cityId: string, routeIndex: number, image: string, day: number) => void;
}

const MILESTONE_DAYS = [1, 7, 15, 21, 30];
export const WEIGHT_PLAN_REWARD_DAYS = Array.from({ length: 30 }, (_, index) => index + 1);
const PLAN_START_DATE = new Date('2026-07-21T00:00:00+08:00');
const PLAN_WINDOW_DAYS = 30;
const COMPLETION_TARGET_DAYS = 30;

const getWeightPlanDateLabel = (day: number) => {
  const date = new Date(PLAN_START_DATE);
  date.setDate(PLAN_START_DATE.getDate() + day - 1);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const dayOfMonth = `${date.getDate()}`.padStart(2, '0');
  return `${month}/${dayOfMonth}`;
};

const generatePlanRoutes = () => {
  const cities = CITIES.filter(city => city.status !== 'upcoming');
  return Array.from({ length: PLAN_WINDOW_DAYS }, (_, index) => {
    const city = cities[index % cities.length];
    const routeIndex = Math.floor(index / cities.length) % Math.max(city.routes, 3) + 1;
    const routeData = getRouteData(city.id, routeIndex);
    return {
      day: index + 1,
      cityId: city.id,
      cityName: city.name,
      routeIndex,
      image: city.image,
      routeData
    };
  });
};

type PlanRoute = ReturnType<typeof generatePlanRoutes>[number];

export default function WeightLossPlanView({
  started,
  completedDays,
  rewardBoxes,
  openedRewardDays,
  rewardHistory,
  newbieTasks,
  onBack,
  onStartPlan,
  onOpenReward,
  onClaimActivationTask,
  onClaimFirstRouteTask,
  onNavigateToRouteDetail
}: WeightLossPlanViewProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [result, setResult] = useState<{ day: number; amount: string } | null>(null);
  const [rewardReveal, setRewardReveal] = useState<{ day: number; phase: 'collecting' | 'opening' } | null>(null);
  const [openingRewardDay, setOpeningRewardDay] = useState<number | null>(null);
  const [routeOverrides, setRouteOverrides] = useState<Record<number, PlanRoute>>({});
  const [showCompletionPreview, setShowCompletionPreview] = useState(false);
  const [previewOpenedRewardDays, setPreviewOpenedRewardDays] = useState<number[]>([]);
  const [previewRewardHistory, setPreviewRewardHistory] = useState<WeightPlanRewardRecord[]>([]);
  const rewardTimersRef = useRef<number[]>([]);
  const rewardScrollerRef = useRef<HTMLDivElement>(null);
  const rewardDragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: 0 });
  const planRoutes = useMemo(() => generatePlanRoutes(), []);
  const previewCompletedDays = useMemo(() => Array.from({ length: COMPLETION_TARGET_DAYS }, (_, index) => index + 1), []);
  const completedDaysView = showCompletionPreview ? previewCompletedDays : completedDays;
  const rewardBoxesView = showCompletionPreview ? WEIGHT_PLAN_REWARD_DAYS : rewardBoxes;
  const openedRewardDaysView = showCompletionPreview ? previewOpenedRewardDays : openedRewardDays;
  const rewardHistoryView = showCompletionPreview ? previewRewardHistory : rewardHistory;
  const isPlanVisible = started || showCompletionPreview;
  const completedSet = new Set(completedDaysView);
  const latestReachedDay = completedDaysView.length > 0 ? Math.max(...completedDaysView) + 1 : 1;
  const nextDay = Math.min(latestReachedDay, PLAN_WINDOW_DAYS);
  const [displayDay, setDisplayDay] = useState(Math.max(1, completedDays.length));
  const activeDay = Math.min(displayDay, PLAN_WINDOW_DAYS);
  const todayRoute = routeOverrides[activeDay] || planRoutes[activeDay - 1];
  const todayCompleted = completedSet.has(activeDay);
  const isFutureDay = activeDay > nextDay;
  const isExpiredDay = isPlanVisible && !showCompletionPreview && !todayCompleted && activeDay < nextDay;
  const planComplete = completedDaysView.length >= COMPLETION_TARGET_DAYS;
  const nextRewardDay = WEIGHT_PLAN_REWARD_DAYS.find(day => day > completedDaysView.length);
  const activationTaskClaimed = !!newbieTasks?.activationClaimed;
  const activationTaskReady = !!newbieTasks?.treadmillActivated || activationTaskClaimed;
  const firstRouteTaskClaimed = !!newbieTasks?.firstRouteClaimed;
  const firstRouteTaskReady = (newbieTasks?.completedRoutes || 0) > 0 || firstRouteTaskClaimed;
  const clampDisplayDay = (day: number) => Math.min(PLAN_WINDOW_DAYS, Math.max(1, day));
  const handleRouteSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) < 44) return;
    setDisplayDay(prev => clampDisplayDay(prev + (info.offset.x < 0 ? 1 : -1)));
  };
  const handleRewardPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = rewardScrollerRef.current;
    if (!scroller) return;
    if ((event.target as HTMLElement).closest('button')) {
      rewardDragRef.current.moved = 0;
      return;
    }

    rewardDragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
      moved: 0
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleRewardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = rewardScrollerRef.current;
    if (!scroller || !rewardDragRef.current.active) return;

    const deltaX = event.clientX - rewardDragRef.current.startX;
    rewardDragRef.current.moved = Math.max(rewardDragRef.current.moved, Math.abs(deltaX));
    scroller.scrollLeft = rewardDragRef.current.scrollLeft - deltaX;
  };
  const handleRewardPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    rewardDragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const handleShuffleRoute = () => {
    if (!todayRoute || todayCompleted || isFutureDay || isExpiredDay) return;

    const cities = CITIES.filter(city => city.status !== 'upcoming' && city.id !== todayRoute.cityId);
    const city = cities[Math.floor(Math.random() * cities.length)];
    const routeIndex = Math.floor(Math.random() * Math.max(city.routes, 1)) + 1;
    const nextRoute: PlanRoute = {
      day: activeDay,
      cityId: city.id,
      cityName: city.name,
      routeIndex,
      image: city.image,
      routeData: getRouteData(city.id, routeIndex)
    };

    setRouteOverrides(prev => ({ ...prev, [activeDay]: nextRoute }));
    showToast(`已切换至${city.name}路线`);
  };

  const handleFirstRouteTaskAction = () => {
    if (firstRouteTaskClaimed) return;
    if (firstRouteTaskReady) {
      onClaimFirstRouteTask?.();
      return;
    }
    if (!todayRoute || isFutureDay || isExpiredDay || todayCompleted) return;
    if (!started) onStartPlan();
    onNavigateToRouteDetail(todayRoute.cityId, todayRoute.routeIndex, todayRoute.image, todayRoute.day);
  };

  useEffect(() => {
    return () => {
      rewardTimersRef.current.forEach(timer => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (showCompletionPreview) {
      setDisplayDay(COMPLETION_TARGET_DAYS);
      setPreviewOpenedRewardDays([]);
      setPreviewRewardHistory([]);
      setResult(null);
    }
  }, [showCompletionPreview]);

  useEffect(() => {
    if (!started || showCompletionPreview) return;
    setDisplayDay(nextDay);
  }, [nextDay, showCompletionPreview, started]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleOpenReward = (day: number) => {
    if (openingRewardDay !== null) return;

    setOpeningRewardDay(day);
    setRewardReveal({ day, phase: 'opening' });

    if (showCompletionPreview) {
      const openTimer = window.setTimeout(() => {
        setRewardReveal({ day, phase: 'opening' });

        const resultTimer = window.setTimeout(() => {
          const amount = getWeightPlanRewardAmount(day);
          setRewardReveal(null);
          setOpeningRewardDay(null);
          setPreviewOpenedRewardDays(prev => (prev.includes(day) ? prev : [...prev, day]));
          setPreviewRewardHistory(prev => {
            if (prev.some(item => item.day === day)) return prev;
            return [...prev, { day, amount, openedAt: '预览状态' }];
          });
          setResult({ day, amount });
          showToast(`第${day}天红包已开启`);
        }, 420);

        rewardTimersRef.current.push(resultTimer);
      }, 120);

      rewardTimersRef.current.push(openTimer);
      return;
    }

    const openTimer = window.setTimeout(() => {
      const response = onOpenReward(day);

      if (!response.success || !response.amount) {
        setRewardReveal(null);
        setOpeningRewardDay(null);
        showToast(response.message);
        if (response.amount) {
          setResult({ day, amount: response.amount });
        }
        return;
      }

      setRewardReveal({ day, phase: 'opening' });

      const resultTimer = window.setTimeout(() => {
        setRewardReveal(null);
        setOpeningRewardDay(null);
        setResult({ day, amount: response.amount! });
        showToast(response.message);
      }, 420);

      rewardTimersRef.current.push(resultTimer);
    }, 120);

    rewardTimersRef.current.push(openTimer);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070A] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_88%_2%,rgba(251,191,36,0.18),transparent_32%),linear-gradient(180deg,#06110d_0%,#05070A_52%,#020304_100%)]" />
      <div className="absolute inset-0 opacity-[0.055] bg-[linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="shrink-0 px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-slate-200 backdrop-blur-md active:scale-95"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-black tracking-tight text-white">打卡领红包</h1>
            </div>
            <button
              type="button"
              onClick={() => setShowCompletionPreview(prev => !prev)}
              className={`h-10 rounded-full border px-3 text-xs font-black transition active:scale-95 ${
                showCompletionPreview
                  ? 'border-amber-200/35 bg-amber-200/15 text-amber-100'
                  : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
              }`}
            >
              预览30天
            </button>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-8 hide-scrollbar">
          <section className="relative mt-4 shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-[#0c1210]/85 p-4 shadow-[0_20px_64px_rgba(0,0,0,0.38)]">
            <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_25%_18%,rgba(52,211,153,0.26),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.22),transparent_34%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-2.5 py-1 text-[10px] font-black text-emerald-100">
                <Sparkles size={12} />
                每日一条路线
              </div>
              <h2 className="mt-3 text-[28px] font-black leading-none tracking-[-0.04em] text-white">
                完成30天打卡
              </h2>
              <p className="mt-2 max-w-[300px] text-sm font-semibold leading-5 text-slate-400">
                每天完成对应的推荐路线，即可领取 1 个固定金额红包。
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-emerald-200/12 bg-emerald-200/[0.055] p-3">
                  <p className="text-[10px] font-bold text-emerald-100/55">开始日期</p>
                  <p className="mt-1 font-mono text-sm font-black tabular-nums text-emerald-100">{started || showCompletionPreview ? '2026.07.21' : '--'}</p>
                </div>
                <div className="rounded-2xl border border-amber-200/12 bg-amber-200/[0.055] p-3">
                  <p className="text-[10px] font-bold text-amber-100/55">结束日期</p>
                  <p className="mt-1 font-mono text-sm font-black tabular-nums text-amber-100">{started || showCompletionPreview ? '2026.08.19' : '--'}</p>
                </div>
              </div>

              <button
                type="button"
                disabled={started || showCompletionPreview}
                onClick={onStartPlan}
                className={`mt-4 h-11 w-full rounded-full text-sm font-black shadow-[0_12px_28px_rgba(255,255,255,0.10)] active:scale-[0.98] ${
                  planComplete
                    ? 'border border-amber-200/30 bg-amber-300/12 text-amber-200 shadow-[0_12px_30px_rgba(251,191,36,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : started || showCompletionPreview
                    ? 'border border-emerald-200/18 bg-emerald-300/10 text-emerald-200'
                    : 'bg-white text-slate-950'
                }`}
              >
                {planComplete ? '打卡已结束' : started || showCompletionPreview ? '打卡已开启' : '开启30天打卡'}
              </button>
            </div>
          </section>

          <section className="order-first shrink-0 rounded-[24px] border border-white/[0.09] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black tracking-[0.24em] text-amber-200/75">新人奖励</p>
                <h2 className="mt-1 text-lg font-black tracking-tight text-white">新手红包任务</h2>
              </div>
              <Gift size={18} className="text-amber-200" />
            </div>

            <div className="mt-4 grid gap-2">
              {[
                {
                  id: 'activate',
                  icon: Flame,
                  title: '首次激活领红包',
                  desc: '首次连接并激活跑步机',
                  amount: '￥1.80',
                  ready: activationTaskReady,
                  claimed: activationTaskClaimed,
                  action: onClaimActivationTask,
                  fallbackLabel: '去激活'
                },
                {
                  id: 'first-route',
                  icon: Route,
                  title: '首次完成路线领红包',
                  desc: '完成任意 1 条城市路线',
                  amount: '￥2.80',
                  ready: firstRouteTaskReady,
                  claimed: firstRouteTaskClaimed,
                  action: handleFirstRouteTaskAction,
                  fallbackLabel: '去完成'
                }
              ].map(task => {
                const TaskIcon = task.icon;
                const ctaLabel = task.claimed ? '已领取' : task.ready ? '领取' : task.fallbackLabel;
                return (
                  <button
                    key={task.id}
                    type="button"
                    disabled={task.claimed}
                    onClick={() => !task.claimed && task.action?.()}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99] ${
                      task.claimed
                        ? 'border-emerald-200/12 bg-emerald-300/[0.055]'
                        : task.ready
                          ? 'border-amber-200/24 bg-amber-300/[0.08] shadow-[0_12px_30px_rgba(251,191,36,0.08)]'
                          : 'border-white/10 bg-black/20'
                    }`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      task.claimed
                        ? 'bg-emerald-300/12 text-emerald-200'
                        : task.ready
                          ? 'bg-amber-300/14 text-amber-200'
                          : 'bg-white/[0.055] text-slate-400'
                    }`}>
                      {task.claimed ? <CheckCircle2 size={20} /> : <TaskIcon size={19} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black text-white">{task.title}</span>
                      <span className="mt-0.5 block truncate text-[11px] font-bold text-slate-500">{task.desc}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-sm font-black text-amber-200">{task.amount}</span>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
                        task.claimed
                          ? 'bg-emerald-300/12 text-emerald-200'
                          : task.ready
                            ? 'bg-amber-300 text-slate-950'
                            : 'bg-white/[0.06] text-slate-400'
                      }`}>
                        {ctaLabel}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {isPlanVisible && (
            <motion.section
              className="mt-4 shrink-0 rounded-2xl border border-emerald-300/15 bg-[#0d1412]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleRouteSwipe}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/70">
                    {planComplete ? 'PLAN COMPLETE' : `DAY ${activeDay}`}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight text-white">
                      {planComplete ? '整期计划已完成' : activeDay === nextDay ? '今日推荐路线' : `第 ${activeDay} 天路线`}
                    </h2>
                    {!planComplete && activeDay === nextDay && !todayCompleted && (
                      <button
                        type="button"
                        onClick={handleShuffleRoute}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 text-[11px] font-black text-emerald-100 active:scale-95"
                      >
                        <Shuffle size={13} />
                        换一条
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs font-black text-emerald-100">
                  {activeDay}/{PLAN_WINDOW_DAYS}
                </div>
              </div>
              <p className="mt-2 text-[11px] font-bold text-slate-500">左右滑动切换日期查看路线</p>

              {todayRoute && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25">
                  <div className="relative h-32">
                    <CityImage src={todayRoute.image} alt={todayRoute.cityName} fallbackLabel={todayRoute.cityName} className="h-full w-full object-cover opacity-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-100">
                        <MapPin size={14} />
                        {todayRoute.cityName}
                      </div>
                      <h3 className="mt-1 text-xl font-black text-white">{todayRoute.routeData.title}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3">
                    <div className="rounded-xl bg-white/[0.045] p-2">
                      <p className="text-[10px] text-slate-500">距离</p>
                      <p className="font-mono text-sm font-black text-white">{todayRoute.routeData.distance} km</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.045] p-2">
                      <p className="text-[10px] text-slate-500">预计时长</p>
                      <p className="font-mono text-sm font-black text-white">{todayRoute.routeData.duration}</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.045] p-2">
                      <p className="text-[10px] text-slate-500">消耗</p>
                      <p className="font-mono text-sm font-black text-white">{todayRoute.routeData.calories}</p>
                    </div>
                  </div>
                  {todayCompleted ? (
                    <div className="mx-3 mb-3">
                      <div className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 text-sm font-black text-emerald-200">
                        <CheckCircle2 size={18} />
                        已完成
                      </div>
                    </div>
                  ) : isExpiredDay ? (
                    <button
                      type="button"
                      disabled
                      className="mx-3 mb-3 flex h-11 w-[calc(100%-24px)] items-center justify-center gap-2 rounded-full border border-slate-500/15 bg-slate-700/10 text-sm font-black text-slate-500"
                    >
                      <Lock size={16} />
                      已过期
                    </button>
                  ) : isFutureDay ? (
                    <button
                      type="button"
                      disabled
                      className="mx-3 mb-3 flex h-11 w-[calc(100%-24px)] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] text-sm font-black text-slate-500"
                    >
                      <Lock size={16} />
                      日期未到，暂不可开始
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateToRouteDetail(todayRoute.cityId, todayRoute.routeIndex, todayRoute.image, todayRoute.day)}
                      className="mx-3 mb-3 flex h-11 w-[calc(100%-24px)] items-center justify-center gap-2 rounded-full bg-emerald-300 text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(52,211,153,0.20)] active:scale-[0.98]"
                    >
                      <Play size={17} className="fill-slate-950" />
                      去完成
                    </button>
                  )}
                </div>
              )}
            </motion.section>
          )}

          <section className="relative mt-4 min-h-[166px] shrink-0 overflow-hidden rounded-[26px] border border-orange-200/18 bg-gradient-to-br from-[#111816] via-[#19140d] to-[#21120d] p-4 pb-4 text-slate-100 shadow-[0_20px_54px_rgba(0,0,0,0.34)]">
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_16%_0%,rgba(52,211,153,0.13),transparent_48%),radial-gradient(circle_at_84%_0%,rgba(251,146,60,0.22),transparent_46%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%)]" />
            <div className="relative flex items-center justify-between gap-3">
              <h2 className="text-lg font-black tracking-tight text-white">
                完成30天共领<span className="ml-1 font-mono text-xl text-amber-300 tabular-nums">8.8元</span>
              </h2>
              <div className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-bold text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                已完成{completedDaysView.length}天
              </div>
            </div>

            <div
              ref={rewardScrollerRef}
              onPointerDown={handleRewardPointerDown}
              onPointerMove={handleRewardPointerMove}
              onPointerUp={handleRewardPointerEnd}
              onPointerCancel={handleRewardPointerEnd}
              onPointerLeave={handleRewardPointerEnd}
              className="relative mt-4 -mx-2 flex min-h-[92px] cursor-grab select-none snap-x snap-mandatory items-start gap-4 overflow-x-auto overflow-y-hidden px-2 pb-2 hide-scrollbar touch-pan-x scroll-smooth active:cursor-grabbing"
            >
              {WEIGHT_PLAN_REWARD_DAYS.map((day, index) => {
                const earned = rewardBoxesView.includes(day);
                const opened = openedRewardDaysView.includes(day);
                const record = rewardHistoryView.find(item => item.day === day);
                const isOpening = openingRewardDay === day;
                const isNext = !earned && day === nextRewardDay;
                const expired = isPlanVisible && !showCompletionPreview && !earned && day < nextDay;
                const amount = opened ? record?.amount : getWeightPlanRewardAmount(day);
                const label = getWeightPlanDateLabel(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={!earned || opened || expired || openingRewardDay !== null}
                    onClick={() => {
                      if (earned && !opened) handleOpenReward(day);
                    }}
                    className={`group relative flex w-[62px] shrink-0 snap-start flex-col items-center pb-1 text-center transition ${
                      earned && !opened ? 'active:scale-95' : ''
                    }`}
                  >
                    {index < WEIGHT_PLAN_REWARD_DAYS.length - 1 && (
                      <span className={`pointer-events-none absolute left-[66%] top-7 h-px w-[74%] border-t ${
                        earned ? 'border-dashed border-rose-300/50' : expired ? 'border-dashed border-slate-600/25' : 'border-dashed border-white/12'
                      }`} />
                    )}
                    <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                      opened
                        ? 'border border-emerald-200/25 bg-gradient-to-br from-white/[0.16] via-white/[0.08] to-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                        : earned
                          ? 'bg-gradient-to-br from-[#ff6a5d] via-[#f43f5e] to-[#fb923c] shadow-[0_10px_24px_rgba(244,63,94,0.28),0_0_0_1px_rgba(255,255,255,0.10)] ring-1 ring-amber-200/20'
                          : expired
                            ? 'border border-slate-500/15 bg-gradient-to-br from-slate-700/22 via-slate-800/18 to-slate-950/30 opacity-45 grayscale'
                          : isNext
                            ? 'bg-gradient-to-br from-[#7c4039] via-[#8b3d52] to-[#a35a36] shadow-[0_8px_20px_rgba(251,146,60,0.14)]'
                            : 'bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] opacity-55 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    } ${isOpening ? 'animate-pulse ring-2 ring-orange-300/55' : ''}`}>
                      <div className={`absolute inset-x-1 top-2 h-5 rounded-t-xl ${opened ? 'bg-white/8' : 'bg-white/25'}`} />
                      <div className={`absolute left-1/2 top-6 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-[0_2px_8px_rgba(249,115,22,0.35)] ${
                        opened
                          ? 'border-white/20 bg-white/14'
                          : 'border-orange-100/80 bg-gradient-to-br from-[#fff4b5] to-[#ffb44d]'
                      }`} />
                      {opened ? (
                        <CheckCircle2 size={17} className="relative mt-4 text-emerald-200 drop-shadow" />
                      ) : earned ? (
                        <Gift size={17} className={`relative mt-4 text-white drop-shadow ${isOpening ? 'animate-bounce' : ''}`} />
                      ) : (
                        <Lock size={14} className="relative mt-4 text-white/70" />
                      )}
                    </div>
                    <p className={`mt-2 font-mono text-sm font-black tabular-nums ${
                      opened ? 'text-slate-400' : earned ? 'text-rose-200' : expired ? 'text-slate-600 line-through decoration-slate-500/60' : isNext ? 'text-amber-200' : 'text-slate-500'
                    }`}>
                      {amount}
                    </p>
                    <p className={`mt-1 inline-flex min-h-6 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-black ${
                      opened
                        ? 'bg-emerald-300/10 text-emerald-200'
                        : earned
                          ? 'bg-rose-400/18 text-rose-100 shadow-[0_0_16px_rgba(251,113,133,0.18)]'
                          : expired
                            ? 'bg-slate-700/18 text-slate-500'
                          : isNext
                            ? 'text-amber-300'
                            : 'text-slate-500'
                    }`}>
                      {opened ? '已领取' : earned ? '领取' : expired ? '已过期' : label}
                    </p>
                  </button>
                );
              })}
            </div>

          </section>

          <section className="mt-4 shrink-0 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4">
            <div>
                <h3 className="text-sm font-black text-white">活动说明</h3>
                <div className="mt-2 space-y-2 text-xs font-semibold leading-5 text-slate-400">
                  <p>1. 新用户首次激活跑步机可领取 1.8 元红包。</p>
                  <p>2. 新用户首次完成 1 条路线可领取 2.8 元红包。</p>
                  <p>3. 打卡活动总期限 30 天，每天按顺序完成 1 条对应路线。</p>
                  <p>4. 每完成 1 天即可领取 1 个固定金额红包，第 1、7、15、21、30 天金额略高，30 天累计可领 8.8 元。</p>
                  <p>5. 获得的红包可在【我的】-【我的钱包】中提现。</p>
                </div>
            </div>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute left-1/2 top-20 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rewardReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.82, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative w-full max-w-[280px] overflow-hidden rounded-[28px] border border-amber-200/20 bg-[#130d08] p-5 text-center shadow-[0_22px_70px_rgba(0,0,0,0.56)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(251,191,36,0.34),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(244,63,94,0.24),transparent_48%)]" />
              <div className="absolute inset-x-8 top-5 h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
              {[0, 1, 2].map(item => (
                <motion.span
                  key={item}
                  className="absolute h-1 w-1 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.65)]"
                  initial={{
                    opacity: 0,
                    x: 138,
                    y: 128,
                    scale: 0.4
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: 138 + Math.cos((item / 3) * Math.PI * 2) * 70,
                    y: 122 + Math.sin((item / 3) * Math.PI * 2) * 54,
                    scale: [0.4, 0.9, 0.6]
                  }}
                  transition={{
                    duration: 0.48,
                    repeat: 0,
                    delay: item * 0.08,
                    ease: 'easeOut'
                  }}
                />
              ))}

              <div className="relative mx-auto mt-1 flex h-24 w-24 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-amber-200/20 blur-2xl"
                  animate={{ scale: rewardReveal.phase === 'opening' ? [1, 1.34, 1.08] : [0.9, 1.08, 0.9], opacity: [0.42, 0.88, 0.5] }}
                  transition={{ duration: rewardReveal.phase === 'opening' ? 0.7 : 1.4, repeat: rewardReveal.phase === 'opening' ? 0 : Infinity }}
                />
                <motion.div
                  className="relative flex h-20 w-20 items-center justify-center rounded-[24px] border border-amber-100/30 bg-gradient-to-br from-[#ff4b2e] via-[#ff7a1a] to-[#ffd15d] text-white shadow-[0_16px_38px_rgba(248,113,22,0.30)]"
                  animate={rewardReveal.phase === 'opening'
                    ? { rotateY: [0, 18, -16, 0], scale: [1, 1.08, 0.96, 1.12] }
                    : { y: [0, -8, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: rewardReveal.phase === 'opening' ? 0.42 : 0.7, repeat: rewardReveal.phase === 'opening' ? 0 : 1 }}
                >
                  <div className="absolute left-0 right-0 top-0 h-9 rounded-t-[28px] bg-white/18" />
                  <div className="absolute inset-x-3 top-9 h-px bg-yellow-100/70" />
                  <Gift size={34} className="relative drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]" />
                </motion.div>
              </div>

              <p className="relative mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-amber-100/80">
                DAY {rewardReveal.day} REWARD
              </p>
              <h3 className="relative mt-2 text-2xl font-black text-white">
                {rewardReveal.phase === 'collecting' ? '红包奖励已获得' : '正在领取奖励'}
              </h3>
              <p className="relative mt-2 text-xs font-bold leading-5 text-amber-100/70">
                {rewardReveal.phase === 'collecting' ? '奖励正在发放，准备领取现金红包。' : '领取处理中，马上公布本次奖励。'}
              </p>

              <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300"
                  initial={{ width: '12%' }}
                  animate={{ width: rewardReveal.phase === 'collecting' ? '54%' : '100%' }}
                  transition={{ duration: rewardReveal.phase === 'collecting' ? 0.56 : 0.86, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/78 p-6 backdrop-blur-md"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 230, damping: 22 }}
              className={`relative w-full max-w-[330px] overflow-hidden rounded-[32px] border p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.66)] ${
                result.day >= COMPLETION_TARGET_DAYS
                  ? 'border-amber-200/18 bg-[#3a1212]'
                  : 'border-emerald-200/16 bg-[#0b1117]'
              }`}
              onClick={event => event.stopPropagation()}
            >
              <div className={`absolute inset-0 ${
                result.day >= COMPLETION_TARGET_DAYS
                  ? 'bg-[radial-gradient(circle_at_50%_18%,rgba(251,146,60,0.40),transparent_36%),radial-gradient(circle_at_82%_88%,rgba(244,63,94,0.22),transparent_48%)]'
                  : 'bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.20),transparent_38%),radial-gradient(circle_at_50%_100%,rgba(52,211,153,0.20),transparent_54%)]'
              }`} />
              <button
                type="button"
                onClick={() => setResult(null)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-white/70 active:scale-95"
              >
                ×
              </button>
              {[0, 1, 2, 3].map(item => (
                <motion.span
                  key={item}
                  className="absolute h-1.5 w-1.5 rounded-full bg-amber-200/70 shadow-[0_0_14px_rgba(251,191,36,0.75)]"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 1, 0.25],
                    scale: [0.5, 1, 0.7],
                    x: [0, (item % 2 === 0 ? 1 : -1) * (56 + item * 18)],
                    y: [0, -42 - item * 12]
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: item * 0.18 }}
                  style={{ left: `${42 + item * 12}%`, top: `${38 + item * 8}%` }}
                />
              ))}

              <div className={`relative mx-auto flex h-24 w-24 items-center justify-center ${
                result.day >= COMPLETION_TARGET_DAYS
                  ? 'rounded-[30px] bg-gradient-to-br from-[#ff7b4b] via-[#ff742f] to-[#ffbe4d] text-white shadow-[0_22px_58px_rgba(248,113,22,0.34)]'
                  : 'rounded-[26px] border border-amber-200/22 bg-amber-300/12 text-amber-100 shadow-[0_0_42px_rgba(250,204,21,0.16)]'
              }`}>
                {result.day >= COMPLETION_TARGET_DAYS ? (
                  <>
                    <div className="absolute inset-x-2 top-5 h-8 rounded-t-[24px] bg-white/18" />
                    <div className="absolute inset-x-4 top-11 h-px bg-yellow-100/70" />
                    <Gift size={42} className="relative drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]" />
                  </>
                ) : (
                  <Trophy size={42} />
                )}
              </div>
              <p className={`relative mt-6 text-[10px] font-black uppercase tracking-[0.28em] ${
                result.day >= COMPLETION_TARGET_DAYS ? 'text-amber-100/80' : 'text-amber-100'
              }`}>
                {result.day >= COMPLETION_TARGET_DAYS ? '现金红包到账' : `第${result.day}天红包`}
              </p>
              {result.day >= COMPLETION_TARGET_DAYS && (
                <h3 className="relative mt-3 text-2xl font-black tracking-tight text-white">
                  第{result.day}天红包
                </h3>
              )}
              <p className={`relative mt-4 font-black tracking-[-0.08em] ${
                result.day >= COMPLETION_TARGET_DAYS
                  ? 'text-6xl text-[#fff4bd]'
                  : 'text-6xl text-white'
              }`}>
                {result.amount}
              </p>
              <button
                onClick={() => setResult(null)}
                className={`relative mt-8 h-14 w-full rounded-full text-base font-black shadow-[0_16px_34px_rgba(52,211,153,0.24)] active:scale-[0.98] ${
                  result.day >= COMPLETION_TARGET_DAYS
                    ? 'bg-gradient-to-r from-[#fff7bd] to-[#ffd79c] text-[#2b0e06]'
                    : 'bg-emerald-300 text-slate-950'
                }`}
              >
                收下红包
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
