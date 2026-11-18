import { useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeftRight, Check, ChevronLeft, ChevronRight, Coins, Footprints, Gift, Globe2, Route, Sparkle, Users, Wallet, X } from 'lucide-react';
import { COINS_PER_CENT, COINS_PER_YUAN, DAILY_COIN_CAP, MAX_WITHDRAWAL_CENTS, MILEAGE_REWARDS, ROUTE_REWARDS, STARTER_COIN_REWARDS, WITHDRAWAL_TIERS, cashChange, coinChange, formatCashValue, parseWithdrawalCents, quoteCashExchange, type CoinEntry, type CoinTrack, type WithdrawalTier } from '../journey/coinRewards';
import { COIN_LOTTERY_NAME, COINS_PER_LANDMARK_MEDAL, MEDAL_LOTTERY_DRAW_COST } from '../journey/medalLottery';
import type { useCoinRewards } from '../journey/useCoinRewards';
import Modal from './journey/Modal';
import styles from './EventsTab.module.css';

interface BenefitsActions {
  onRun: () => void;
  onSelectMedalLottery: () => void;
  onSelectTeamRelay: () => void;
  onSelectHundredCities: () => void;
}

type EventsTabProps = { rewards: ReturnType<typeof useCoinRewards>; onToast: (message: string) => void } & (
  (BenefitsActions & { onBackToLottery?: never })
  | ({ onBackToLottery: () => void } & Partial<Record<keyof BenefitsActions, never>>)
);

const numberFormat = new Intl.NumberFormat('zh-CN');
const entryDate = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
});
const trackNames = { mileage: '累计运动里程', route: '路线完成' };
const historyTabs = { history: '金币记录', cashHistory: '现金记录' } as const;
const previewHistoryRowCount = 5;
const coinHistoryExamples = [
  { title: `${trackNames.mileage}奖励`, delta: STARTER_COIN_REWARDS.mileage.coins },
  { title: `${trackNames.route}奖励`, delta: STARTER_COIN_REWARDS.route.coins },
  { title: '景点勋章兑换金币', delta: COINS_PER_LANDMARK_MEDAL },
  { title: COIN_LOTTERY_NAME, delta: -MEDAL_LOTTERY_DRAW_COST },
  { title: '金币兑换现金', delta: -1_000 },
];
const cashHistoryExamples = [
  { title: '幸运大转盘中奖', delta: 166 },
  { title: '金币兑换现金', delta: 80 },
  { title: '微信提现', delta: -20 },
  { title: '金币兑换现金', delta: 100 },
  { title: '微信提现', delta: -100 },
];
type HistoryTab = keyof typeof historyTabs;
const exchangeRate = `${numberFormat.format(COINS_PER_YUAN)} 金币兑 ¥1`;
type ExchangeDraft = ReturnType<typeof quoteCashExchange> & { id: string };
const fallingCoins = [
  { x: 5, drift: -16, delay: 40, size: 19, tilt: -24 },
  { x: 16, drift: -14, delay: 185, size: 12, tilt: 38 },
  { x: 26, drift: -25, delay: 0, size: 17, tilt: -28 },
  { x: 45, drift: -27, delay: 125, size: 13, tilt: 22 },
  { x: 60, drift: 20, delay: 65, size: 15, tilt: -34 },
  { x: 75, drift: 19, delay: 245, size: 16, tilt: 24 },
  { x: 84, drift: 18, delay: 45, size: 19, tilt: 35 },
  { x: 94, drift: 10, delay: 170, size: 12, tilt: -38 },
];

function RewardMilestones({ tiers, value, track, starterClaimed, replayStarter, onClaim }: {
  tiers: readonly { goal: number; coins: number }[];
  value: number;
  track: CoinTrack;
  starterClaimed: boolean;
  replayStarter: boolean;
  onClaim: () => void;
}) {
  const reachedTier = (goal: number, index: number) => index === 0 && replayStarter
    ? starterClaimed
    : value >= goal || (index === 0 && starterClaimed);
  const current = tiers.findIndex((tier, index) => !reachedTier(tier.goal, index));
  const isMileage = track === 'mileage';
  return (
    <ol className={`${styles.milestones} ${isMileage ? styles.mileageTimeline : styles.routeRewards}`}>
      {tiers.map((tier, index) => {
        const reached = reachedTier(tier.goal, index);
        const claimable = index === 0 && !reached;
        const goal = track === 'route' ? `第 ${tier.goal} 条` : `${tier.goal} km`;
        const next = tiers[index + 1];
        const segmentProgress = next ? Math.max(0, Math.min(1, (value - tier.goal) / (next.goal - tier.goal))) : 0;
        const tileContent = (
          <>
            <span className={styles.tierReward}>
              <span className={styles.tierCoins}>+{tier.coins}<span className={styles.srOnly}> 金币{reached ? '，已入账' : ''}</span></span>
              <span className={styles.tierCoinIcon} aria-hidden="true">{reached ? <Check size={11} strokeWidth={3} /> : <Sparkle size={10} />}</span>
            </span>
            {isMileage && <span className={styles.timelineDot} aria-hidden="true" />}
            <span className={styles.tierGoal}>{goal}</span>
          </>
        );
        return (
          <li key={tier.goal} data-reached={reached} data-claimable={claimable} aria-current={index === current ? 'step' : undefined}
            style={isMileage && next ? { '--segment-progress': `${segmentProgress * 100}%` } as CSSProperties : undefined}>
            {claimable ? <button type="button" className={styles.rewardTile} aria-label={`领取${trackNames[track]} ${goal} 奖励，${tier.coins} 金币`} onClick={onClaim}>{tileContent}</button>
              : <span className={styles.rewardTile}>{tileContent}</span>}
          </li>
        );
      })}
    </ol>
  );
}

function RewardHistory({ ledger, showCash, showExamples }: { ledger: CoinEntry[]; showCash: boolean; showExamples: boolean }) {
  const change = showCash ? cashChange : coinChange;
  const entries = ledger.filter(entry => change(entry) !== 0)
    .sort((a, b) => b.at - a.at);
  const exampleRows = showExamples ? (showCash ? cashHistoryExamples : coinHistoryExamples) : [];
  const exampleCount = Math.max(0, previewHistoryRowCount - entries.length);
  const oldestDate = entries.at(-1)?.at ?? Date.now();
  const rows = [
    ...entries.map(entry => ({
      id: `entry-${entry.id}`,
      title: entry.kind === 'starter-claim' ? `${trackNames[entry.track]}奖励`
        : entry.kind === 'exercise' ? entry.routeName
        : entry.kind === 'medal-exchange' ? '景点勋章兑换金币'
        : entry.kind === 'medal-draw' ? COIN_LOTTERY_NAME
        : entry.kind === 'cash-exchange' ? '金币兑换现金'
        : entry.kind === 'cash-withdrawal' ? '微信提现'
        : entry.kind === 'withdrawal' ? '模拟提现' : '演示余额',
      date: entryDate.format(entry.at),
      detail: entry.kind === 'exercise' && !showCash ? `里程 +${entry.reward.mileage} · 路线完成 +${entry.reward.route}` : '',
      delta: change(entry),
    })),
    ...exampleRows.slice(0, exampleCount).map((entry, index) => ({
      ...entry,
      id: `example-${index}`,
      date: entryDate.format(oldestDate - (index + 1) * 86_400_000),
      detail: '',
    })),
  ];
  if (!rows.length) return <p className={styles.empty}>{showCash ? '暂无现金记录，兑换或提现后可在这里查看。' : '完成有效运动后，奖励明细会显示在这里。'}</p>;
  return (
    <ul className={styles.history}>
      {rows.map(({ id, title, date, detail, delta }) => {
        const amount = showCash ? formatCashValue(Math.abs(delta)) : `${numberFormat.format(Math.abs(delta))} 金币`;
        return (
          <li key={id}>
            <div>
              <strong>{title}</strong>
              <small>{date}</small>
              {detail && <small>{detail}</small>}
            </div>
            <b>{delta < 0 ? '−' : '+'}{amount}</b>
          </li>
        );
      })}
    </ul>
  );
}

export default function EventsTab({ rewards, onRun, onToast, onSelectMedalLottery, onSelectTeamRelay, onSelectHundredCities, onBackToLottery }: EventsTabProps) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<HistoryTab | null>(null);
  const [earningsOpen, setEarningsOpen] = useState(false);
  const showEarnings = earningsOpen || !!onBackToLottery;
  const [tier, setTier] = useState<WithdrawalTier | 'custom'>(1);
  const [customAmount, setCustomAmount] = useState('');
  const [notice, setNotice] = useState('');
  const [exchangeDraft, setExchangeDraft] = useState<ExchangeDraft | null>(null);
  const [exchangePending, setExchangePending] = useState(false);
  const [exchangeError, setExchangeError] = useState('');
  const exchanging = useRef(false);
  const exchangeTrigger = useRef<HTMLButtonElement>(null);
  const [compact, setCompact] = useState(false);
  const [claimedReward, setClaimedReward] = useState<{ track: CoinTrack; credited: boolean } | null>(null);
  const [claimError, setClaimError] = useState('');
  const claiming = useRef(false);
  const tasksHeading = useRef<HTMLHeadingElement>(null);
  const walletRef = useRef<HTMLElement>(null);
  const withdrawalId = useRef<string | null>(null);
  const withdrawing = useRef(false);
  const [withdrawPending, setWithdrawPending] = useState(false);
  const [withdrawalResult, setWithdrawalResult] = useState<number | null>(null);
  const [wechatDialog, setWechatDialog] = useState<'bind' | 'unbind' | null>(null);
  const [wechatPending, setWechatPending] = useState(false);
  const [wechatError, setWechatError] = useState('');
  const wechatTrigger = useRef<HTMLButtonElement>(null);
  const earningsBack = useRef<HTMLButtonElement>(null);
  const earningsTrigger = useRef<HTMLElement | null>(null);
  const historyTrigger = useRef<HTMLElement | null>(null);
  const [withdrawn, setWithdrawn] = useState(false);
  const headingId = useId();
  const activities = [
    { name: COIN_LOTTERY_NAME, description: '勋章兑金币，金币抽现金红包', icon: Gift, theme: 'gold', select: onSelectMedalLottery },
    { name: '百人百城计划', description: '打卡全球城市，圆梦旅行大奖', icon: Globe2, theme: 'red', select: onSelectHundredCities },
    { name: '环球搭子小队', description: '双人组队，完成城市路线', icon: Users, theme: 'sand', select: onSelectTeamRelay, hidden: true },
  ].filter(activity => !activity.hidden);
  const routeCount = Math.min(rewards.today.routes.size, ROUTE_REWARDS.length);
  const amount = tier === 'custom' ? customAmount : tier;
  const withdrawalCents = parseWithdrawalCents(amount);
  const exceedsWithdrawalLimit = withdrawalCents !== null && withdrawalCents > MAX_WITHDRAWAL_CENTS;
  const canWithdraw = rewards.canSimulateWithdrawal && rewards.wechatBound && !withdrawPending && !withdrawn
    && withdrawalCents !== null && !exceedsWithdrawalLimit && rewards.cashCents >= withdrawalCents;
  const invalidAmount = tier === 'custom' && customAmount.trim() !== '' && withdrawalCents === null;
  const insufficientBalance = !withdrawn && withdrawalCents !== null && withdrawalCents > rewards.cashCents;
  const demoCreditLoaded = rewards.ledger.some(entry => entry.kind === 'demo-credit' || entry.kind === 'demo-cash-credit');
  const cashLabel = formatCashValue(rewards.cashCents);
  const withdrawalHint = invalidAmount ? '请输入大于 0、最多两位小数的金额。'
    : exceedsWithdrawalLimit ? `单次最高提现${MAX_WITHDRAWAL_CENTS / 100}元`
      : insufficientBalance ? `现金余额不足，可用现金 ${cashLabel}`
      : !rewards.canSimulateWithdrawal ? '微信提现暂未开通。'
        : !rewards.wechatBound ? `可用现金 ${cashLabel}，请先绑定微信。` : `可用现金 ${cashLabel}`;

  const openCashExchange = () => {
    setExchangeError('');
    setExchangeDraft({ ...quoteCashExchange(rewards.balance), id: `cash-exchange-${crypto.getRandomValues(new Uint32Array(4)).join('-')}` });
  };
  const closeCashExchange = () => {
    if (exchanging.current) return;
    setExchangeDraft(null);
    requestAnimationFrame(() => exchangeTrigger.current?.focus({ preventScroll: true }));
  };
  const submitCashExchange = async () => {
    if (!exchangeDraft?.coins || exchanging.current) return;
    exchanging.current = true;
    setExchangePending(true);
    setExchangeError('');
    try {
      if (await rewards.exchangeCash(exchangeDraft.coins, exchangeDraft.id)) {
        onToast(`兑换成功，${formatCashValue(exchangeDraft.cents)} 已存入现金余额。`);
        setExchangeDraft(null);
        requestAnimationFrame(() => exchangeTrigger.current?.focus({ preventScroll: true }));
      } else {
        setExchangeError('余额已变化或兑换未完成，请关闭后重试。');
      }
    } catch {
      setExchangeError('暂时无法兑换，请重试。');
    } finally {
      exchanging.current = false;
      setExchangePending(false);
    }
  };
  const claimStarter = async (track: CoinTrack) => {
    if (claiming.current) return;
    claiming.current = true;
    setClaimError('');
    try {
      const claim = await rewards.claimStarter(track);
      if (claim) {
        setClaimedReward({ track, credited: claim.credited });
        return;
      }
      setClaimError('暂时无法领取，请刷新后重试。');
    } catch {
      setClaimError('暂时无法领取，请刷新后重试。');
    } finally {
      claiming.current = false;
    }
  };
  const closeClaim = () => {
    setClaimedReward(null);
    requestAnimationFrame(() => tasksHeading.current?.focus({ preventScroll: true }));
  };
  const openEarnings = () => {
    earningsTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    withdrawalId.current = null;
    setTier(1);
    setCustomAmount('');
    setWithdrawn(false);
    setNotice('');
    setEarningsOpen(true);
  };
  const closeEarnings = () => {
    if (withdrawing.current) return;
    setEarningsOpen(false);
    requestAnimationFrame(() => earningsTrigger.current?.focus({ preventScroll: true }));
  };
  const closeWechatDialog = () => {
    setWechatDialog(null);
    requestAnimationFrame(() => wechatTrigger.current?.focus({ preventScroll: true }));
  };
  const submitWechatBinding = async () => {
    if (!wechatDialog || wechatPending) return;
    setWechatPending(true);
    setWechatError('');
    try {
      if (await rewards.setWechatBinding(wechatDialog === 'bind')) {
        closeWechatDialog();
        onToast(wechatDialog === 'bind' ? '绑定成功' : '解绑成功');
        return;
      }
      setWechatError('绑定状态保存失败，请重试。');
    } catch {
      setWechatError('绑定状态保存失败，请重试。');
    } finally {
      setWechatPending(false);
    }
  };
  const submitWithdrawal = async () => {
    if (!canWithdraw || withdrawalCents === null || withdrawing.current) return;
    withdrawing.current = true;
    setWithdrawPending(true);
    setNotice('');
    const id = withdrawalId.current ??= `withdraw-${crypto.getRandomValues(new Uint32Array(4)).join('-')}`;
    try {
      if (await rewards.withdraw(amount, id)) {
        setWithdrawn(true);
        setWithdrawalResult(withdrawalCents);
      } else {
        setNotice('余额已更新或本地记录保存失败，请重试。');
      }
    } catch {
      setNotice('余额已更新或本地记录保存失败，请重试。');
    } finally {
      withdrawing.current = false;
      setWithdrawPending(false);
    }
  };

  const dismissWithdrawalResult = () => {
    setWithdrawalResult(null);
    requestAnimationFrame(() => earningsBack.current?.focus({ preventScroll: true }));
  };

  const loadDemoBalance = async () => {
    try {
      setNotice(await rewards.loadDemoBalance() ? '已载入 ¥1 演示余额。' : '演示余额已载入或本地记录保存失败。');
    } catch {
      setNotice('本地记录保存失败，请重试。');
    }
  };
  const openHistory = (kind: HistoryTab, trigger: HTMLElement) => {
    historyTrigger.current = trigger;
    setHistoryTab(kind);
  };
  const closeHistory = () => {
    setHistoryTab(null);
    const trigger = historyTrigger.current;
    historyTrigger.current = null;
    requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
  };

  return (
    <>
      {!onBackToLottery && <main className={styles.page} id={earningsOpen || historyTab ? undefined : 'main-content'} aria-label="福利" inert={earningsOpen || !!historyTab || rulesOpen || !!claimedReward || !!exchangeDraft}
        onScroll={event => setCompact(event.currentTarget.scrollTop >= (walletRef.current?.offsetHeight ?? Infinity))}>
        <div className={styles.stickyAnchor}>
          {compact && <div className={styles.stickyWallet}>
            <div className={styles.stickyBalances}>
              <button type="button" onClick={event => openHistory('history', event.currentTarget)} aria-label={`金币明细，${numberFormat.format(rewards.balance)} 金币`}>
                <Coins size={17} aria-hidden="true" /><b>{numberFormat.format(rewards.balance)}</b><span>金币</span>
              </button>
              <button type="button" onClick={event => openHistory('cashHistory', event.currentTarget)} aria-label={`现金明细，${cashLabel}`}>
                <Wallet size={16} aria-hidden="true" /><b>{cashLabel}</b>
              </button>
            </div>
            <button type="button" onClick={openEarnings}>去提现 <ChevronRight size={15} aria-hidden="true" /></button>
          </div>}
        </div>

        <section ref={walletRef} className={styles.wallet} aria-label="金币钱包">
          <div className={`${styles.walletTop} ${styles.walletSummary}`}>
            <button type="button" onClick={event => openHistory('history', event.currentTarget)}>
              <span><Coins className={styles.walletCoin} size={15} aria-hidden="true" />金币余额 (金币)<ChevronRight size={14} aria-hidden="true" /></span>
              <strong>{numberFormat.format(rewards.balance)}</strong>
            </button>
            <button type="button" onClick={event => openHistory('cashHistory', event.currentTarget)}>
              <span><Wallet className={styles.walletCash} size={15} aria-hidden="true" />现金余额 (元)<ChevronRight size={14} aria-hidden="true" /></span>
              <strong>{cashLabel}</strong>
            </button>
          </div>
          <div className={styles.walletBottom}>
            <button className={styles.exchangeLink} ref={exchangeTrigger} type="button" aria-haspopup="dialog" onClick={openCashExchange}>
              <ArrowLeftRight size={15} aria-hidden="true" />去兑换 <ChevronRight size={14} aria-hidden="true" />
            </button>
            <button type="button" onClick={openEarnings}>去提现 <ChevronRight size={15} aria-hidden="true" /></button>
          </div>
        </section>

        <div className={styles.content}>
          <section className={styles.tasks} aria-labelledby="coin-tasks-title">
            <header>
              <div className={styles.tasksSummary}>
                <h2 id="coin-tasks-title" ref={tasksHeading} tabIndex={-1}>运动得福利</h2>
                <p>今日已获 <strong>{rewards.today.earned}</strong> / {DAILY_COIN_CAP} 金币</p>
                <progress className={styles.dailyProgress} aria-label="今日金币奖励进度" value={rewards.today.earned} max={DAILY_COIN_CAP} />
              </div>
              <button className={styles.run} type="button" onClick={onRun}>去跑步</button>
            </header>
            <div className={styles.task}>
              <div className={styles.taskHeading}><span data-theme="sand"><Footprints size={18} aria-hidden="true" /></span><h3>累计运动里程</h3><strong>{(rewards.today.meters / 1000).toLocaleString('zh-CN', { maximumFractionDigits: 3 })} <small>km</small></strong></div>
              <RewardMilestones tiers={MILEAGE_REWARDS} value={rewards.today.meters / 1000} track="mileage" starterClaimed={rewards.starterClaims.has('mileage')} replayStarter={rewards.replayStarterClaims} onClaim={() => void claimStarter('mileage')} />
            </div>
            <div className={styles.task}>
              <div className={styles.taskHeading}><span data-theme="gold"><Route size={18} aria-hidden="true" /></span><h3>{trackNames.route}</h3><strong>{routeCount}<small> / {ROUTE_REWARDS.length} 条</small></strong></div>
              <RewardMilestones tiers={ROUTE_REWARDS} value={routeCount} track="route" starterClaimed={rewards.starterClaims.has('route')} replayStarter={rewards.replayStarterClaims} onClaim={() => void claimStarter('route')} />
            </div>
            {claimError && <p className={styles.claimError} role="alert">{claimError}</p>}
          </section>

          <section className={styles.more} aria-labelledby="more-benefits-title">
            <h2 id="more-benefits-title">更多福利</h2>
            <ul className={styles.benefitList}>
              {activities.map(({ name, description, icon: Icon, theme, select }) => (
                <li key={name}>
                  <button type="button" className={styles.benefitLink} onClick={select}>
                    <span className={styles.benefitIcon} data-theme={theme}><Icon size={17} aria-hidden="true" /></span>
                    <span className={styles.benefitCopy}><strong>{name}</strong>{description && <small>{description}</small>}</span>
                    <ChevronRight className={styles.benefitChevron} size={16} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <p className={styles.footer}><button type="button" onClick={() => setRulesOpen(true)}>活动规则 <ChevronRight size={13} aria-hidden="true" /></button></p>
        </div>
      </main>}

      {showEarnings && (
        <main className={`${styles.page} ${styles.earningsPage}`} id={historyTab ? undefined : 'main-content'} aria-labelledby="earnings-title"
          inert={!!historyTab || rulesOpen || !!wechatDialog || withdrawPending || withdrawalResult !== null}>
          <header className={styles.earningsHeader}>
            <nav className={styles.earningsNav} aria-label="收益页导航">
              <button type="button" autoFocus ref={earningsBack} disabled={withdrawPending} onClick={onBackToLottery ?? closeEarnings} aria-label={onBackToLottery ? `返回${COIN_LOTTERY_NAME}` : '返回福利'}><ChevronLeft size={24} aria-hidden="true" /></button>
              <h1 id="earnings-title">我的钱包</h1>
            </nav>
            <div className={`${styles.walletTop} ${styles.earningsBalance}`}>
              <button type="button" onClick={event => openHistory('history', event.currentTarget)}><span>金币余额 (金币)<ChevronRight size={14} aria-hidden="true" /></span><strong>{numberFormat.format(rewards.balance)}</strong></button>
              <button type="button" onClick={event => openHistory('cashHistory', event.currentTarget)}><span>现金余额 (元)<ChevronRight size={14} aria-hidden="true" /></span><strong>{cashLabel}</strong></button>
            </div>
          </header>

          <section className={styles.withdrawCard} aria-labelledby="withdraw-title">
            <h2 id="withdraw-title">微信提现</h2>
            <button className={styles.wechatBindingRow} type="button" ref={wechatTrigger} aria-haspopup="dialog"
              aria-label={rewards.wechatBound ? '微信，已绑定，解绑' : '微信，未绑定，绑定微信'}
              disabled={!rewards.canSimulateWithdrawal || withdrawPending}
              onClick={() => {
                setWechatError('');
                setWechatDialog(rewards.wechatBound ? 'unbind' : 'bind');
              }}>
              <span className={styles.wechatIcon}>
                <img src={`${import.meta.env.BASE_URL}images/welfare/wechat.svg`} alt="" width={22} height={22} />
              </span>
              <span className={styles.wechatName}>微信</span>
              <span className={styles.wechatAction}>
                {rewards.wechatBound ? '解绑' : '未绑定'}
                <ChevronRight size={18} aria-hidden="true" />
              </span>
            </button>
            <p className={styles.sheetNote}>提现后1-3个工作日内到账</p>
            <div className={styles.withdrawTiers} role="group" aria-label="提现档位">
              {WITHDRAWAL_TIERS.map(value => (
                <button key={value} type="button" aria-pressed={tier === value} disabled={withdrawn || withdrawPending}
                  aria-describedby={tier === value && insufficientBalance ? 'custom-withdrawal-hint' : undefined} onClick={() => {
                  setTier(value);
                  setCustomAmount('');
                }}>
                  <strong>{value.toFixed(2)} <small>元</small></strong>
                </button>
              ))}
            </div>
            <div className={styles.customWithdrawal} data-selected={tier === 'custom'}>
              <label htmlFor="custom-withdrawal-amount">自定义金额（元）</label>
              <input id="custom-withdrawal-amount" type="text" inputMode="decimal" autoComplete="off" placeholder="最低 ¥0.01"
                value={customAmount} onChange={event => {
                  setTier('custom');
                  setCustomAmount(event.target.value);
                }} disabled={withdrawn || withdrawPending}
                aria-invalid={(invalidAmount || exceedsWithdrawalLimit || (tier === 'custom' && insufficientBalance)) || undefined}
                aria-describedby="custom-withdrawal-hint" />
              <small id="custom-withdrawal-hint" data-error={invalidAmount || exceedsWithdrawalLimit || insufficientBalance} role="status">{withdrawalHint}</small>
            </div>
            <button className={`${styles.confirm} ${styles.confirmWechat}`} type="button" disabled={!canWithdraw} onClick={submitWithdrawal}>
              {withdrawPending ? '提交中…' : '立即提现'}
            </button>
            {rewards.demo && !demoCreditLoaded && <button className={styles.demo} type="button" onClick={loadDemoBalance}>载入 ¥1 演示余额</button>}
            <p className={styles.notice} role="status">{notice}</p>
          </section>
        </main>
      )}

      {wechatDialog && (
        <Modal labelId={headingId} onClose={wechatPending ? undefined : closeWechatDialog}
          className={`${styles.sheet} ${styles.withdrawalResult}`} backdropClassName={`${styles.backdrop} ${styles.withdrawalBackdrop}`}>
          <h2 id={headingId}>{wechatDialog === 'bind' ? '绑定微信' : '解除微信绑定'}</h2>
          <p className={styles.sheetNote}>{wechatDialog === 'bind'
            ? '绑定后，可将现金余额提现至该微信账号。'
            : '解绑后，需重新绑定微信才能发起提现。'}</p>
          {wechatError && <p className={styles.wechatError} role="alert">{wechatError}</p>}
          <div className={styles.wechatDialogActions}>
            <button className={styles.wechatCancel} type="button" disabled={wechatPending} onClick={closeWechatDialog}>取消</button>
            <button className={styles.confirm} type="button" disabled={wechatPending} onClick={submitWechatBinding}>
              {wechatPending ? '处理中…' : wechatDialog === 'bind' ? '确认绑定' : '确认解绑'}
            </button>
          </div>
        </Modal>
      )}

      {withdrawalResult !== null && (
        <Modal labelId={headingId} className={`${styles.sheet} ${styles.withdrawalResult}`} backdropClassName={`${styles.backdrop} ${styles.withdrawalBackdrop}`}>
          <span className={styles.withdrawalSuccessIcon} aria-hidden="true"><Check size={23} strokeWidth={2.5} /></span>
          <h2 id={headingId}>提交成功</h2>
          <dl className={styles.withdrawalReceipt}>
            <dt>提现金额</dt><dd>{formatCashValue(withdrawalResult)}</dd>
          </dl>
          <p className={styles.sheetNote}>预计 1-3 个工作日内到账</p>
          <button className={styles.confirm} type="button" onClick={dismissWithdrawalResult}>知道了</button>
        </Modal>
      )}

      {historyTab && (
        <main className={`${styles.page} ${styles.earningsPage}`} id="main-content" aria-labelledby="history-title" inert={rulesOpen}>
          <header className={`${styles.earningsHeader} ${styles.historyHeader}`}>
            <nav className={styles.earningsNav} aria-label="收益记录导航">
              <button type="button" autoFocus onClick={closeHistory} aria-label="返回"><ChevronLeft size={24} aria-hidden="true" /></button>
              <h1 id="history-title">收益记录</h1>
            </nav>
            <dl className={styles.historyBalance}>
              <div><dt>金币余额 (金币)</dt><dd>{numberFormat.format(rewards.balance)}</dd></div>
              <div><dt>现金余额 (元)</dt><dd>{cashLabel}</dd></div>
            </dl>
            <p className={styles.historyRate}>{exchangeRate}，确认兑换后计入现金余额。</p>
          </header>
          <section className={styles.historyCard} aria-label={historyTabs[historyTab]}>
            <div className={styles.historyTabs} role="group" aria-label="记录类型">
              {(['history', 'cashHistory'] as const).map(tab => (
                <button key={tab} type="button" aria-pressed={historyTab === tab} onClick={() => setHistoryTab(tab)}>{historyTabs[tab]}</button>
              ))}
            </div>
            <RewardHistory ledger={rewards.ledger} showCash={historyTab === 'cashHistory'} showExamples={rewards.isPreview || rewards.demo} />
          </section>
        </main>
      )}

      {exchangeDraft && (
        <Modal labelId={headingId} onClose={closeCashExchange} className={styles.sheet} backdropClassName={styles.backdrop}>
          <header className={styles.sheetHeader}>
            <h2 id={headingId}>金币兑现金</h2>
            <button type="button" onClick={closeCashExchange} disabled={exchangePending} aria-label="取消兑换"><X size={21} aria-hidden="true" /></button>
          </header>
          <p className={styles.sheetNote}>{exchangeRate}</p>
          <dl className={styles.exchangeAmounts}>
            <div><dt>扣除金币</dt><dd>{numberFormat.format(exchangeDraft.coins)}</dd></div>
            <div><dt>获得现金</dt><dd>{formatCashValue(exchangeDraft.cents)}</dd></div>
          </dl>
          <p className={styles.sheetNote}>{exchangeDraft.coins === 0
            ? `至少需要 ${COINS_PER_CENT} 金币才能兑换 ¥0.01。`
            : exchangeDraft.coins > rewards.balance ? '金币余额已变化，请关闭后重新发起兑换。'
              : '确认后，现金将存入钱包，不足一分钱的金币继续保留。'}</p>
          <button className={styles.confirm} type="button" onClick={submitCashExchange}
            disabled={!exchangeDraft.coins || exchangeDraft.coins > rewards.balance || exchangePending}>
            {exchangePending ? '兑换中…' : '确认兑换'}
          </button>
          {exchangeError && <p className={styles.notice} role="alert">{exchangeError}</p>}
        </Modal>
      )}

      {claimedReward && (
        <Modal labelId={headingId} onClose={closeClaim} className={styles.claimDialog} backdropClassName={styles.claimBackdrop}>
          <h2 id={headingId}>{claimedReward.credited ? '已获得' : '今日已获得'} <strong>{STARTER_COIN_REWARDS[claimedReward.track].coins}</strong> 金币</h2>
          <p>{trackNames[claimedReward.track]}奖励已入账</p>
          <div className={styles.claimArt} aria-hidden="true">
            <img src={`${import.meta.env.BASE_URL}images/welfare/coin-purse-vermilion.webp`} alt="" width="544" height="363" />
            {fallingCoins.map(({ x, drift, delay, size, tilt }) => (
              <span key={x} className={styles.fallingCoin} style={{
                left: `${x}%`, width: size, animationDelay: `${delay}ms`,
                '--coin-drift': `${drift}px`, '--coin-tilt': `${tilt}deg`,
              } as CSSProperties}>✦</span>
            ))}
          </div>
          <button className={styles.claimDone} type="button" onClick={closeClaim}>{claimedReward.credited ? '收下金币' : '知道了'}</button>
          <button className={styles.claimClose} type="button" onClick={closeClaim} aria-label="关闭领取结果"><X size={20} aria-hidden="true" /></button>
        </Modal>
      )}

      {rulesOpen && (
        <Modal labelId={headingId} onClose={() => setRulesOpen(false)} className={`${styles.sheet} ${styles.rulesSheet}`} backdropClassName={styles.backdrop}>
          <header className={styles.sheetHeader}><h2 id={headingId}>活动规则</h2><button type="button" onClick={() => setRulesOpen(false)} aria-label="关闭活动规则"><X size={21} aria-hidden="true" /></button></header>
          <ol className={styles.rules}>
            <li>
              <h3>里程奖励</h3>
              <p>仅统计观看路线视频期间产生的运动里程，以运动设备记录为准。</p>
              <p>当日累计达到 {MILEAGE_REWARDS.map(({ goal, coins }) => `${goal} 公里奖励 ${coins} 金币`).join('、')}。</p>
            </li>
            <li>
              <h3>{trackNames.route}奖励</h3>
              <p>完整播放一条路线的视频至结束即为完成，提前退出不计。同一路线当天只计一次，次日可重新计入。</p>
              <p>当天完成不同路线，{ROUTE_REWARDS.map(({ goal, coins }) => `第 ${goal} 条奖励 ${coins} 金币`).join('、')}。</p>
            </li>
            <li>
              <h3>奖励结算</h3>
              <p>里程奖励和路线完成奖励可叠加，达标后在结算时自动入账，每档每天只发放一次。运动任务每天最多获得 <strong>{DAILY_COIN_CAP} 金币</strong>。</p>
              <p>每日任务于北京时间 0 点重置，已入账金币继续保留。</p>
            </li>
            <li>
              <h3>兑换与提现</h3>
              <p>{exchangeRate}，手动确认后计入现金余额。每次最低兑换 ¥0.01，不足一分钱的金币继续保留。</p>
              <p>绑定微信后，可选择 {WITHDRAWAL_TIERS.map(amount => `¥${amount}`).join('、')} 或自定义金额申请提现。单次最高提现 <strong>{formatCashValue(MAX_WITHDRAWAL_CENTS)}</strong>，且不得超过可提现余额。</p>
              <p>提交申请后 1–3 个工作日内到账。</p>
            </li>
          </ol>
        </Modal>
      )}
    </>
  );
}
