# Alltura UI — Design Spec v2.0
**Fecha:** 2026-05-14  
**Estado:** Aprobado — listo para implementar

---

## 1. Decisiones de diseño

| Dimensión | Decisión |
|---|---|
| Dirección | B — Profesional Refinado (light, enterprise, blanco/slate) |
| Tipografía | Plus Jakarta Sans (400, 500, 600, 700) |
| Color primario | Azul Clásico `#2A64A4` / dark `#1E2A4A` |
| Border radius | 8 px base (ver escala) |
| Densidad | Confortable (spacing estándar) |

---

## 2. Tokens de color

```
/* Primarios */
--color-primary:        #2A64A4
--color-primary-hover:  #215490
--color-primary-light:  #DBEAFE
--color-primary-dark:   #1E2A4A

/* Texto (Slate) */
--color-text-base:      #0F172A  /* slate-900 */
--color-text-muted:     #475569  /* slate-600 */
--color-text-subtle:    #94A3B8  /* slate-400 */

/* Superficies */
--color-bg-page:        #F8FAFC  /* slate-50 */
--color-bg-card:        #FFFFFF
--color-bg-sidebar:     #2A64A4

/* Bordes */
--color-border:         #E2E8F0  /* slate-200 */
--color-border-focus:   #2A64A4

/* Estados semánticos */
--color-success:        #16A34A  /* green-600 */
--color-success-bg:     #DCFCE7
--color-warning:        #D97706  /* amber-600 */
--color-warning-bg:     #FEF3C7
--color-danger:         #DC2626  /* red-600 */
--color-danger-bg:      #FEE2E2
--color-info:           #1D4ED8  /* blue-700 */
--color-info-bg:        #DBEAFE
```

---

## 3. Tipografía

**Fuente:** Plus Jakarta Sans — Google Fonts  
**Import:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`

| Clase / uso | Size | Weight | Line-height |
|---|---|---|---|
| `heading-xl` / título página | 24px | 700 | 1.25 |
| `heading-lg` / título sección | 20px | 700 | 1.3 |
| `heading-md` / título card | 16px | 700 | 1.4 |
| `body-base` / párrafo | 14px | 400 | 1.6 |
| `body-sm` / subtítulo, helper | 13px | 400 | 1.5 |
| `label-base` / label form | 13px | 600 | 1.4 |
| `label-sm` / badge, th tabla | 11px | 700 | 1.3 |

Tailwind config:
```js
fontFamily: {
  sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
}
```

---

## 4. Border radius

| Token | Valor | Uso |
|---|---|---|
| `rounded-sm` | 4px | badges pequeños, chips |
| `rounded` | 8px | botones, inputs, cards pequeñas |
| `rounded-md` | 8px | (alias base) |
| `rounded-lg` | 12px | modales, cards grandes, sidebar |
| `rounded-xl` | 16px | paneles principales |
| `rounded-full` | 9999px | avatares, indicadores de estado |

---

## 5. Sombras

```
shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
shadow:     0 4px 12px rgba(0,0,0,0.08)
shadow-md:  0 8px 24px rgba(0,0,0,0.10)
shadow-lg:  0 16px 48px rgba(0,0,0,0.12)
```

Cards en reposo: `shadow-sm`. Cards hover/active: `shadow`. Modales: `shadow-lg`.

---

## 6. Spacing (densidad confortable)

| Contexto | Padding |
|---|---|
| Card / panel | `p-5` (20px) |
| Fila de tabla | `py-3 px-4` (12px / 16px) |
| Header de tabla (th) | `py-2 px-4` |
| Botón base | `py-2 px-4` |
| Botón pequeño | `py-1.5 px-3` |
| Input | `py-2 px-3` |
| Sidebar item | `py-2.5 px-3` |
| Modal | `p-6` |
| Section gap | `gap-4` o `space-y-4` |

---

## 7. Componentes a actualizar

### 7.1 AppLayout
- Sidebar: `bg-[#2A64A4]`, texto `text-white`, ítems activos `bg-white/15 rounded-lg`
- Header: `bg-white border-b border-slate-200 shadow-sm`
- Font: cargar Plus Jakarta Sans via `<link>` en el HTML shell (o importar en CSS global)

### 7.2 Botones (no existe componente dedicado — crear `Button.tsx`)
- Primary: `bg-[#2A64A4] hover:bg-[#215490] text-white rounded-md py-2 px-4 font-semibold text-sm transition-colors`
- Ghost: `border border-[#2A64A4] text-[#2A64A4] hover:bg-blue-50 rounded-md py-2 px-4 font-semibold text-sm`
- Danger: `bg-red-600 hover:bg-red-700 text-white rounded-md py-2 px-4 font-semibold text-sm`

### 7.3 Modal / ConfirmationModal
- Overlay: `bg-slate-900/50 backdrop-blur-sm`
- Panel: `bg-white rounded-xl shadow-lg p-6 max-w-md w-full`
- Título: `text-lg font-bold text-slate-900`

### 7.4 ResponsiveTable
- Header `th`: `bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wide py-2 px-4`
- Fila `td`: `py-3 px-4 text-sm text-slate-900 border-b border-slate-100`
- Hover fila: `hover:bg-slate-50 transition-colors`

### 7.5 Badges de estado (nuevo componente `StatusBadge.tsx`)
- Variantes: `active | inactive | pending | expired | in-stock`
- Forma: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold`
- Con dot de color según variante

### 7.6 Spinner
- Color: `border-[#2A64A4]`
- Tamaños: sm (16px), md (24px), lg (40px)

### 7.7 NotificationBell
- Variant `light`: ícono `text-slate-500 hover:text-slate-900`
- Variant `dark` (en sidebar): ícono `text-white/70 hover:text-white`
- Badge de conteo: `bg-red-500 text-white text-[10px] rounded-full`

### 7.8 ErrorMessage / ErrorPage
- Colores actualizados a tokens slate + primary
- Botón "reintentar": usar estilos Button primary

### 7.9 Container / ResponsiveGrid
- `Container`: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- `ResponsiveGrid`: gap actualizado a `gap-4`

---

## 8. CSS global / fuente

Agregar en el punto de entrada (`main.tsx` o `index.css`):

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

body {
  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  background-color: #F8FAFC;
  color: #0F172A;
  -webkit-font-smoothing: antialiased;
}
```

---

## 9. Tailwind config (cambios)

```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    colors: {
      primary: {
        DEFAULT: '#2A64A4',
        hover:   '#215490',
        light:   '#DBEAFE',
        dark:    '#1E2A4A',
      },
    },
    boxShadow: {
      sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      DEFAULT: '0 4px 12px rgba(0,0,0,0.08)',
      md: '0 8px 24px rgba(0,0,0,0.10)',
      lg: '0 16px 48px rgba(0,0,0,0.12)',
    },
  },
},
```

---

## 10. Nuevos componentes a crear

| Componente | Descripción |
|---|---|
| `Button.tsx` | Primary / Ghost / Danger, sm/md/lg |
| `StatusBadge.tsx` | Variantes de estado EPP con dot |
| `PageHeader.tsx` | Título + subtítulo + acciones slot |
| `EmptyState.tsx` | Ilustración + mensaje + CTA |

---

## 11. Versión a publicar

- Bump: `1.0.1` → `1.1.0` (minor — nuevos componentes, no breaking)
- Todos los exports existentes se mantienen sin cambios de API
