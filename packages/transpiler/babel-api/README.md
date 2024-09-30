# @openinlua/babel-api
A package that encapsulates the babel API for use in the transpiler.

To implement the dependency injection pattern, the package exports a function that registers the babel API in the
transpiler.

```ts
import { registerBabelAPI } from '@openinlua/babel-api';

function plugin(api: typeof babel) {
  registerBabelAPI(api);

  // Your babel plugin code here.
}
```

And then you can import to use it.
> types can use as a `type` or as a `namespace` for the babel API.

```ts
import { types as t } from '@openinlua/babel-api';

t.isIdentifier(node as t.Node);
```
