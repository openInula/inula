import { Action, AgnosticHistory, BaseOption, CommonListener, DefaultStateType, Listener, Location, To } from './types';
import {
  addHeadSlash,
  createLocation,
  createMemoryRecord,
  createPath,
  isLocationEqual,
  normalizeSlash,
  stripBasename,
  stripHeadSlash,
} from './utils';
import { getDefaultConfirmation } from './dom';
import TransitionManager from './transitionManager';

import warning from './waring';
import { getBaseHistory } from './baseHistory';

export type urlHashType = 'slash' | 'noslash';

type HashHistoryOption = {
  hashType?: urlHashType;
} & BaseOption;

// 获取#前的内容
function stripHash(path: string): string {
  const idx = path.indexOf('#');
  return idx === -1 ? path : path.substring(0, idx);
}

// 获取#后的内容
export function getHashContent(path: string): string {
  const idx = path.indexOf('#');
  return idx === -1 ? '' : path.substring(idx + 1);
}

export function createHashHistory<S = DefaultStateType>(option: HashHistoryOption = {}): AgnosticHistory<S> {
  const browserHistory = window.history;
  const { hashType = 'slash', getUserConfirmation = getDefaultConfirmation } = option;

  const basename = option.basename ? normalizeSlash(option.basename) : '';

  const pathDecoder = addHeadSlash;
  const pathEncoder = hashType === 'slash' ? addHeadSlash : stripHeadSlash;

  const startLocation = getHashContent(window.location.href);
  const encodedLocation = pathEncoder(startLocation);
  // 初始化hash格式不合法时会重定向
  if (startLocation !== encodedLocation) {
    window.location.replace(stripHash(window.location.href) + '#' + encodedLocation);
  }

  function getLocation() {
    let hashPath = pathDecoder(getHashContent(window.location.hash));
    if (basename) {
      hashPath = stripBasename(hashPath, basename);
    }

    return createLocation<S>('', hashPath, undefined, 'default');
  }

  const initLocation = getLocation();

  const memRecords = createMemoryRecord<string, Location<S>>(initLocation, createPath);

  const transitionManager = new TransitionManager<S>();

  function createHref(location: Location<S>) {
    const tag = document.querySelector('base');
    const base = tag && tag.getAttribute('href') ? stripHash(window.location.href) : '';
    return base + '#' + pathEncoder(basename + createPath(location));
  }

  let forceNextPop = false;
  let ignorePath: null | string = null;

  const listen = (listener: CommonListener<S>) => {
    const trigger: Listener<S> = { type: 'common', listener: listener };
    return addListener(trigger);
  };

  const { go, addListener, block, destroy, getUpdateStateFunc } = getBaseHistory(
    'hash',
    transitionManager,
    handleHashChange
  );

  const history: AgnosticHistory<S> = {
    action: Action.pop,
    length: browserHistory.length,
    location: initLocation,
    go,
    goBack: () => go(-1),
    goForward: () => go(1),
    push,
    replace,
    listen,
    addListener,
    block,
    destroy,
    createHref,
  };

  const updateState = getUpdateStateFunc(history);

  function push(to: To, state?: S) {
    warning(state !== undefined, 'Hash history does not support state, it will be ignored');

    const action = Action.push;
    const location = createLocation<S>(history.location, to, state, '');

    transitionManager.confirmJumpTo(location, action, getUserConfirmation, isJump => {
      if (!isJump) {
        return;
      }
      const path = createPath(location);
      const encodedPath = pathEncoder(basename + path);
      // 前后hash不一样才进行跳转
      if (getHashContent(window.location.href) !== encodedPath) {
        ignorePath = encodedPath;
        window.location.hash = encodedPath;

        memRecords.addRecord(history.location, location, action);

        updateState({ action, location });
      } else {
        updateState(undefined);
      }
    });
  }

  function replace(to: To, state?: S) {
    warning(state !== undefined, 'Hash history does not support state, it will be ignored');
    const action = Action.replace;
    const location = createLocation<S>(history.location, to, state, '');

    transitionManager.confirmJumpTo(location, action, getUserConfirmation, isJump => {
      if (!isJump) {
        return;
      }
      const path = createPath(location);
      const encodedPath = pathEncoder(basename + path);
      if (getHashContent(window.location.href) !== encodedPath) {
        ignorePath = path;
        window.location.replace(stripHash(window.location.href) + '#' + encodedPath);
      }
      memRecords.addRecord(history.location, location, action);
      updateState({ action, location });
    });
  }

  function handleHashChange() {
    const hashPath = getHashContent(window.location.href);
    const encodedPath = pathEncoder(hashPath);
    if (hashPath !== encodedPath) {
      window.location.replace(stripHash(window.location.href) + '#' + encodedPath);
    } else {
      const location = getLocation();
      const prevLocation = history.location;
      if (!forceNextPop && isLocationEqual(location, prevLocation)) {
        return;
      }
      if (ignorePath === createPath(location)) {
        return;
      }
      ignorePath = null;
      handlePopState(location);
    }
  }

  function handlePopState(location: Location<S>) {
    if (forceNextPop) {
      forceNextPop = false;
      updateState(undefined);
    } else {
      const action = Action.pop;

      const callback = (isJump: boolean) => {
        if (isJump) {
          updateState({ action: action, location: location });
        } else {
          revertPopState(location);
        }
      };

      transitionManager.confirmJumpTo(location, action, getUserConfirmation, callback);
    }
  }

  // 在跳转行为被Block后，用History.go()跳转回之前的页面
  function revertPopState(from: Location<S>) {
    const to = history.location;
    const delta = memRecords.getDelta(to, from);
    if (delta !== 0) {
      go(delta);
      forceNextPop = true;
    }
  }

  return history;
}
