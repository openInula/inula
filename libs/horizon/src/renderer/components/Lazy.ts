import type {PromiseType} from '../Types';

import {TYPE_LAZY} from '../utils/elementType';

enum LayStatus {
  UnProcessed = 'UnProcessed',
  Pending = 'Pending',
  Fulfilled = 'Fulfilled',
  Rejected = 'Rejected',
}

type LazyContent<T> = {
  _status: string;
  _value: () => PromiseType<{default: T}> | PromiseType<T> | T | any;
};

export type LazyComponent<T, P> = {
  vtype: number;
  _content: P;
  _load: (content: P) => T;
};

// lazyContent随着阶段改变，_value改变:
// 1. 未初始化 -> promiseCtor: () => promise
// 2. pending -> promise
// 3. fulfilled -> module
// 4. rejected -> error
function lazyLoader<T>(lazyContent: LazyContent<T>): any {
  if (lazyContent._status === LayStatus.UnProcessed) {
    // 执行动态导入组件import
    const promise = lazyContent._value();
    lazyContent._status = LayStatus.Pending;
    lazyContent._value = promise;
    promise.then(
      module => {
        if (lazyContent._status === LayStatus.Pending) {
          const defaultExport = module.default;
          lazyContent._status = LayStatus.Fulfilled;
          lazyContent._value = defaultExport;
        }
      },
      error => {
        if (lazyContent._status === LayStatus.Pending) {
          lazyContent._status = LayStatus.Rejected;
          lazyContent._value = error;
        }
      },
    );
  }
  if (lazyContent._status === LayStatus.Fulfilled) {
    return lazyContent._value;
  } else {
    throw lazyContent._value;
  }
}

export function lazy<T>(promiseCtor: () => PromiseType<{default: T}>): LazyComponent<T, LazyContent<T>> {
  return {
    vtype: TYPE_LAZY,
    _content: {
      _status: LayStatus.UnProcessed,
      _value: promiseCtor,
    },
    _load: lazyLoader,
  };
}
