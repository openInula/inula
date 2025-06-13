import { cleanupRContext, RContext } from './RContext';

/**
 * RContextScope收集RContext，用于在组件销毁时，清除组件中的RContext，如：清除组件中注册的watch
 */
let activeRContextScope: RContextScope | null = null;

export class RContextScope {
  /**
   * 存储作用域内的所有RContext
   */
  rContexts: RContext[] = [];

  constructor() {}

  /**
   * 激活当前作用域
   */
  on(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    activeRContextScope = this;
  }

  /**
   * 停用当前作用域
   */
  off(): void {
    activeRContextScope = null;
  }

  /**
   * 停止当前作用域及其所有RContext
   */
  stop(): void {
    for (let i = 0, l = this.rContexts.length; i < l; i++) {
      cleanupRContext(this.rContexts[i]);
    }
    this.rContexts = [];
  }
}

export function recordRContextScope(rContext: RContext, scope: RContextScope | null = activeRContextScope) {
  if (scope) {
    scope.rContexts.push(rContext);
  }
}
