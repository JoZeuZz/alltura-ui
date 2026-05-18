# Elastic Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `useElasticScroll` hook and `ElasticScrollArea` component to alltura-ui that apply a subtle elastic transform when a user over-scrolls a vertical container, then integrate them into AppLayout and Modal.

**Architecture:** A `useElasticScroll(containerRef, options?)` hook listens for `wheel` and touch events on a scroll container; when the user hits a boundary, it applies a temporary `translateY` shift to `firstElementChild` (the inner wrapper) and springs it back via CSS cubic-bezier. An `ElasticScrollArea` wrapper component builds on top of the hook for zero-config consumer use.

**Tech Stack:** React 18, TypeScript, Vitest + @testing-library/react + jsdom (new), no runtime deps added.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/hooks/useElasticScroll.ts` | Hook primitive |
| Create | `src/components/ElasticScrollArea.tsx` | Wrapper component |
| Modify | `src/layout/AppLayout.tsx` | Integrate hook on main + sidebar nav |
| Modify | `src/components/Modal.tsx` | Integrate hook on scroll body |
| Modify | `src/index.ts` | Export new hook + component |
| Create | `src/hooks/useElasticScroll.test.ts` | Hook unit tests |
| Create | `src/components/ElasticScrollArea.test.tsx` | Component unit tests |
| Create | `vitest.config.ts` | Test runner config |

---

## Task 1: Set up Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test script + devDependencies)

- [ ] **Step 1: Install test dependencies**

```bash
cd /home/proyectos/alltura-ui
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Expected: packages added to `node_modules`, no peer dep errors.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

- [ ] **Step 3: Create `src/test-setup.ts`**

```ts
// src/test-setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add `test` script to `package.json`**

In `package.json` under `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify Vitest runs (no tests yet)**

```bash
cd /home/proyectos/alltura-ui && npm test 2>&1 | tail -5
```

Expected: `No test files found` or exit 0 with 0 tests.

- [ ] **Step 6: Commit**

```bash
cd /home/proyectos/alltura-ui
git add vitest.config.ts src/test-setup.ts package.json package-lock.json
git commit -m "chore: add vitest + testing-library setup"
```

---

## Task 2: `useElasticScroll` hook (TDD)

**Files:**
- Create: `src/hooks/useElasticScroll.ts`
- Create: `src/hooks/useElasticScroll.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/hooks/useElasticScroll.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useElasticScroll } from './useElasticScroll';

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
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb;
      return 0;
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('applies translateY shift to firstElementChild on wheel at bottom boundary', () => {
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });

    renderHook(() => useElasticScroll(ref));
    dispatchWheel(container, 100);

    // Before rAF: shift applied
    expect(inner.style.transition).toBe('none');
    expect(inner.style.transform).toMatch(/translateY\(-\d+(\.\d+)?px\)/);
  });

  it('resets transform to translateY(0) with spring after rAF', () => {
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });

    renderHook(() => useElasticScroll(ref));
    dispatchWheel(container, 100);

    rafCallback!(0);

    expect(inner.style.transition).toBe('transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)');
    expect(inner.style.transform).toBe('translateY(0)');
  });

  it('applies positive translateY shift on wheel at top boundary', () => {
    const { container, inner } = createContainer({ scrollTop: 0, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });

    renderHook(() => useElasticScroll(ref));
    dispatchWheel(container, -100);

    expect(inner.style.transform).toMatch(/translateY\(\d+(\.\d+)?px\)/);
  });

  it('does not apply shift when scrolling mid-list (not at boundary)', () => {
    const { container, inner } = createContainer({ scrollTop: 100, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });

    renderHook(() => useElasticScroll(ref));
    dispatchWheel(container, 50);

    expect(inner.style.transform).toBe('');
  });

  it('caps displacement at maxDisplacement option', () => {
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });

    renderHook(() => useElasticScroll(ref, { maxDisplacement: 6 }));
    dispatchWheel(container, 1000);

    expect(inner.style.transform).toBe('translateY(-6px)');
  });

  it('does not register listeners when prefers-reduced-motion is active', () => {
    setupMatchMedia(true);
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });
    const spy = vi.spyOn(container, 'addEventListener');

    renderHook(() => useElasticScroll(ref));

    expect(spy).not.toHaveBeenCalled();
    dispatchWheel(container, 100);
    expect(inner.style.transform).toBe('');
  });

  it('does not register listeners when disabled option is true', () => {
    const { container, inner } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });
    const spy = vi.spyOn(container, 'addEventListener');

    renderHook(() => useElasticScroll(ref, { disabled: true }));

    expect(spy).not.toHaveBeenCalled();
  });

  it('removes all event listeners on unmount', () => {
    const { container } = createContainer({ scrollTop: 200, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });
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
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });

    expect(() => renderHook(() => useElasticScroll(ref))).not.toThrow();
  });

  it('sets overscroll-behavior-y to contain on the container', () => {
    const { container } = createContainer({ scrollTop: 0, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });

    renderHook(() => useElasticScroll(ref));

    expect(container.style.overscrollBehaviorY).toBe('contain');
  });

  it('restores overscroll-behavior-y on unmount', () => {
    const { container } = createContainer({ scrollTop: 0, clientHeight: 100, scrollHeight: 300 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, configurable: true });

    const { unmount } = renderHook(() => useElasticScroll(ref));
    unmount();

    expect(container.style.overscrollBehaviorY).toBe('');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /home/proyectos/alltura-ui && npm test 2>&1 | tail -20
```

Expected: multiple FAIL — `useElasticScroll` not found.

- [ ] **Step 3: Implement `useElasticScroll`**

```ts
// src/hooks/useElasticScroll.ts
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

    function applyElastic(delta: number): void {
      if (isAnimating) return;
      const shift = Math.sign(delta) * Math.min(Math.abs(delta) * 0.25, maxDisplacement);
      inner!.style.transition = 'none';
      inner!.style.transform = `translateY(${-shift}px)`;
      isAnimating = true;
      requestAnimationFrame(() => {
        inner!.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        inner!.style.transform = 'translateY(0)';
        setTimeout(() => { isAnimating = false; }, 520);
      });
    }

    function handleWheel(e: WheelEvent): void {
      const atTop = container.scrollTop <= 0;
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      if (e.deltaY < 0 && atTop) applyElastic(e.deltaY);
      else if (e.deltaY > 0 && atBottom) applyElastic(e.deltaY);
    }

    function handleTouchStart(e: TouchEvent): void {
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e: TouchEvent): void {
      const dy = touchStartY - e.changedTouches[0].clientY;
      const atTop = container.scrollTop <= 0;
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      if (dy < -10 && atTop) applyElastic(dy);
      else if (dy > 10 && atBottom) applyElastic(dy);
    }

    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.style.overscrollBehaviorY = '';
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef, maxDisplacement, disabled]);
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /home/proyectos/alltura-ui && npm test 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/hooks/useElasticScroll.ts src/hooks/useElasticScroll.test.ts
git commit -m "feat(hooks): add useElasticScroll hook"
```

---

## Task 3: `ElasticScrollArea` component (TDD)

**Files:**
- Create: `src/components/ElasticScrollArea.tsx`
- Create: `src/components/ElasticScrollArea.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/ElasticScrollArea.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ElasticScrollArea } from './ElasticScrollArea';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((q: string) => ({
      matches: false, media: q, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })),
  });
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { cb(0); return 0; });
});

describe('ElasticScrollArea', () => {
  it('renders children inside a double-div structure (container > inner)', () => {
    const { container } = render(
      <ElasticScrollArea>
        <p>content</p>
      </ElasticScrollArea>
    );
    const outer = container.firstElementChild!;
    const inner = outer.firstElementChild!;
    expect(inner).toBeTruthy();
    expect(inner.textContent).toBe('content');
  });

  it('applies className to outer container', () => {
    const { container } = render(
      <ElasticScrollArea className="overflow-y-auto h-64">
        <p>content</p>
      </ElasticScrollArea>
    );
    expect(container.firstElementChild!.className).toBe('overflow-y-auto h-64');
  });

  it('inner div has no className', () => {
    const { container } = render(
      <ElasticScrollArea>
        <p>content</p>
      </ElasticScrollArea>
    );
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toBe('');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /home/proyectos/alltura-ui && npm test 2>&1 | tail -20
```

Expected: FAIL — `ElasticScrollArea` not found.

- [ ] **Step 3: Implement `ElasticScrollArea`**

```tsx
// src/components/ElasticScrollArea.tsx
import React, { useRef } from 'react';
import { useElasticScroll, ElasticScrollOptions } from '../hooks/useElasticScroll';

export interface ElasticScrollAreaProps extends ElasticScrollOptions {
  children: React.ReactNode;
  className?: string;
}

export function ElasticScrollArea({
  children,
  className = '',
  maxDisplacement,
  disabled,
}: ElasticScrollAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useElasticScroll(containerRef, { maxDisplacement, disabled });

  return (
    <div ref={containerRef} className={className}>
      <div>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run all tests to confirm they pass**

```bash
cd /home/proyectos/alltura-ui && npm test 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/components/ElasticScrollArea.tsx src/components/ElasticScrollArea.test.tsx
git commit -m "feat(components): add ElasticScrollArea wrapper component"
```

---

## Task 4: Export from `src/index.ts`

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add exports after the existing hooks block**

In `src/index.ts`, find the hooks export section and add two new lines:

```ts
// after existing hook exports, e.g. after useMediaQuery export:
export { useElasticScroll } from './hooks/useElasticScroll';
export type { ElasticScrollOptions } from './hooks/useElasticScroll';
export { ElasticScrollArea } from './components/ElasticScrollArea';
export type { ElasticScrollAreaProps } from './components/ElasticScrollArea';
```

- [ ] **Step 2: Typecheck**

```bash
cd /home/proyectos/alltura-ui && npm run typecheck 2>&1 | grep -iE "error" | head -10
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/index.ts
git commit -m "feat: export useElasticScroll and ElasticScrollArea"
```

---

## Task 5: Integrate into AppLayout

**Files:**
- Modify: `src/layout/AppLayout.tsx`

There are two scroll containers in AppLayout:

**A — Main content** (`<main id="main-content">`, line ~524): currently renders `<Suspense>` as direct child. Need to add a `<div>` wrapper around `<Suspense>` so `firstElementChild` is a stable element, then attach the hook.

**B — Sidebar nav** (`<div className="flex-1 px-2 py-3 ... overflow-y-auto">`, line ~314): currently renders `{navItems.map(...)}` as direct children (multiple elements). Need a `<div>` wrapper, then attach the hook.

- [ ] **Step 1: Add `useRef` imports and `useElasticScroll` import**

At the top of `src/layout/AppLayout.tsx`, add `useRef` to the React import if not present, and add:

```ts
import { useElasticScroll } from '../hooks/useElasticScroll';
```

- [ ] **Step 2: Declare refs inside the component function**

In the `AppLayoutInner` component body (or wherever the main component's state is declared), add two refs:

```ts
const mainRef = useRef<HTMLElement>(null);
const sidebarNavRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 3: Call the hook twice inside the component**

Directly after the ref declarations:

```ts
useElasticScroll(mainRef, { maxDisplacement: 14 });
useElasticScroll(sidebarNavRef, { maxDisplacement: 8 });
```

- [ ] **Step 4: Attach `mainRef` and wrap main's children**

Find the `<main id="main-content" ...>` element (~line 524). Add `ref={mainRef}` and wrap its children in a single `<div>`:

```tsx
<main
  id="main-content"
  ref={mainRef}
  className="flex-1 w-full pt-4 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pt-6 sm:px-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] lg:pt-10 lg:px-10 lg:pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] overflow-y-auto"
>
  <div>
    <Suspense fallback={
      <div className="flex items-center justify-center h-64" aria-label="Cargando contenido">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <Outlet key={location.pathname} />
    </Suspense>
  </div>
</main>
```

- [ ] **Step 5: Attach `sidebarNavRef` and wrap nav items**

Find the sidebar nav div (~line 314). Add `ref={sidebarNavRef}` and wrap `{navItems.map(...)}` in a `<div>`:

```tsx
<div
  ref={sidebarNavRef}
  className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin"
>
  <div>
    {navItems.map((item, i) => renderNavItem(item, i))}
  </div>
</div>
```

- [ ] **Step 6: Typecheck**

```bash
cd /home/proyectos/alltura-ui && npm run typecheck 2>&1 | grep -iE "error" | head -10
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/layout/AppLayout.tsx
git commit -m "feat(AppLayout): integrate useElasticScroll on main content and sidebar nav"
```

---

## Task 6: Integrate into Modal

**Files:**
- Modify: `src/components/Modal.tsx`

Modal has two scroll modes:

**Non-`mobileFullscreen`** (default): the panel div itself has `overflow-y-auto` (line ~76). Children rendered directly inside the panel — no inner wrapper. Need: add a wrapper `<div>` around all panel content (header + children) so `firstElementChild` is stable.

**`mobileFullscreen`**: the `<div className="flex-1 overflow-y-auto ...">` at line ~140 is the scroll container with `{children}` directly inside. Need: wrap `{children}` in a `<div>`.

- [ ] **Step 1: Add `useElasticScroll` import and refs**

At the top of `src/components/Modal.tsx`:

```ts
import { useRef } from 'react'; // useRef is already imported — confirm and add if missing
import { useElasticScroll } from '../hooks/useElasticScroll';
```

Inside the `Modal` function body, add two refs and hook calls:

```ts
const nonFullscreenPanelRef = useRef<HTMLDivElement>(null);
const fullscreenBodyRef = useRef<HTMLDivElement>(null);
useElasticScroll(nonFullscreenPanelRef, { maxDisplacement: 14, disabled: mobileFullscreen });
useElasticScroll(fullscreenBodyRef, { maxDisplacement: 14, disabled: !mobileFullscreen });
```

> The `disabled` flag ensures each hook only activates for its relevant mode.

- [ ] **Step 2: Update non-fullscreen panel — add inner wrapper**

Find where the panel div renders in non-fullscreen mode (inside `<div ref={dialogPanelRef} ... className={panelCls}>` when `mobileFullscreen` is false). The current structure is:

```tsx
<div ref={dialogPanelRef} ... className={panelCls} ...>
  <div className={headerCls}>...</div>   {/* header */}
  {description && !externalDescId && <p ...>{description}</p>}
  {mobileFullscreen ? (
    <div className="flex-1 overflow-y-auto ...">...</div>
  ) : children}
</div>
```

Change so the panel ref for elastic scroll wraps all panel content in the non-fullscreen branch. Add `ref={nonFullscreenPanelRef}` to `dialogPanelRef`'s div and wrap the non-fullscreen content in one `<div>`:

```tsx
<div
  ref={(el) => {
    (dialogPanelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (nonFullscreenPanelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  }}
  role="dialog"
  aria-modal="true"
  aria-labelledby={effectiveTitleId}
  aria-describedby={effectiveDescId}
  className={panelCls}
  onClick={(e) => e.stopPropagation()}
  tabIndex={-1}
>
  {mobileFullscreen ? (
    <>
      <div className={headerCls}>
        {showInternalTitle && (
          <h2 id={internalTitleId} className="heading-4 text-content-primary">{title}</h2>
        )}
        <button ref={closeButtonRef} onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg text-content-disabled hover:text-content-secondary hover:bg-surface-overlay transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex-shrink-0" aria-label="Cerrar">
          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      {description && !externalDescId && <p id={internalDescId} className="sr-only">{description}</p>}
      <div ref={fullscreenBodyRef} className="flex-1 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pb-6 md:px-8 md:pb-8">
        <div>{children}</div>
      </div>
    </>
  ) : (
    <div>
      <div className={headerCls}>
        {showInternalTitle && (
          <h2 id={internalTitleId} className="heading-4 text-content-primary">{title}</h2>
        )}
        <button ref={closeButtonRef} onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg text-content-disabled hover:text-content-secondary hover:bg-surface-overlay transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex-shrink-0" aria-label="Cerrar">
          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      {description && !externalDescId && <p id={internalDescId} className="sr-only">{description}</p>}
      {children}
    </div>
  )}
</div>
```

> Note: The `ref` callback above assigns to both `dialogPanelRef` (needed by FocusTrap logic) and `nonFullscreenPanelRef` (needed by the elastic hook). For non-fullscreen mode, `firstElementChild` of this div will be the `<div>` inner wrapper.

- [ ] **Step 3: Typecheck**

```bash
cd /home/proyectos/alltura-ui && npm run typecheck 2>&1 | grep -iE "error" | head -10
```

Expected: no errors. If `dialogPanelRef` assignment via callback causes a type error, cast it:
```ts
(dialogPanelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
```

- [ ] **Step 4: Run all tests**

```bash
cd /home/proyectos/alltura-ui && npm test 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/components/Modal.tsx
git commit -m "feat(Modal): integrate useElasticScroll on scroll containers"
```

---

## Task 7: Build + version bump

**Files:**
- Modify: `package.json` (version field, managed by `npm version`)

- [ ] **Step 1: Run full build**

```bash
cd /home/proyectos/alltura-ui && npm run build 2>&1 | grep -iE "error|warn" | head -20
```

Expected: no errors. Dist files updated.

- [ ] **Step 2: Verify hook and component appear in dist**

```bash
grep -c "useElasticScroll\|ElasticScrollArea" /home/proyectos/alltura-ui/dist/alltura-ui.mjs
```

Expected: count > 0.

- [ ] **Step 3: Bump patch version**

```bash
cd /home/proyectos/alltura-ui && npm version patch
```

Expected: version bumped (e.g. `1.1.3` → `1.1.4`), git tag created.

- [ ] **Step 4: Publish (requires NODE_AUTH_TOKEN)**

If `NODE_AUTH_TOKEN` is set:
```bash
cd /home/proyectos/alltura-ui && npm publish && git push && git push --tags
```

If token is not available in this session, the build is ready — publish when the token is available:
```bash
export NODE_AUTH_TOKEN=<token>
cd /home/proyectos/alltura-ui && npm publish && git push && git push --tags
```

- [ ] **Step 5: Update consumer app**

In `/home/proyectos/herramientas/frontend`, update the package version and reinstall:

```bash
cd /home/proyectos/herramientas/frontend
npm install @jozeuZz/alltura-ui@<new-version>
npm run typecheck 2>&1 | grep -iE "error" | head -10
```

Expected: no errors. Consumer app now receives elastic scroll on AppLayout and Modal automatically.

---

## Self-Review Checklist

- [x] **Spec coverage**
  - ✅ `useElasticScroll` hook with `maxDisplacement`, `disabled`, `prefers-reduced-motion` — Task 2
  - ✅ `ElasticScrollArea` wrapper — Task 3
  - ✅ `overscroll-behavior-y: contain` set/restored — Task 2 Step 3 (hook implementation)
  - ✅ Exported from `index.ts` — Task 4
  - ✅ AppLayout main + sidebar integration — Task 5
  - ✅ Modal non-fullscreen + fullscreen integration — Task 6
  - ✅ `firstElementChild` null guard — Task 2 Step 3 (early return)
  - ✅ All tests listed in spec — Task 2 Step 1 (9 test cases covering all spec rows)
  - ✅ Version bump — Task 7

- [x] **No placeholders** — all steps have complete code

- [x] **Type consistency**
  - `ElasticScrollOptions` defined in Task 2, used in Task 3 and Task 5 correctly
  - `useElasticScroll` signature consistent across all tasks
  - `ElasticScrollAreaProps extends ElasticScrollOptions` consistent in Task 3 and Task 4 exports
