import { isSame } from '../../CommonUtils';
import { createProxy, getObserver, hookObserverMap } from '../ProxyHandler';

export function createObjectProxy<T extends object>(rawObj: T): ProxyHandler<T> {
  const proxy = new Proxy(rawObj, {
    get,
    set,
  });

  return proxy;
}

export function get(rawObj: object, key: string, receiver: any): any {
  const observer = getObserver(rawObj);

  if (key === 'addListener') {
    return observer.addListener.bind(observer);
  }

  if (key === 'removeListener') {
    return observer.removeListener.bind(observer);
  }

  observer.useProp(key);

  const value = Reflect.get(rawObj, key, receiver);

  // 对于value也需要进一步代理
  const valProxy = createProxy(value, hookObserverMap.get(rawObj));

  return valProxy;
}

export function set(rawObj: object, key: string, value: any, receiver: any): boolean {
  const observer = getObserver(rawObj);

  if (value && key == 'removeListener') {
    observer.removeListener(value);
  }
  const oldValue = rawObj[key];
  const newValue = value;

  const ret = Reflect.set(rawObj, key, newValue, receiver);

  if (!isSame(newValue, oldValue)) {
    observer.setProp(key);
  }

  return ret;
}
