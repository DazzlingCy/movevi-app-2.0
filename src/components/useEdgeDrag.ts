import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

// Convert screen movement to the player's coordinates, including its portrait rotation.
function inverseScreenTransform(element: HTMLElement) {
  let matrix = new DOMMatrix();
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const transform = getComputedStyle(node).transform;
    if (transform !== 'none') matrix = new DOMMatrix(transform).multiply(matrix);
  }
  return matrix.inverse();
}

export function useEdgeDrag(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const positionRef = useRef(position);
  const side = useRef<'left' | 'right'>('right');
  const gesture = useRef<{ id: number; clientX: number; clientY: number; x: number; y: number; inverse: DOMMatrix } | null>(null);

  function bounds() {
    const element = ref.current!;
    const parent = element.offsetParent as HTMLElement;
    const css = getComputedStyle(parent);
    const inset = (name: string) => parseFloat(css.getPropertyValue(name)) || 0;
    const left = Math.max(8, inset('--player-safe-left'));
    const right = Math.max(left, parent.clientWidth - element.offsetWidth - Math.max(8, inset('--player-safe-right')));
    const top = 64 + inset('--player-safe-top');
    const bottom = Math.max(top, parent.clientHeight - element.offsetHeight - 68 - inset('--player-safe-bottom'));
    return { left, right, top, bottom };
  }

  function move(x: number, y: number, snap = false) {
    const b = bounds();
    x = Math.max(b.left, Math.min(b.right, x));
    if (snap) {
      side.current = x < (b.left + b.right) / 2 ? 'left' : 'right';
      x = b[side.current];
    }
    const next = { x, y: Math.max(b.top, Math.min(b.bottom, y)) };
    positionRef.current = next;
    setPosition(next);
  }

  useEffect(() => {
    const element = ref.current;
    const parent = element?.offsetParent as HTMLElement | null;
    if (!enabled || !element || !parent) return;
    const observer = new ResizeObserver(() => {
      if (gesture.current || !positionRef.current) return;
      const b = bounds();
      move(b[side.current], positionRef.current.y);
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [enabled]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || !event.isPrimary || event.button !== 0 || gesture.current) return;
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget;
    gesture.current = {
      id: event.pointerId, clientX: event.clientX, clientY: event.clientY,
      x: element.offsetLeft, y: element.offsetTop,
      inverse: inverseScreenTransform(element.offsetParent as HTMLElement),
    };
    element.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    event.stopPropagation();
    const dx = event.clientX - start.clientX;
    const dy = event.clientY - start.clientY;
    const m = start.inverse;
    move(start.x + m.a * dx + m.c * dy, start.y + m.b * dx + m.d * dy);
  }

  function finish(event: PointerEvent<HTMLDivElement>) {
    if (gesture.current?.id !== event.pointerId) return;
    event.stopPropagation();
    gesture.current = null;
    setDragging(false);
    const element = event.currentTarget;
    move(element.offsetLeft, element.offsetTop, true);
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!enabled || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const b = bounds();
    const element = event.currentTarget;
    const x = event.key === 'ArrowLeft' ? b.left : event.key === 'ArrowRight' ? b.right : element.offsetLeft;
    const y = element.offsetTop + (event.key === 'ArrowUp' ? -24 : event.key === 'ArrowDown' ? 24 : 0);
    move(x, y, true);
  }

  return { ref, position, dragging, onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish, onLostPointerCapture: finish, onKeyDown };
}
