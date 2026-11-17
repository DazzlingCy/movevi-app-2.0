import { useEffect, useRef, useState } from 'react';
import { exerciseDay } from './dailyExercise';
import { cashBalance, coinBalance, coinDayProgress, getAvailableMedals, getExchangedMedals, getMedalDraws, readCoinLedger, recordCashExchange, recordCashWithdrawal, recordMedalDraw, recordMedalExchange, recordStarterClaim, settleCoinWorkout, type CoinLedger, type CoinTrack, type CoinWorkout } from './coinRewards';
import { MEDAL_LOTTERY_DRAW_COST, MEDAL_LOTTERY_POOL_SIZE, PREVIEW_AVAILABLE_MEDALS, PREVIEW_EXCHANGED_MEDALS } from './medalLottery';

declare const __APP_VERSION__: string;

function createPreviewLedger(): CoinLedger {
  const exchange = recordMedalExchange([], PREVIEW_EXCHANGED_MEDALS, Date.now());
  return exchange ? [exchange] : [];
}

export function useCoinRewards(demo: boolean) {
  // Vite preview serves a production build, including over the local network.
  const localPreview = __APP_VERSION__.startsWith('local-');
  const { hostname, pathname } = window.location;
  const githubPages = hostname === 'dazzlingcy.github.io';
  const hostedPreview = githubPages && pathname.startsWith('/movevi-app-preview');
  const publishedPreview = githubPages && /^\/movevi-app-2\.0(?:\/|$)/.test(pathname);
  const transientPreview = localPreview || hostedPreview;
  const isPreview = transientPreview || publishedPreview;
  const trackWorkouts = isPreview || demo;
  const canSimulateWithdrawal = isPreview || demo;
  const previewMedals = isPreview ? PREVIEW_AVAILABLE_MEDALS : [];
  const key = demo ? 'movevi-coins-demo-v1' : 'movevi-coins-v1';
  const wechatBindingKey = `${key}:wechat-preview-bound`;
  const readWechatBinding = () => {
    if (!canSimulateWithdrawal) return false;
    try { return localStorage.getItem(wechatBindingKey) === '1'; } catch { return false; }
  };
  const read = () => readCoinLedger(localStorage.getItem(key));
  const [ledger, setLedger] = useState<CoinLedger>(() => {
    if (transientPreview) return createPreviewLedger();
    try { return read(); } catch { return []; }
  });
  const latest = useRef(ledger);
  const [now, setNow] = useState(Date.now);
  const [wechatBound, setWechatBound] = useState(readWechatBinding);
  const [previewStarterClaims, setPreviewStarterClaims] = useState<Partial<Record<CoinTrack, string>>>({});

  useEffect(() => {
    const refreshDay = () => setNow(Date.now());
    const sync = (event: StorageEvent) => {
      if (canSimulateWithdrawal && (event.key === wechatBindingKey || event.key === null)) {
        setWechatBound(event.newValue === '1');
      }
      if (transientPreview || event.key !== key) return;
      latest.current = readCoinLedger(event.newValue);
      setLedger(latest.current);
      refreshDay();
    };
    const timer = window.setInterval(refreshDay, 15_000);
    window.addEventListener('focus', refreshDay);
    window.addEventListener('storage', sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshDay);
      window.removeEventListener('storage', sync);
    };
  }, [key, transientPreview, canSimulateWithdrawal, wechatBindingKey]);

  const currentLedger = () => {
    if (transientPreview) return latest.current;
    try { return read(); } catch { return latest.current; }
  };
  const update = (apply: (previous: CoinLedger) => CoinLedger) => {
    const previous = currentLedger();
    const next = apply(previous);
    if (next === previous) return false;
    if (!transientPreview) {
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { return false; }
    }
    latest.current = next;
    setLedger(next);
    setNow(Date.now());
    return true;
  };
  const withLedgerLock = <T,>(mutate: () => T) => !transientPreview && navigator.locks
    ? navigator.locks.request(key, mutate) : mutate();

  const day = exerciseDay(now);
  const starterClaims = new Set(publishedPreview
    ? (['mileage', 'route'] as const).filter(track => previewStarterClaims[track] === day)
    : ledger.flatMap(entry => entry.kind === 'starter-claim' && exerciseDay(entry.at) === day ? [entry.track] : []));
  const exchangedMedals = getExchangedMedals(ledger).reverse();
  if (publishedPreview) {
    const exchangedIds = new Set(exchangedMedals.map(medal => medal.id));
    exchangedMedals.push(...PREVIEW_EXCHANGED_MEDALS.filter(medal => !exchangedIds.has(medal.id)));
  }

  return {
    demo,
    isPreview,
    trackWorkouts,
    ledger,
    balance: coinBalance(ledger),
    cashCents: cashBalance(ledger),
    canSimulateWithdrawal,
    wechatBound,
    today: coinDayProgress(ledger, now),
    starterClaims,
    replayStarterClaims: publishedPreview,
    availableMedals: getAvailableMedals(ledger, previewMedals),
    exchangedMedals,
    medalDraws: getMedalDraws(ledger),
    async exchangeMedals(ids: readonly string[]) {
      const exchange = () => {
        const selected = new Set(ids);
        let earned = 0;
        const saved = update(previous => {
          const medals = getAvailableMedals(previous, previewMedals).filter(medal => selected.has(medal.id));
          const entry = recordMedalExchange(previous, medals, Date.now());
          if (!entry) return previous;
          earned = entry.coins;
          return [...previous, entry];
        });
        return saved ? earned : 0;
      };
      return withLedgerLock(exchange);
    },
    async drawMedalLottery() {
      const draw = () => {
        let outcome: { prizeIndex: number } | { message: string } = { message: '抽奖记录保存失败，请重试' };
        const saved = update(previous => {
          if (getMedalDraws(previous).length >= MEDAL_LOTTERY_POOL_SIZE) {
            outcome = { message: '本期红包已抽完' };
            return previous;
          }
          if (coinBalance(previous) < MEDAL_LOTTERY_DRAW_COST) {
            outcome = { message: '金币不足，可先兑换景点勋章' };
            return previous;
          }
          const id = 'medal-draw-' + crypto.getRandomValues(new Uint32Array(4)).join('-');
          const entry = recordMedalDraw(previous, id, Date.now());
          if (!entry) return previous;
          outcome = { prizeIndex: entry.prizeIndex };
          return [...previous, entry];
        });
        return !saved && 'prizeIndex' in outcome ? { message: '抽奖记录保存失败，请重试' } : outcome;
      };
      return withLedgerLock(draw);
    },
    async claimStarter(track: CoinTrack) {
      return withLedgerLock(() => {
        const at = Date.now();
        const claimDay = exerciseDay(at);
        if (publishedPreview && previewStarterClaims[track] === claimDay) return null;
        let alreadyAwarded = false;
        const credited = update(previous => {
          const next = recordStarterClaim(previous, track, at);
          alreadyAwarded = next === previous;
          return next;
        });
        if (!credited && !(publishedPreview && alreadyAwarded)) return null;
        if (publishedPreview) {
          setPreviewStarterClaims(previous => ({ ...previous, [track]: claimDay }));
          if (!credited) setNow(at);
        }
        return { credited };
      });
    },
    record(workout: CoinWorkout): ReturnType<typeof settleCoinWorkout> | undefined {
      if (!trackWorkouts) return;
      let entry: ReturnType<typeof settleCoinWorkout> = null;
      const saved = update(previous => {
        const settled = settleCoinWorkout(previous, workout);
        entry = settled;
        return settled ? [...previous, settled] : previous;
      });
      return saved ? entry ?? undefined : undefined;
    },
    async exchangeCash(coins: number, id: string) {
      return withLedgerLock(() => update(previous => recordCashExchange(previous, coins, id, Date.now())));
    },
    async loadDemoBalance() {
      return demo && withLedgerLock(() => update(previous => previous.some(entry => entry.kind === 'demo-credit' || entry.kind === 'demo-cash-credit')
        ? previous : [...previous, { kind: 'demo-cash-credit', id: 'demo-cash-credit', at: Date.now(), cents: 100 }]));
    },
    async setWechatBinding(bound: boolean) {
      if (!canSimulateWithdrawal) return false;
      return withLedgerLock(() => {
        try {
          if (bound) localStorage.setItem(wechatBindingKey, '1');
          else localStorage.removeItem(wechatBindingKey);
        } catch { return false; }
        setWechatBound(bound);
        return true;
      });
    },
    async withdraw(amount: string | number, id: string) {
      return canSimulateWithdrawal && withLedgerLock(() => readWechatBinding()
        && update(previous => recordCashWithdrawal(previous, amount, id, Date.now())));
    },
  };
}
