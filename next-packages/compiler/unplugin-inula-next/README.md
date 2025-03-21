# @openinula/unplugin

inulaNext unified plugin system for build tools.Based on [unplugin](https://github.com/unjs/unplugin).

## Install

```bash
npm i @openinula/unplugin
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import inulaNext from '@openinula/unplugin/vite'

export default defineConfig({
  plugins: [
    inulaNext({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import inulaNext from '@openinula/unplugin/rollup'

export default {
  plugins: [
    inulaNext({ /* options */ }),
  ],
}
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('@openinula/unplugin/webpack')({ /* options */ })
  ]
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    ['@openinula/unplugin/nuxt', { /* options */ }],
  ],
})
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('@openinula/unplugin/webpack')({ /* options */ }),
    ],
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import inulaNext from '@openinula/unplugin/esbuild'

build({
  plugins: [inulaNext()],
})
```

<br></details>
