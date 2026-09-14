import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Crown,
  History,
  Info,
  Medal,
  ShoppingBag,
  Sparkles,
  X,
  Zap
} from 'lucide-react';
import {
  GLOW_RANKS,
  getGlowRank,
  type GlowCenterStats,
  type GlowValueRecord,
  type GlowValueRecordType
} from '../lib/glow';

interface GlowCenterViewProps {
  userStats: GlowCenterStats;
  onBack: () => void;
  onOpenShop: () => void;
}

type CenterTab = 'rank' | 'records';
type RecordFilter = 'all' | GlowValueRecordType;

const rankCopy: Record<number, { title: string; desc: string; aura: string }> = {
  1: { title: '初次留痕', desc: '完成第一次出发，开始记录你的城市光迹。', aura: 'rgba(251,146,60,0.32)' },
  2: { title: '稳定探索', desc: '跑步习惯开始形成，城市记忆持续唤醒。', aura: 'rgba(226,232,240,0.28)' },
  3: { title: '黄金光迹', desc: '路线完成度进入稳定阶段，探索节奏逐渐成型。', aura: 'rgba(251,191,36,0.34)' },
  4: { title: '钻石轨道', desc: '跨城探索能力提升，光迹网络进入高亮状态。', aura: 'rgba(34,211,238,0.34)' },
  5: { title: '星耀巡航', desc: '持续奔跑让你的城市版图开始形成星群。', aura: 'rgba(217,70,239,0.34)' },
  6: { title: '王者回响', desc: '已抵达最高段位，完整光迹将成为城市传说。', aura: 'rgba(251,113,133,0.34)' }
};

function RankBadgeIcon({ level, size = 34 }: { level: number; size?: number }) {
  if (level === 1) return <Zap size={size} strokeWidth={2.6} />;
  if (level === 6) return <Crown size={size} strokeWidth={2.5} />;
  return <Medal size={size} strokeWidth={2.4} />;
}

export default function GlowCenterView({ userStats, onBack, onOpenShop }: GlowCenterViewProps) {
  const reduceMotion = useReducedMotion();
  const lightValue = userStats.lightValue || 0;
  const lifetimeLightValue = userStats.lifetimeLightValue ?? lightValue;
  const rankInfo = getGlowRank(lifetimeLightValue);
  const currentRankIndex = Math.max(0, GLOW_RANKS.findIndex(rank => rank.level === rankInfo.current.level));
  const [activeTab, setActiveTab] = useState<CenterTab>('rank');
  const [recordFilter, setRecordFilter] = useState<RecordFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(currentRankIndex);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const rankInfoCloseRef = useRef<HTMLButtonElement>(null);

  const selectedRank = GLOW_RANKS[selectedIndex] || rankInfo.current;
  const selectedCopy = rankCopy[selectedRank.level];
  const selectedUnlocked = lifetimeLightValue >= selectedRank.threshold;
  const selectedIsCurrent = selectedRank.level === rankInfo.current.level;

  useEffect(() => {
    setSelectedIndex(currentRankIndex);
  }, [currentRankIndex]);

  useEffect(() => {
    if (showRankInfo) rankInfoCloseRef.current?.focus();
  }, [showRankInfo]);

  const selectRank = (index: number) => {
    setSelectedIndex(Math.max(0, Math.min(GLOW_RANKS.length - 1, index)));
  };

  const handleRankDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.18;
    if (swipe < -55) selectRank(selectedIndex + 1);
    if (swipe > 55) selectRank(selectedIndex - 1);
  };

  const closeOnEscape = (event: KeyboardEvent<HTMLDivElement>, close: () => void) => {
    if (event.key === 'Escape') close();
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#020407] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(94,106,210,0.24),transparent_36%),radial-gradient(circle_at_84%_10%,rgba(251,191,36,0.17),transparent_34%),linear-gradient(180deg,#020407_0%,#07111b_46%,#030507_100%)]" />
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="shrink-0 border-b border-white/[0.07] px-5 pb-3 pt-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-slate-200 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              aria-label="返回"
            >
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-xl font-black tracking-tight text-white">光迹值中心</h1>
            <button
              type="button"
              onClick={() => setShowRankInfo(true)}
              className="flex h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.055] px-3 text-[10px] font-black text-slate-200 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Info size={14} />
              说明
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4 hide-scrollbar">
          <section className="relative overflow-hidden rounded-[28px] border border-cyan-200/15 bg-[#09111b]/92 p-4 shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_44%),radial-gradient(circle_at_90%_0%,rgba(251,191,36,0.16),transparent_42%)]" />
            <div className="relative flex items-center gap-3">
              <div className={`h-14 w-14 shrink-0 rounded-full bg-gradient-to-br ${rankInfo.current.color} p-[2px]`}>
                <div className="h-full w-full rounded-full bg-slate-950 p-1">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200"
                    alt="沐小六头像"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-black text-white">沐小六</p>
                  <span className={`rounded-full bg-gradient-to-r ${rankInfo.current.color} px-2 py-0.5 text-[9px] font-black text-slate-950`}>
                    LV.{rankInfo.current.level} {rankInfo.current.name}
                  </span>
                </div>
                <p className="mt-1 text-[10px] font-bold text-slate-500">
                  {rankInfo.next ? `距离${rankInfo.next.name}还差 ${rankInfo.remaining}` : '已达最高段位'}
                </p>
              </div>
            </div>

            <div className="relative mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-3 py-2.5">
                <p className="text-[10px] font-bold text-slate-500">累计光迹值</p>
                <p className="mt-0.5 font-mono text-xl font-black text-white">{lifetimeLightValue}</p>
              </div>
              <button
                type="button"
                onClick={onOpenShop}
                className="group rounded-2xl border border-cyan-200/20 bg-cyan-300/[0.09] px-3 py-2.5 text-left transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label={`可用光迹值 ${lightValue}，进入光迹商城`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-cyan-100/65">可用光迹值</span>
                  <ShoppingBag size={12} className="text-cyan-100/55" />
                </span>
                <span className="mt-0.5 flex items-end justify-between gap-2">
                  <span className="font-mono text-xl font-black text-cyan-100">{lightValue}</span>
                  <span className="mb-0.5 flex items-center gap-0.5 text-[8px] font-black text-cyan-100/55">
                    去兑换 <ChevronRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </button>
            </div>

            <div className="relative mt-3">
              <div className="mb-1.5 flex items-center justify-between text-[9px] font-bold text-slate-500">
                <span>{rankInfo.current.name}</span>
                <span>{rankInfo.next ? `${rankInfo.progress.toFixed(0)}%` : '最高段位'}</span>
              </div>
              <div
                role="progressbar"
                aria-label={`前往${rankInfo.next?.name || '最高段位'}的进度`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(rankInfo.progress)}
                className="h-2 overflow-hidden rounded-full bg-white/10"
              >
                <motion.div
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${rankInfo.progress}%` }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
                />
              </div>
            </div>
          </section>

          <div role="tablist" aria-label="光迹值中心功能" className="sticky top-0 z-20 mt-4 grid grid-cols-2 rounded-2xl border border-white/10 bg-[#080d14]/90 p-1 shadow-xl backdrop-blur-xl">
            {([
              { id: 'rank', label: '段位成长' },
              { id: 'records', label: '光迹记录' }
            ] as const).map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${tab.id}-panel`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-11 rounded-xl text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                    active
                      ? tab.id === 'rank' ? 'bg-amber-200 text-slate-950' : 'bg-cyan-200 text-slate-950'
                      : 'text-slate-500'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'rank' ? (
              <motion.section
                key="rank-panel"
                id="rank-panel"
                role="tabpanel"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="mt-4"
              >
                <div className="grid grid-cols-6 gap-1.5" aria-label="选择段位">
                  {GLOW_RANKS.map((rank, index) => {
                    const active = index === selectedIndex;
                    const unlocked = lifetimeLightValue >= rank.threshold;
                    return (
                      <button
                        key={rank.level}
                        type="button"
                        onClick={() => selectRank(index)}
                        aria-label={`查看${rank.name}段位${unlocked ? '，已解锁' : '，未解锁'}`}
                        aria-pressed={active}
                        className={`flex min-h-12 flex-col items-center justify-center rounded-2xl border text-[9px] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                          active
                            ? 'border-amber-200/45 bg-amber-300/14 text-amber-100'
                            : unlocked
                              ? 'border-white/10 bg-white/[0.04] text-slate-300'
                              : 'border-white/[0.06] bg-black/15 text-slate-700'
                        }`}
                      >
                        <span className="font-mono">LV.{rank.level}</span>
                        <span className="mt-0.5">{rank.name}</span>
                      </button>
                    );
                  })}
                </div>

                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.14}
                  onDragEnd={handleRankDragEnd}
                  key={selectedRank.level}
                  initial={reduceMotion ? false : { opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                  className={`relative mt-3 overflow-hidden rounded-[28px] border p-4 ${
                    selectedIsCurrent
                      ? 'border-amber-300/40 bg-amber-300/[0.06] shadow-[0_0_34px_rgba(251,191,36,0.13)]'
                      : selectedUnlocked
                        ? 'border-white/10 bg-[#09111b]/90'
                        : 'border-white/[0.07] bg-[#071019]/80'
                  }`}
                >
                  <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: selectedCopy.aura }} />
                  <div className="relative flex items-center gap-4">
                    <div className={`flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-[26px] bg-gradient-to-br ${selectedRank.color} p-[3px]`}>
                      <div className="flex h-full w-full items-center justify-center rounded-[23px] border border-black/25 bg-[#07111b] text-white">
                        <RankBadgeIcon level={selectedRank.level} size={38} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-[10px] font-black tracking-[0.2em] text-slate-500">LV.{selectedRank.level}</p>
                        {selectedIsCurrent && <span className="rounded-full bg-amber-300/14 px-2 py-1 text-[9px] font-black text-amber-100">当前段位</span>}
                      </div>
                      <h2 className={`mt-1 bg-gradient-to-r ${selectedRank.color} bg-clip-text text-3xl font-black text-transparent`}>{selectedRank.name}</h2>
                      <p className="mt-1 text-xs font-black text-white">{selectedCopy.title}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-4 text-slate-500">{selectedCopy.desc}</p>
                    </div>
                  </div>

                  <div className="relative mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                      <p className="text-[9px] font-bold text-slate-500">达成条件</p>
                      <p className="mt-1 font-mono text-base font-black text-white">{selectedRank.threshold}+</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                      <p className="text-[9px] font-bold text-slate-500">当前状态</p>
                      <p className={`mt-1 text-xs font-black ${selectedUnlocked ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {selectedIsCurrent ? '当前段位' : selectedUnlocked ? '已解锁' : '未解锁'}
                      </p>
                    </div>
                  </div>

                </motion.div>

              </motion.section>
            ) : (
              <motion.section
                key="records-panel"
                id="records-panel"
                role="tabpanel"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="mt-4"
              >
                <GlowRecordPanel
                  records={userStats.glowValueRecords || []}
                  filter={recordFilter}
                  onFilterChange={setRecordFilter}
                />
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showRankInfo && (
          <DialogBackdrop onClose={() => setShowRankInfo(false)} onKeyDown={event => closeOnEscape(event, () => setShowRankInfo(false))}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="rank-info-title"
              initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.96 }}
              className="w-full max-w-[330px] rounded-[28px] border border-white/10 bg-[#07111b] p-5 shadow-2xl"
              onClick={event => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-200" />
                  <h2 id="rank-info-title" className="text-lg font-black text-white">段位说明</h2>
                </div>
                <button
                  ref={rankInfoCloseRef}
                  type="button"
                  onClick={() => setShowRankInfo(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  aria-label="关闭段位说明"
                >
                  <X size={17} />
                </button>
              </div>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400">
                段位由累计光迹值决定，记录长期探索进度；可用光迹值可用于切换探索城市或在光迹商城兑换物品，使用后不会影响已经达到的段位。
              </p>
              <div className="mt-4 rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.04] p-4">
                <p className="text-[10px] font-black tracking-[0.18em] text-cyan-100">光迹值获取</p>
                <ol className="mt-3 space-y-3">
                  <li className="flex items-start gap-3 text-sm font-medium leading-5 text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-200/10 font-mono text-[10px] font-black text-cyan-100">1</span>
                    <span>每完成 <strong className="font-black text-white">1 条路线</strong>，获得 <strong className="font-black text-cyan-100">1 点光迹值</strong></span>
                  </li>
                  <li className="flex items-start gap-3 text-sm font-medium leading-5 text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-200/10 font-mono text-[10px] font-black text-cyan-100">2</span>
                    <span>完成一座城市的全部路线，额外获得 <strong className="font-black text-cyan-100">10 点光迹值</strong></span>
                  </li>
                </ol>
              </div>
              <div className="mt-3 rounded-2xl border border-amber-200/10 bg-amber-200/[0.04] p-4">
                <p className="text-[10px] font-black tracking-[0.18em] text-amber-100">光迹值消耗</p>
                <p className="mt-2 text-sm font-medium leading-5 text-slate-300">
                  切换一次探索城市消耗 <strong className="font-black text-amber-100">3 点光迹值</strong>；也可进入光迹商城兑换探索道具与专属收藏。
                </p>
              </div>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-400">
                点击段位轨道或左右滑动，可以预览全部段位及其达成条件。
              </p>
            </motion.div>
          </DialogBackdrop>
        )}
      </AnimatePresence>

    </div>
  );
}

const getRecordDateKey = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const getRecordDateLabel = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (getRecordDateKey(timestamp) === getRecordDateKey(today.getTime())) return '今天';
  if (getRecordDateKey(timestamp) === getRecordDateKey(yesterday.getTime())) return '昨天';
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
};

function GlowRecordPanel({
  records,
  filter,
  onFilterChange
}: {
  records: GlowValueRecord[];
  filter: RecordFilter;
  onFilterChange: (filter: RecordFilter) => void;
}) {
  const sortedRecords = [...records].sort((a, b) => b.createdAt - a.createdAt);
  const visibleRecords = filter === 'all' ? sortedRecords : sortedRecords.filter(record => record.type === filter);
  const earnedTotal = records.filter(record => record.type === 'earn').reduce((sum, record) => sum + record.amount, 0);
  const spentTotal = records.filter(record => record.type === 'spend').reduce((sum, record) => sum + record.amount, 0);
  const groups = visibleRecords.reduce<Array<{ key: string; label: string; records: GlowValueRecord[] }>>((result, record) => {
    const key = getRecordDateKey(record.createdAt);
    const existing = result.find(group => group.key === key);
    if (existing) existing.records.push(record);
    else result.push({ key, label: getRecordDateLabel(record.createdAt), records: [record] });
    return result;
  }, []);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[20px] border border-emerald-200/12 bg-emerald-300/[0.055] p-3">
          <p className="text-[9px] font-bold text-emerald-100/55">累计获取</p>
          <p className="mt-1 font-mono text-xl font-black text-emerald-200">+{earnedTotal}</p>
        </div>
        <div className="rounded-[20px] border border-amber-200/12 bg-amber-300/[0.05] p-3">
          <p className="text-[9px] font-bold text-amber-100/55">累计消耗</p>
          <p className="mt-1 font-mono text-xl font-black text-amber-100">-{spentTotal}</p>
        </div>
      </div>

      <div role="group" aria-label="筛选光迹值记录" className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.08] bg-black/20 p-1">
        {([
          { id: 'all', label: '全部' },
          { id: 'earn', label: '获取' },
          { id: 'spend', label: '消耗' }
        ] as const).map(option => (
          <button
            key={option.id}
            type="button"
            aria-pressed={filter === option.id}
            onClick={() => onFilterChange(option.id)}
            className={`min-h-10 rounded-xl text-[11px] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              filter === option.id ? 'bg-cyan-200 text-slate-950' : 'text-slate-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {groups.length > 0 ? (
        <div className="mt-4 space-y-5">
          {groups.map(group => (
            <section key={group.key} aria-label={`${group.label}光迹值记录`}>
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-xs font-black text-slate-300">{group.label}</h2>
                <span className="font-mono text-[9px] font-bold text-slate-600">{group.records.length} 笔</span>
              </div>
              <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#08111a]/90">
                {group.records.map((record, index) => (
                  <GlowRecordRow key={record.id} record={record} showDivider={index < group.records.length - 1} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] px-6 py-10 text-center">
          <History size={24} className="mx-auto text-slate-600" />
          <p className="mt-3 text-sm font-black text-slate-300">暂无相关记录</p>
          <p className="mt-1 text-[10px] font-bold text-slate-600">完成路线或使用光迹值后，记录会显示在这里。</p>
        </div>
      )}
    </div>
  );
}

function GlowRecordRow({ record, showDivider }: { key?: string; record: GlowValueRecord; showDivider: boolean }) {
  const earned = record.type === 'earn';
  const Icon = earned ? ArrowDownLeft : ArrowUpRight;
  const time = new Date(record.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  return (
    <article className={`flex min-h-[76px] items-center gap-3 px-3.5 py-3 ${showDivider ? 'border-b border-white/[0.06]' : ''}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
        earned ? 'border-emerald-200/15 bg-emerald-300/10 text-emerald-200' : 'border-amber-200/15 bg-amber-300/10 text-amber-100'
      }`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-xs font-black text-white">{record.title}</h3>
        <p className="mt-1 truncate text-[9px] font-bold text-slate-600">{time} · {record.description}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-mono text-base font-black ${earned ? 'text-emerald-200' : 'text-amber-100'}`}>
          {earned ? '+' : '-'}{record.amount}
        </p>
        <p className="mt-0.5 text-[8px] font-bold text-slate-700">光迹值</p>
      </div>
    </article>
  );
}

function DialogBackdrop({
  children,
  onClose,
  onKeyDown,
  zIndex = 'z-[60]'
}: {
  children: ReactNode;
  onClose: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  zIndex?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 ${zIndex} flex items-center justify-center bg-black/80 p-6 backdrop-blur-md`}
      onClick={onClose}
      onKeyDown={onKeyDown}
    >
      {children}
    </motion.div>
  );
}
