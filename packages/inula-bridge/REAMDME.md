# inula-bridge

`inula-bridge` is a bridge between inula legacy and next. Aim to help you migrate your inula legacy code to next incrementally.

That means you can use inula legacy code in next. And off course, you can use next code in inula legacy.

## How to install

### vite

We provide a plugin for vite.

```bash
npm install @openinula/bridge --save-dev
npm install @openinula/vite-plugin-inula-bridge --save-dev
```

## How to use

### define your next component

Use `'use next'` in the top of your file to use next syntax.

```tsx
'use next';

function Button() {
  let count = 0;
  function onClick() {  
    count += 1;
  }
  return <Button onClick={onClick}>Hello World</Button>;
}
```

In default, file will compile into inula legacy syntax.
But with `'use next'`, file will compile into next syntax.

### use your next component in inula legacy
Just import your next component and use it in inula legacy.

```tsx
import { Button } from './next-components';

function App() {
  return <Button>Hello World</Button>;
}
```

## limitations

1. Compat layer will add additional dom.
2. Can not use jsx in children of hybrid components, like `<Next><h1>YOUR TEXT</h1></Next>`.


## under the hood

`inula-bridge` is a transpiler. It will wrap your next component when import it in inula legacy.

```tsx
import { Button } from './next-components';

// will be transpiled into
import { withLegacyCompat } from '@openinula/bridge';
import { Button as __Button } from './next-components';
const Button = withLegacyCompat(__Button);
```

And vice versa.
```tsx
'use next';
import { Button } from './inula-legacy-components';

// will be transpiled into
import { withNextCompat } from '@openinula/bridge';
import { Button as __Button } from './inula-legacy-components';
const Button = withNextCompat(__Button);
```
