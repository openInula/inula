import { isObject } from '../CommonUtils';

export function readonlyProxy<T extends object>(target: T): ProxyHandler<T> {
  return new Proxy(target, {
    get(target, property, receiver) {
      const result = Reflect.get(target, property, receiver);
      try {
        if (isObject(result)) {
          return readonlyProxy(result);
        }
      } catch(err) {
        // 不处理
      }
      return result;
    },

    set() {
      throw Error('Trying to change readonly variable');
    },

    deleteProperty() {
      throw Error('Trying to change readonly variable');
    },
  });
}

export default readonlyProxy;
