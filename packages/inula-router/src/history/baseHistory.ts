import { Action, EventType, HistoryProps, Listener, Navigation, PopDirection, PopNavigation, Prompt } from './types';
import transitionManager from './transitionManager';
import { isSupportsPopState } from './dom';
import { createPath } from './utils';

type Trigger<S> =
  | {
      type: 'common';
      trigger: (arg: Navigation<S>) => void;
    }
  | {
      type: 'pop';
      trigger: (arg: PopNavigation) => void;
    };

// 抽取BrowserHistory和HashHistory中相同的方法
export function getBaseHistory<S>(
  type: 'browser' | 'hash' = 'browser',
  transitionManager: transitionManager<S>,
  popActionListener: (event: PopStateEvent | HashChangeEvent) => void
) {
  let listenerCount = 0;
  const supportPopState = isSupportsPopState();
  let listeners: Trigger<S>[] = [];
  const unListeners: (() => void)[] = [];
  const browserHistory = window.history;

  // 标记是否暂停触发type为pop类型的listener
  let pauseTrigger = false;

  function go(step: number, triggerListener = true) {
    if (triggerListener) {
      pauseTrigger = true;
    }
    browserHistory.go(step);
  }

  function setupListener(count: number | null) {
    if (count === null) {
      listenerCount = 0;
    } else {
      listenerCount += count;
    }
    if (listenerCount === 1 && count === 1) {
      if (type === 'browser' && supportPopState) {
        addEventListener(EventType.PopState, popActionListener);
      } else {
        addEventListener(EventType.HashChange, popActionListener);
      }
    } else if (listenerCount === 0) {
      if (type === 'browser' && supportPopState) {
        removeEventListener(EventType.PopState, popActionListener);
      } else {
        removeEventListener(EventType.HashChange, popActionListener);
      }
    }
  }

  function addListener(listener: Listener<S>): () => void {
    let isActive = true;
    const wrapper = (args: Navigation<S> | PopNavigation) => {
      if (isActive) {
        if (listener.type === 'common' && 'action' in args) {
          listener.listener(args);
        } else if (listener.type === 'pop' && 'to' in args) {
          listener.listener(args.to, args.from, args.information);
        }
      }
    };
    const trigger: Trigger<S> = { type: listener.type, trigger: wrapper };
    listeners.push(trigger);
    setupListener(1);

    const cancelListener = () => {
      isActive = false;
      setupListener(-1);
      listeners = listeners.filter(listener => listener !== trigger);
    };

    unListeners.push(cancelListener);
    return cancelListener;
  }

  function destroy() {
    for (const unListen of unListeners) {
      unListen();
    }
    unListeners.length = 0;
    setupListener(null);
  }

  let isBlocked = false;

  function block(prompt: Prompt<S> = false): () => void {
    const unblock = transitionManager.setPrompt(prompt);
    if (!isBlocked) {
      setupListener(1);
      isBlocked = true;
    }
    return () => {
      if (isBlocked) {
        isBlocked = false;
        setupListener(-1);
      }
      unblock();
    };
  }

  function getUpdateStateFunc(historyProps: HistoryProps<S>) {
    return function (nextState: Navigation<S> | undefined) {
      const originPath = createPath(historyProps.location);
      if (nextState) {
        Object.assign(historyProps, nextState);
      }
      const delta = browserHistory.length - historyProps.length;
      historyProps.length = browserHistory.length;
      // 避免location引用相同时setState不触发
      const location = Object.assign({}, historyProps.location);
      const commonArgs = { location: location, action: historyProps.action };
      const popArgs: PopNavigation = {
        to: createPath(location),
        from: originPath,
        information: {
          delta: delta,
          direction: delta > 0 ? PopDirection.forward : PopDirection.back,
          type: Action.pop,
        },
      };
      for (let i = 0; i < listeners.length && !pauseTrigger; i++) {
        const listener = listeners[i];
        if (listener.type === 'common') {
          listener.trigger(commonArgs);
        } else if (listener.type === 'pop' && historyProps.action === Action.pop) {
          // vue history listener only trigger when action is pop
          listener.trigger(popArgs);
        }
      }
      pauseTrigger = false;
    };
  }

  return { go, addListener, block, destroy, getUpdateStateFunc };
}
