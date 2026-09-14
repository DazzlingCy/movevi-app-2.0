import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, Gift, Info, Sparkles, Ticket, Trophy, X, Zap } from 'lucide-react';
import { getGlowRank, getGlowWheelDailyExchangeLimit, GLOW_WHEEL_EXCHANGE_RULE_TEXT } from '../lib/glow';

const CASH_PRIZES = [
  { amount: 0.18, weight: 45, color: '#7dd3fc' },
  { amount: 0.38, weight: 30, color: '#a5b4fc' },
  { amount: 0.88, weight: 15, color: '#c4b5fd' },
  { amount: 1.88, weight: 7, color: '#67e8f9' },
  { amount: 5.88, weight: 2.5, color: '#f9a8d4' },
  { amount: 8.88, weight: 0.5, color: '#fde68a' }
];

interface GlowWheelViewProps {
  userStats: any;
  onBack: () => void;
  onClaimChance: () => { success: boolean; message: string };
  onDraw: (amount: number) => { success: boolean; message: string };
}

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = (angle - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
};

const describeSector = (startAngle: number, endAngle: number, radius: number) => {
  const start = polarToCartesian(100, 100, radius, endAngle);
  const end = polarToCartesian(100, 100, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    'M', 100, 100,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ');
};

const pickPrize = () => {
  const totalWeight = CASH_PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
  let cursor = Math.random() * totalWeight;
  for (const prize of CASH_PRIZES) {
    cursor -= prize.weight;
    if (cursor <= 0) return prize;
  }
  return CASH_PRIZES[0];
};

export default function GlowWheelView({ userStats, onBack, onClaimChance, onDraw }: GlowWheelViewProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const lightValue = userStats?.lightValue || 0;
  const tickets = userStats?.glowWheelChances || 0;
  const drawHistory: Array<{ id: string; amount: number; createdAt: string }> = userStats?.glowWheelDrawHistory || [];
  const glowRank = getGlowRank(userStats?.lifetimeLightValue ?? lightValue).current;
  const dailyExchangeLimit = getGlowWheelDailyExchangeLimit(glowRank.level);
  const exchangedToday = userStats?.dailyGlowWheelExchangeCount || 0;
  const exchangeLimitReached = exchangedToday >= dailyExchangeLimit;
  const canExchange = !exchangeLimitReached;
  const canDraw = tickets > 0 && !isSpinning;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleExchange = () => {
    const response = onClaimChance();
    showToast(response.message);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (tickets <= 0) {
      showToast('请先领取现金抽奖券');
      return;
    }

    const prize = pickPrize();
    const prizeIndex = CASH_PRIZES.findIndex(item => item.amount === prize.amount);
    const segment = 360 / CASH_PRIZES.length;
    const baseRotation = rotation - (rotation % 360);
    const targetRotation = baseRotation + (5 * 360) + (360 - (prizeIndex * segment + segment / 2));

    setIsSpinning(true);
    setResult(null);
    setRotation(targetRotation);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      const response = onDraw(prize.amount);
      if (response.success) {
        setResult(prize.amount);
      }
      showToast(response.message);
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#030408] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_2%,rgba(83,58,253,0.28),transparent_30%),radial-gradient(circle_at_86%_0%,rgba(249,107,238,0.18),transparent_30%),radial-gradient(circle_at_54%_8%,rgba(125,211,252,0.16),transparent_28%),linear-gradient(180deg,#030408_0%,#07111c_46%,#030408_100%)]" />
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="shrink-0 px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-slate-200 backdrop-blur-md transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-300/50"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-black tracking-[0.26em] text-indigo-200">光迹现金</p>
              <h1 className="mt-1 text-xl font-black tracking-tight text-white">光迹值现金抽奖</h1>
            </div>
            <button
              onClick={() => setShowRules(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200/15 bg-indigo-300/10 text-indigo-100 backdrop-blur-md transition-colors hover:bg-indigo-300/18 focus:outline-none focus:ring-2 focus:ring-indigo-300/50"
              aria-label="现金抽奖规则说明"
            >
              <Info size={18} />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 hide-scrollbar">
          <section className="rounded-[24px] border border-white/10 bg-[#0b1018]/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-indigo-300/20 bg-indigo-300/10 p-3">
                <p className="text-[10px] font-semibold text-indigo-100/70">抽奖券</p>
                <p className="mt-1 font-mono text-xl font-black text-indigo-100 tabular-nums">{tickets}</p>
              </div>
              <button
                onClick={handleExchange}
                disabled={!canExchange}
                className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-200/60 ${
                  canExchange
                    ? 'border-cyan-200/45 bg-gradient-to-br from-cyan-300 via-indigo-300 to-violet-400 text-[#06101b] shadow-[0_14px_34px_rgba(99,102,241,0.28)] hover:brightness-110'
                    : 'border-white/10 bg-white/[0.03] text-slate-500'
                }`}
              >
                {canExchange && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.55),transparent_42%)] opacity-70" />
                )}
                <div className="relative flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-[10px] font-black ${canExchange ? 'text-[#062033]/70' : 'text-slate-500'}`}>
                      {exchangeLimitReached ? '今日已满' : '今日领取'}
                    </p>
                    <p className="mt-1 text-sm font-black leading-tight">抽奖券</p>
                  </div>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    canExchange ? 'bg-black/15 text-[#06101b]' : 'bg-white/5 text-slate-500'
                  }`}>
                    <Ticket size={15} />
                  </span>
                </div>
                <div className="relative mt-2 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${canExchange ? 'text-[#062033]/70' : 'text-slate-500'}`}>免费</span>
                  <span className="font-mono text-lg font-black tabular-nums">+1</span>
                </div>
              </button>
            </div>

            <div className="mt-4 rounded-[22px] border border-white/10 bg-[#070b12] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-[0.22em] text-indigo-200">实时抽奖</p>
                  <h2 className="mt-1 text-base font-black text-white">现金奖池转盘</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold text-slate-400">
                  消耗 1 张券
                </span>
              </div>

              <div className="relative mx-auto flex h-[304px] w-[304px] max-w-full items-center justify-center">
                <div className="absolute top-0 z-30 h-0 w-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-white drop-shadow-[0_9px_18px_rgba(255,255,255,0.18)]" />
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,#533afd,#7dd3fc,#f96bee,#fde68a,#533afd)] p-[1px] shadow-[0_0_50px_rgba(83,58,253,0.18)]">
                  <div className="h-full w-full rounded-full bg-[#050812]" />
                </div>

                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-[16px] overflow-hidden rounded-full border border-white/10 bg-slate-950 shadow-[inset_0_0_30px_rgba(255,255,255,0.04)]"
                >
                  <svg viewBox="0 0 200 200" className="h-full w-full">
                    <defs>
                      <radialGradient id="glow-wheel-center" cx="50%" cy="50%" r="55%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#020617" stopOpacity="0.04" />
                      </radialGradient>
                    </defs>
                    {CASH_PRIZES.map((prize, index) => {
                      const segment = 360 / CASH_PRIZES.length;
                      const startAngle = index * segment;
                      const endAngle = startAngle + segment;
                      const midAngle = startAngle + segment / 2;
                      return (
                        <g key={prize.amount}>
                          <path
                            d={describeSector(startAngle, endAngle, 99)}
                            fill={index % 2 === 0 ? '#101827' : '#0b1120'}
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="1"
                          />
                          <path
                            d={describeSector(startAngle + 1, endAngle - 1, 96)}
                            fill={prize.color}
                            opacity="0.16"
                          />
                        </g>
                      );
                    })}
                    <circle cx="100" cy="100" r="99" fill="url(#glow-wheel-center)" />
                  </svg>
                </motion.div>

                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute inset-[16px] z-20 overflow-hidden rounded-full"
                >
                  {CASH_PRIZES.map((prize, index) => {
                    const segment = 360 / CASH_PRIZES.length;
                    const midAngle = index * segment + segment / 2;
                    const labelPoint = polarToCartesian(50, 50, 30, midAngle);
                    return (
                      <div
                        key={prize.amount}
                        className="absolute"
                        style={{ left: `${labelPoint.x}%`, top: `${labelPoint.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <motion.div
                          animate={{ rotate: -rotation }}
                          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                          className="flex flex-col items-center gap-0.5"
                        >
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${prize.color}24`, color: prize.color }}
                          >
                            <Gift size={14} strokeWidth={2.3} />
                          </div>
                          <span className="whitespace-nowrap font-mono text-[9px] font-black leading-none text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]">
                            ¥{prize.amount.toFixed(2)}
                          </span>
                        </motion.div>
                      </div>
                    );
                  })}
                </motion.div>

                <button
                  onClick={handleSpin}
                  disabled={!canDraw}
                  className={`absolute z-40 flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full border text-center shadow-2xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 ${
                    canDraw
                      ? 'border-indigo-200/30 bg-[#10162a] text-white hover:bg-[#151c34] shadow-[0_0_34px_rgba(83,58,253,0.26)]'
                      : 'border-white/10 bg-[#090d16] text-slate-500'
                  }`}
                >
                  <Gift size={20} className={isSpinning ? 'animate-pulse text-indigo-200' : 'text-indigo-200'} />
                  <span className="mt-1 text-[11px] font-black">{isSpinning ? '抽取中' : '开始抽奖'}</span>
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400">当前可用抽奖券</span>
                  <span className="font-mono text-lg font-black text-indigo-100 tabular-nums">{tickets}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] font-bold">
                  <span className="text-slate-500">今日可兑</span>
                  <span className={exchangeLimitReached ? 'text-amber-200' : 'text-cyan-200'}>
                    {exchangedToday}/{dailyExchangeLimit} 张
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[22px] border border-white/10 bg-[#0b1018]/86 p-4">
            <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-black text-indigo-100">
                <Zap size={13} />
                奖池与概率
              </span>
              <span className="text-[10px] font-bold text-slate-500">公开展示</span>
            </div>
            <div className="grid grid-cols-6 gap-2 max-[420px]:gap-1.5">
              {CASH_PRIZES.map(prize => (
                <div
                  key={prize.amount}
                  className="min-w-0 rounded-2xl border border-white/10 bg-black/30 px-1.5 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <p className="font-mono text-[11px] font-black text-amber-200 tabular-nums">¥{prize.amount.toFixed(2)}</p>
                  <p className="mt-2 font-mono text-[10px] font-bold text-slate-500 tabular-nums">{prize.weight}%</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-[22px] border border-white/10 bg-[#0b1018]/86 p-4">
            <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-black text-slate-200">
                <Trophy size={13} className="text-indigo-200" />
                现金中奖记录
              </span>
              <span className="text-[10px] font-semibold text-slate-500">{drawHistory.length} 条记录</span>
            </div>
            {drawHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 py-6 text-center text-xs font-bold text-slate-500">
                暂无现金抽奖记录
              </div>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1 hide-scrollbar">
                {drawHistory.map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                    <div>
                      <p className="text-xs font-black text-white">沐小六</p>
                      <p className="mt-1 text-[10px] font-bold text-slate-500">{record.createdAt}</p>
                    </div>
                    <p className="font-mono text-base font-black text-cyan-100 tabular-nums">+¥{record.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <AnimatePresence>
        {result !== null && !isSpinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', damping: 18 }}
              className="relative w-full max-w-xs overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1018] p-5 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              onClick={event => event.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_50%_0%,rgba(83,58,253,0.36),transparent_70%)]" />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-200/20 bg-indigo-300/10 text-indigo-100">
                <Sparkles size={30} />
              </div>
              <p className="relative mt-4 text-[10px] font-black tracking-[0.24em] text-indigo-200">恭喜抽中</p>
              <p className="relative mt-2 font-mono text-5xl font-black text-white tabular-nums">¥{result.toFixed(2)}</p>
              <button
                onClick={() => setResult(null)}
                className="relative mt-5 h-11 w-full rounded-full bg-indigo-400 text-sm font-black text-white shadow-[0_12px_28px_rgba(83,58,253,0.28)]"
              >
                收下奖励
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/78 p-6 backdrop-blur-md"
            onClick={() => setShowRules(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="relative w-full max-w-[330px] overflow-hidden rounded-[28px] border border-indigo-200/15 bg-[#07101a] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.58)]"
              onClick={event => event.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_50%_0%,rgba(129,140,248,0.26),transparent_70%)]" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-indigo-200/15 bg-indigo-300/10 text-indigo-100">
                    <Info size={18} />
                  </div>
                  <h2 className="text-lg font-black text-white">现金抽奖规则</h2>
                </div>
                <button
                  onClick={() => setShowRules(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="relative mt-5 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-xs font-black text-indigo-100">领取方式</p>
                  <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-400">
                    每日可免费领取现金抽奖券，每次抽奖消耗 1 张券，不消耗光迹值。
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-xs font-black text-cyan-100">每日上限</p>
                  <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-400">{GLOW_WHEEL_EXCHANGE_RULE_TEXT}</p>
                  <p className="mt-2 font-mono text-xs font-black text-cyan-200">
                    当前{glowRank.name}：今日已领 {exchangedToday}/{dailyExchangeLimit} 张
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-xs font-black text-amber-100">奖池概率</p>
                  <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-400">
                    奖池与概率在页面中公开展示，中奖金额以抽奖结果为准。
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="absolute left-1/2 top-20 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-xs font-black text-slate-950 shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
