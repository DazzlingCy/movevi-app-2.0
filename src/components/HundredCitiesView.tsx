import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ChevronsRight, X, Zap } from 'lucide-react';
import CityImage from './CityImage';
import HundredCitiesInfoView from './HundredCitiesInfoView';
import Modal from './journey/Modal';
import styles from './HundredCitiesView.module.css';

interface CityLink { id: string; name: string; image: string }

interface HundredCitiesViewProps {
  cities: readonly CityLink[];
  onBack: () => void;
  onStart: () => void;
  onExploreCity: (id: string) => void;
}

const assets = `${import.meta.env.BASE_URL}images/welfare/hundred-cities-`;
const amountFormat = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const poolTarget = 10_000;
const previewPool = 6_000;
const previewCities = [
  { id: 'hangzhou', name: '杭州', subtitle: '中国 · 江南水乡', cards: 2, code: 'LT-2026-8888' },
  { id: 'tokyo', name: '东京', subtitle: '日本 · 传统与现代', cards: 2 },
  { id: 'paris', name: '巴黎', subtitle: '法国 · 浪漫之都', cards: 1 },
];
const metrics = [
  { label: '已获得城市卡', value: '12', image: 'city-card' },
  { label: '解锁路线', value: '122', unit: '/166', image: 'routes' },
  { label: '运动里程', value: '3656', unit: ' km', image: 'mileage' },
  { label: '本期已助力金额', value: '356.6', unit: ' 元', image: 'support' },
];
const steps = [
  { title: '完成路线探索', description: '跑完城市路线，解锁城市故事并获得城市碎片。', note: '收集城市碎片', image: 'explore' },
  { title: '集齐抽奖卡片', description: '集齐同一座城市的碎片，合成该城市的抽奖卡。', note: '每张卡对应一个抽奖码', image: 'collect' },
  { title: '参与圆梦抽奖', description: '奖池达到 10,000 元后，开放圆梦抽奖。', note: '抽取旅行大奖', image: 'draw' },
  { title: '获得圆梦旅行', description: '中奖后可从已完成的城市中选择旅行目的地。', note: '机票和五星级酒店', image: 'travel' },
];
const panels = {
  cities: '城市探索地图', draw: '开奖规则',
};
type Panel = keyof typeof panels | 'ranking' | 'rules';

export default function HundredCitiesView({ cities, onBack, onStart, onExploreCity }: HundredCitiesViewProps) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const modalTitle = useId();
  const backButton = useRef<HTMLButtonElement>(null);
  const panelTrigger = useRef<HTMLElement | null>(null);
  const infoPage = panel === 'ranking' || panel === 'rules' ? panel : null;
  const modal = panel === 'cities' || panel === 'draw' ? panel : null;
  const progress = Math.min(100, Math.floor(previewPool * 100 / poolTarget));
  const poolFull = progress === 100;

  useEffect(() => {
    backButton.current?.focus({ preventScroll: true });
  }, []);

  const openPanel = (kind: Panel, trigger: HTMLElement) => {
    panelTrigger.current = trigger;
    setPanel(kind);
  };
  const closePanel = () => {
    setPanel(null);
    requestAnimationFrame(() => panelTrigger.current?.focus({ preventScroll: true }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.screen} hidden={infoPage !== null} inert={panel !== null}>
        <header className={styles.nav}>
          <button type="button" ref={backButton} aria-label="返回福利" onClick={onBack}><ChevronLeft size={24} aria-hidden="true" /></button>
          <h1>百人百城·全球圆梦计划 <span>（第一期）</span></h1>
        </header>
        <main className={styles.scroll} id={infoPage ? undefined : 'main-content'}>
          <section className={styles.hero} aria-label="圆梦计划奖池">
            <img className={styles.heroArt} src={`${assets}hero.webp`} alt="" width="750" height="258" fetchPriority="high" />
            <div className={styles.heroActions}>
              <button type="button" onClick={event => openPanel('ranking', event.currentTarget)}>助力排名</button>
              <button type="button" onClick={event => openPanel('rules', event.currentTarget)}>活动规则</button>
            </div>
            <div className={styles.pool}>
              <div className={styles.poolHeader}>
                <h2>实时奖金池</h2>
                <div className={styles.poolUpdate}><strong>+¥0.6</strong><small>{poolFull ? '已满额' : '助力中'}</small></div>
              </div>
              <p><span>¥</span>{amountFormat.format(previewPool)}</p>
              <dl className={styles.funding}>
                <div><dt>奖金底池</dt><dd>¥1,000</dd></div>
                <div><dt>实时注资</dt><dd>每公里 +¥0.1</dd></div>
              </dl>
            </div>
            <button className={styles.start} type="button" onClick={onStart}>开启圆梦之旅 <ChevronsRight size={23} aria-hidden="true" /></button>
          </section>

          <div className={styles.content}>
            <dl className={styles.metrics} aria-label="我的活动数据">
              {metrics.map(({ label, value, unit, image }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd><span>{value}{unit && <small>{unit}</small>}</span>
                    <img src={`${assets}${image}.webp`} alt="" width="52" height="52" loading="lazy" />
                  </dd>
                </div>
              ))}
            </dl>

            <section aria-label="城市探索地图">
              <header className={styles.sectionHeader}>
                <h2>城市探索地图 <span className={styles.cityTotal}>（<strong>12</strong>/100）</span></h2>
                <button type="button" aria-haspopup="dialog" onClick={event => openPanel('cities', event.currentTarget)}>更多城市 <ChevronRight size={17} aria-hidden="true" /></button>
              </header>
              <ul className={styles.cityCards}>
                {previewCities.map(city => (
                  <li key={city.id}>
                    <button type="button" className={styles.cityCard} data-complete={city.cards === 2} onClick={() => onExploreCity(city.id)}>
                      <img src={`${assets}${city.id}.webp`} alt="" width="100" height="100" loading="lazy" />
                      <span className={styles.cityCopy}>
                        <span className={styles.cityHeading}><strong>{city.name}</strong>{city.code && <span className={styles.won}>已中奖</span>}</span>
                        <span className={styles.cityMeta}>{city.subtitle}{city.code && <span>{city.code}</span>}</span>
                        <span className={styles.cityProgress}>卡片收集进度 <span><strong>{city.cards}</strong>/2</span>
                          {city.cards === 2 ? <Check size={17} aria-hidden="true" /> : <Zap size={17} aria-hidden="true" />}
                        </span>
                        <progress aria-label={`${city.name}卡片收集进度`} max={2} value={city.cards} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="圆梦抽奖进度">
              <header className={styles.sectionHeader}>
                <h2>圆梦抽奖进度</h2>
                <button type="button" aria-haspopup="dialog" onClick={event => openPanel('draw', event.currentTarget)}>开奖规则 <ChevronRight size={17} aria-hidden="true" /></button>
              </header>
              <div className={styles.drawProgress}>
                <p>奖池进度 <strong>{progress}%</strong></p>
                <progress aria-label="圆梦抽奖奖池进度" max={100} value={progress} />
                <p>奖池进度达到 100% 时，开启抽奖通道 <span>{poolFull ? '已开启' : '待开启'}</span></p>
              </div>
            </section>

            <section aria-label="活动参与流程">
              <header className={styles.sectionHeader}><h2>活动参与流程</h2></header>
              <ol className={styles.steps}>
                {steps.map(({ title, description, note, image }, index) => (
                  <li key={title}>
                    <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                    <div className={styles.stepCard}>
                      <img src={`${assets}${image}.webp`} alt="" width="76" height="76" loading="lazy" />
                      <div><h3>{title}</h3><p>{description}</p><span>{note}</span></div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </main>
      </div>

      {infoPage && <HundredCitiesInfoView kind={infoPage} onBack={closePanel} />}

      {modal && (
        <Modal labelId={modalTitle} onClose={closePanel} className={styles.sheet} backdropClassName={styles.backdrop}>
          <header className={styles.sheetHeader}><h2 id={modalTitle}>{panels[modal]}</h2>
            <button type="button" onClick={closePanel} aria-label="关闭"><X size={20} aria-hidden="true" /></button>
          </header>
          {modal === 'draw' && (
            <ol className={styles.sheetRules}>
              <li>奖池达到 ¥10,000 时，开启抽奖通道。</li>
              <li>每张已集齐的城市抽奖卡对应一个抽奖码，可凭抽奖码参与。</li>
              <li>中奖者可选择一座已完成的城市参加圆梦旅行，费用包含机票和五星级酒店。</li>
            </ol>
          )}
          {modal === 'cities' && (
            <ul className={styles.cityList}>
              {cities.map(city => (
                <li key={city.id}><button type="button" onClick={() => onExploreCity(city.id)}>
                  <CityImage src={city.image} alt="" fallbackLabel={city.name} />{city.name}<ChevronRight size={16} aria-hidden="true" />
                </button></li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}
