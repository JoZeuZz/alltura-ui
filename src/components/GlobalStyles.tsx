import { useEffect } from 'react';

/**
 * GlobalStyles — inyecta estilos CSS globales de Alltura una sola vez.
 *
 * Incluye:
 *  - Scrollbar refinado: delgado (4 px), bordes redondeados, semi-transparente,
 *    gris claro. Aplica a todos los elementos por defecto; clases de mayor
 *    especificidad como .scrollbar-thin pueden sobreescribirlo.
 *
 * Uso: renderiza <GlobalStyles /> una sola vez en la raíz de la app
 * (p. ej. dentro de AuthProvider o en el componente App).
 */

const ALLTURA_GLOBAL_ATTR = 'data-alltura-global';

const GLOBAL_CSS = `
/* ── Alltura Scrollbar ──────────────────────────────────────────────────
   Delgado, redondeado, semi-transparente. Aplica como estilo base global.
   Cualquier clase de mayor especificidad puede sobreescribir estos valores.
   ──────────────────────────────────────────────────────────────────────── */

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 114, 128, 0.28) transparent;
}

/* WebKit — Chrome, Safari, Edge */
*::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

*::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 100px;
}

*::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.28);
  border-radius: 100px;
  transition: background 0.2s ease;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.5);
}

*::-webkit-scrollbar-corner {
  background: transparent;
}
`;

export function GlobalStyles() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.querySelector(`[${ALLTURA_GLOBAL_ATTR}]`)) return;

    const style = document.createElement('style');
    style.setAttribute(ALLTURA_GLOBAL_ATTR, '');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }, []);

  return null;
}
