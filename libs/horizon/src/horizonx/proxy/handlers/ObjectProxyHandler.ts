import { isSame } from '../../CommonUtils';
import { createProxy, getObserver, hookObserverMap } from '../ProxyHandler';
import { OBSERVER_KEY } from '../../Constants';

export function createObjectProxy<T extends object>(rawObj: T, singleLevel = false): ProxyHandler<T> {
  const proxy = new Proxy(rawObj, {
    get: (...args) => get(...args, singleLevel),
    set,
  });

  return proxy;
}

export function get(rawObj: object, key: string | symbol, receiver: any, singleLevel = false): any {
  // The observer object of symbol ('_horizonObserver') cannot be accessed from Proxy to prevent errors caused by clonedeep.
  if (key === OBSERVER_KEY) {
    return undefined;
  }

  const observer = getObserver(rawObj);

  if (key === 'watch'){
    return (prop, handler:(key:string, oldValue:any, newValue:any)=>void)=>{
      if(!observer.watchers[prop]){
        observer.watchers[prop]=[] as ((key:string, oldValue:any, newValue:any)=>void)[];
      }
      observer.watchers[prop].push(handler);
      return ()=>{
        observer.watchers[prop]=observer.watchers[prop].filter(cb=>cb!==handler);
      }
    }
  }

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
    const valProxy = singleLevel ? value : createProxy(value, hookObserverMap.get(rawObj));

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
    if(observer.watchers?.[key]){
      observer.watchers[key].forEach(cb => {
        cb(key, oldValue, newValue);
      });
    }
    observer.setProp(key);
  }

  return ret;
}
