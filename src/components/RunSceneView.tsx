import { useLayoutEffect, useRef } from 'react';
import { Check, Clock3, Coffee, GalleryHorizontalEnd, Landmark, Route, Trees, Waves } from 'lucide-react';
import { CITY_CARD_MODE_LABEL, RUN_SCENES, runSceneImage, type RunScene } from '../journey/runScenes';
import styles from './RunSceneView.module.css';

const sceneIcons = { beach: Waves, forest: Trees, architecture: Landmark, midday: Coffee };
const sceneGroups = [
  { id: 'natural', label: '自然环境', upcoming: { label: '公路', image: 'road', icon: Route } },
  { id: 'lifestyle', label: '生活场景', upcoming: { label: '碎片时间', image: 'break-singapore', icon: Clock3 } },
] as const;

interface Props {
  selection: RunScene | null;
  onSelect: (scene: RunScene | null) => void;
  onUnavailable: () => void;
  onClose: () => void;
}

export default function RunSceneView({ selection, onSelect, onUnavailable, onClose }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const swipeDismissed = useRef(false);
  useLayoutEffect(() => headingRef.current?.focus({ preventScroll: true }), []);

  return (
    <div id="run-scene-content" className={styles.page} role="dialog" aria-modal="true" aria-labelledby="run-scene-title"
      onKeyDown={event => { if (event.key === 'Escape') onClose(); }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        swipeDismissed.current = false;
        swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
      }}
      onPointerCancel={() => { swipe.current = null; }}
      onPointerUp={event => {
        const start = swipe.current;
        swipe.current = null;
        if (!start || start.id !== event.pointerId) return;
        const distance = event.clientX - start.x;
        if (distance < 64 || distance <= Math.abs(event.clientY - start.y) * 1.4) return;
        swipeDismissed.current = true;
        onClose();
      }}
      onClickCapture={event => {
        if (event.detail && swipeDismissed.current) event.stopPropagation();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h1 id="run-scene-title" ref={headingRef} tabIndex={-1}>跑步模式</h1>
          <p>今天想怎么跑？</p>
        </header>
        <div className={styles.scroll}>
          <div className={styles.quick}>
              <button className={styles.cityMode} type="button" aria-pressed={selection === null} aria-description="按城市浏览跑步路线" onClick={() => onSelect(null)}>
                <GalleryHorizontalEnd size={20} strokeWidth={2} aria-hidden="true" />
                <span>{CITY_CARD_MODE_LABEL}</span>
                {selection === null && <Check className={styles.quickCheck} size={16} aria-hidden="true" />}
              </button>
          </div>
          {sceneGroups.map(group => (
            <section className={styles.catalog} key={group.id} aria-labelledby={`run-scene-${group.id}`}>
              <h2 id={`run-scene-${group.id}`}>{group.label}</h2>
              <div className={styles.tags}>
                {RUN_SCENES.filter(scene => scene.group === group.id).map(scene => {
                  const Icon = sceneIcons[scene.id];
                  const active = selection?.id === scene.id;
                  return <button key={scene.id} type="button" aria-pressed={active} onClick={() => onSelect(scene)}>
                    <img src={runSceneImage(scene.entries[0], 'thumbnail')} alt="" width={384} height={334} decoding="async" />
                    <span className={styles.tagLabel}><Icon size={17} aria-hidden="true" />{scene.label}</span>
                    {active && <Check className={styles.tagCheck} size={14} aria-hidden="true" />}
                  </button>;
                })}
                <button className={styles.upcoming} type="button" onClick={onUnavailable}>
                  <img src={runSceneImage(group.upcoming, 'thumbnail')} alt="" width={384} height={334} decoding="async" />
                  <span className={styles.tagLabel}><group.upcoming.icon size={17} aria-hidden="true" />{group.upcoming.label}</span>
                </button>
              </div>
            </section>
          ))}
        </div>
      </div>
      <button className={styles.dismissArea} type="button" onClick={onClose} aria-label="收起跑步模式" />
    </div>
  );
}
