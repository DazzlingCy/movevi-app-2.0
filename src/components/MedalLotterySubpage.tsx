import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, ChevronLeft, ChevronRight, Medal } from 'lucide-react';
import { getRouteCover } from '../data/routeCovers';
import { getJourneyCity } from '../journey/data';
import { COIN_LOTTERY_NAME, COINS_PER_LANDMARK_MEDAL, MEDAL_LOTTERY_DRAW_COST, type LandmarkMedal } from '../journey/medalLottery';
import { resolveRecommendationCover } from '../lib/localImages';
import CityImage from './CityImage';
import Modal from './journey/Modal';
import styles from './MedalLotterySubpage.module.css';

interface MedalLotterySubpageProps {
  kind: 'exchange' | 'wheel';
  balance: number;
  availableMedals: readonly LandmarkMedal[];
  exchangedMedals: readonly LandmarkMedal[];
  onExchange: (ids: readonly string[]) => Promise<number>;
  onGetCoins: () => void;
  eventNumber: number;
  totalPool: number;
  remainingPool: number;
  rewards: ReadonlyArray<{ level: string; amount: string; unit: string }>;
  rules: ReactNode;
  wins: readonly string[];
  rotation: number;
  spinning: boolean;
  modalOpen: boolean;
  onBack: () => void;
  onDraw: () => void;
}

const wheelLights = Array.from({ length: 24 }, (_, index) => index * 15);
const panelTitles = { rules: '活动规则', prizes: '奖品清单', history: '我的奖品' };

function MedalFace({ medal }: { medal: LandmarkMedal }) {
  const city = getJourneyCity(medal.cityId);
  const route = city?.routes.find(item => item.landmarks[0] === medal.name);
  const cover = route && city ? getRouteCover(city.name, route.order)?.src : undefined;
  return (
    <>
      <span className={styles.medalCoin} aria-hidden="true">
        {cover ? (
          <CityImage src={cover} optimizedSrc={resolveRecommendationCover(cover, 'thumbnail')} alt="" fallbackLabel={medal.name} />
        ) : <Medal size={23} />}
      </span>
      <span className={styles.medalName}>{medal.name}</span>
    </>
  );
}

export default function MedalLotterySubpage({
  kind, balance, availableMedals, exchangedMedals, onExchange, onGetCoins, eventNumber, totalPool, remainingPool, rewards, rules, wins,
  rotation, spinning, modalOpen, onBack, onDraw,
}: MedalLotterySubpageProps) {
  const [panel, setPanel] = useState<keyof typeof panelTitles | null>(null);
  const [selectedMedals, setSelectedMedals] = useState(() => new Set(availableMedals.map(medal => medal.id)));
  const [exchangeError, setExchangeError] = useState('');
  const [exchangeToast, setExchangeToast] = useState('');
  const [exchangePending, setExchangePending] = useState(false);
  const exchangeInProgress = useRef(false);
  const exchangeToastTimer = useRef<number | undefined>(undefined);
  const headingId = useId();
  const exchange = kind === 'exchange';
  const selectedIds = availableMedals.filter(medal => selectedMedals.has(medal.id)).map(medal => medal.id);
  const enoughCoins = balance >= MEDAL_LOTTERY_DRAW_COST;
  const drawCost = MEDAL_LOTTERY_DRAW_COST.toLocaleString('zh-CN');

  useEffect(() => () => window.clearTimeout(exchangeToastTimer.current), []);

  const toggleMedal = (id: string) => {
    setSelectedMedals(selected => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exchangeSelected = async () => {
    if (!selectedIds.length || exchangeInProgress.current) return;
    exchangeInProgress.current = true;
    setExchangePending(true);
    setExchangeError('');
    try {
      const coins = await onExchange(selectedIds);
      if (coins) {
        window.clearTimeout(exchangeToastTimer.current);
        setExchangeToast(`兑换成功，获得 ${coins.toLocaleString('zh-CN')} 金币`);
        exchangeToastTimer.current = window.setTimeout(() => setExchangeToast(''), 1800);
      } else {
        setExchangeError('未能兑换，请确认勋章状态后重试');
      }
    } catch {
      setExchangeError('暂时无法兑换，请重试');
    } finally {
      exchangeInProgress.current = false;
      setExchangePending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={exchange ? styles.screen : `${styles.screen} ${styles.wheelScreen}`} inert={modalOpen || panel !== null}>
        <header className={styles.nav}>
          <button type="button" onClick={onBack} disabled={spinning || exchangePending} aria-label={`返回${COIN_LOTTERY_NAME}`}>
            <ChevronLeft size={25} aria-hidden="true" />
          </button>
          <h1>{exchange ? '勋章兑金币' : '幸运大转盘'}</h1>
        </header>
        {exchange ? (
          <>
            <main className={styles.exchange} id="main-content">
              <section className={styles.exchangeCard}>
                <h2>我的金币 <strong>{balance.toLocaleString('zh-CN')}</strong></h2>
              </section>
              <section className={styles.exchangeCard}>
                <h2>可兑换勋章 <strong>{availableMedals.length}枚</strong></h2>
                <p>每枚勋章可兑换 {COINS_PER_LANDMARK_MEDAL.toLocaleString('zh-CN')} 金币</p>
                {availableMedals.length > 0 && (
                  <ul className={styles.medalGrid} aria-label="选择要兑换的勋章">
                    {availableMedals.map(medal => (
                      <li key={medal.id}>
                        <button type="button" disabled={exchangePending} aria-pressed={selectedMedals.has(medal.id)} onClick={() => toggleMedal(medal.id)}>
                          <MedalFace medal={medal} />
                          {selectedMedals.has(medal.id) && <span className={styles.medalCheck} aria-hidden="true"><Check size={11} /></span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className={styles.exchangeCard}>
                <h2>已兑换勋章 <strong>{exchangedMedals.length}枚</strong></h2>
                {exchangedMedals.length > 0 ? (
                  <ul className={styles.medalGrid + ' ' + styles.exchangedMedals}>
                    {exchangedMedals.map(medal => <li key={medal.id}><MedalFace medal={medal} /></li>)}
                  </ul>
                ) : <p className={styles.empty}><Medal size={21} aria-hidden="true" />暂无兑换记录</p>}
              </section>
            </main>
            <footer className={styles.exchangeFooter}>
              <div className={`toast toast--dark ${styles.exchangeToast}${exchangeToast ? ' is-visible' : ''}`} role="status">{exchangeToast}</div>
              {exchangeError && <p className={styles.exchangeError} role="alert">{exchangeError}</p>}
              <button type="button" disabled={exchangePending || !selectedIds.length} onClick={exchangeSelected}>
                {exchangePending ? '兑换中…' : !availableMedals.length ? '无可兑换的勋章' : selectedIds.length
                  ? `兑换 ${(selectedIds.length * COINS_PER_LANDMARK_MEDAL).toLocaleString('zh-CN')} 金币` : '请选择要兑换的勋章'}
              </button>
            </footer>
          </>
        ) : (
          <main className={styles.wheelPage} id="main-content">
            <div className={styles.banner}>
              <p>跑 遍 全 世 界</p>
              <strong aria-hidden="true">RUN THE WORLD</strong>
            </div>
            <div className={styles.links}>
              <button type="button" onClick={() => setPanel('rules')} disabled={spinning} aria-haspopup="dialog">活动规则</button>
              <button type="button" onClick={() => setPanel('prizes')} disabled={spinning} aria-haspopup="dialog">奖品清单</button>
            </div>
            <div className={styles.wheel}>
              <div className={styles.rim} aria-hidden="true">
                {wheelLights.map(angle => <i key={angle} style={{ rotate: angle + 'deg' }} />)}
              </div>
              <div className={styles.disk} style={{ '--wheel-rotation': `${rotation}deg` } as CSSProperties} aria-hidden="true">
                {rewards.map(({ level }, index) => (
                  <span className={styles.label} key={level} style={{ '--sector-angle': `${index * 60}deg` } as CSSProperties}>
                    <b>{level}</b>
                  </span>
                ))}
              </div>
              <div className={styles.hub}>
                <button type="button" onClick={onDraw} disabled={spinning || !enoughCoins || remainingPool === 0}
                  aria-label={spinning ? '抽奖中' : `开始抽奖，消耗 ${drawCost} 金币`}>
                  {spinning ? '抽奖中' : remainingPool === 0 ? '已抽完' : enoughCoins ? <>开始<br />抽奖</> : <>金币<br />不足</>}
                </button>
              </div>
            </div>
            <div className={styles.drawCost}>
              <span>每次消耗 <strong>{drawCost}</strong> 金币</span>
              {!enoughCoins && remainingPool > 0 && <button type="button" onClick={onGetCoins}>去兑换金币 <ChevronRight size={14} aria-hidden="true" /></button>}
            </div>
            <section className={styles.pool}>
              <h2>第{eventNumber}期奖池</h2>
              <div><span>剩 <strong>{remainingPool}</strong></span><span>总 <strong>{totalPool}</strong></span></div>
              <progress aria-label="剩余红包份数" value={remainingPool} max={totalPool} />
            </section>
            <div className={styles.stats}>
              <p>金币余额 <strong>{balance.toLocaleString('zh-CN')}</strong></p>
              <button type="button" onClick={() => setPanel('history')} disabled={spinning} aria-haspopup="dialog">
                我的奖品 <strong>{wins.length}</strong><ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </main>
        )}
      </div>
      {panel && (
        <Modal labelId={headingId} onClose={() => setPanel(null)} className={styles.dialog} backdropClassName={styles.backdrop}>
          <h2 id={headingId}>{panelTitles[panel]}</h2>
          {panel === 'rules' && rules}
          {panel === 'prizes' && (
            <ul>{rewards.map(({ level, amount, unit }) => <li key={level}><span>{level}</span><strong>{amount} {unit}</strong></li>)}</ul>
          )}
          {panel === 'history' && (
            wins.length
              ? <ol>{wins.map((amount, index) => <li key={index}><span>现金红包</span><strong>{amount}</strong></li>)}</ol>
              : <p>暂无奖品记录</p>
          )}
          <button type="button" onClick={() => setPanel(null)}>知道了</button>
        </Modal>
      )}
    </div>
  );
}
