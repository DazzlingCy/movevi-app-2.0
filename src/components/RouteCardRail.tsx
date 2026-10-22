import { useEffect, useLayoutEffect, useRef, type ReactNode, type PointerEvent } from 'react';
import styles from './RouteCardRail.module.css';

export default function RouteCardRail({ items, initialIndex = 0, onSelect }: { items: ReactNode[]; initialIndex?: number; onSelect: (index: number) => void }) {
  const railRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(initialIndex);
  const callbackRef = useRef(onSelect);
  const frameRef = useRef(0);
  const blockClickUntil = useRef(0);
  const dragRef = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  useEffect(() => { callbackRef.current = onSelect; }, [onSelect]);

  const nearestIndex = () => {
    const rail = railRef.current;
    if (!rail) return 0;
    const slides = [...rail.querySelectorAll<HTMLElement>('[data-route-slide]')];
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;
    slides.forEach((slide, index) => {
      const delta = Math.abs(slide.offsetLeft + slide.clientWidth / 2 - center);
      if (delta < distance) { nearest = index; distance = delta; }
    });
    return nearest;
  };
  const go = (index: number, animate = true) => {
    const rail = railRef.current;
    if (!rail) return;
    const slides = rail.querySelectorAll<HTMLElement>('[data-route-slide]');
    const slide = slides[Math.max(0, Math.min(slides.length - 1, index))];
    if (!slide) return;
    rail.scrollTo({ left: slide.offsetLeft - (rail.clientWidth - slide.clientWidth) / 2, behavior: animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  };
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(() => go(indexRef.current, false));
    observer.observe(rail);
    go(indexRef.current, false);
    return () => { observer.disconnect(); cancelAnimationFrame(frameRef.current); frameRef.current = 0; };
  }, [items.length]);

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.dataset.dragging = 'false';
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.moved) { blockClickUntil.current = performance.now() + 250; go(nearestIndex()); }
  };

  if (!items.length) return null;
  return <div className={styles.root}>
    <div ref={railRef} className={styles.rail} tabIndex={0} role="region" aria-label="路线卡片，可左右滑动或使用方向键切换"
      onScroll={() => {
        blockClickUntil.current = performance.now() + 120;
        if (frameRef.current) return;
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = 0;
          const index = nearestIndex();
          if (index !== indexRef.current) { indexRef.current = index; callbackRef.current(index); }
        });
      }}
      onKeyDown={event => {
        const index = event.key === 'ArrowLeft' ? indexRef.current - 1 : event.key === 'ArrowRight' ? indexRef.current + 1 : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
        if (index !== null) { event.preventDefault(); go(index); }
      }}
      onFocusCapture={event => {
        const slide = (event.target as HTMLElement).closest<HTMLElement>('[data-route-slide]');
        if (slide) go(Number(slide.dataset.routeSlide), false);
      }}
      onPointerDown={event => {
        if (event.pointerType === 'mouse' && event.button === 0) dragRef.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
      }}
      onPointerMove={event => {
        const drag = dragRef.current;
        if (!drag || drag.id !== event.pointerId) return;
        if (event.buttons === 0) { finishDrag(event); return; }
        const delta = event.clientX - drag.x;
        if (!drag.moved && Math.abs(delta) > 6) { drag.moved = true; event.currentTarget.dataset.dragging = 'true'; event.currentTarget.setPointerCapture(event.pointerId); }
        if (drag.moved) { event.preventDefault(); event.currentTarget.scrollLeft = drag.left - delta; }
      }}
      onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
      onClickCapture={event => { if (event.detail > 0 && performance.now() < blockClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}
      onDragStart={event => event.preventDefault()}
    >
      {items.map((item, index) => <div className={styles.slide} key={index} data-route-slide={index}>{item}</div>)}
    </div>
  </div>;
}
