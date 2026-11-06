import { useId, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Footprints, PlugZap, Trophy, X } from 'lucide-react';
import { FIRST_CITY_REWARDS, FIRST_CITY_TASK_IDS, FIRST_CITY_TOTAL_CENTS, formatRewardCents, type FirstCityRewardClaim, type FirstCityRewardsState, type FirstCityTaskId } from '../journey/firstCityRewards';
import CityImage from './CityImage';
import Modal from './journey/Modal';
import styles from './FirstCityRewardsView.module.css';

interface FirstCityRewardsViewProps {
  state: FirstCityRewardsState;
  city: { name: string; image: string; total: number };
  storageFailed: boolean;
  onBack: () => void;
  onDevice: () => void;
  onContinue: (task: 'firstRoute' | 'firstCity') => void;
  onClaim: (id: FirstCityTaskId) => { success: boolean; message: string; claim?: FirstCityRewardClaim };
}

const taskCopy = {
  activation:{ title:'首次激活', Icon:PlugZap },
  firstRoute:{ title:'完成首条路线', Icon:Footprints },
  firstCity:{ title:'完成首座城市', Icon:Trophy }
};

function NewcomerRewardArt() {
  return <svg className={styles.rewardArt} viewBox="0 0 128 104" fill="none" aria-hidden="true" focusable="false">
    <path d="M11 72V45H29V72M30 72V25H48V72M86 72V39H100V72M102 72V20H116V72" fill="#373149" stroke="#645976" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M36 33H41M36 41H41M36 49H41M107 29H111M107 37H111M107 45H111" stroke="#90819F" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 83H103C115 83 120 91 107 95H22C8 95 4 89 17 83Z" fill="#4C425F" />
    <path d="M26 89H101" stroke="#8D7BA7" strokeWidth="1.5" strokeDasharray="5 5" strokeLinecap="round" />
    <circle cx="70" cy="28" r="7" fill="#DFD4FF" />
    <path d="M67 41L59 57L73 65L67 81M60 57L49 69L36 68M64 44L76 50L86 43M65 42L52 43L45 53" stroke="#C7B6FA" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="105" cy="69" r="13" fill="#EBC69B" stroke="#F3D9B8" strokeWidth="2" />
    <path d="M100 65L105 70L110 65M105 70V77M101 73H109" stroke="#8D633F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export default function FirstCityRewardsView({ state, city, storageFailed, onBack, onDevice, onContinue, onClaim }: FirstCityRewardsViewProps) {
  const [result, setResult] = useState<FirstCityRewardClaim | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId();
  const rulesTitleId = useId();
  const lastTaskRef = useRef<HTMLElement | null>(null);
  const claimedCents = state.claims.reduce((sum, claim) => sum + claim.amountCents, 0);
  const completed = Math.min(city.total, state.completedRouteIds.length);
  const closeResult = () => { setResult(null); window.requestAnimationFrame(() => lastTaskRef.current?.focus({ preventScroll:true })); };
  const claim = (id: FirstCityTaskId, task: HTMLElement | null) => {
    lastTaskRef.current = task;
    const response = onClaim(id);
    if (response.success && response.claim) { setError(''); setResult(response.claim); }
    else setError(response.message);
  };
  return <div className={styles.page}>
    <header className={styles.header} inert={!!result || rulesOpen || undefined}>
      <button type="button" aria-label="返回" onClick={onBack}><ChevronLeft size={22} /></button><h1>新手任务</h1><button className={styles.rulesButton} type="button" aria-haspopup="dialog" onClick={() => setRulesOpen(true)}>活动说明</button>
    </header>
    <main className={styles.content} inert={!!result || rulesOpen || undefined}>
      <section className={styles.intro} aria-label="活动奖励总额">
        <h2>完成新人任务，<br /><span className={styles.rewardLine}>累计获得现金奖励<strong>{FIRST_CITY_TOTAL_CENTS / 100}<span>元！</span></strong></span></h2>
        <NewcomerRewardArt />
        <div className={styles.collected}><span>已领取</span><strong>{formatRewardCents(claimedCents)}<small> / {formatRewardCents(FIRST_CITY_TOTAL_CENTS)}</small></strong></div>
      </section>
      {storageFailed && <p className={styles.error} role="alert">本地记录暂时无法保存，请检查浏览器存储后重试领取。</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.tasks} aria-label="新手奖励任务">
        {FIRST_CITY_TASK_IDS.map(id => {
          const { title, Icon } = taskCopy[id];
          const paid = state.claims.some(record => record.taskId === id);
          const achieved = state.achievedTaskIds.includes(id);
          const status = paid ? 'claimed' : achieved ? 'ready' : 'pending';
          const statusText = paid ? '任务已完成' : id === 'activation' ? '已激活' : '已完成';
          const amount = formatRewardCents(FIRST_CITY_REWARDS[id]);
          return <section className={`${styles.task} ${id === 'firstCity' ? styles.cityTask : ''}`} key={id} aria-label={title} data-task-id={id} data-state={status} tabIndex={-1}>
            <div className={styles.taskTop}>
              <span className={styles.taskIcon}><Icon size={21} aria-hidden="true" /></span>
              <h3>{title}</h3><strong className={styles.amount}>{amount}</strong>
            </div>
            {id !== 'firstCity' && <p className={styles.description}>{id === 'activation' ? '首次成功连接跑步机' : '完成首条路线'}</p>}
            {id === 'firstCity' && <div className={styles.cityProgress}>
              <CityImage src={city.image} alt="" fallbackLabel={city.name} loading="eager" className={styles.cityImage} />
              <div className={styles.cityCaption}><strong>{city.name}</strong><p>已完成 <b>{completed}</b><small> / {city.total} 条路线</small></p></div>
              <div className={styles.progressTrack} role="progressbar" aria-label={`${city.name}首城完成进度`} aria-valuemin={0} aria-valuemax={city.total} aria-valuenow={completed}><i style={{ width:`${city.total ? completed / city.total * 100 : 0}%` }} /></div>
            </div>}
            <div className={styles.taskBottom}>
              {(achieved || id === 'firstCity') && <span className={styles.status}>{achieved ? statusText : '完成首座城市'}</span>}
              <button className={styles.taskAction} type="button" disabled={paid} aria-haspopup={achieved && !paid ? 'dialog' : undefined} onClick={event => {
                if (achieved) claim(id, event.currentTarget.closest('section'));
                else if (id === 'activation') onDevice();
                else onContinue(id);
              }}>{paid && <Check size={14} aria-hidden="true" />}{paid ? '已领取' : achieved ? `领取 ${amount}` : id === 'activation' ? '去激活' : '去运动'}{!paid && !achieved && <ChevronRight size={14} aria-hidden="true" />}</button>
            </div>
          </section>;
        })}
      </div>
    </main>
    {rulesOpen && <div className={styles.resultLayer}><Modal labelId={rulesTitleId} onClose={() => setRulesOpen(false)} className={`${styles.resultDialog} ${styles.rulesDialog}`} backdropClassName={styles.resultBackdrop}>
      <button className={styles.close} type="button" onClick={() => setRulesOpen(false)} aria-label="关闭活动说明"><X size={19} /></button>
      <h2 id={rulesTitleId}>活动说明</h2><ol>
        <li>三项任务累计可领 {FIRST_CITY_TOTAL_CENTS / 100} 元，每项奖励每个账号仅限领取一次。</li>
        <li>首座城市确定后不随城市切换，重跑同一路线不增加完成数量。</li>
        <li>任务不设期限，已达成的奖励可随时领取。</li>
      </ol><button className={styles.confirm} type="button" onClick={() => setRulesOpen(false)}>知道了</button>
    </Modal></div>}
    {result && <div className={styles.resultLayer}><Modal labelId={titleId} onClose={closeResult} className={styles.resultDialog} backdropClassName={styles.resultBackdrop}>
      <button className={styles.close} type="button" onClick={closeResult} aria-label="关闭奖励提示"><X size={19} /></button>
      <span className={styles.resultIcon}><Check size={26} aria-hidden="true" /></span>
      <h2 id={titleId}>奖励已领取</h2><strong className={styles.resultAmount}>{formatRewardCents(result.amountCents)}</strong>
      <p>{taskCopy[result.taskId].title}奖励已记录</p>
      <button className={styles.confirm} type="button" onClick={closeResult}>知道了</button>
    </Modal></div>}
  </div>;
}
