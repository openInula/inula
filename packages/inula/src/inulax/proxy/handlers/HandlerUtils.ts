import { createProxy, getObserver, reduxAdapterMap } from '../ProxyHandler';
import { isArray, isValidIntegerKey, resolveMutation } from '../../CommonUtils';
import { isRef } from '../../reactive/Ref';
import { CurrentListener, IObserver, Listeners, WatchFn, WatchHandler } from '../../types/ProxyTypes';

export const SET_WATCH_KEY = '_setWatchKey';

// 获取观察者函数
export function getWatchFn(observer: IObserver): WatchFn {
  // 返回一个函数，该函数接受属性和处理程序作为参数
  return (prop: any, handler?: WatchHandler) => {
    // Set不需要指定prop
    if (typeof prop === 'function') {
      handler = prop;
      prop = SET_WATCH_KEY;
    }

    // 观察指定的属性
    watchProp(observer, prop, handler as WatchHandler);
  };
}

// 观察属性
function watchProp(observer: IObserver, prop: any, handler: WatchHandler) {
  if (!observer.watchers[prop]) {
    observer.watchers[prop] = [];
  }

  // 将处理程序添加到观察者数组中
  if (!observer.watchers[prop].includes(handler)) {
    observer.watchers[prop].push(handler);
  }

  return () => {
    // 从观察者数组中移除处理程序
    observer.watchers[prop] = observer.watchers[prop].filter(cb => cb !== handler);
  };
}

export function triggerSetWatchers(observer: IObserver) {
  if (observer.watchers[SET_WATCH_KEY]) {
    observer.watchers[SET_WATCH_KEY].forEach(cb => {
      cb();
    });
  }
}

export function getValOrProxy(
  key: string | symbol,
  isShallow: boolean,
  value: any,
  rawObj: Record<string, any>,
  listener: CurrentListener,
  listeners: Listeners
): any {
  if (isShallow) {
    return value;
  }

  if (isRef(value)) {
    // ref unwrapping
    return isArray(rawObj) && isValidIntegerKey(key) ? value : value.value;
  }

  // 对于value也需要进一步代理
  return createProxy(
    value,
    {
      current: change => {
        if (!change.parents) change.parents = [];
        change.parents.push(rawObj);
        const mutation = resolveMutation(
          { ...rawObj, [key]: change.mutation.from },
          { ...rawObj, [key]: change.mutation.to }
        );
        listener.current({ ...change, mutation });
        listeners.forEach(lst => lst({ ...change, mutation }));
      },
    },
    false,
    reduxAdapterMap.get(rawObj)
  );
}

export function registerListener(rawObj: any, listener: CurrentListener, listeners: Listeners) {
  getObserver(rawObj).addListener(change => {
    if (!change.parents) change.parents = [];
    change.parents.push(rawObj);
    listener.current(change);
    listeners.forEach(lst => lst(change));
  });
}
