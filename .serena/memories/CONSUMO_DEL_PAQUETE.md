# Consumo de @jozeuZz/alltura-ui — Reglas canónicas

**Paquete:** `@jozeuZz/alltura-ui`
**Registry:** GitHub Packages (`https://npm.pkg.github.com`)
**Versión actual:** 1.1.1

---

## Regla crítica: NUNCA usar `file:` en package.json committeado

En cualquier app consumidora (ej: `herramientas/frontend`), el `package.json` SIEMPRE debe referenciar la versión de registro:

```json
"@jozeuZz/alltura-ui": "1.1.1"
```

**NO:**
```json
"@jozeuZz/alltura-ui": "file:../../alltura-ui"
```

### Por qué

- Docker build context de `frontend` es `./frontend` solamente.
- La ruta `../../alltura-ui` no existe dentro del contenedor.
- `npm ci` falla con `EUSAGE: no package-lock.json` (error confuso pero causado por el `file:` no resolvible).
- Fix aplicado en `herramientas` repo: commit `74d3046`, 2026-05-15.

---

## Patrones correctos por contexto

| Contexto | Cómo usar |
|---|---|
| **Producción / Docker / Coolify** | `"1.1.1"` desde GitHub Packages — siempre |
| **Tests (vitest)** | `vite.config.ts → test.alias` apunta a `../../alltura-ui/src/index.ts` — funciona independiente del package.json |
| **Hot-reload local sobre alltura-ui** | `npm link` temporal en la app consumidora — NUNCA commitear `file:` |

---

## Setup en app consumidora nueva

1. `.npmrc` con:
   ```
   @jozeuZz:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
   ```
2. `package.json`: `"@jozeuZz/alltura-ui": "1.1.1"`
3. `tailwind.config.js` content: `./node_modules/@jozeuZz/alltura-ui/src/**/*.{js,jsx,ts,tsx}`
4. `vite.config.ts` test alias: `'@jozeuZz/alltura-ui': path.resolve(__dirname, '../../alltura-ui/src/index.ts')`

---

## Publicar nueva versión

En `/home/proyectos/alltura-ui/`:

```bash
npm version patch   # o minor/major
npm run build
npm publish
git push
```

Luego en app consumidora: actualizar versión en `package.json` + regenerar lockfile.

### Regenerar lockfile limpio (si hay residuo de `file:`)

```bash
rm -rf node_modules/@jozeuZz
NODE_AUTH_TOKEN=<token> npm install @jozeuZz/alltura-ui@<version> --save-exact --package-lock-only
```

Verificar que `package-lock.json` tenga `"resolved": "https://npm.pkg.github.com/..."` y NO `"link": true`.
