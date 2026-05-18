# Elastic Scroll — Alltura UI Design Spec

**Date:** 2026-05-18  
**Status:** Approved  
**Scope:** `@jozeuZz/alltura-ui`

---

## Problem

All vertical scroll containers in alltura-ui reach their boundary with no visual feedback. The goal is to add a subtle elastic overscroll effect that communicates "no more content" in a way that feels deliberate and cohesive across the entire Alltura ecosystem — both inside alltura-ui itself and in consumer apps.

---

## Decision: Elastic Transform (Variant A)

When a user scrolls past the top or bottom boundary of a scrollable container, the inner content shifts slightly in the direction of the overscroll, then springs back with a cubic-bezier easing. No bounce libraries, no native CSS overscroll — pure JS + CSS transform.

Visual parameters:
- **Max displacement:** `14px` (main content), `8px` (sidebar nav — narrower, less room)
- **Spring easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — slight overshoot, snappy return
- **Spring duration:** `0.5s`
- **Trigger:** `wheel` event + `touchstart/touchend` at scroll boundary
- **Axis:** vertical only — horizontal scroll (ResponsiveTable) is excluded

Tone: sober, industrial. The displacement is small enough to read as "resistance" rather than playfulness.

---

## Architecture

```
alltura-ui/src/
  hooks/
    useElasticScroll.ts        ← primitive hook, exported
  components/
    ElasticScrollArea.tsx      ← convenience wrapper over the hook, exported
  layout/
    AppLayout.tsx              ← uses hook on main content + sidebar nav
    Modal.tsx                  ← uses hook on modal body scroll container
```

---

## Hook: `useElasticScroll`

### Signature

```ts
interface ElasticScrollOptions {
  maxDisplacement?: number; // default: 14
  disabled?: boolean;       // default: false
}

function useElasticScroll<T extends HTMLElement>(
  containerRef: RefObject<T>,
  options?: ElasticScrollOptions
): void
```

### Behavior

1. On mount, reads `containerRef.current` (the scroll container) and `containerRef.current.firstElementChild` (the inner element to transform).
2. Registers `wheel` and `touchstart`/`touchend` listeners on the container (passive).
3. On overscroll detected:
   - Applies `transform: translateY(±shift)` to the inner element with `transition: none`.
   - On the next animation frame, switches to `transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)` and resets to `translateY(0)`.
   - Guards with `isAnimating` flag — ignores new triggers while spring is in flight.
4. `shift = Math.sign(delta) * Math.min(Math.abs(delta) * 0.25, maxDisplacement)` — proportional to wheel delta, capped at max.
5. Sets `overscroll-behavior-y: contain` on the container element to prevent double-bounce on iOS Safari when the JS effect is active. Restored on unmount.
6. On unmount, removes all event listeners.
7. **Accessibility:** If `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true at mount time, the hook registers no listeners and returns immediately.
8. If `options.disabled === true`, same — no listeners registered.

### Constraints

- Requires the scroll container to have exactly one direct child element (the inner element). If `firstElementChild` is null, hook is a no-op.
- Does not mutate `will-change` or any other property beyond `transform` and `transition`.

---

## Component: `ElasticScrollArea`

### Signature

```tsx
interface ElasticScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxDisplacement?: number;
  disabled?: boolean;
}

function ElasticScrollArea(props: ElasticScrollAreaProps): JSX.Element
```

### Markup

```html
<div ref={containerRef} className={className}>
  <div ref={innerRef}>
    {children}
  </div>
</div>
```

The inner `<div>` is managed by the component. The outer div receives `className` — consumers must pass their own `overflow-y-auto` and height classes.

The component uses `useElasticScroll` internally, passing `containerRef` and options.

---

## Internal Integration

### AppLayout — main content

- **File:** `src/layout/AppLayout.tsx`
- **Target element:** `<main id="main-content">` (currently `overflow-y-auto`, line ~524)
- **Inner element:** the single `<div>` wrapping `{children}` inside main — already exists, no markup change needed.
- **Hook call:** `useElasticScroll(mainRef, { maxDisplacement: 14 })`
- **Change:** add `mainRef` to the `<main>` element.

### AppLayout — sidebar nav

- **File:** `src/layout/AppLayout.tsx`
- **Target element:** nav items container (currently `overflow-y-auto overflow-x-hidden scrollbar-thin`, line ~314)
- **Inner element:** the `<div>` wrapping nav items — verify at implementation time that a single child element exists, or wrap items in one if needed.
- **Hook call:** `useElasticScroll(sidebarNavRef, { maxDisplacement: 8 })`

### Modal — body

- **File:** `src/components/Modal.tsx`
- **Target element:** the scrollable body container inside the modal.
- **Inner element:** verify at implementation time. If no single inner child exists, wrap modal body content in a `<div>`.
- **Hook call:** `useElasticScroll(modalBodyRef, { maxDisplacement: 14 })`

> Implementation note: before touching AppLayout or Modal, read the current markup to confirm inner child structure. Add a wrapper `<div>` only if `firstElementChild` would be ambiguous.

---

## Exports

The following are added to alltura-ui's public API (`src/index.ts`):

```ts
export { useElasticScroll } from './hooks/useElasticScroll';
export type { ElasticScrollOptions } from './hooks/useElasticScroll';
export { ElasticScrollArea } from './components/ElasticScrollArea';
export type { ElasticScrollAreaProps } from './components/ElasticScrollArea';
```

---

## Consumer Usage

### Hook (advanced — consumer controls their own ref)

```tsx
import { useElasticScroll } from '@jozeuZz/alltura-ui';

const listRef = useRef<HTMLDivElement>(null);
useElasticScroll(listRef);

<div ref={listRef} className="overflow-y-auto h-64">
  <div> {/* inner element — required */}
    {items.map(...)}
  </div>
</div>
```

### Component (zero-config)

```tsx
import { ElasticScrollArea } from '@jozeuZz/alltura-ui';

<ElasticScrollArea className="overflow-y-auto h-64">
  {items.map(...)}
</ElasticScrollArea>
```

---

## Testing

**`useElasticScroll.test.ts`** (Vitest + jsdom):

| Test | Assertion |
|------|-----------|
| wheel down at bottom boundary | `transform: translateY(Npx)` applied then reset to `translateY(0)` |
| wheel up at top boundary | `transform: translateY(-Npx)` applied then reset |
| wheel mid-scroll (not at boundary) | no transform applied |
| `prefers-reduced-motion: reduce` | no listeners registered |
| `disabled: true` | no listeners registered |
| unmount | `removeEventListener` called for both `wheel` and touch events |
| `firstElementChild` is null | hook is no-op, no error thrown |

**`ElasticScrollArea.test.tsx`**:
- Renders outer container + inner div as `firstElementChild`
- `className` forwarded to outer container
- `children` rendered inside inner div

No visual/e2e tests — animation is CSS, not logic.

---

## Out of Scope

- `ResponsiveTable` horizontal scroll — excluded by design
- Keyboard scroll (arrow keys, Page Down) — wheel/touch only; keyboard scroll is handled by the browser and overscroll is rarely triggered
- Custom scrollbar styling — no change
- Momentum scroll tuning — no changes to `-webkit-overflow-scrolling`

---

## Version Impact

New minor version of alltura-ui after implementation. Consumer apps get the effect automatically on all alltura-ui scroll areas; opt-in via hook/component for their own containers.
