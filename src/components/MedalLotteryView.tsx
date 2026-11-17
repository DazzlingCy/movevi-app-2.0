import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Medal, Play, Sparkles, Trophy } from 'lucide-react';
import { COIN_LOTTERY_NAME, COINS_PER_LANDMARK_MEDAL, getMedalLotteryStock, MEDAL_LOTTERY_DRAW_COST, MEDAL_LOTTERY_POOL_SIZE, MEDAL_LOTTERY_PRIZES, type LandmarkMedal } from '../journey/medalLottery';
import Modal from './journey/Modal';
import MedalLotterySubpage from './MedalLotterySubpage';
import styles from './MedalLotteryView.module.css';

interface MedalLotteryViewProps {
  balance: number;
  wins: readonly number[];
  availableMedals: readonly LandmarkMedal[];
  exchangedMedals: readonly LandmarkMedal[];
  onExchange: (ids: readonly string[]) => Promise<number>;
  onBack: () => void;
  onGoRun: () => void;
  renderEarnings: (onBack: () => void) => ReactNode;
  onDraw: () => Promise<{ success: false; message: string } | { success: true; amount: string; prizeIndex: number }>;
}

const eventNumber = 16;
const imageBase = import.meta.env.BASE_URL + 'images/welfare/';
const oddsFormat = new Intl.NumberFormat('zh-CN', { style: 'percent', maximumFractionDigits: 2 });
const medalValue = COINS_PER_LANDMARK_MEDAL.toLocaleString('zh-CN');
const drawCost = MEDAL_LOTTERY_DRAW_COST.toLocaleString('zh-CN');

const stepItems = [
  { description: '跑完路线，获得景点勋章', action: '去跑步' },
  { description: `每枚勋章可兑换 ${medalValue} 金币`, action: '兑换金币' },
  { description: `消耗 ${drawCost} 金币抽一次现金红包`, action: '去抽奖' },
  { description: '前往「我的收益」提现', action: '去提现' },
];

const infoPanels = {
  rules: {
    title: '活动规则',
  },
  history: {
    title: '往期奖励公示',
    body: '暂无往期奖励公示。',
  },
  odds: {
    title: '中奖概率',
    body: '各档中奖概率按当前奖池的剩余份数计算。',
  },
};

type InfoPanel = keyof typeof infoPanels;

function LotteryRules() {
  return (
    <div className={styles.rules} role="region" aria-label="规则详情" tabIndex={0}>
      <section>
        <h3>一、参与方式</h3>
        <p>活动期间，金币余额充足且奖池还有剩余红包时，可前往「幸运大转盘」参与抽奖。</p>
      </section>
      <section>
        <h3>二、获取景点勋章</h3>
        <p>跑完路线可获得对应的景点勋章。每个主要景点对应 1 枚勋章，每条路线通常有 2–3 枚，具体以路线内容为准。</p>
      </section>
      <section>
        <h3>三、兑换金币与抽奖</h3>
        <p>在「福利」进入「金币抽奖」，点击「兑换金币」并选择勋章。每枚勋章可兑换 {medalValue} 金币，支持批量兑换。兑换所得计入金币余额。</p>
        <p>在「幸运大转盘」每次消耗 {drawCost} 金币抽取现金红包。兑换和扣费记录可在「金币明细」查看。</p>
      </section>
      <section>
        <h3>四、奖池与有效期</h3>
        <p>奖池抽完后，本期抽奖结束。各档中奖概率按当前奖池的剩余份数计算。未兑换的勋章和未使用的金币将保留至下期。</p>
      </section>
      <section>
        <h3>五、通用条款</h3>
        <p>参与者应遵守平台规则及活动约定。对作弊获取勋章、金币或恶意刷奖等行为，主办方可取消参与及获奖资格，并收回相关奖励。</p>
        <p>中奖记录可在「我的奖品」查看。提取现金奖励时，请前往「我的收益」申请提现，并核对提现信息。</p>
      </section>
    </div>
  );
}

export default function MedalLotteryView({
  balance, wins, availableMedals, exchangedMedals, onExchange, onBack, onGoRun, onDraw, renderEarnings,
}: MedalLotteryViewProps) {
  const [toast, setToast] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [info, setInfo] = useState<InfoPanel | null>(null);
  const [subpage, setSubpage] = useState<'exchange' | 'wheel' | 'earnings' | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const spinTimer = useRef<number | undefined>(undefined);
  const drawInProgress = useRef(false);
  const headingId = useId();
  const heading = (section: string) => headingId + '-' + section;
  const stock = getMedalLotteryStock(wins);
  const remainingPool = stock.reduce((total, count) => total + count, 0);

  useEffect(() => () => {
    window.clearTimeout(toastTimer.current);
    window.clearTimeout(spinTimer.current);
  }, []);

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(''), 2200);
  };

  const handleDraw = async () => {
    if (drawInProgress.current || !remainingPool || balance < MEDAL_LOTTERY_DRAW_COST) return;
    drawInProgress.current = true;
    setSpinning(true);
    const response = await onDraw().catch(() => ({ success: false as const, message: '暂时无法抽奖，请重试' }));
    if (response.success === false) {
      showToast(response.message);
      drawInProgress.current = false;
      setSpinning(false);
      return;
    }
    const { amount, prizeIndex } = response;
    setRotation(angle => (Math.floor(angle / 360) + 5) * 360 + (360 - prizeIndex * 60) % 360);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    spinTimer.current = window.setTimeout(() => {
      spinTimer.current = undefined;
      drawInProgress.current = false;
      setSpinning(false);
      setResult(amount);
    }, reducedMotion ? 0 : 2400);
  };

  const stepActions = [
    onGoRun,
    () => setSubpage('exchange'),
    () => setSubpage('wheel'),
    () => setSubpage('earnings'),
  ];

  const infoLink = (panel: InfoPanel) => (
    <button type="button" className={styles.sectionLink} onClick={() => setInfo(panel)} aria-haspopup="dialog">
      {infoPanels[panel].title}<ChevronRight size={16} aria-hidden="true" />
    </button>
  );

  return (
    <div className={styles.page}>
      <div className={styles.screen} hidden={subpage !== null} inert={result !== null || info !== null}>
        <header className={styles.nav}>
          <button type="button" className={styles.iconButton} onClick={onBack} aria-label="返回福利">
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
          <h1>{COIN_LOTTERY_NAME}</h1>
        </header>

        <main className={styles.scroll} id={subpage === null ? 'main-content' : undefined}>
          <div className={styles.hero} aria-hidden="true">
            <img src={imageBase + 'medal-lottery-wheel.webp'} alt="" width="1200" height="676" fetchPriority="high" />
          </div>

          <div className={styles.content}>
            <section className={styles.panel} aria-labelledby={heading('event')}>
              <div className={styles.sectionHeading}>
                <h2 id={heading('event')}>第{eventNumber}期{COIN_LOTTERY_NAME}</h2>
                {infoLink('rules')}
              </div>
              <div className={styles.eventBanner}>
                <p className={styles.eventTitle}><span>{COIN_LOTTERY_NAME}<Sparkles size={15} aria-hidden="true" /></span></p>
                <p className={styles.eventRates}>
                  <span>1 枚勋章兑 <strong>{medalValue}</strong> 金币</span>
                  <span>抽 1 次用 <strong>{drawCost}</strong> 金币</span>
                </p>
                <div className={styles.eventMetrics}>
                  <span><strong>1237</strong> 人报名</span>
                  <span className={styles.coinBalance}>金币余额 <strong>{balance.toLocaleString('zh-CN')}</strong></span>
                </div>

                <div className={styles.schedule}>
                  <div className={styles.scheduleTicket}>
                    <h3>本期活动 <small>（抽完截止）</small></h3>
                    <div className={styles.scheduleBody}>
                      <p>开始 <time dateTime="2025-09-01">2025/09/01</time></p>
                      <p>结束 <time dateTime="2025-09-30">2025/09/30</time></p>
                    </div>
                  </div>
                  <div className={styles.scheduleTicket}>
                    <h3>下期时间</h3>
                    <div className={styles.scheduleBody}>
                      <p>本期结束后的</p>
                      <p>1–3 个工作日</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.panel} aria-labelledby={heading('steps')}>
              <div className={styles.sectionHeading}><h2 id={heading('steps')}>参与步骤</h2></div>
              <ol className={styles.steps}>
                {stepItems.map(({ description, action }, index) => (
                  <li key={action}>
                    <span className={styles.stepNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <div className={styles.stepBody}>
                      <p>{description}</p>
                      <button type="button" className={styles.primary} onClick={stepActions[index]}>{action}</button>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.panel} aria-labelledby={heading('participation')}>
              <div className={styles.sectionHeading}><h2 id={heading('participation')}>参与规则</h2></div>
              <ol className={styles.ruleCards}>
                <li>
                  <div className={styles.ruleArt}>
                    <span>第1步</span>
                    <Medal size={54} strokeWidth={1.2} aria-hidden="true" />
                  </div>
                  <p>完成路线<br />获得景点勋章</p>
                </li>
                <li className={styles.ruleConnector} aria-hidden="true"><Play size={15} fill="currentColor" /></li>
                <li>
                  <div className={styles.ruleArt}>
                    <span>第2步</span>
                    <img src={imageBase + 'coin-purse-vermilion.webp'} width="544" height="363" loading="lazy" alt="" />
                  </div>
                  <p>勋章兑换金币<br />金币抽现金红包</p>
                </li>
              </ol>
            </section>

            <section className={styles.panel} aria-labelledby={heading('pool')}>
              <div className={styles.sectionHeading}>
                <h2 id={heading('pool')}>第{eventNumber}期奖池</h2>
                {infoLink('history')}
              </div>
              <div className={styles.poolBody}>
                <div>
                  <p>共 <strong>{MEDAL_LOTTERY_POOL_SIZE}</strong> 份红包</p>
                  <p className={styles.remaining}>剩余 <strong>{remainingPool}</strong> 份</p>
                </div>
                <div className={styles.poolArt} aria-hidden="true">
                  <Sparkles size={20} />
                  <div className={styles.poolPacket}><span>¥</span></div>
                </div>
              </div>
              <progress className={styles.poolProgress} aria-label="剩余红包份数" value={remainingPool} max={MEDAL_LOTTERY_POOL_SIZE} />
            </section>

            <section className={styles.panel} aria-labelledby={heading('prizes')}>
              <div className={styles.sectionHeading}>
                <h2 id={heading('prizes')}>第{eventNumber}期奖励</h2>
                {infoLink('odds')}
              </div>
              <ul className={styles.prizes}>
                {MEDAL_LOTTERY_PRIZES.map(({ level, amount, unit, count }) => (
                  <li key={level}>
                    <div className={styles.prizePacket}>
                      <div className={styles.prizeTicket}>
                        <span>现金红包</span>
                        <strong>{amount}<small>{unit}</small></strong>
                      </div>
                      <h3>{level}</h3>
                    </div>
                    <p>（{count}份）</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>
      </div>

      {subpage === 'earnings' && renderEarnings(() => setSubpage(null))}

      {(subpage === 'exchange' || subpage === 'wheel') && (
        <MedalLotterySubpage
          kind={subpage}
          balance={balance}
          availableMedals={availableMedals}
          exchangedMedals={exchangedMedals}
          onExchange={onExchange}
          onGetCoins={() => setSubpage('exchange')}
          eventNumber={eventNumber}
          totalPool={MEDAL_LOTTERY_POOL_SIZE}
          remainingPool={remainingPool}
          rewards={MEDAL_LOTTERY_PRIZES}
          rules={<LotteryRules />}
          wins={wins.map(index => {
            const { amount, unit } = MEDAL_LOTTERY_PRIZES[index];
            return amount + ' ' + unit;
          })}
          rotation={rotation}
          spinning={spinning}
          modalOpen={result !== null}
          onBack={() => { setToast(''); setSubpage(null); }}
          onDraw={handleDraw}
        />
      )}

      {info && (
        <Modal labelId={heading('info')} onClose={() => setInfo(null)} className={styles.dialog} backdropClassName={styles.backdrop}>
          <h2 id={heading('info')}>{infoPanels[info].title}</h2>
          {info === 'rules' ? <LotteryRules /> : <p>{infoPanels[info].body}</p>}
          {info === 'odds' && (
            <dl className={styles.odds}>
              {MEDAL_LOTTERY_PRIZES.map(({ level }, index) => (
                <div key={level}><dt>{level}</dt><dd>{oddsFormat.format(remainingPool ? stock[index] / remainingPool : 0)}</dd></div>
              ))}
            </dl>
          )}
          <button type="button" className={styles.primary} onClick={() => setInfo(null)}>知道了</button>
        </Modal>
      )}
      {result && (
        <Modal labelId={heading('result')} onClose={() => setResult(null)} className={styles.dialog + ' ' + styles.result} backdropClassName={styles.backdrop}>
          <Trophy size={32} aria-hidden="true" />
          <h2 id={heading('result')}>恭喜抽中</h2>
          <strong>{result}</strong>
          <button type="button" className={styles.primary} onClick={() => setResult(null)}>收下奖励</button>
        </Modal>
      )}
      {toast && <p className={styles.toast} role="status">{toast}</p>}
    </div>
  );
}
