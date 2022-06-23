import { createProxy, getObserver, hookObserverMap } from '../ProxyHandler';
import { isMap, isWeakMap, isSame } from '../../CommonUtils';

const COLLECTION_CHANGE = '_collectionChange';
const handler = {
  get,
  set,
  add,
  delete: deleteFun,
  clear,
  has,
  entries,
  forEach,
  keys,
  values,
  [Symbol.iterator]: forOf,
};

export function createCollectionProxy(rawObj: Object, hookObserver = true): Object {
  const boundHandler = {};
  Object.entries(handler).forEach(([id, val]) => {
    boundHandler[id] = (...args: any[]) => {
      return (val as any)(...args, hookObserver);
    };
  });
  return new Proxy(rawObj, { ...boundHandler });
}

function get(rawObj: { size: number }, key: any, receiver: any): any {
  if (key === 'size') {
    return size(rawObj);
  } else if (key === 'get') {
    return getFun.bind(null, rawObj);
  } else if (Object.prototype.hasOwnProperty.call(handler, key)) {
    const value = Reflect.get(handler, key, receiver);
    return value.bind(null, rawObj);
  }

  return Reflect.get(rawObj, key, receiver);
}

function getFun(rawObj: { get: (key: any) => any }, key: any) {
  const tracker = getObserver(rawObj);
  tracker.useProp(key);

  const value = rawObj.get(key);
  // 对于value也需要进一步代理
  const valProxy = createProxy(value, hookObserverMap.get(rawObj));

  return valProxy;
}

// Map的set方法
function set(
  rawObj: { get: (key: any) => any; set: (key: any, value: any) => any; has: (key: any) => boolean },
  key: any,
  value: any
) {
  const oldValue = rawObj.get(key);
  const newValue = value;
  rawObj.set(key, newValue);
  const valChange = !isSame(newValue, oldValue);
  const tracker = getObserver(rawObj);

  if (valChange || !rawObj.has(key)) {
    tracker.setProp(COLLECTION_CHANGE);
  }

  if (valChange) {
    tracker.setProp(key);
  }

  return rawObj;
}

// Set的add方法
function add(rawObj: { add: (any) => void; set: (string, any) => any; has: (any) => boolean }, value: any): Object {
  if (!rawObj.has(value)) {
    rawObj.add(value);

    const tracker = getObserver(rawObj);
    tracker.setProp(value);
    tracker.setProp(COLLECTION_CHANGE);
  }

  return rawObj;
}

function has(rawObj: { has: (string) => boolean }, key: any): boolean {
  const tracker = getObserver(rawObj);
  tracker.useProp(key);

  return rawObj.has(key);
}

function clear(rawObj: { size: number; clear: () => void }) {
  const oldSize = rawObj.size;
  rawObj.clear();

  if (oldSize > 0) {
    const tracker = getObserver(rawObj);
    tracker.allChange();
  }
}

function deleteFun(rawObj: { has: (key: any) => boolean; delete: (key: any) => void }, key: any) {
  if (rawObj.has(key)) {
    rawObj.delete(key);

    const tracker = getObserver(rawObj);
    tracker.setProp(key);
    tracker.setProp(COLLECTION_CHANGE);

    return true;
  }

  return false;
}

function size(rawObj: { size: number }) {
  const tracker = getObserver(rawObj);
  tracker.useProp(COLLECTION_CHANGE);
  return rawObj.size;
}

function keys(rawObj: { keys: () => { next: () => { value: any; done: boolean } } }) {
  return wrapIterator(rawObj, rawObj.keys());
}

function values(rawObj: { values: () => { next: () => { value: any; done: boolean } } }) {
  return wrapIterator(rawObj, rawObj.values());
}

function entries(rawObj: { entries: () => { next: () => { value: any; done: boolean } } }) {
  return wrapIterator(rawObj, rawObj.entries(), true);
}

function forOf(rawObj: {
  entries: () => { next: () => { value: any; done: boolean } };
  values: () => { next: () => { value: any; done: boolean } };
}) {
  const isMapType = isMap(rawObj) || isWeakMap(rawObj);
  const iterator = isMapType ? rawObj.entries() : rawObj.values();
  return wrapIterator(rawObj, iterator, isMapType);
}

function forEach(
  rawObj: { forEach: (callback: (value: any, key: any) => void) => void },
  callback: (valProxy: any, keyProxy: any, rawObj: any) => void
) {
  const tracker = getObserver(rawObj);
  tracker.useProp(COLLECTION_CHANGE);
  rawObj.forEach((value, key) => {
    const valProxy = createProxy(value, hookObserverMap.get(rawObj));
    const keyProxy = createProxy(key, hookObserverMap.get(rawObj));
    // 最后一个参数要返回代理对象
    return callback(valProxy, keyProxy, rawObj);
  });
}

function wrapIterator(rawObj: Object, rawIt: { next: () => { value: any; done: boolean } }, isPair = false) {
  const tracker = getObserver(rawObj);
  const hookObserver = hookObserverMap.get(rawObj);
  tracker.useProp(COLLECTION_CHANGE);

  return {
    next() {
      const { value, done } = rawIt.next();
      if (done) {
        return { value: createProxy(value, hookObserver), done };
      }

      tracker.useProp(COLLECTION_CHANGE);

      let newVal;
      if (isPair) {
        newVal = [createProxy(value[0], hookObserver), createProxy(value[1], hookObserver)];
      } else {
        newVal = createProxy(value, hookObserver);
      }

      return { value: newVal, done };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}
