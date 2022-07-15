import { isSame } from '../../CommonUtils';
import { createProxy, getObserver, hookObserverMap } from '../ProxyHandler';
import { OBSERVER_KEY } from '../../Constants';

export function createObjectProxy<T extends object>(rawObj: T): ProxyHandler<T> {
  const proxy = new Proxy(rawObj, {
    get,
    set,
  });

  return proxy;
}

export function get(rawObj: object, key: string | symbol, receiver: any): any {
  // The observer object of symbol ('_horizonObserver') cannot be accessed from Proxy to prevent errors caused by clonedeep.
  if (key === OBSERVER_KEY) {
    return undefined;
  }

  const observer = getObserver(rawObj);

  if (key === 'addListener') {
    return observer.addListener.bind(observer);
  }

  if (key === 'removeListener') {
    return observer.removeListener.bind(observer);
  }

  observer.useProp(key);

  const value = Reflect.get(rawObj, key, receiver);

  // 对于prototype不做代理
  if (key !== 'prototype') {
    // 对于value也需要进一步代理
    const valProxy = createProxy(value, hookObserverMap.get(rawObj));

    return valProxy;
  }

  return value;
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
