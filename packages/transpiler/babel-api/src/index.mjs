/** @type {null | typeof import('@babel/core').types} */
let _t = null;
/** @type {null | typeof import('@babel/core')} */
let babelApi = null;

/**
 * @param {import('@babel/core')} api
 */
export const register = api => {
  babelApi = api;
  _t = api.types;
};

/**
 * @returns {typeof import('@babel/core')}
 */
export const getBabelApi = () => {
  if (!babelApi) {
    throw new Error('Please call register() before using the babel api');
  }
  return babelApi;
};

export function traverse(node, visitor) {
  getBabelApi().traverse(node, visitor);
}

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
);
