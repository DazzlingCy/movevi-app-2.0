import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Globe2,
  Medal,
  MoonStar,
  Orbit,
  ShoppingBag,
  Shuffle,
  Sparkles,
  X
} from 'lucide-react';
import {
  GLOW_SHOP_ITEMS,
  type GlowExchangeResult,
  type GlowShopItem,
  type GlowShopItemVisual,
  type GlowShopStats
} from '../lib/glow';

interface GlowShopViewProps {
  userStats: GlowShopStats;
  onBack: () => void;
  onRedeem: (itemId: string) => GlowExchangeResult;
  onUse: (itemId: string) => GlowExchangeResult;
}

const itemSections = [
  {
    id: 'utility' as const,
    title: '功能道具',
    description: '兑换后立即进入对应活动或探索库存'
  },
  {
    id: 'collectible' as const,
    title: '首页装扮',
    description: '切换首页地球与太空风格，可同时使用'
  }
];

function ShopIcon({ visual, size = 26 }: { visual: GlowShopItemVisual; size?: number }) {
  if (visual === 'switch') return <Shuffle size={size} />;
  if (visual === 'medal-ticket') return <Medal size={size} />;
  if (visual === 'globe-natural') return <Globe2 size={size} className="text-cyan-100" />;
  if (visual === 'globe-night') return <MoonStar size={size} className="text-amber-100" />;
  if (visual === 'space-nebula') return <Orbit size={size} className="text-violet-100" />;
  return <Sparkles size={size} className="text-sky-100" />;
}

function DialogBackdrop({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

export default function GlowShopView({ userStats, onBack, onRedeem, onUse }: GlowShopViewProps) {
  const reduceMotion = useReducedMotion();
  const balance = userStats.lightValue || 0;
  const inventory = userStats.glowShopInventory || {};
  const ownedItemIds = userStats.ownedGlowShopItemIds || [];
  const equippedItemIds = userStats.equippedGlowShopItemIds || [];
  const [selectedItem, setSelectedItem] = useState<GlowShopItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedItem) confirmButtonRef.current?.focus();
  }, [selectedItem]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const redeem = () => {
    if (!selectedItem) return;
    const result = onRedeem(selectedItem.id);
    setToast(result.message);
    if (result.success) setSelectedItem(null);
  };

  const useItem = (item: GlowShopItem) => {
    const result = onUse(item.id);
    setToast(result.message);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#020407] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.19),transparent_35%),radial-gradient(circle_at_92%_12%,rgba(251,191,36,0.15),transparent_34%),linear-gradient(180deg,#020407_0%,#07111b_55%,#030507_100%)]" />
      <div className="absolute inset-0 opacity-[0.045] bg-[linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="shrink-0 border-b border-white/[0.07] px-5 pb-3 pt-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-slate-200 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              aria-label="返回光迹值中心"
            >
              <ChevronLeft size={23} />
            </button>
            <div className="text-center">
              <p className="text-[9px] font-black tracking-[0.22em] text-cyan-200/65">光迹兑换站</p>
              <h1 className="mt-0.5 text-xl font-black tracking-tight text-white">光迹商城</h1>
            </div>
            <div className="h-11 w-11" aria-hidden="true" />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-9 pt-4 hide-scrollbar">
          <section className="relative overflow-hidden rounded-[28px] border border-cyan-200/15 bg-[#09131d]/94 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.36)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_8%,rgba(251,191,36,0.18),transparent_38%),linear-gradient(135deg,rgba(103,232,249,0.09),transparent_48%)]" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-cyan-200/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.14)]">
                <ShoppingBag size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-500">当前可用</p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-black text-white">{balance}</span>
                  <span className="text-[10px] font-black text-cyan-200/70">光迹值</span>
                </div>
              </div>
              <div className="rounded-full border border-amber-200/15 bg-amber-200/[0.06] px-3 py-1.5 text-[9px] font-black text-amber-100">
                兑换不影响段位
              </div>
            </div>
          </section>

          {itemSections.map((section, sectionIndex) => {
            const items = GLOW_SHOP_ITEMS.filter(item => item.category === section.id);
            return (
              <section key={section.id} className="mt-6" aria-labelledby={`${section.id}-title`}>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div>
                    <h2 id={`${section.id}-title`} className="text-base font-black text-white">{section.title}</h2>
                    <p className="mt-1 text-[10px] font-bold text-slate-600">{section.description}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] font-black text-slate-600">0{sectionIndex + 1}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {items.map((item, index) => {
                    const owned = !item.repeatable && ownedItemIds.includes(item.id);
                    const equipped = equippedItemIds.includes(item.id);
                    const count = inventory[item.id] || 0;
                    const insufficient = balance < item.price;
                    return (
                      <motion.article
                        key={item.id}
                        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: reduceMotion ? 0 : 0.24 }}
                        className={`relative flex min-h-[236px] flex-col overflow-hidden rounded-[24px] border p-3.5 ${
                          equipped
                            ? 'border-cyan-200/35 bg-cyan-300/[0.07] shadow-[0_0_28px_rgba(34,211,238,0.09)]'
                            : owned
                            ? 'border-emerald-200/20 bg-emerald-300/[0.055]'
                            : 'border-white/[0.09] bg-[#09111b]/92'
                        }`}
                      >
                        <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${item.accent} opacity-15 blur-2xl`} />
                        <div className="relative flex items-start justify-between gap-2">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-br ${item.accent} p-[1px]`}>
                            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#07111b] text-white">
                              <ShopIcon visual={item.visual} size={22} />
                            </div>
                          </div>
                          {equipped ? (
                            <span className="flex items-center gap-1 rounded-full bg-cyan-300/12 px-2 py-1 text-[8px] font-black text-cyan-100">
                              <Check size={10} /> 使用中
                            </span>
                          ) : owned ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-300/12 px-2 py-1 text-[8px] font-black text-emerald-200">
                              <Check size={10} /> 已拥有
                            </span>
                          ) : count > 0 ? (
                            <span className="rounded-full bg-cyan-300/10 px-2 py-1 font-mono text-[8px] font-black text-cyan-100">持有 {count}</span>
                          ) : null}
                        </div>

                        <div className="relative mt-3 flex-1">
                          <p className="text-[9px] font-black tracking-[0.12em] text-slate-600">{item.subtitle}</p>
                          <h3 className="mt-1 text-sm font-black leading-5 text-white">{item.name}</h3>
                          <p className="mt-1.5 text-[10px] font-medium leading-[1.45] text-slate-500">{item.description}</p>
                          {item.benefit && (
                            <p className="mt-2 text-[9px] font-black text-cyan-100/70">{item.benefit}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={!owned && insufficient}
                          onClick={() => owned ? useItem(item) : setSelectedItem(item)}
                          className={`relative mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[11px] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                            equipped
                              ? 'border border-cyan-200/22 bg-cyan-300/[0.1] text-cyan-100 active:scale-[0.98]'
                              : owned
                                ? 'border border-emerald-200/18 bg-emerald-300/10 text-emerald-100 active:scale-[0.98]'
                              : insufficient
                                ? 'cursor-not-allowed border border-white/[0.06] bg-black/20 text-slate-700'
                                : 'bg-cyan-200 text-slate-950 shadow-[0_10px_24px_rgba(103,232,249,0.14)] active:scale-[0.98]'
                          }`}
                        >
                          {equipped ? '恢复默认' : owned ? '使用' : insufficient ? '光迹值不足' : (
                            <>
                              <Sparkles size={12} />
                              {item.price}
                              <ArrowRight size={12} />
                            </>
                          )}
                        </button>
                      </motion.article>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <p className="mt-6 text-center text-[9px] font-bold leading-5 text-slate-700">
            商城兑换仅使用可用光迹值，不会降低累计光迹值与当前段位。
          </p>
        </main>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <DialogBackdrop onClose={() => setSelectedItem(null)}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="exchange-title"
              initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
              className="w-full max-w-[390px] rounded-[28px] border border-white/10 bg-[#08111b] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.68)]"
              onClick={event => event.stopPropagation()}
              onKeyDown={event => {
                if (event.key === 'Escape') setSelectedItem(null);
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-gradient-to-br ${selectedItem.accent} p-[1px]`}>
                    <div className="flex h-full w-full items-center justify-center rounded-[16px] bg-[#07111b] text-white">
                      <ShopIcon visual={selectedItem.visual} size={23} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-cyan-200/65">确认兑换</p>
                    <h2 id="exchange-title" className="mt-0.5 truncate text-lg font-black text-white">{selectedItem.name}</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  aria-label="关闭兑换确认"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.08] bg-black/20 p-3 text-center">
                <div>
                  <p className="text-[9px] font-bold text-slate-600">当前余额</p>
                  <p className="mt-1 font-mono text-sm font-black text-white">{balance}</p>
                </div>
                <div className="border-x border-white/[0.07]">
                  <p className="text-[9px] font-bold text-slate-600">本次消耗</p>
                  <p className="mt-1 font-mono text-sm font-black text-amber-200">-{selectedItem.price}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-600">兑换后</p>
                  <p className="mt-1 font-mono text-sm font-black text-cyan-100">{Math.max(0, balance - selectedItem.price)}</p>
                </div>
              </div>

              <button
                ref={confirmButtonRef}
                type="button"
                onClick={redeem}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-200 to-emerald-200 text-sm font-black text-slate-950 shadow-[0_14px_34px_rgba(103,232,249,0.18)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Sparkles size={16} />
                消耗 {selectedItem.price} 点兑换
              </button>
            </motion.div>
          </DialogBackdrop>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center px-5"
          >
            <motion.div
              initial={reduceMotion ? false : { scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 6 }}
              className="flex w-full max-w-sm items-center justify-center rounded-2xl border border-cyan-200/15 bg-[#0b1823]/95 px-4 py-3 text-center text-xs font-black text-cyan-50 shadow-2xl backdrop-blur-xl"
            >
              {toast}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
