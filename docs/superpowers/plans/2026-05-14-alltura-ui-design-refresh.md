# Alltura UI v1.1.0 — Design Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Actualizar `alltura-ui` con los tokens de diseño v2 (Plus Jakarta Sans, paleta Azul Clásico refinada, sidebar `#2A64A4`, header blanco, bordes 8px, densidad confortable) y añadir cuatro nuevos componentes (`Button`, `StatusBadge`, `PageHeader`, `EmptyState`), luego publicar v1.1.0.

**Architecture:** Cambios en dos capas: (1) consumer app `epp-alltura/frontend` actualiza la fuente tipográfica en su CSS/config, (2) `alltura-ui` actualiza `AppLayout` y añade nuevos componentes que serán exportados desde `index.ts`. Sin cambios de API pública.

**Tech Stack:** React 18 + TypeScript + Tailwind CSS (tokens via CSS vars en consumer app) + Vite + npm publish a GitHub Packages.

---

## Mapa de archivos

| Acción | Ruta |
|---|---|
| Modificar | `herramientas/frontend/src/index.css` |
| Modificar | `herramientas/frontend/tailwind.config.js` |
| Modificar | `alltura-ui/src/layout/AppLayout.tsx` |
| Crear | `alltura-ui/src/components/Button.tsx` |
| Crear | `alltura-ui/src/components/StatusBadge.tsx` |
| Crear | `alltura-ui/src/components/PageHeader.tsx` |
| Crear | `alltura-ui/src/components/EmptyState.tsx` |
| Modificar | `alltura-ui/src/index.ts` |
| Modificar | `alltura-ui/package.json` |

---

## Task 1: Cambiar tipografía a Plus Jakarta Sans (consumer app)

**Files:**
- Modify: `herramientas/frontend/src/index.css` líneas 1
- Modify: `herramientas/frontend/tailwind.config.js` línea ~107 (`fontFamily`)

- [ ] **Step 1: Cambiar Google Fonts import en index.css**

En `herramientas/frontend/src/index.css`, reemplazar la primera línea:

```css
/* ANTES */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* DESPUÉS */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
```

- [ ] **Step 2: Actualizar fontFamily en tailwind.config.js**

En `herramientas/frontend/tailwind.config.js`, buscar la sección `fontFamily` dentro de `theme.extend` y reemplazar:

```js
// ANTES
fontFamily: {
  sans: ['Inter', 'Poppins', 'sans-serif'],
},

// DESPUÉS
fontFamily: {
  sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
},
```

- [ ] **Step 3: Verificar build del consumer app**

```bash
cd /home/proyectos/herramientas/frontend
npm run build 2>&1 | tail -20
```

Expected: build exitoso, sin errores de compilación.

- [ ] **Step 4: Commit**

```bash
cd /home/proyectos/herramientas
git add frontend/src/index.css frontend/tailwind.config.js
git commit -m "feat(ui): migrate typography to Plus Jakarta Sans"
```

---

## Task 2: Actualizar AppLayout — sidebar y header

**Files:**
- Modify: `alltura-ui/src/layout/AppLayout.tsx`

El sidebar actualmente usa `bg-dark-blue` (`#1E2A4A`). El header también usa `bg-dark-blue`. Cambiar a: sidebar = `bg-primary` (`#2A64A4`), header = blanco con borde.

- [ ] **Step 1: Actualizar constante darkFocusRing**

En `AppLayout.tsx`, buscar y reemplazar la línea ~56:

```ts
// ANTES
const darkFocusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-[#1E2A4A]';

// DESPUÉS
const darkFocusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-primary';
```

- [ ] **Step 2: Actualizar activeLinkCls y linkCls**

Buscar la sección de nav link classes (~línea 175) y reemplazar:

```ts
// ANTES
const activeLinkCls = `relative flex items-center px-3 py-2.5 rounded-lg text-white bg-primary min-h-[44px]
  ...`;

// DESPUÉS — activo con overlay blanco sobre sidebar azul
const activeLinkCls = `relative flex items-center px-3 py-2.5 rounded-lg text-white bg-white/20 min-h-[44px]
  ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${darkFocusRing} transition-colors duration-150`;

const linkCls = `relative flex items-center px-3 py-2.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 min-h-[44px]
  ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${darkFocusRing} transition-colors duration-150`;
```

> **Nota:** Leer las líneas exactas 175-192 del archivo antes de editar para capturar la implementación completa de ambas variables `activeLinkCls` y `linkCls`.

- [ ] **Step 3: Cambiar bg del sidebar de dark-blue a primary**

Buscar `bg-dark-blue` en AppLayout.tsx (~línea 275) dentro del `<nav>` del sidebar:

```tsx
// ANTES
className={`fixed lg:static inset-y-0 left-0 z-40 bg-dark-blue text-white flex flex-col
  ...`}

// DESPUÉS
className={`fixed lg:static inset-y-0 left-0 z-40 bg-primary text-white flex flex-col
  ...`}
```

- [ ] **Step 4: Cambiar el header de dark a blanco**

Buscar el `<header>` (~línea 361) con `bg-dark-blue`:

```tsx
// ANTES
className="bg-dark-blue text-white flex items-center gap-[var(--shell-header-gap)] ... shadow-md border-b border-white/10 ..."

// DESPUÉS
className="bg-surface text-content-primary flex items-center gap-[var(--shell-header-gap)] ... shadow-sm border-b border-edge ..."
```

- [ ] **Step 5: Ajustar iconos del header (menu toggle + perfil) de white a dark**

En el header hay botones que usan `text-white` o `text-gray-*`. Cambiar a tokens semánticos oscuros. Buscar los botones de toggle y perfil dentro del `<header>` y cambiar:
- `text-white` → `text-content-secondary`
- `hover:text-gray-200` → `hover:text-content-primary`
- `hover:bg-gray-700` → `hover:bg-surface-overlay`

- [ ] **Step 6: Ajustar el logo del header para verse en fondo blanco**

El logo `<img>` del header se muestra cuando `showHeaderLogo` es true. Verificar que siga siendo visible en fondo blanco (el logo puede ser oscuro ya — no cambiar). Si el logo es blanco/claro, se necesitará un toggle condicional. Revisar visualmente.

- [ ] **Step 7: Verificar build de alltura-ui**

```bash
cd /home/proyectos/alltura-ui
npm run build 2>&1 | tail -20
```

Expected: build exitoso sin errores TypeScript.

- [ ] **Step 8: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/layout/AppLayout.tsx
git commit -m "feat(AppLayout): sidebar bg primary, header blanco, nav items white overlay"
```

---

## Task 3: Crear componente Button

**Files:**
- Create: `alltura-ui/src/components/Button.tsx`

- [ ] **Step 1: Crear el archivo**

Crear `alltura-ui/src/components/Button.tsx` con el siguiente contenido:

```tsx
import React from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'secondary';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantCls: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-content-inverse hover:bg-primary-hover border border-transparent focus-visible:ring-primary',
  ghost:
    'bg-transparent text-primary hover:bg-primary-light border border-primary focus-visible:ring-primary',
  danger:
    'bg-danger text-content-inverse hover:bg-red-700 border border-transparent focus-visible:ring-danger',
  secondary:
    'bg-surface text-content-secondary hover:bg-surface-overlay border border-edge focus-visible:ring-primary',
};

const sizeCls: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
  md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
  lg: 'px-5 py-2.5 text-base gap-2 min-h-[48px]',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={[
          'inline-flex items-center justify-center rounded-lg font-semibold',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          variantCls[variant],
          sizeCls[size],
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {loading ? (
          <span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        ) : (
          leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
```

- [ ] **Step 2: Verificar build**

```bash
cd /home/proyectos/alltura-ui
npm run build 2>&1 | tail -10
```

Expected: sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/components/Button.tsx
git commit -m "feat(Button): add primary/ghost/danger/secondary variants with loading state"
```

---

## Task 4: Crear componente StatusBadge

**Files:**
- Create: `alltura-ui/src/components/StatusBadge.tsx`

- [ ] **Step 1: Crear el archivo**

Crear `alltura-ui/src/components/StatusBadge.tsx`:

```tsx
import React from 'react';

export type StatusVariant =
  | 'active'      // verde — asignado y vigente
  | 'inactive'    // gris — dado de baja / sin asignar
  | 'pending'     // azul — en proceso
  | 'expiring'    // ámbar — próximo a vencer
  | 'expired'     // rojo — vencido
  | 'in-stock';   // info — disponible en bodega

export interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const config: Record<StatusVariant, { dot: string; badge: string; defaultLabel: string }> = {
  active: {
    dot:   'bg-success',
    badge: 'bg-success-subtle text-success-text border border-success-border',
    defaultLabel: 'Activo',
  },
  inactive: {
    dot:   'bg-content-disabled',
    badge: 'bg-surface-overlay text-content-muted border border-edge',
    defaultLabel: 'Inactivo',
  },
  pending: {
    dot:   'bg-primary',
    badge: 'bg-primary-light text-primary border border-primary/30',
    defaultLabel: 'Pendiente',
  },
  expiring: {
    dot:   'bg-warning',
    badge: 'bg-warning-subtle text-warning-text border border-warning-border',
    defaultLabel: 'Por vencer',
  },
  expired: {
    dot:   'bg-danger',
    badge: 'bg-danger-subtle text-danger-text border border-danger-border',
    defaultLabel: 'Vencido',
  },
  'in-stock': {
    dot:   'bg-info',
    badge: 'bg-info-subtle text-info-text border border-info-border',
    defaultLabel: 'En bodega',
  },
};

const sizeCls = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-0.5 gap-1.5',
};

const dotSizeCls = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

export default function StatusBadge({
  variant,
  label,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const { dot, badge, defaultLabel } = config[variant];
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-semibold',
        badge,
        sizeCls[size],
        className,
      ].join(' ')}
    >
      <span className={['rounded-full flex-shrink-0', dot, dotSizeCls[size]].join(' ')} aria-hidden="true" />
      {label ?? defaultLabel}
    </span>
  );
}
```

- [ ] **Step 2: Verificar build**

```bash
cd /home/proyectos/alltura-ui
npm run build 2>&1 | tail -10
```

Expected: sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/components/StatusBadge.tsx
git commit -m "feat(StatusBadge): add EPP status badge (active/inactive/pending/expiring/expired/in-stock)"
```

---

## Task 5: Crear componente PageHeader

**Files:**
- Create: `alltura-ui/src/components/PageHeader.tsx`

- [ ] **Step 1: Crear el archivo**

Crear `alltura-ui/src/components/PageHeader.tsx`:

```tsx
import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  className?: string;
}

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

export default function PageHeader({
  title,
  subtitle,
  actions,
  backHref,
  onBack,
  className = '',
}: PageHeaderProps) {
  const hasBack = backHref || onBack;

  return (
    <div className={['flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between', className].join(' ')}>
      <div className="flex items-start gap-3 min-w-0">
        {hasBack && (
          <a
            href={backHref ?? '#'}
            onClick={
              onBack
                ? (e) => {
                    if (!backHref) e.preventDefault();
                    onBack();
                  }
                : undefined
            }
            className="flex-shrink-0 mt-1 inline-flex items-center justify-center w-7 h-7 rounded-md text-content-muted hover:text-content-primary hover:bg-surface-overlay transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            aria-label="Volver"
          >
            <BackIcon />
          </a>
        )}
        <div className="min-w-0">
          <h1 className="heading-4 text-content-primary truncate">{title}</h1>
          {subtitle && (
            <p className="body-small text-content-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```bash
cd /home/proyectos/alltura-ui
npm run build 2>&1 | tail -10
```

Expected: sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/components/PageHeader.tsx
git commit -m "feat(PageHeader): add title/subtitle/actions/back navigation header"
```

---

## Task 6: Crear componente EmptyState

**Files:**
- Create: `alltura-ui/src/components/EmptyState.tsx`

- [ ] **Step 1: Crear el archivo**

Crear `alltura-ui/src/components/EmptyState.tsx`:

```tsx
import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

const DefaultIcon = () => (
  <svg
    className="w-10 h-10"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className,
      ].join(' ')}
    >
      <div className="text-content-disabled mb-4">{icon ?? <DefaultIcon />}</div>
      <p className={['font-semibold text-content-primary', compact ? 'text-sm' : 'text-base'].join(' ')}>
        {title}
      </p>
      {description && (
        <p className={['text-content-muted mt-1', compact ? 'text-xs' : 'text-sm'].join(' ')}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```bash
cd /home/proyectos/alltura-ui
npm run build 2>&1 | tail -10
```

Expected: sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/components/EmptyState.tsx
git commit -m "feat(EmptyState): add empty state with icon/title/description/action slots"
```

---

## Task 7: Exportar nuevos componentes desde index.ts

**Files:**
- Modify: `alltura-ui/src/index.ts`

- [ ] **Step 1: Añadir exports**

En `alltura-ui/src/index.ts`, después de la exportación de `TourOverlay` (~línea 17), añadir:

```ts
export { default as Button } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';
export { default as StatusBadge } from './components/StatusBadge';
export type { StatusBadgeProps, StatusVariant } from './components/StatusBadge';
export { default as PageHeader } from './components/PageHeader';
export type { PageHeaderProps } from './components/PageHeader';
export { default as EmptyState } from './components/EmptyState';
export type { EmptyStateProps } from './components/EmptyState';
```

- [ ] **Step 2: Verificar build**

```bash
cd /home/proyectos/alltura-ui
npm run build 2>&1 | tail -20
```

Expected: build exitoso. El bundle `dist/alltura-ui.mjs` debe incluir los 4 nuevos componentes.

- [ ] **Step 3: Verificar exports en dist**

```bash
grep -c "Button\|StatusBadge\|PageHeader\|EmptyState" /home/proyectos/alltura-ui/dist/alltura-ui.mjs
```

Expected: número > 0 para cada componente.

- [ ] **Step 4: Commit**

```bash
cd /home/proyectos/alltura-ui
git add src/index.ts
git commit -m "feat: export Button, StatusBadge, PageHeader, EmptyState from public API"
```

---

## Task 8: Bump versión y publicar

**Files:**
- Modify: `alltura-ui/package.json`

- [ ] **Step 1: Bump a 1.1.0**

```bash
cd /home/proyectos/alltura-ui
npm version minor
```

Expected: `package.json` pasa de `1.0.1` a `1.1.0`. Git tag `v1.1.0` creado.

- [ ] **Step 2: Build final limpio**

```bash
cd /home/proyectos/alltura-ui
rm -rf dist && npm run build 2>&1 | tail -20
```

Expected: build exitoso sin warnings relevantes.

- [ ] **Step 3: Publicar a GitHub Packages**

```bash
cd /home/proyectos/alltura-ui
npm publish
```

Expected: `+ @jozeuZz/alltura-ui@1.1.0` — publicado con éxito.

- [ ] **Step 4: Push tags**

```bash
cd /home/proyectos/alltura-ui
git push && git push --tags
```

- [ ] **Step 5: Actualizar consumer app a 1.1.0 (si usa file: local)**

Si `herramientas/frontend/package.json` usa `file:../../alltura-ui`, no hace falta cambiar la versión — ya apunta al código fuente local.

Si usa la versión publicada del registry:

```bash
cd /home/proyectos/herramientas/frontend
npm install @jozeuZz/alltura-ui@1.1.0
npm run build 2>&1 | tail -20
```

Expected: consumer app compila con la nueva versión.

---

## Self-review checklist

- [x] Font switch: Tasks 1 cubre index.css + tailwind.config.js en consumer app
- [x] AppLayout sidebar: Task 2 cambia `bg-dark-blue` → `bg-primary`, header → blanco
- [x] Button: Task 3 — variantes primary/ghost/danger/secondary + loading + tamaños
- [x] StatusBadge: Task 4 — 6 variantes EPP con dot + semantic tokens
- [x] PageHeader: Task 5 — title/subtitle/actions/back
- [x] EmptyState: Task 6 — icon/title/description/action/compact
- [x] Exports: Task 7 — todos los nuevos componentes en index.ts
- [x] Versión: Task 8 — bump 1.0.1 → 1.1.0 + publish
- [x] Spec coverage: design spec v2 sección 7 (componentes) cubierta
- [x] Sin placeholders en ninguna tarea
- [x] Tipos consistentes entre tareas (ButtonVariant, StatusVariant, etc.)
