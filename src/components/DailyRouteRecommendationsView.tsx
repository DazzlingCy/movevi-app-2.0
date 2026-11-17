import { useLayoutEffect, useRef } from 'react';
import { getRouteCategory } from '../data/routeCategories';
import { getRouteCover } from '../data/routeCovers';
import type { DailyRouteRecommendation } from '../journey/routeRecommendations';
import type { JourneyCity, JourneyRoute } from '../journey/types';
import { resolveRecommendationCover } from '../lib/localImages';
import CityImage from './CityImage';
import StickyHeroNav, { HeroBackButton } from './StickyHeroNav';
import styles from './DailyRouteRecommendationsView.module.css';

interface Props {
  cityImageFor: (city: JourneyCity) => string;
  day: string;
  recommendations: DailyRouteRecommendation[];
  scrollTop: number;
  onBack: () => void;
  onRouteClick: (route: JourneyRoute, position: number) => void;
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'UTC',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

export default function DailyRouteRecommendationsView({ cityImageFor, day, recommendations, scrollTop, onBack, onRouteClick }: Props) {
  const pageRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (pageRef.current) pageRef.current.scrollTop = scrollTop;
  }, [scrollTop]);

  return (
    <main ref={pageRef} className={styles.page} id="main-content">
      <StickyHeroNav overlapHero={false}>
        <HeroBackButton label="返回首页" onClick={onBack} />
      </StickyHeroNav>
      <div className={styles.content}>
        <header className={styles.listHeader}>
          <h1>每日推荐</h1>
          <time dateTime={day}>{dateFormatter.format(new Date(day))}</time>
        </header>
        {!recommendations.length ? <p className={styles.empty}>今日暂无推荐路线</p> : (
          <ul className={styles.routes} aria-label="每日推荐路线">
            {recommendations.map(({ city, route }, index) => {
              const featured = index === 0;
              const category = getRouteCategory(city.name, route.order);
              const cover = getRouteCover(city.name, route.order)?.src;
              return (
                <li key={route.id}>
                  <button type="button" className={styles.route + (featured ? ' ' + styles.featured : '')}
                    onClick={() => onRouteClick(route, pageRef.current?.scrollTop ?? 0)}>
                    <span className={styles.cover}>
                      <CityImage className={styles.image} src={cover ?? cityImageFor(city)}
                        optimizedSrc={resolveRecommendationCover(cover, featured ? 'feature' : 'thumbnail')}
                        alt="" fallbackLabel={route.landmarks[0]} loading={index < 3 ? 'eager' : 'lazy'}
                        fetchPriority={featured ? 'high' : 'low'} />
                    </span>
                    {featured && <span className={styles.kicker}>今日精选</span>}
                    <span className={styles.routeBody}>
                      <span className={styles.routeMeta}>{city.name}<span className={styles.routeType}>{category}</span></span>
                      <strong>{route.name}</strong>
                      {featured && <span className={styles.landmarks}>{route.landmarks.join(' · ')}</span>}
                    </span>
                    <span className={styles.metrics}>{route.distanceKm.toFixed(1)} km · 约 {route.durationMinutes} 分钟</span>
                    <span className={styles.action}>{featured ? '查看路线' : '查看'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
