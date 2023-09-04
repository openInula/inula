import utils from '../utils/commonUtils/utils';
import { InterceptorHandler, IrInterceptorManager } from '../types/interfaces';
import { FulfilledFn, RejectedFn } from '../types/types';

class InterceptorManager<V> implements IrInterceptorManager<V> {
  private handlers: (InterceptorHandler<V> | null)[];

  constructor() {
    this.handlers = [];
  }

  use(
    fulfilled?: FulfilledFn<V>,
    rejected?: RejectedFn,
    options?: { synchronous?: boolean; runWhen?: (value: V) => boolean }
  ): number {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : undefined,
    });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  clear(): void {
    this.handlers = [];
  }

  forEach(func: Function) {
    utils.forEach(this.handlers, function forEachHandler(h: any) {
      if (h !== null) {
        func(h);
      }
    });
  }
}

export default InterceptorManager;
