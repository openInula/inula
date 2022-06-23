import { createObjectProxy } from './handlers/ObjectProxyHandler';
import { Observer } from './Observer';
import { HooklessObserver } from './HooklessObserver';
import { isArray, isCollection, isObject } from '../CommonUtils';
import { createArrayProxy } from './handlers/ArrayProxyHandler';
import { createCollectionProxy } from './handlers/CollectionProxyHandler';

const OBSERVER_KEY = Symbol('_horizonObserver');

const proxyMap = new WeakMap();

export const hookObserverMap = new WeakMap();

export function createProxy(rawObj: any, hookObserver = true): any {
  // 不是对象（是原始数据类型）不用代理
  if (!isObject(rawObj)) {
    return rawObj;
  }

  const existProxy = proxyMap.get(rawObj);
  if (existProxy) {
    return existProxy;
  }

  // Observer不需要代理
  if (rawObj instanceof Observer) {
    return rawObj;
  }

  // 创建Observer
  let observer = getObserver(rawObj);
  if (!observer) {
    observer = hookObserver ? new Observer() : new HooklessObserver();
    rawObj[OBSERVER_KEY] = observer;
  }

  hookObserverMap.set(rawObj, hookObserver);

  // 创建Proxy
  let proxyObj;
  if (isArray(rawObj)) {
    // 数组
    proxyObj = createArrayProxy(rawObj as []);
  } else if (isCollection(rawObj)) {
    // 集合
    proxyObj = createCollectionProxy(rawObj);
  } else {
    // 原生对象 或 函数
    proxyObj = createObjectProxy(rawObj);
  }

  proxyMap.set(rawObj, proxyObj);
  proxyMap.set(proxyObj, proxyObj);

  return proxyObj;
}

export function getObserver(rawObj: any): Observer {
  return rawObj[OBSERVER_KEY];
}

