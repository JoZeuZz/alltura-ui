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

## Local development (monorepo)

When working inside `herramientas/`, the package is installed via `file:` path — no registry needed:

```json
// frontend/package.json
"@jozeuZz/alltura-ui": "file:../../alltura-ui"
```

Vitest resolves directly to source for per-module mocking:

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
