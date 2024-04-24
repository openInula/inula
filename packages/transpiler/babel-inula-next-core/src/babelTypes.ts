import { type types as t } from '@babel/core';
let _t: null | typeof types = null;

export const register = (types: typeof t) => {
  _t = types;
};

export const types = new Proxy(
  {},
  {
    get: (_, p, receiver) => {
      if (!_t) {
        throw new Error('Please call register() before using the babel types');
      }

      if (p in _t) {
        return Reflect.get(_t, p, receiver);
      }
      return undefined;
    },
  }
) as typeof t;
