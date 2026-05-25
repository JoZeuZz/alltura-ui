# @jozeuZz/alltura-ui

Shared UI package for Alltura apps — layout, auth, notifications, tour.

Published to [npm](https://www.npmjs.com/package/@jozeuZz/alltura-ui).

## Installation

No token or `.npmrc` configuration needed — package is public.

```bash
npm install @jozeuZz/alltura-ui
```

### Configure Tailwind (if applicable)

Add to `tailwind.config.js` content:

```js
"./node_modules/@jozeuZz/alltura-ui/src/**/*.{js,jsx,ts,tsx}"
```

## CI / CD (Coolify or any Docker-based pipeline)

No auth required. `npm ci` works without any `.npmrc` or secrets.

**Do not** use `file:../../alltura-ui` in `package.json` for deployed apps — the path does not exist inside the Docker build context and will cause `npm ci` to fail.

## Local development (monorepo)

To work on `alltura-ui` source and see changes live without publishing, use npm link:

```bash
cd /home/proyectos/alltura-ui && npm link
cd /home/proyectos/herramientas/frontend && npm link @jozeuZz/alltura-ui
```

Vitest resolves directly to source for per-module mocking (unchanged):

```ts
// frontend/vite.config.ts (test.alias)
'@jozeuZz/alltura-ui': path.resolve(__dirname, '../../alltura-ui/src/index.ts')
```

## Publishing a new version

Requires `npm login` (one time, with your npmjs.com account).

```bash
cd /home/proyectos/alltura-ui
npm version patch   # or minor / major
npm run build
npm publish
git push
```

## Peer dependencies

```
react >=18
react-dom >=18
react-router-dom >=6
@tanstack/react-query >=5
```
