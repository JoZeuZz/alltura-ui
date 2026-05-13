# @jozeuZz/alltura-ui

Shared UI package for Alltura apps — layout, auth, notifications, tour.

Published to [GitHub Packages](https://github.com/JoZeuZz/alltura-ui/packages).

## Installation

### 1. Configure registry

Add to `.npmrc` in your project root (or `~/.npmrc` for global):

```
@jozeuZz:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_YOUR_TOKEN
```

Generate a token at: GitHub → Settings → Developer settings → Personal access tokens → permissions: `read:packages`

### 2. Install

```bash
npm install @jozeuZz/alltura-ui
```

### 3. Configure Tailwind (if applicable)

Add to `tailwind.config.js` content:

```js
"./node_modules/@jozeuZz/alltura-ui/src/**/*.{js,jsx,ts,tsx}"
```

## CI / CD (Coolify or any Docker-based pipeline)

The consumer app must commit an `.npmrc` with an env-var token reference (no secret in source):

```
@jozeuZz:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then add `NODE_AUTH_TOKEN=<ghp_token>` as an environment variable in Coolify (or equivalent CI secret). The token needs `read:packages` scope.

**Do not** use `file:../../alltura-ui` in `package.json` for deployed apps — the path does not exist inside the Docker build context and will cause `npm ci` to fail.

## Local development (monorepo)

`herramientas/frontend` uses the registry version (`^1.0.x`) everywhere, including locally. The global `~/.npmrc` provides the auth token for local installs.

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
