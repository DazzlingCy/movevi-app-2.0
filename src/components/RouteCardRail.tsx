import { useEffect, useLayoutEffect, useRef, type ReactNode, type PointerEvent } from 'react';
import styles from './RouteCardRail.module.css';

interface Props {
  items: ReactNode[];
  initialIndex?: number;
  onSelect: (index: number) => void;
  onSwipePastStart?: () => void;
}

export default function RouteCardRail({ items, initialIndex = 0, onSelect, onSwipePastStart }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(initialIndex);
  const callbackRef = useRef(onSelect);
  const frameRef = useRef(0);
  const settleFrameRef = useRef(0);
  const slidesRef = useRef<{ element: HTMLElement; center: number }[]>([]);
  const blockClickUntil = useRef(0);
  const dragRef = useRef<{ id: number; x: number; y: number; left: number; moved: boolean; lastX: number; time: number; velocity: number } | null>(null);
  const edgeTouch = useRef<{ id: number; x: number; y: number } | null>(null);
  useEffect(() => { callbackRef.current = onSelect; }, [onSelect]);

  const prefersReducedMotion = (rail: HTMLDivElement) => rail.closest('[data-reduced-motion="true"]') !== null
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nearestIndex = (center: number) => {
    let nearest = 0;
    let distance = Infinity;
    slidesRef.current.forEach((slide, index) => {
      const delta = Math.abs(slide.center - center);
      if (delta < distance) { nearest = index; distance = delta; }
    });
    return nearest;
  };

  const updateSlides = (rail: HTMLDivElement) => {
    const width = rail.clientWidth;
    if (!width) return;
    const center = rail.scrollLeft + width / 2;
    slidesRef.current.forEach(({ element, center: slideCenter }) => {
      const distance = Math.min(1, Math.abs(slideCenter - center) / (width * .76));
      element.style.setProperty('--route-card-scale', (1 - distance * .045).toFixed(4));
    });
    const index = nearestIndex(center);
    if (index === indexRef.current) return;
    indexRef.current = index;
    callbackRef.current(index);
  };
  const go = (index: number, animate = true) => {
    const rail = railRef.current;
    if (!rail) return;
    const slides = slidesRef.current;
    const slide = slides[Math.max(0, Math.min(slides.length - 1, index))];
    if (!slide) return;
    rail.scrollTo({ left: slide.center - rail.clientWidth / 2, behavior: animate && !prefersReducedMotion(rail) ? 'smooth' : 'instant' });
  };

  const stopSettling = (rail: HTMLDivElement) => {
    if (!settleFrameRef.current) return;
    cancelAnimationFrame(settleFrameRef.current);
    settleFrameRef.current = 0;
    delete rail.dataset.settling;
  };
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => {
      stopSettling(rail);
      slidesRef.current = [...rail.querySelectorAll<HTMLElement>('[data-route-slide]')].map(element => ({
        element, center: element.offsetLeft + element.clientWidth / 2,
      }));
      go(indexRef.current, false);
      updateSlides(rail);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      stopSettling(rail);
    };
  }, [items.length]);

  const finishStartSwipe = (rail: HTMLDivElement, dx: number, dy: number) => {
    if (!onSwipePastStart || rail.scrollLeft > 2 || dx < 64 || dx <= Math.abs(dy) * 1.4) return false;
    blockClickUntil.current = performance.now() + 250;
    onSwipePastStart();
    return true;
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const rail = event.currentTarget;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    if (!drag.moved) return;

    const now = performance.now();
    blockClickUntil.current = now + 250;
    if (event.type === 'pointerup' && drag.left <= 2 && finishStartSwipe(rail, event.clientX - drag.x, event.clientY - drag.y)) {
      delete rail.dataset.dragging;
      return;
    }
    const velocity = now - drag.time < 85 ? drag.velocity : 0;
    const limit = rail.clientWidth * .32;
    const momentum = Math.min(limit, Math.max(-limit, velocity * 140));
    const start = rail.scrollLeft;
    const index = nearestIndex(start + rail.clientWidth / 2 + momentum);
    const target = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, slidesRef.current[index].center - rail.clientWidth / 2));

    // Keep snap disabled until the drag settles at its intended card.
    rail.dataset.settling = 'true';
    delete rail.dataset.dragging;
    if (prefersReducedMotion(rail) || Math.abs(target - start) < 1) {
      rail.scrollLeft = target;
      delete rail.dataset.settling;
      return;
    }
    const duration = Math.min(360, 205 + Math.abs(target - start) * .4);
    const step = (time: number) => {
      const progress = Math.min(1, (time - now) / duration);
      rail.scrollLeft = start + (target - start) * (1 - (1 - progress) ** 3);
      if (progress < 1) settleFrameRef.current = requestAnimationFrame(step);
      else {
        settleFrameRef.current = 0;
        delete rail.dataset.settling;
      }
    };
    settleFrameRef.current = requestAnimationFrame(step);
  };

  if (!items.length) return null;
  return <div className={styles.root}>
    <div ref={railRef} className={styles.rail} tabIndex={0} role="region" aria-label="路线卡片，可左右滑动或使用方向键切换"
      onScroll={event => {
        const rail = event.currentTarget;
        blockClickUntil.current = performance.now() + 120;
        if (frameRef.current) return;
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = 0;
          updateSlides(rail);
        });
      }}
      onKeyDown={event => {
        const index = event.key === 'ArrowLeft' ? indexRef.current - 1 : event.key === 'ArrowRight' ? indexRef.current + 1 : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
        if (index !== null) { event.preventDefault(); stopSettling(event.currentTarget); go(index); }
      }}
      onFocusCapture={event => {
        const slide = (event.target as HTMLElement).closest<HTMLElement>('[data-route-slide]');
        if (slide && (event.target as HTMLElement).matches(':focus-visible')) go(Number(slide.dataset.routeSlide), false);
      }}
      onTouchStart={event => {
        edgeTouch.current = null;
        if (!onSwipePastStart || event.touches.length !== 1 || event.currentTarget.scrollLeft > 2) return;
        const touch = event.touches[0];
        edgeTouch.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={event => {
        const start = edgeTouch.current;
        edgeTouch.current = null;
        if (!start) return;
        const touch = event.changedTouches[0];
        if (touch?.identifier === start.id) finishStartSwipe(event.currentTarget, touch.clientX - start.x, touch.clientY - start.y);
      }}
      onTouchCancel={() => { edgeTouch.current = null; }}
      onPointerDown={event => {
        stopSettling(event.currentTarget);
        if (event.pointerType === 'mouse' && event.button === 0) dragRef.current = {
          id: event.pointerId, x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, moved: false,
          lastX: event.clientX, time: performance.now(), velocity: 0,
        };
      }}
      onPointerMove={event => {
        const drag = dragRef.current;
        if (!drag || drag.id !== event.pointerId) return;
        if (event.buttons === 0) { finishDrag(event); return; }
        const delta = event.clientX - drag.x;
        if (!drag.moved && Math.abs(delta) > 6) { drag.moved = true; event.currentTarget.dataset.dragging = 'true'; event.currentTarget.setPointerCapture(event.pointerId); }
        if (drag.moved) {
          event.preventDefault();
          const now = performance.now();
          const speed = (drag.lastX - event.clientX) / Math.max(8, now - drag.time);
          drag.velocity = drag.velocity * .6 + speed * .4;
          drag.lastX = event.clientX;
          drag.time = now;
          event.currentTarget.scrollLeft = drag.left - delta;
        }
      }}
      onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
      onWheel={event => stopSettling(event.currentTarget)}
      onClickCapture={event => { if (event.detail > 0 && performance.now() < blockClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}
      onDragStart={event => event.preventDefault()}
    >
      {items.map((item, index) => <div className={styles.slide} key={index} data-route-slide={index}>{item}</div>)}
    </div>
  </div>;
}
