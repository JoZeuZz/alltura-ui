import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useElasticScroll } from './useElasticScroll';

function makeRef<T extends HTMLElement>(el: T) {
  return { current: el };
}

function setupMatchMedia(reducedMotion = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((q: string) => ({
      matches: reducedMotion && q.includes('prefers-reduced-motion'),
      media: q,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function createContainer({ scrollTop = 0, clientHeight = 100, scrollHeight = 300 } = {}) {
  const container = document.createElement('div');
  const inner = document.createElement('div');
  container.appendChild(inner);
  document.body.appendChild(container);
  Object.defineProperty(container, 'scrollTop', { value: scrollTop, writable: true, configurable: true });
  Object.defineProperty(container, 'clientHeight', { value: clientHeight, writable: true, configurable: true });
  Object.defineProperty(container, 'scrollHeight', { value: scrollHeight, writable: true, configurable: true });
  return { container, inner };
}

function dispatchWheel(el: HTMLElement, deltaY: number) {
  el.dispatchEvent(new WheelEvent('wheel', { deltaY, bubbles: true }));
}

describe('useElasticScroll', () => {
  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    setupMatchMedia(false);
    rafCallback = null;
    vi.useFakeTimers();
    // stubGlobal must come AFTER useFakeTimers, since fake timers overrides rAF
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb;
      return 0;
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('applies translateY shift to firstElementChild on wheel at bottom boundary', () => {
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);

    renderHook(() => useElasticScroll(ref));
    dispatchWheel(container, 100);

    // Before rAF: shift applied
    expect(inner.style.transition).toBe('none');
    expect(inner.style.transform).toMatch(/translateY\(-\d+(\.\d+)?px\)/);
  });

  it('resets transform to translateY(0) with spring after rAF', () => {
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);

    renderHook(() => useElasticScroll(ref));
    dispatchWheel(container, 100);

    rafCallback!(0);

    expect(inner.style.transition).toBe('transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)');
    expect(inner.style.transform).toBe('translateY(0)');
  });

  it('applies positive translateY shift on wheel at top boundary', () => {
    const { container, inner } = createContainer({ scrollTop: 0, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);

    renderHook(() => useElasticScroll(ref));
    dispatchWheel(container, -100);

    expect(inner.style.transform).toMatch(/translateY\(\d+(\.\d+)?px\)/);
  });

  it('does not apply shift when scrolling mid-list (not at boundary)', () => {
    const { container, inner } = createContainer({ scrollTop: 100, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);

    renderHook(() => useElasticScroll(ref));
    dispatchWheel(container, 50);

    expect(inner.style.transform).toBe('');
  });

  it('caps displacement at maxDisplacement option', () => {
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);

    renderHook(() => useElasticScroll(ref, { maxDisplacement: 6 }));
    dispatchWheel(container, 1000);

    expect(inner.style.transform).toBe('translateY(-6px)');
  });

  it('does not register listeners when prefers-reduced-motion is active', () => {
    setupMatchMedia(true);
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);
    const spy = vi.spyOn(container, 'addEventListener');

    renderHook(() => useElasticScroll(ref));

    expect(spy).not.toHaveBeenCalled();
    dispatchWheel(container, 100);
    expect(inner.style.transform).toBe('');
  });

  it('does not register listeners when disabled option is true', () => {
    const { container } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);
    const spy = vi.spyOn(container, 'addEventListener');

    renderHook(() => useElasticScroll(ref, { disabled: true }));

    expect(spy).not.toHaveBeenCalled();
  });

  it('removes all event listeners on unmount', () => {
    const { container } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);
    const spy = vi.spyOn(container, 'removeEventListener');

    const { unmount } = renderHook(() => useElasticScroll(ref));
    unmount();

    expect(spy).toHaveBeenCalledWith('wheel', expect.any(Function));
    expect(spy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(spy).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  it('is a no-op when firstElementChild is null', () => {
    const container = document.createElement('div');
    // no inner child
    document.body.appendChild(container);
    const ref = makeRef(container);

    expect(() => renderHook(() => useElasticScroll(ref))).not.toThrow();
  });

  it('does not apply shift when document.body.overflow is hidden (modal open)', () => {
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);

    renderHook(() => useElasticScroll(ref));
    document.body.style.overflow = 'hidden';
    dispatchWheel(container, 100);

    expect(inner.style.transform).toBe('');

    document.body.style.overflow = '';
  });

  it('sets overscroll-behavior-y to contain on the container', () => {
    const { container } = createContainer({ scrollTop: 0, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);

    renderHook(() => useElasticScroll(ref));

    expect(container.style.overscrollBehaviorY).toBe('contain');
  });

  it('restores overscroll-behavior-y on unmount', () => {
    const { container } = createContainer({ scrollTop: 0, clientHeight: 100, scrollHeight: 300 });
    const ref = makeRef(container);

    const { unmount } = renderHook(() => useElasticScroll(ref));
    unmount();

    expect(container.style.overscrollBehaviorY).toBe('');
  });
});
