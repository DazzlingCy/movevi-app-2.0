import { useId, useState } from 'react';
import { Play, ChevronLeft, MessageCircle, MapPin, AlignLeft, X, Lock, UserRound } from 'lucide-react';
import { getRouteData } from '../data/cities';
import CityImage from './CityImage';
import RouteRunners from './RouteRunners';
import Modal from './journey/Modal';
import type { CityRouteListItem } from './CityRoutesView';
import styles from './RouteDetailView.module.css';

interface RouteDetailViewProps {
  cityId: string;
  routeIndex: number;
  image: string;
  routeOverride?: CityRouteListItem;
  collectionIntent?: 'review' | 'collect';
  onBack: () => void;
  onStart: () => void;
}

interface RouteComment {
  text: string;
  createdAt: string;
}

function renderCommentEntry(comment: RouteComment, index: number) {
  return (
    <article key={index} className={styles.reviewEntry}>
      <div className={styles.reviewAuthor}>
        <span className={styles.reviewAvatar}><UserRound size={20} aria-hidden="true" /></span>
        <div><strong>我</strong><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString('zh-CN', { hour12: false })}</time></div>
      </div>
      <p>{comment.text}</p>
    </article>
  );
}

export default function RouteDetailView({ cityId, routeIndex, image, routeOverride, collectionIntent, onBack, onStart }: RouteDetailViewProps) {
  const routeData = routeOverride ?? getRouteData(cityId, routeIndex);
  const isLocked = routeOverride?.isUnlocked === false && !routeOverride?.isCompleted;
  const gradientId = useId();
  const commentTitleId = useId();
  const commentInputId = useId();
  const [showComments, setShowComments] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, RouteComment[]>>({});
  const routeKey = cityId + ':' + routeIndex;
  const draft = drafts[routeKey] ?? '';
  const routeComments = comments[routeKey] ?? [];
  const landmarks = routeData.spots.split(/\s*[—→]\s*/).filter(Boolean);
  const stats = [
    { value: routeData.distance, label: '预计里程', unit: 'km' },
    { value: routeData.duration, label: '预计时长', unit: 'min' },
    { value: routeData.calories, label: '预计消耗', unit: 'kcal' },
    { value: routeData.rating, label: '路线评分', unit: '分' },
  ];

  return (
    <div className={styles.page}>
      <main className={styles.scrollArea} inert={showComments || undefined}>
        <header className={styles.hero}>
          <CityImage src={routeOverride?.coverImage || image} alt="" fallbackLabel={routeData.title} className={styles.heroImage} loading="eager" fetchPriority="high" />
          <div className={styles.heroShade} />
          <button type="button" onClick={onBack} className={styles.back} aria-label="返回">
            <ChevronLeft size={22} />
          </button>
          <div className={styles.heroContent}>
            <h1>{routeData.title}</h1>
            <RouteRunners count={routeOverride?.runnerCount} avatars={routeOverride?.runnerAvatars} />
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.summary} aria-label="路线数据">
            <dl className={styles.stats}>
              {stats.map((stat, index) => (
                <div key={stat.label} className={index === 3 ? styles.rating : undefined}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}<span>{stat.unit}</span></dd>
                </div>
              ))}
            </dl>
            {/* Preserve the original illustrative curve; it is not measured elevation data. */}
            <div className={styles.chart} aria-hidden="true">
              <svg viewBox="0 0 400 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#74d8b6" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#74d8b6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0 80 Q 50 20 100 50 T 200 40 T 300 60 T 400 10 L 400 100 L 0 100 Z" fill={'url(#' + gradientId + ')'} />
                <path d="M 0 80 Q 50 20 100 50 T 200 40 T 300 60 T 400 10" fill="none" stroke="#74d8b6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="route-spots-title">
            <h2 id="route-spots-title"><MapPin size={18} aria-hidden="true" />路线景点</h2>
            <p className={styles.spots}>{landmarks.join(' → ')}</p>
          </section>
          <section className={styles.section} aria-labelledby="route-intro-title">
            <h2 id="route-intro-title"><AlignLeft size={18} aria-hidden="true" />路线简介</h2>
            <p>{routeData.intro}</p>
          </section>
          <section className={styles.section} aria-labelledby="route-reviews-title">
            <div className={styles.reviewsHeading}>
              <h2 id="route-reviews-title"><MessageCircle size={18} aria-hidden="true" />路线评论<span className={styles.reviewCount}>{routeComments.length}</span></h2>
            </div>
            {routeComments.length ? (
              <div>
                {routeComments.map(renderCommentEntry)}
                <p className={styles.reviewsEnd}>没有更多了</p>
              </div>
            ) : <div className={styles.reviewsEmpty}><MessageCircle size={26} aria-hidden="true" /><p>暂无评论，分享你的路线感受吧</p></div>}
          </section>
        </div>
      </main>

      <footer className={styles.actions} inert={showComments || undefined}>
        <button type="button" className={styles.commentButton} onClick={() => setShowComments(true)} aria-haspopup="dialog">
          <MessageCircle size={21} aria-hidden="true" /><span>评论</span>
        </button>
        <button type="button" disabled={isLocked} onClick={() => { if (!isLocked) onStart(); }} className={styles.startButton} title={isLocked ? '完成前序路线后解锁' : undefined}>
          {isLocked ? <Lock size={18} aria-hidden="true" /> : <Play size={18} fill="currentColor" aria-hidden="true" />}
          {isLocked ? '未解锁 · 暂不能开始' : collectionIntent === 'collect' ? '开始收集' : collectionIntent === 'review' ? '再跑一次' : '开始跑步'}
        </button>
      </footer>

      {showComments && (
        <div className={styles.modalLayer}>
          <Modal labelId={commentTitleId} onClose={() => setShowComments(false)} className={styles.commentSheet}>
            <div className={styles.commentHeader}>
              <h2 id={commentTitleId}>路线评论</h2>
              <button type="button" onClick={() => setShowComments(false)} aria-label="关闭评论"><X size={20} /></button>
            </div>
            <p className={styles.commentRoute}>{routeData.title}</p>
            <div className={styles.commentList} aria-live="polite">
              {routeComments.length ? routeComments.map(renderCommentEntry) : <div className={styles.empty}><MessageCircle size={28} aria-hidden="true" /><p>暂无评论，分享你的路线感受吧</p></div>}
            </div>
            <form onSubmit={event => {
              event.preventDefault();
              const text = draft.trim();
              if (!text) return;
              const comment = { text, createdAt: new Date().toISOString() };
              setComments(previous => ({ ...previous, [routeKey]: [...(previous[routeKey] ?? []), comment] }));
              setDrafts(previous => ({ ...previous, [routeKey]: '' }));
            }}>
              <label htmlFor={commentInputId}>写评论</label>
              <textarea id={commentInputId} tabIndex={0} value={draft} onChange={event => setDrafts(previous => ({ ...previous, [routeKey]: event.target.value }))} maxLength={500} rows={3} placeholder="这条路线给你留下了什么印象？" />
              <div className={styles.commentSubmit}><span>{draft.length}/500 · 仅本次预览可见</span><button type="submit" disabled={!draft.trim()}>发布（演示）</button></div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
