import { RefObject, useEffect } from 'react';

export interface ElasticScrollOptions {
  maxDisplacement?: number;
  disabled?: boolean;
}

export function useElasticScroll<T extends HTMLElement>(
  containerRef: RefObject<T>,
  options: ElasticScrollOptions = {}
): void {
  const { maxDisplacement = 14, disabled = false } = options;

  useEffect(() => {
    if (disabled) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = containerRef.current;
    if (!container) return;

    const inner = container.firstElementChild as HTMLElement | null;
    if (!inner) return;

    container.style.overscrollBehaviorY = 'contain';

    let isAnimating = false;
    let touchStartY = 0;
    let animationTimerId = 0;

    function applyElastic(delta: number): void {
      if (isAnimating) return;
      const shift = Math.sign(delta) * Math.min(Math.abs(delta) * 0.25, maxDisplacement);
      inner!.style.transition = 'none';
      inner!.style.transform = `translateY(${-shift}px)`;
      isAnimating = true;
      window.requestAnimationFrame(() => {
        inner!.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        inner!.style.transform = 'translateY(0)';
        animationTimerId = setTimeout(() => { isAnimating = false; }, 520) as unknown as number;
      });
    }

    function handleWheel(e: WheelEvent): void {
      const atTop = container!.scrollTop <= 0;
      const atBottom = container!.scrollTop + container!.clientHeight >= container!.scrollHeight - 1;
      if (e.deltaY < 0 && atTop) applyElastic(e.deltaY);
      else if (e.deltaY > 0 && atBottom) applyElastic(e.deltaY);
    }

    function handleTouchStart(e: TouchEvent): void {
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e: TouchEvent): void {
      const dy = touchStartY - e.changedTouches[0].clientY;
      const atTop = container!.scrollTop <= 0;
      const atBottom = container!.scrollTop + container!.clientHeight >= container!.scrollHeight - 1;
      if (dy < -10 && atTop) applyElastic(dy);
      else if (dy > 10 && atBottom) applyElastic(dy);
    }

    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      clearTimeout(animationTimerId);
      container.style.overscrollBehaviorY = '';
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef, maxDisplacement, disabled]);
}
