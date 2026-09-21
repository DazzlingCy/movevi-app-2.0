import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, FileText, Sparkles } from 'lucide-react';

interface JourneyLevelViewProps {
  onBack: () => void;
}

const CURRENT_EXPERIENCE = 172;
const CURRENT_LEVEL_INDEX = 2;

const RANK_CARDS = [
  { level: 1, name: '青铜', goal: 80, value: 80, state: '已解锁', start: '#bb7950', mid: '#925234', end: '#61351f', ink: '#fff3e9', filter: 'sepia(.2) saturate(.82) brightness(.82)' },
  { level: 2, name: '白银', goal: 120, value: 120, state: '已解锁', start: '#e8edf4', mid: '#aeb9c9', end: '#697789', ink: '#243042', filter: 'grayscale(.9) brightness(1.18)' },
  { level: 3, name: '黄金', goal: 300, value: CURRENT_EXPERIENCE, state: '当前等级', start: '#f5d98c', mid: '#d9ab4f', end: '#b98236', ink: '#59380e', filter: 'saturate(1.04)' },
  { level: 4, name: '钻石', goal: 600, value: CURRENT_EXPERIENCE, state: '待解锁', start: '#8ee2e6', mid: '#55a9c5', end: '#35627f', ink: '#082d3d', filter: 'hue-rotate(145deg) saturate(.72) brightness(1.08)' },
  { level: 5, name: '星耀', goal: 1000, value: CURRENT_EXPERIENCE, state: '待解锁', start: '#9c9af4', mid: '#6968c8', end: '#393777', ink: '#17143f', filter: 'hue-rotate(218deg) saturate(.8) brightness(.92)' },
  { level: 6, name: '王者', goal: 1001, value: CURRENT_EXPERIENCE, state: '待解锁', start: '#f0af70', mid: '#ba5e62', end: '#702f54', ink: '#3d1322', filter: 'hue-rotate(318deg) saturate(.92) brightness(.9)' }
];

const LEVELS = [
  { level: 6, name: '王者', threshold: 1001, width: '100%' },
  { level: 5, name: '星耀', threshold: 601, width: '68%' },
  { level: 4, name: '钻石', threshold: 301, width: '44%' },
  { level: 3, name: '黄金', threshold: 121, width: '27%', current: true },
  { level: 2, name: '白银', threshold: 81, width: '16%' },
  { level: 1, name: '青铜', threshold: 0, width: '4%' }
];

export default function JourneyLevelView({ onBack }: JourneyLevelViewProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeLevelIndex, setActiveLevelIndex] = useState(CURRENT_LEVEL_INDEX);

  const showLevel = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const nextIndex = Math.min(RANK_CARDS.length - 1, Math.max(0, index));
    const carousel = carouselRef.current;
    const card = carousel?.children[nextIndex] as HTMLElement | undefined;
    if (!carousel || !card) return;
    carousel.scrollTo({ left: card.offsetLeft, behavior });
    setActiveLevelIndex(nextIndex);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => showLevel(CURRENT_LEVEL_INDEX, 'auto'));
    return () => window.cancelAnimationFrame(frame);
  }, [showLevel]);

  const syncActiveLevel = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = [...carousel.children] as HTMLElement[];
    const nearestIndex = cards.reduce((nearest, card, index) => (
      Math.abs(card.offsetLeft - carousel.scrollLeft) < Math.abs(cards[nearest].offsetLeft - carousel.scrollLeft) ? index : nearest
    ), 0);
    setActiveLevelIndex(nearestIndex);
  };

  return (
    <main className="journey-level-page" id="main-content">
      <header className="journey-level-header">
        <button type="button" onClick={onBack} aria-label="返回我的页面"><ChevronLeft /></button>
        <h1>等级</h1>
        <span aria-hidden="true" />
      </header>

      <div className="journey-level-content">
        <section className="journey-level-carousel" aria-label="等级卡片" aria-roledescription="轮播">
          <div className="journey-level-carousel__track" ref={carouselRef} onScroll={syncActiveLevel}>
            {RANK_CARDS.map((rank, index) => {
              const progress = Math.min(100, Math.round((rank.value / rank.goal) * 100));
              const cardStyle = {
                '--rank-card-start': rank.start,
                '--rank-card-mid': rank.mid,
                '--rank-card-end': rank.end,
                '--rank-card-ink': rank.ink,
                '--rank-badge-filter': rank.filter
              } as CSSProperties;
              return (
                <article
                  className={`journey-level-card${index === CURRENT_LEVEL_INDEX ? ' is-current' : ''}`}
                  style={cardStyle}
                  aria-label={`LV${rank.level} ${rank.name}，${rank.state}`}
                  aria-current={index === CURRENT_LEVEL_INDEX ? 'true' : undefined}
                  key={rank.level}
                >
                  <div className="journey-level-card__shine" aria-hidden="true" />
                  <span className="journey-level-card__eyebrow">{rank.state}</span>
                  <img className="journey-level-card__badge" src="/rank-bronze-badge.png" alt={`${rank.name}等级徽章`} />
                  <div className="journey-level-card__rank"><strong>LV{rank.level}</strong><span>{rank.name}</span></div>
                  <div className="journey-level-card__progress-copy">
                    <span>{rank.name}等级</span>
                    <span>经验值 <b>{rank.value}</b>/{rank.goal}</span>
                  </div>
                  <div className="journey-level-card__progress" role="progressbar" aria-label={`${rank.name}等级经验进度`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                    <i style={{ width: `${progress}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
          <div className="journey-level-carousel__controls">
            <button type="button" onClick={() => showLevel(activeLevelIndex - 1)} disabled={activeLevelIndex === 0} aria-label="查看上一等级"><ChevronLeft /></button>
            <div aria-label={`第 ${activeLevelIndex + 1} 张，共 ${RANK_CARDS.length} 张`}>
              {RANK_CARDS.map((rank, index) => <button type="button" className={activeLevelIndex === index ? 'is-active' : ''} onClick={() => showLevel(index)} aria-label={`查看 LV${rank.level} ${rank.name}`} aria-current={activeLevelIndex === index ? 'true' : undefined} key={rank.level} />)}
            </div>
            <button type="button" onClick={() => showLevel(activeLevelIndex + 1)} disabled={activeLevelIndex === RANK_CARDS.length - 1} aria-label="查看下一等级"><ChevronRight /></button>
          </div>
        </section>

        <section className="journey-level-panel">
          <div className="journey-level-details" aria-label="成长明细">
            <span><i><FileText /></i><strong>成长明细</strong></span>
            <ChevronRight aria-hidden="true" />
          </div>

          <section className="journey-level-table" aria-labelledby="journey-level-table-title">
            <div className="journey-level-section-title">
              <div><span><Sparkles /></span><div><h2 id="journey-level-table-title">等级升级对照表</h2><p>累计经验值，解锁更高等级</p></div></div>
              <span>当前 LV3</span>
            </div>
            <div className="journey-level-bars">
              {LEVELS.map(item => (
                <div className={item.current ? 'is-current' : ''} key={item.level}>
                  <span>{item.name}<small>LV{item.level}</small></span>
                  <i><b style={{ width: item.width }} /></i>
                  <strong>{item.threshold}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="journey-level-rules" aria-labelledby="journey-level-rules-title">
            <h2 id="journey-level-rules-title">经验值获取说明</h2>
            <ol>
              <li><span>1</span><p>每完成一条城市路线，经验值 <strong>+1</strong></p></li>
              <li><span>2</span><p>完成一座城市的所有路线，额外获得 <strong>+10</strong></p></li>
              <li><span>3</span><p>后续更新中将添加更多光迹值玩法，敬请期待</p></li>
            </ol>
          </section>
        </section>
      </div>
    </main>
  );
}
