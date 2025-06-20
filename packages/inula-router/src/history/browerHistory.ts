import { getDefaultConfirmation, isSupportHistory, isSupportsPopState } from './dom';
import {
  Action,
  AgnosticHistory,
  BaseOption,
  CommonListener,
  DefaultStateType,
  EventType,
  History,
  HistoryState,
  Listener,
  Location,
  LocationHandler,
  Path,
  To,
} from './types';
import { createLocation, createMemoryRecord, createPath, normalizeSlash, stripBasename } from './utils';
import TransitionManager from './transitionManager';

import warning from './waring';
import { getBaseHistory } from './baseHistory';

export type BrowserHistoryOption = {
  /**
   * forceRefresh为True时跳转时会强制刷新页面
   */
  forceRefresh?: boolean;
} & BaseOption;

export function createBrowserHistory<S = DefaultStateType>(options: BrowserHistoryOption): History<S>;
/**
 * @internal
 * @desc this override signature only for internal usage
 */
export function createBrowserHistory<S = DefaultStateType>(
  options: LocationHandler<S> & BrowserHistoryOption
): AgnosticHistory<S>;
export function createBrowserHistory<S = DefaultStateType>(
  options: LocationHandler<S> & BrowserHistoryOption = {}
): AgnosticHistory<S> {
  const supportHistory = isSupportHistory();
  const isSupportPopState = isSupportsPopState();
  const browserHistory = window.history;
  const { forceRefresh = false, getUserConfirmation = getDefaultConfirmation } = options;

  const basename = options.basename ? normalizeSlash(options.basename) : '';

  const initLocation = getLocation(getHistoryState());

  const recordOperator = createMemoryRecord<string, Location<S>>(initLocation, l => l.key);

  const transitionManager = new TransitionManager<S>();

  const { go, addListener, block, destroy, getUpdateStateFunc } = getBaseHistory<S>(
    'browser',
    transitionManager,
    handlePop
  );

  const listen = (listener: CommonListener<S>) => {
    const trigger: Listener<S> = { type: 'common', listener: listener };
    return addListener(trigger);
  };

  const history: AgnosticHistory<S> = {
    action: Action.pop,
    length: browserHistory.length,
    location: initLocation,
    go,
    goBack: () => go(-1),
    goForward: () => go(-1),
    listen,
    addListener,
    block,
    push,
    replace,
    destroy,
    createHref,
  };

  const updateState = getUpdateStateFunc(history);

  function getHistoryState() {
    return supportHistory ? window.history.state : {};
  }

  function getLocation(historyState: Partial<HistoryState<S>>) {
    const { search, hash } = window.location;
    const { key, state } = historyState || {};
    let pathname = window.location.pathname;
    pathname = basename ? stripBasename(pathname, basename) : pathname;

    return createLocation<S>('', { pathname, search, hash }, state, key);
  }

  // 拦截页面POP事件后，防止返回到的页面被重复拦截
  let forceJump = false;

  function handlePopState(location: Location<S>) {
    if (forceJump) {
      forceJump = false;
      updateState(undefined);
    } else {
      const action = Action.pop;

      const callback = (isJump: boolean) => {
        if (isJump) {
          // 执行跳转行为
          updateState({ action: action, location: location });
        } else {
          revertPopState(location, history.location);
        }
      };

      transitionManager.confirmJumpTo(location, action, getUserConfirmation, callback);
    }
  }

  const isEventPopState = (event: Event): event is PopStateEvent => {
    return event.type === EventType.PopState;
  };

  function handlePop(event: PopStateEvent | HashChangeEvent) {
    const historyState = isSupportPopState && isEventPopState(event) ? event.state : getHistoryState();
    const handler = options.locationHandler ? options.locationHandler : getLocation;
    handlePopState(handler(historyState));
  }

  // 取消页面跳转并恢复到跳转前的页面
  function revertPopState(from: Location<S>, to: Location<S>) {
    const delta = recordOperator.getDelta(to, from);
    if (delta !== 0) {
      go(delta);
      forceJump = true;
    }
  }

  function createHref(path: Partial<Path>) {
    return (options.baseHandler ? options.baseHandler() : basename) + createPath(path);
  }

  function push(to: To, state?: S) {
    const action = Action.push;
    const location = createLocation<S>(history.location, to, state, undefined);

    transitionManager.confirmJumpTo(location, action, getUserConfirmation, isJump => {
      if (!isJump) {
        return;
      }
      const href = createHref(location);
      const { key, state } = location;

      if (supportHistory) {
        if (forceRefresh) {
          window.location.href = href;
        } else {
          browserHistory.pushState({ key: key, state: state }, '', href);
          recordOperator.addRecord(history.location, location, action);
          updateState({ action, location });
        }
      } else {
        warning(state !== undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
        window.location.href = href;
      }
    });
  }

  function replace(to: To, state?: S) {
    const action = Action.replace;
    const location = createLocation<S>(history.location, to, state, undefined);

    transitionManager.confirmJumpTo(location, action, getUserConfirmation, isJump => {
      if (!isJump) {
        return;
      }
      const href = createHref(location);
      const { key, state } = location;
      if (supportHistory) {
        if (forceRefresh) {
          window.location.replace(href);
        } else {
          browserHistory.replaceState({ key: key, state: state }, '', href);
          recordOperator.addRecord(history.location, location, action);
          updateState({ action, location });
        }
      } else {
        warning(state !== undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
        window.location.replace(href);
      }
    });
  }

  return history;
}
