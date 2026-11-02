export const HOME_CAROUSEL_IDLE_MS = 900;

export function hasMeaningfulCarouselScroll(restingLeft: number, nextLeft: number): boolean {
  // Native snapping can adjust fractional pixels after the card has expanded.
  return Math.abs(nextLeft - restingLeft) > 2;
}

interface CarouselScheduler {
  delay(callback: () => void, ms: number): number;
  clearDelay(id: number): void;
  frame(callback: () => void): number;
  cancelFrame(id: number): void;
}

/** Keep browse mode stable while native snapping is being re-enabled. */
export function createCarouselSettler(scheduler: CarouselScheduler, beforeSettle: () => void, settle: () => void) {
  let timer: number | undefined;
  let frame: number | undefined;
  let revision = 0;
  const cancel = () => {
    revision++;
    if (timer !== undefined) scheduler.clearDelay(timer);
    if (frame !== undefined) scheduler.cancelFrame(frame);
    timer = undefined;
    frame = undefined;
  };
  const arm = () => {
    cancel();
    const current = revision;
    timer = scheduler.delay(() => {
      if (current !== revision) return;
      timer = undefined;
      beforeSettle();
      if (current !== revision) return;
      frame = scheduler.frame(() => {
        if (current !== revision) return;
        frame = undefined;
        frame = scheduler.frame(() => {
          if (current !== revision) return;
          frame = undefined;
          settle();
        });
      });
    }, HOME_CAROUSEL_IDLE_MS);
  };
  return { arm, cancel };
}
