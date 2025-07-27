'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var horizon = require('@cloudsop/horizon');
var jsxRuntime = require('@cloudsop/horizon/jsx-runtime');

function isBrowser() {
  return typeof window !== 'undefined' && window.document && typeof window.document.createElement === 'function';
}
function getDefaultConfirmation(message, callBack) {
  callBack(window.confirm(message));
}

// 判断浏览器是否支持pushState方法，pushState是browserHistory实现的基础
function isSupportHistory() {
  return isBrowser() && window.history && 'pushState' in window.history;
}

// 判断浏览器是否支持PopState事件
function isSupportsPopState() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
}

var Action = /*#__PURE__*/ (function (Action) {
  Action['pop'] = 'POP';
  Action['push'] = 'PUSH';
  Action['replace'] = 'REPLACE';
  return Action;
})({});
var EventType = /*#__PURE__*/ (function (EventType) {
  EventType['PopState'] = 'popstate';
  EventType['HashChange'] = 'hashchange';
  return EventType;
})({});
var PopDirection = /*#__PURE__*/ (function (PopDirection) {
  PopDirection['back'] = 'back';
  PopDirection['forward'] = 'forward';
  PopDirection['unknown'] = '';
  return PopDirection;
})({});

function _extends() {
  _extends = Object.assign
    ? Object.assign.bind()
    : function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
  return _extends.apply(this, arguments);
}

function createPath(path) {
  var search = path.search,
    hash = path.hash;
  var pathname = path.pathname || '/';
  if (search && search !== '?') {
    pathname += search.startsWith('?') ? search : '?' + search;
  }
  if (hash && hash !== '#') {
    pathname += hash.startsWith('#') ? hash : '#' + hash;
  }
  return pathname;
}
function parsePath(url) {
  var pathname = url || '/';
  var parsedPath = {
    search: '',
    hash: '',
  };
  var hashIdx = url.indexOf('#');
  if (hashIdx > -1) {
    var hash = url.substring(hashIdx);
    parsedPath.hash = hash === '#' ? '' : hash;
    pathname = pathname.substring(0, hashIdx);
  }
  var searchIdx = url.indexOf('?');
  if (searchIdx > -1) {
    var search = url.substring(searchIdx);
    parsedPath.search = search === '?' ? '' : search;
    pathname = pathname.substring(0, searchIdx);
  }
  parsedPath.pathname = pathname;
  return parsedPath;
}
function createLocation(current, to, state, key) {
  var pathname = typeof current === 'string' ? current : current.pathname;
  var urlObj = typeof to === 'string' ? parsePath(to) : to;
  // 随机key长度取6
  var getRandKey = genRandomKey(6);
  var location = _extends(
    {
      pathname: pathname,
      search: '',
      hash: '',
      state: state,
      key: typeof key === 'string' ? key : getRandKey(),
    },
    urlObj
  );
  if (!location.pathname) {
    location.pathname = pathname ? pathname : '/';
  } else if (!location.pathname.startsWith('/')) {
    location.pathname = parseRelativePath(location.pathname, pathname);
  }
  if (location.search && location.search[0] !== '?') {
    location.search = '?' + location.search;
  }
  if (location.hash && location.hash[0] !== '#') {
    location.hash = '#' + location.hash;
  }
  return location;
}
function addHeadSlash(path) {
  if (path[0] === '/') {
    return path;
  }
  return '/' + path;
}
function normalizeSlash(path) {
  var tempPath = addHeadSlash(path);
  if (tempPath[tempPath.length - 1] === '/') {
    return tempPath.substring(0, tempPath.length - 1);
  }
  return tempPath;
}
function hasBasename(path, prefix) {
  return (
    path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 && ['/', '?', '#', ''].includes(path.charAt(prefix.length))
  );
}
function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substring(prefix.length) : path;
}

// 使用随机生成的Key记录被访问过的URL，当Block被被触发时利用delta值跳转到之前的页面
function createMemoryRecord(initVal, fn) {
  var visitedRecord = [fn(initVal)];
  function getDelta(to, from) {
    var toIdx = visitedRecord.lastIndexOf(fn(to));
    if (toIdx === -1) {
      toIdx = 0;
    }
    var fromIdx = visitedRecord.lastIndexOf(fn(from));
    if (fromIdx === -1) {
      fromIdx = 0;
    }
    return toIdx - fromIdx;
  }
  function addRecord(current, newRecord, action) {
    var curVal = fn(current);
    var NewVal = fn(newRecord);
    if (action === Action.push) {
      var prevIdx = visitedRecord.lastIndexOf(curVal);
      var newVisitedRecord = visitedRecord.slice(0, prevIdx + 1);
      newVisitedRecord.push(NewVal);
      visitedRecord = newVisitedRecord;
    }
    if (action === Action.replace) {
      var _prevIdx = visitedRecord.lastIndexOf(curVal);
      if (_prevIdx !== -1) {
        visitedRecord[_prevIdx] = NewVal;
      }
    }
  }
  return {
    getDelta: getDelta,
    addRecord: addRecord,
  };
}
function genRandomKey(length) {
  var end = length + 2;
  return function () {
    return Math.random().toString(18).substring(2, end);
  };
}
function parseRelativePath(to, from) {
  if (to.startsWith('/')) {
    return to;
  }
  var fromParts = from.split('/');
  var toParts = to.split('/');
  var lastToPart = toParts[toParts.length - 1];
  if (lastToPart === '..' || lastToPart === '.') {
    toParts.push('');
  }
  var index = fromParts.length - 1;
  var toIndex = 0;
  var urlPart;
  while (toIndex < toParts.length) {
    urlPart = toParts[toIndex];
    if (urlPart === '.') {
      continue;
    }
    if (urlPart === '..') {
      if (index > 1) {
        index--;
      }
      toIndex++;
    } else {
      break;
    }
  }
  return fromParts.slice(0, index).join('/') + '/' + toParts.slice(toIndex).join('/');
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _typeof(o) {
  '@babel/helpers - typeof';

  return (
    (_typeof =
      'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
        ? function (o) {
            return typeof o;
          }
        : function (o) {
            return o && 'function' == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype
              ? 'symbol'
              : typeof o;
          }),
    _typeof(o)
  );
}

function toPrimitive(t, r) {
  if ('object' != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || 'default');
    if ('object' != _typeof(i)) return i;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return ('string' === r ? String : Number)(t);
}

function toPropertyKey(t) {
  var i = toPrimitive(t, 'string');
  return 'symbol' == _typeof(i) ? i : String(i);
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, 'prototype', {
    writable: false,
  });
  return Constructor;
}

var TransitionManager = /*#__PURE__*/ (function () {
  function TransitionManager() {
    _classCallCheck(this, TransitionManager);
    this.prompt = void 0;
    this.prompt = null;
  }
  _createClass(TransitionManager, [
    {
      key: 'setPrompt',
      value: function setPrompt(prompt) {
        var _this = this;
        this.prompt = prompt;

        // 清除Prompt
        return function () {
          if (_this.prompt === prompt) {
            _this.prompt = null;
          }
        };
      },
    },
    {
      key: 'confirmJumpTo',
      value: function confirmJumpTo(location, action, userConfirmationFunc, callBack) {
        if (this.prompt !== null) {
          var result = typeof this.prompt === 'function' ? this.prompt(location, action) : this.prompt;
          if (typeof result === 'string') {
            typeof userConfirmationFunc === 'function' ? userConfirmationFunc(result, callBack) : callBack(true);
          } else {
            callBack(result !== false);
          }
        } else {
          callBack(true);
        }
      },
    },
  ]);
  return TransitionManager;
})();

function warning(condition, message) {
  if (condition) {
    if (console && typeof console.warn === 'function') {
      console.warn(message);
    }
  }
}

function _createForOfIteratorHelper$3(r, e) {
  var t = ('undefined' != typeof Symbol && r[Symbol.iterator]) || r['@@iterator'];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$3(r)) || (e && r && 'number' == typeof r.length)) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] };
        },
        e: function (r) {
          throw r;
        },
        f: F,
      };
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    );
  }
  var o,
    a = !0,
    u = !1;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return ((a = r.done), r);
    },
    e: function (r) {
      ((u = !0), (o = r));
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    },
  };
}
function _unsupportedIterableToArray$3(r, a) {
  if (r) {
    if ('string' == typeof r) return _arrayLikeToArray$3(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return (
      'Object' === t && r.constructor && (t = r.constructor.name),
      'Map' === t || 'Set' === t
        ? Array.from(r)
        : 'Arguments' === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
          ? _arrayLikeToArray$3(r, a)
          : void 0
    );
  }
}
function _arrayLikeToArray$3(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
// 抽取BrowserHistory和HashHistory中相同的方法
function getBaseHistory() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'browser';
  var transitionManager = arguments.length > 1 ? arguments[1] : undefined;
  var popActionListener = arguments.length > 2 ? arguments[2] : undefined;
  var listenerCount = 0;
  var supportPopState = isSupportsPopState();
  var listeners = [];
  var unListeners = [];
  var browserHistory = window.history;

  // 标记是否暂停触发type为pop类型的listener
  var pauseTrigger = false;
  function go(step) {
    var triggerListener = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (triggerListener) {
      pauseTrigger = true;
    }
    browserHistory.go(step);
  }
  function setupListener(count) {
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
  function addListener(listener) {
    var isActive = true;
    var wrapper = function (args) {
      if (isActive) {
        if (listener.type === 'common' && 'action' in args) {
          listener.listener(args);
        } else if (listener.type === 'pop' && 'to' in args) {
          listener.listener(args.to, args.from, args.information);
        }
      }
    };
    var trigger = {
      type: listener.type,
      trigger: wrapper,
    };
    listeners.push(trigger);
    setupListener(1);
    var cancelListener = function () {
      isActive = false;
      setupListener(-1);
      listeners = listeners.filter(function (listener) {
        return listener !== trigger;
      });
    };
    unListeners.push(cancelListener);
    return cancelListener;
  }
  function destroy() {
    var _iterator = _createForOfIteratorHelper$3(unListeners),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done; ) {
        var unListen = _step.value;
        unListen();
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    unListeners.length = 0;
    setupListener(null);
  }
  var isBlocked = false;
  function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var unblock = transitionManager.setPrompt(prompt);
    if (!isBlocked) {
      setupListener(1);
      isBlocked = true;
    }
    return function () {
      if (isBlocked) {
        isBlocked = false;
        setupListener(-1);
      }
      unblock();
    };
  }
  function getUpdateStateFunc(historyProps) {
    return function (nextState) {
      var originPath = createPath(historyProps.location);
      if (nextState) {
        _extends(historyProps, nextState);
      }
      var delta = browserHistory.length - historyProps.length;
      historyProps.length = browserHistory.length;
      // 避免location引用相同时setState不触发
      var location = _extends({}, historyProps.location);
      var commonArgs = {
        location: location,
        action: historyProps.action,
      };
      var popArgs = {
        to: createPath(location),
        from: originPath,
        information: {
          delta: delta,
          direction: delta > 0 ? PopDirection.forward : PopDirection.back,
          type: Action.pop,
        },
      };
      for (var i = 0; i < listeners.length && !pauseTrigger; i++) {
        var listener = listeners[i];
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
  return {
    go: go,
    addListener: addListener,
    block: block,
    destroy: destroy,
    getUpdateStateFunc: getUpdateStateFunc,
  };
}

/**
 * @internal
 * @desc this override signature only for internal usage
 */

function createBrowserHistory() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var supportHistory = isSupportHistory();
  var isSupportPopState = isSupportsPopState();
  var browserHistory = window.history;
  var _options$forceRefresh = options.forceRefresh,
    forceRefresh = _options$forceRefresh === void 0 ? false : _options$forceRefresh,
    _options$getUserConfi = options.getUserConfirmation,
    getUserConfirmation = _options$getUserConfi === void 0 ? getDefaultConfirmation : _options$getUserConfi;
  var basename = options.basename ? normalizeSlash(options.basename) : '';
  var initLocation = getLocation(getHistoryState());
  var recordOperator = createMemoryRecord(initLocation, function (l) {
    return l.key;
  });
  var transitionManager = new TransitionManager();
  var _getBaseHistory = getBaseHistory('browser', transitionManager, handlePop),
    go = _getBaseHistory.go,
    addListener = _getBaseHistory.addListener,
    block = _getBaseHistory.block,
    destroy = _getBaseHistory.destroy,
    getUpdateStateFunc = _getBaseHistory.getUpdateStateFunc;
  var listen = function (listener) {
    var trigger = {
      type: 'common',
      listener: listener,
    };
    return addListener(trigger);
  };
  var history = {
    action: Action.pop,
    length: browserHistory.length,
    location: initLocation,
    go: go,
    goBack: function () {
      return go(-1);
    },
    goForward: function () {
      return go(-1);
    },
    listen: listen,
    addListener: addListener,
    block: block,
    push: push,
    replace: replace,
    destroy: destroy,
    createHref: createHref,
  };
  var updateState = getUpdateStateFunc(history);
  function getHistoryState() {
    return supportHistory ? window.history.state : {};
  }
  function getLocation(historyState) {
    var _window$location = window.location,
      search = _window$location.search,
      hash = _window$location.hash;
    var _ref = historyState || {},
      key = _ref.key,
      state = _ref.state;
    var pathname = window.location.pathname;
    pathname = basename ? stripBasename(pathname, basename) : pathname;
    return createLocation(
      '',
      {
        pathname: pathname,
        search: search,
        hash: hash,
      },
      state,
      key
    );
  }

  // 拦截页面POP事件后，防止返回到的页面被重复拦截
  var forceJump = false;
  function handlePopState(location) {
    if (forceJump) {
      forceJump = false;
      updateState(undefined);
    } else {
      var action = Action.pop;
      var callback = function (isJump) {
        if (isJump) {
          // 执行跳转行为
          updateState({
            action: action,
            location: location,
          });
        } else {
          revertPopState(location, history.location);
        }
      };
      transitionManager.confirmJumpTo(location, action, getUserConfirmation, callback);
    }
  }
  var isEventPopState = function (event) {
    return event.type === EventType.PopState;
  };
  function handlePop(event) {
    var historyState = isSupportPopState && isEventPopState(event) ? event.state : getHistoryState();
    var handler = options.locationHandler ? options.locationHandler : getLocation;
    handlePopState(handler(historyState));
  }

  // 取消页面跳转并恢复到跳转前的页面
  function revertPopState(from, to) {
    var delta = recordOperator.getDelta(to, from);
    if (delta !== 0) {
      go(delta);
      forceJump = true;
    }
  }
  function createHref(path) {
    return (options.baseHandler ? options.baseHandler() : basename) + createPath(path);
  }
  function push(to, state) {
    var action = Action.push;
    var location = createLocation(history.location, to, state, undefined);
    transitionManager.confirmJumpTo(location, action, getUserConfirmation, function (isJump) {
      if (!isJump) {
        return;
      }
      var href = createHref(location);
      var key = location.key,
        state = location.state;
      if (supportHistory) {
        if (forceRefresh) {
          window.location.href = href;
        } else {
          browserHistory.pushState(
            {
              key: key,
              state: state,
            },
            '',
            href
          );
          recordOperator.addRecord(history.location, location, action);
          updateState({
            action: action,
            location: location,
          });
        }
      } else {
        warning(state !== undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
        window.location.href = href;
      }
    });
  }
  function replace(to, state) {
    var action = Action.replace;
    var location = createLocation(history.location, to, state, undefined);
    transitionManager.confirmJumpTo(location, action, getUserConfirmation, function (isJump) {
      if (!isJump) {
        return;
      }
      var href = createHref(location);
      var key = location.key,
        state = location.state;
      if (supportHistory) {
        if (forceRefresh) {
          window.location.replace(href);
        } else {
          browserHistory.replaceState(
            {
              key: key,
              state: state,
            },
            '',
            href
          );
          recordOperator.addRecord(history.location, location, action);
          updateState({
            action: action,
            location: location,
          });
        }
      } else {
        warning(state !== undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
        window.location.replace(href);
      }
    });
  }
  return history;
}

function normalizeBase(base) {
  if (!base) {
    if (typeof document !== 'undefined') {
      var baseEl = document.querySelector('base');
      base = (baseEl && baseEl.getAttribute('href')) || '/';
      base = base.replace(/^\w+:\/\/[^\/]+/, '');
    } else {
      base = '/';
    }
  }
  if (base[0] !== '/' && base[0] !== '#') {
    base = '/' + base;
  }
  return normalizeSlash(base);
}
var BEFORE_HASH_RE = /^[^#]+#/;
function createHrefHandler(base) {
  return function (location) {
    return base.replace(BEFORE_HASH_RE, '#') + location;
  };
}
function parseURL(location) {
  var currentLocation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';
  var path,
    query = {},
    searchString = '',
    hash = '';

  // Could use URL and URLSearchParams but IE 11 doesn't support it
  // TODO: move to new URL()
  var hashPos = location.indexOf('#');
  var searchPos = location.indexOf('?');
  // the hash appears before the search, so it's not part of the search string
  if (hashPos < searchPos && hashPos >= 0) {
    searchPos = -1;
  }
  if (searchPos > -1) {
    path = location.slice(0, searchPos);
    searchString = location.slice(searchPos + 1, hashPos > -1 ? hashPos : location.length);
    query = parseQuery(searchString);
  }
  if (hashPos > -1) {
    path = path || location.slice(0, hashPos);
    // keep the # character
    hash = location.slice(hashPos, location.length);
  }

  // no search and no query
  path = parseRelativePath(path != null ? path : location, currentLocation);
  // empty path means a relative query or hash `?foo=f`, `#thing`

  return {
    fullPath: path + (searchString && '?') + searchString + hash,
    path: path,
    query: query,
    hash: decode(hash),
  };
}
function stringifyUrl(location) {
  var query = location.query ? stringifyQuery(location.query) : '';
  return location.path + (query && '?') + query + (location.hash || '');
}
function stringifyQuery(query) {
  var urlParams = new URLSearchParams();
  var keys = Object.keys(query);
  var _loop = function () {
    var key = _keys[_i];
    var value = query[key];
    if (Array.isArray(value)) {
      value.forEach(function (v) {
        if (v) {
          urlParams.append(key, v);
        }
      });
    } else if (value !== undefined && value !== null) {
      urlParams.append(key, value.toString());
    }
  };
  for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
    _loop();
  }
  return urlParams.toString();
}
function normalizeQuery(query) {
  var normalizedQuery = {};
  for (var key in query) {
    var value = query[key];
    if (value !== undefined) {
      normalizedQuery[key] = Array.isArray(value)
        ? value.map(function (v) {
            return v == null ? null : '' + v;
          })
        : value == null
          ? value
          : '' + value;
    }
  }
  return normalizedQuery;
}
function locationToObject(location, currentRoute) {
  return typeof location === 'string' ? parseURL(location, currentRoute.path) : _extends({}, location);
}
function parseQuery(queryString) {
  var params = new URLSearchParams(queryString);
  return Object.fromEntries(params.entries());
}
function decode(text) {
  return decodeURIComponent(String(text));
}
function shallowCompareArray(a, b) {
  return Array.isArray(b)
    ? a.length === b.length &&
        a.every(function (v, i) {
          return b[i] === v;
        })
    : a.length === 1 && a[0] === b;
}
function compareParams(a, b) {
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (var _i2 = 0, _aKeys = aKeys; _i2 < _aKeys.length; _i2++) {
    var key = _aKeys[_i2];
    var aValue = a[key];
    var bValue = b[key];
    if (Array.isArray(aValue)) {
      if (!shallowCompareArray(aValue, bValue)) {
        return false;
      }
    } else if (Array.isArray(bValue)) {
      if (!shallowCompareArray(bValue, aValue)) {
        return false;
      }
    } else {
      return a === b;
    }
  }
  return true;
}
function isSameRouteLocation(a, b) {
  var matchLengthA = a.matched.length - 1;
  var matchLengthB = b.matched.length - 1;
  return (
    matchLengthA >= -1 &&
    matchLengthA === matchLengthB &&
    a.matched[matchLengthA] === b.matched[matchLengthB] &&
    compareParams(a.params, b.params) &&
    stringifyQuery(a.query) === stringifyQuery(b.query) &&
    a.hash === b.hash
  );
}
function createCallBackList() {
  var callbacks = [];
  var add = function (cb) {
    callbacks.push(cb);
    return function () {
      callbacks = callbacks.filter(function (item) {
        return item !== cb;
      });
    };
  };
  return {
    add: add,
    list: function () {
      return callbacks.slice(0);
    },
    clear: function () {
      return (callbacks.length = 0);
    },
  };
}
function guardEvent(e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return;
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return;
  // don't redirect if `target="_blank"`
  // @ts-expect-error getAttribute does exist
  if (e.currentTarget && e.currentTarget.getAttribute) {
    // @ts-expect-error getAttribute exists
    var target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) return;
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) e.preventDefault();
  return true;
}
function includesParams(outer, inner) {
  var _loop2 = function () {
      var innerValue = inner[key];
      var outerValue = outer[key];
      if (typeof innerValue === 'string') {
        if (innerValue !== outerValue)
          return {
            v: false,
          };
      } else {
        if (
          !Array.isArray(outerValue) ||
          outerValue.length !== innerValue.length ||
          innerValue.some(function (value, i) {
            return value !== outerValue[i];
          })
        )
          return {
            v: false,
          };
      }
    },
    _ret;
  for (var key in inner) {
    _ret = _loop2();
    if (_ret) return _ret.v;
  }
  return true;
}

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
function createVueBaseHistory(handler, base) {
  var urlBase = normalizeBase(base);
  var locationHandler = handler.locationHandler ? handler.locationHandler(urlBase) : null;
  var hrefHandler = handler.baseHandler ? handler.baseHandler(urlBase) : null;
  var baseHistory = createBrowserHistory({
    basename: urlBase,
    locationHandler: locationHandler,
    baseHandler: hrefHandler,
  });
  var listen = function (listener) {
    return baseHistory.addListener({
      type: 'pop',
      listener: listener,
    });
  };
  var listenLocation = function (listener) {
    return baseHistory.listen(listener);
  };
  var push = function (to, data) {
    return baseHistory.push(stripBasename(to, urlBase), data);
  };
  var replace = function (to, data) {
    return baseHistory.replace(stripBasename(to, urlBase), data);
  };
  var historyAdapter = {
    base: urlBase,
    location: '',
    state: {},
    go: baseHistory.go,
    push: push,
    listen: listen,
    listenLocation: listenLocation,
    replace: replace,
    destroy: baseHistory.destroy,
    createHref: createHrefHandler(urlBase),
  };

  // let location and state readonly
  Object.defineProperties(historyAdapter, {
    location: {
      enumerable: true,
      get: function () {
        return createPath(locationHandler ? locationHandler(baseHistory.location) : baseHistory.location);
      },
    },
    state: {
      enumerable: true,
      get: function () {
        return baseHistory.location.state;
      },
    },
  });
  return historyAdapter;
}
function createWebHistory(base) {
  return createVueBaseHistory({}, base);
}
function createWebHashHistory(base) {
  base = location.host ? base || location.pathname + location.search : '';
  if (!base.includes('#')) {
    base += '#';
  }
  var getLocation = function (basename) {
    return function () {
      var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;
      var hashPos = basename.indexOf('#');
      if (hashPos > -1) {
        var slicePos = hash.includes(basename.slice(hashPos)) ? basename.slice(hashPos).length : 1;
        var pathFromHash = addHeadSlash(hash.slice(slicePos));
        return createLocation('', pathFromHash);
      }
      var path = stripBasename(pathname, basename);
      return createLocation('', path + search + hash);
    };
  };
  var getBase = function (base) {
    return function () {
      var hashIndex = base.indexOf('#');
      if (hashIndex !== -1) {
        return window.location.host && document.querySelector('base') ? base : base.slice(hashIndex);
      }
      return location.protocol + '//' + location.host + base;
    };
  };
  var hashHandlers = {
    locationHandler: getLocation,
    baseHandler: getBase,
  };
  return createVueBaseHistory(hashHandlers, base);
}

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

var START_LOCATION = {
  path: '/',
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  meta: {},
  matched: [],
};
var ErrorTypes = /*#__PURE__*/ (function (ErrorTypes) {
  ErrorTypes[(ErrorTypes['MATCHER_NOT_FOUND'] = 1)] = 'MATCHER_NOT_FOUND';
  ErrorTypes[(ErrorTypes['NAVIGATION_GUARD_REDIRECT'] = 2)] = 'NAVIGATION_GUARD_REDIRECT';
  ErrorTypes[(ErrorTypes['NAVIGATION_ABORTED'] = 4)] = 'NAVIGATION_ABORTED';
  ErrorTypes[(ErrorTypes['NAVIGATION_CANCELLED'] = 8)] = 'NAVIGATION_CANCELLED';
  ErrorTypes[(ErrorTypes['NAVIGATION_DUPLICATED'] = 16)] = 'NAVIGATION_DUPLICATED';
  return ErrorTypes;
})({});

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
var RouterContext = horizon.createContext(null);
var RouteContext = horizon.createContext(START_LOCATION);
var CurrentRouteRecord = horizon.createContext(null);

// provide match depth for <RouterView/>
var ViewDepth = horizon.createContext({
  depth: 0,
});

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

var TokenType = /*#__PURE__*/ (function (TokenType) {
  TokenType['Delimiter'] = 'delimiter';
  TokenType['Static'] = 'static';
  TokenType['Param'] = 'param';
  TokenType['WildCard'] = 'wildcard';
  TokenType['LBracket'] = '(';
  TokenType['RBracket'] = ')';
  TokenType['Pattern'] = 'pattern';
  return TokenType;
})({});

// 解析URL中的动态参数，以实现TypeScript提示功能

/**
 * @description 将url中的//转换为/
 */
function cleanPath(path) {
  return path.replace(/\/+/g, '/');
}
function scoreCompare(score1, score2) {
  var score1Length = score1.length;
  var score2Length = score2.length;
  var end = Math.min(score1Length, score2Length);
  for (var i = 0; i < end; i++) {
    var delta = score2[i] - score1[i];
    if (delta !== 0) {
      return delta;
    }
  }
  if (score1Length === score2Length) {
    return 0;
  }
  return score1Length > score2Length ? -1 : 1;
}

// 把正则表达式的特殊符号加两个反斜杠进行转义
function escapeStr(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}

var validChar = /[^/:()*?$^+]/;

// 对Url模板进行词法解析，解析结果为Tokens
function lexer(path) {
  var tokens = [];
  if (!path) {
    return tokens;
  }
  var urlPath = cleanPath(path);
  if (urlPath !== '*' && !urlPath.startsWith('/')) {
    throw new Error('Url must start with "/".');
  }
  var getLiteral = function () {
    var name = '';
    while (i < urlPath.length && validChar.test(urlPath[i])) {
      name += urlPath[i];
      skipChar(1);
    }
    return name;
  };
  var skipChar = function (step) {
    i += step;
  };
  var i = 0;
  while (i < urlPath.length) {
    var curChar = urlPath[i];
    var prevChar = urlPath[i - 1];
    if (curChar === '/') {
      tokens.push({
        type: TokenType.Delimiter,
        value: urlPath[i],
      });
      skipChar(1);
      continue;
    }
    // dynamic params (/:a)
    if (prevChar === '/' && curChar === ':') {
      skipChar(1);
      tokens.push({
        type: TokenType.Param,
        value: getLiteral(),
      });
      continue;
    }
    // wildCard params (/:*)
    if ((prevChar === '/' || prevChar === undefined) && curChar === '*') {
      tokens.push({
        type: TokenType.WildCard,
        value: urlPath[i],
      });
      skipChar(1);
      continue;
    }
    // static params
    if (prevChar === '/' && validChar.test(curChar)) {
      tokens.push({
        type: TokenType.Static,
        value: getLiteral(),
      });
      continue;
    }
    if (curChar === '(') {
      tokens.push({
        type: TokenType.LBracket,
        value: '(',
      });
      skipChar(1);
      continue;
    }
    if (curChar === ')') {
      tokens.push({
        type: TokenType.RBracket,
        value: ')',
      });
      skipChar(1);
      continue;
    }
    if (['*', '?', '$', '^', '+'].includes(curChar)) {
      tokens.push({
        type: TokenType.Pattern,
        value: curChar,
      });
      skipChar(1);
      continue;
    }
    if (validChar.test(curChar)) {
      tokens.push({
        type: TokenType.Pattern,
        value: getLiteral(),
      });
      continue;
    }
    // 跳过非法字符
    skipChar(1);
  }
  return tokens;
}

function _createForOfIteratorHelper$2(r, e) {
  var t = ('undefined' != typeof Symbol && r[Symbol.iterator]) || r['@@iterator'];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$2(r)) || (e && r && 'number' == typeof r.length)) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] };
        },
        e: function (r) {
          throw r;
        },
        f: F,
      };
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    );
  }
  var o,
    a = !0,
    u = !1;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return ((a = r.done), r);
    },
    e: function (r) {
      ((u = !0), (o = r));
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    },
  };
}
function _unsupportedIterableToArray$2(r, a) {
  if (r) {
    if ('string' == typeof r) return _arrayLikeToArray$2(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return (
      'Object' === t && r.constructor && (t = r.constructor.name),
      'Map' === t || 'Set' === t
        ? Array.from(r)
        : 'Arguments' === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
          ? _arrayLikeToArray$2(r, a)
          : void 0
    );
  }
}
function _arrayLikeToArray$2(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}

// 不同类型参数的匹配得分
var MatchScore = /*#__PURE__*/ (function (MatchScore) {
  MatchScore[(MatchScore['static'] = 10)] = 'static';
  MatchScore[(MatchScore['param'] = 6)] = 'param';
  MatchScore[(MatchScore['wildcard'] = 3)] = 'wildcard';
  MatchScore[(MatchScore['placeholder'] = -1)] = 'placeholder';
  return MatchScore;
})(MatchScore || {}); // 兼容 react v5 matched类型
var defaultOption = {
  // url匹配时是否大小写敏感
  caseSensitive: false,
  // 是否严格匹配url结尾的/
  strictMode: false,
  // 是否完全精确匹配
  exact: false,
};
// 正则表达式中需要转义的字符
var REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
// 用于匹配两个//中的的值
var BASE_PARAM_PATTERN = '[^/]+';
var DefaultDelimiter = '/#?';

/**
 * URL匹配整体流程
 * 1.词法解析，将URL模板解析为Token
 * 2.使用Token生成正则表达式
 * 3.利用正则表达式解析URL中参数或填充URL模板
 */

function createPathParser(pathname) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOption;
  var _option$caseSensitive = option.caseSensitive,
    caseSensitive = _option$caseSensitive === void 0 ? defaultOption.caseSensitive : _option$caseSensitive,
    _option$strictMode = option.strictMode,
    strictMode = _option$strictMode === void 0 ? defaultOption.strictMode : _option$strictMode,
    _option$exact = option.exact,
    exact = _option$exact === void 0 ? defaultOption.exact : _option$exact;
  var pattern = '^';
  var keys = [];
  var scores = [];
  var tokens = lexer(pathname);
  var onlyHasWildCard = tokens.length === 1 && tokens[0].type === TokenType.WildCard;
  var tokenCount = tokens.length;
  var lastToken = tokens[tokenCount - 1];
  var asteriskCount = 0;

  /**
   * 用于支持URL中的可选参数/:parma?
   * @description 向前扫描到下一个分隔符/，检查其中是否有?
   * @param currentIdx
   */
  var lookToNextDelimiter = function (currentIdx) {
    var hasOptionalParam = false;
    while (currentIdx < tokens.length && tokens[currentIdx].type !== TokenType.Delimiter) {
      if (tokens[currentIdx].value === '?' || tokens[currentIdx].value === '*') {
        hasOptionalParam = true;
      }
      currentIdx++;
    }
    return hasOptionalParam;
  };
  for (var tokenIdx = 0; tokenIdx < tokenCount; tokenIdx++) {
    var token = tokens[tokenIdx];
    var nextToken = tokens[tokenIdx + 1];
    switch (token.type) {
      case TokenType.Delimiter: {
        // 该分隔符后有可选参数则该分割符在匹配时是可选的
        var hasOptional = lookToNextDelimiter(tokenIdx + 1);
        // 该分隔符为最后一个且strictMode===false时，该分割符在匹配时是可选的
        var isSlashOptional = nextToken === undefined && !strictMode;
        pattern += '/' + (hasOptional || isSlashOptional ? '?' : '');
        break;
      }
      case TokenType.Static:
        pattern += token.value.replace(REGEX_CHARS_RE, '\\$&');
        if (nextToken && nextToken.type === TokenType.Pattern) {
          pattern += '(.' + nextToken.value + ')';
          keys.push(String(asteriskCount));
          asteriskCount++;
        }
        scores.push(MatchScore.static);
        break;
      case TokenType.Param: {
        // 动态参数支持形如/:param、/:param*、/:param?、/:param(\\d+)的形式
        var paramRegexp = '';
        if (nextToken) {
          switch (nextToken.type) {
            case TokenType.LBracket:
              // 跳过当前Token和左括号
              tokenIdx += 2;
              while (tokens[tokenIdx].type !== TokenType.RBracket) {
                paramRegexp += tokens[tokenIdx].value;
                tokenIdx++;
              }
              paramRegexp = '(' + paramRegexp + ')';
              break;
            case TokenType.Pattern:
              tokenIdx++;
              paramRegexp += '(' + (nextToken.value === '*' ? '.*' : BASE_PARAM_PATTERN) + ')' + nextToken.value;
              break;
          }
        }
        pattern += paramRegexp ? '(?:' + paramRegexp + ')' : '(' + BASE_PARAM_PATTERN + ')';
        keys.push(token.value);
        scores.push(MatchScore.param);
        break;
      }
      case TokenType.WildCard:
        keys.push(token.value);
        pattern +=
          '((?:' + BASE_PARAM_PATTERN + ')' + (onlyHasWildCard ? '?' : '') + '(?:/(?:' + BASE_PARAM_PATTERN + '))*)';
        scores.push(onlyHasWildCard ? MatchScore.wildcard : MatchScore.placeholder);
        break;
    }
  }
  var isWildCard = lastToken.type === TokenType.WildCard;
  if (!isWildCard && !exact) {
    if (!strictMode) {
      pattern += '(?:[' + escapeStr(DefaultDelimiter) + '](?=$))?';
    }
    if (lastToken.type !== TokenType.Delimiter) {
      pattern += '(?=[' + escapeStr(DefaultDelimiter) + ']|$)';
    }
  } else {
    pattern += strictMode ? '$' : '[' + escapeStr(DefaultDelimiter) + ']?$';
  }
  var flag = caseSensitive ? '' : 'i';
  var regexp = new RegExp(pattern, flag);

  /**
   * @description 根据给定Pattern解析path
   */
  function parse(path) {
    var reMatch = path.match(regexp);
    if (!reMatch) {
      return null;
    }
    var matchedPath = reMatch[0];
    var params = {};
    var parseScore = Array.from(scores);
    for (var i = 1; i < reMatch.length; i++) {
      var param = reMatch[i];
      var key = keys[i - 1];
      if (key === '*' && param) {
        var value = param.split('/');
        if (!Array.isArray(params['*'])) {
          params['*'] = value;
        } else {
          var _params$;
          (_params$ = params['*']).push.apply(_params$, value);
        }
        // 完成通配符参数解析后将placeholder替换为wildcard参数的分值
        parseScore.splice.apply(
          parseScore,
          [scores.indexOf(MatchScore.placeholder), 1].concat(new Array(value.length).fill(MatchScore.wildcard))
        );
      } else {
        params[key] = param ? param : undefined;
      }
    }
    var isExact = path === matchedPath;
    var url = path === '/' && matchedPath === '' ? '/' : matchedPath;
    return {
      isExact: isExact,
      path: pathname,
      url: url,
      score: parseScore,
      params: params,
    };
  }

  /**
   * @description 使用给定参数填充pattern，得到目标URL
   */
  function compile(params) {
    var path = '';
    var _iterator = _createForOfIteratorHelper$2(tokens),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done; ) {
        var _token = _step.value;
        switch (_token.type) {
          case TokenType.Static:
            path += _token.value;
            break;
          case TokenType.Param:
            if (!params[_token.value]) {
              throw new Error('Param is invalid.');
            }
            path += params[_token.value];
            break;
          case TokenType.WildCard: {
            var wildCard = params['*'];
            if (wildCard instanceof Array) {
              path += wildCard.join('/');
            } else {
              path += wildCard;
            }
            break;
          }
          case TokenType.Delimiter:
            path += _token.value;
            break;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return path;
  }
  return {
    regexp: regexp,
    keys: keys,
    score: scores,
    compile: compile,
    parse: parse,
  };
}

function _createForOfIteratorHelper$1(r, e) {
  var t = ('undefined' != typeof Symbol && r[Symbol.iterator]) || r['@@iterator'];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$1(r)) || (e && r && 'number' == typeof r.length)) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] };
        },
        e: function (r) {
          throw r;
        },
        f: F,
      };
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    );
  }
  var o,
    a = !0,
    u = !1;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return ((a = r.done), r);
    },
    e: function (r) {
      ((u = !0), (o = r));
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    },
  };
}
function _unsupportedIterableToArray$1(r, a) {
  if (r) {
    if ('string' == typeof r) return _arrayLikeToArray$1(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return (
      'Object' === t && r.constructor && (t = r.constructor.name),
      'Map' === t || 'Set' === t
        ? Array.from(r)
        : 'Arguments' === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
          ? _arrayLikeToArray$1(r, a)
          : void 0
    );
  }
}
function _arrayLikeToArray$1(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
var defaultMatcherOption = {
  strict: false,
  sensitive: false,
};
function isRouteName(name) {
  return typeof name === 'string' || typeof name === 'undefined';
}
function getLocationParams(params, keys) {
  var newParams = {};
  var _iterator = _createForOfIteratorHelper$1(keys),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var _key = _step.value;
      if (_key in params) {
        newParams[_key] = params[_key];
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return newParams;
}
function convertRecordToBranch(record, option) {
  var parser = createPathParser(record.path, option);
  return {
    raw: record,
    path: record.path,
    score: parser.score,
    parse: parser.parse,
    regexp: parser.regexp,
    compile: parser.compile,
    component: record.component,
    key: parser.keys,
    children: [],
  };
}
function agnosticRouteMatcher(routes) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultMatcherOption;
  var branchHandler =
    arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : function (item) {
          return item;
        };
  var branches = [];
  var branchesMap = new Map();
  function addBranch(route) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var recursive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var normalizedRecord = branchHandler(route);
    var path = normalizedRecord.path;
    if (parent && !path.startsWith('/')) {
      var concatSlash = parent.path.endsWith('/') ? '' : '/';
      normalizedRecord.path = parent.path + (path ? concatSlash + path : '');
    }
    var recordParserOption = mergeDefault(
      {
        exact: true,
        caseSensitive: option.sensitive,
        strictMode: option.strict,
      },
      {
        caseSensitive: route.sensitive,
        strictMode: route.strict,
      }
    );
    var branch = convertRecordToBranch(normalizedRecord, recordParserOption);
    if (parent) {
      branch.parent = parent;
      parent.children.push(branch);
    }
    var originalBranch = branch;
    branches.push(branch);
    if (branch.raw.name) {
      branchesMap.set(branch.raw.name, branch);
    }
    if (Array.isArray(route.children) && recursive) {
      var _iterator2 = _createForOfIteratorHelper$1(route.children),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
          var child = _step2.value;
          addBranch(child, branch);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
    branches.sort(function (a, b) {
      var score = scoreCompare(a.score, b.score);
      if (score !== 0) {
        return score;
      }
      return a.parent ? -1 : 1;
    });
    return originalBranch
      ? function () {
          return delBranch(originalBranch);
        }
      : function () {};
  }
  function getNamedBranch(name) {
    if (branchesMap.has(name)) {
      return branchesMap.get(name).raw;
    }
    return undefined;
  }
  function delBranch(branchRef) {
    if (isRouteName(branchRef)) {
      var branch = branchesMap.get(branchRef);
      if (branch) {
        branchesMap.delete(branchRef);
        var branchIndex = branches.indexOf(branch);
        if (branchIndex > -1) {
          branches.splice(branchIndex, 1);
          branch.children.forEach(function (b) {
            return delBranch(b);
          });
        }
      }
    } else {
      var idx = branches.indexOf(branchRef);
      if (idx > -1) {
        branches.splice(idx, 1);
        if (branchRef.raw.name) {
          branchesMap.delete(branchRef.raw.name);
        }
      }
      branchRef.children.forEach(function (b) {
        return delBranch(b);
      });
    }
    branches.sort(function (a, b) {
      return scoreCompare(a.score, b.score);
    });
  }
  function matchPath(to, from) {
    var path;
    var branch;
    var name;
    var params = {};
    if ('name' in to && to.name) {
      branch = branchesMap.get(to.name);
      if (!branch) {
        throw Error('route now found');
      }
      name = branch.raw.name;
      params = getLocationParams(from.params, branch.key);
      if (to.params) {
        params = _extends(params, getLocationParams(to.params, branch.key));
      }
      path = branch.compile(params);
    } else if (to.path != null) {
      path = to.path;
      var _iterator3 = _createForOfIteratorHelper$1(branches),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
          var b = _step3.value;
          if (b.regexp.test(path)) {
            branch = b;
            break;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      if (branch) {
        params = branch.parse(path).params;
        name = branch.raw.name;
      }
    } else {
      branch = from.name
        ? branchesMap.get(from.name)
        : branches.find(function (b) {
            return b.regexp.test(from.path);
          });
      if (!branch) {
        throw Error('route now found');
      }
      name = branch.raw.name;
      params = _extends({}, from.params, to.params);
      path = branch.compile(params);
    }
    var matched = [];
    var parentBranch = branch;
    while (parentBranch) {
      matched.push(parentBranch.raw);
      parentBranch = parentBranch.parent;
    }
    // push is 800 times faster than unshift
    matched.reverse();
    if (matched.length < 1) {
      console.warn('url "' + path + '" has no matched route');
    }
    return {
      name: name,
      path: path,
      params: params,
      matched: matched,
      meta: merge(matched),
    };
  }
  routes.forEach(function (r) {
    return addBranch(r);
  });
  return {
    branches: branches,
    addBranch: addBranch,
    delBranch: delBranch,
    matchPath: matchPath,
    getNamedBranch: getNamedBranch,
  };
}
function merge(data) {
  return data.reduce(function (prev, currentValue) {
    return _extends(prev, currentValue.meta);
  }, {});
}
function mergeDefault(defaultOptions, partialOptions) {
  var mergedOption = {};
  for (var _key2 in defaultOptions) {
    mergedOption[_key2] =
      _key2 in partialOptions && partialOptions[_key2] != null ? partialOptions[_key2] : defaultOptions[_key2];
  }
  return mergedOption;
}

function _defineProperty(obj, key, value) {
  key = toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

var NavigationFailureSymbol = Symbol('navigation failure');
function createRouterError(type, params) {
  return _extends(
    new Error(),
    _defineProperty(
      {
        type: type,
      },
      NavigationFailureSymbol,
      true
    ),
    params
  );
}
function isNavigationFailure(error, type) {
  return error instanceof Error && NavigationFailureSymbol in error && (type == null || Boolean(error.type & type));
}

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
function useRouter() {
  return horizon.useContext(RouterContext);
}
function useRoute() {
  return horizon.useContext(RouteContext);
}
function useLink(props) {
  var router = horizon.useContext(RouterContext);
  var currentRoute = horizon.useContext(RouteContext);
  var to = props.to,
    replace = props.replace;
  var route = horizon.useMemo(
    function () {
      return router.resolve(to);
    },
    [to]
  );
  var activeBranchIndex = horizon.useMemo(
    function () {
      var matched = route.matched;
      var length = matched.length;
      var targetMatched = matched[length - 1];
      var currentMatched = currentRoute.matched;
      if (!targetMatched || currentMatched.length === 0) {
        return -1;
      }
      var index = currentMatched.findIndex(function (m) {
        return m === targetMatched;
      });
      if (index > -1) {
        return index;
      }
      var parentRecordPath = matched[length - 2] ? matched[length - 2].path : '';
      if (
        length > 1 &&
        targetMatched.path === parentRecordPath &&
        currentMatched[currentMatched.length - 1].path !== parentRecordPath
      ) {
        return currentMatched.findIndex(function (m) {
          return m === matched[length - 2];
        });
      }
      return index;
    },
    [route, currentRoute]
  );
  var isActive = activeBranchIndex > -1 && includesParams(currentRoute.params, route.params);
  var isExactActive =
    activeBranchIndex > -1 &&
    activeBranchIndex === currentRoute.matched.length - 1 &&
    isSameRouteLocation(currentRoute, route);
  function navigate(e) {
    if (guardEvent(e)) {
      return router[replace ? 'replace' : 'push'](to);
    }
    return Promise.resolve();
  }
  return {
    route: route,
    navigate: navigate,
    isActive: isActive,
    isExactActive: isExactActive,
  };
}
function useRouteWatch(callback, config) {
  var router = horizon.useContext(RouterContext);
  var _ref = config || {},
    immediate = _ref.immediate;
  var isMount = horizon.useRef(false);
  var unListener = horizon.useRef(null);
  horizon.useEffect(function () {
    if (!isMount.current) {
      unListener.current = router.subscribeRouteChange(function (to, from) {
        return callback(to, from);
      });
      if (immediate) {
        callback(router.currentRoute, router.currentRoute);
      }
      isMount.current = true;
    }
  }, []);
  return function () {
    return unListener.current && unListener.current();
  };
}

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
var getLinkClass = function (propClass, globalClass, defaultClass) {
  return [propClass, globalClass, defaultClass].reduce(function (prev, curr) {
    return prev != null ? prev : curr;
  });
};
function RouterLink(props) {
  var router = horizon.useContext(RouterContext);
  var to = props.to,
    replace = props.replace,
    children = props.children;
  var link = useLink({
    to: to,
    replace: replace,
  });
  var activeClass = props.activeClass,
    exactActiveClass = props.exactActiveClass;
  var _router$option = router.option,
    linkActiveClass = _router$option.linkActiveClass,
    linkExactActiveClass = _router$option.linkExactActiveClass;
  var classes = [];
  if (link.isActive) {
    classes.push(getLinkClass(activeClass, linkActiveClass, 'router-link-active'));
  }
  if (link.isExactActive) {
    classes.push(getLinkClass(exactActiveClass, linkExactActiveClass, 'router-link-exact-active'));
  }
  var className = classes.length > 0 ? classes.join(' ') : undefined;
  return jsxRuntime.jsx('a', {
    onClick: link.navigate,
    href: link.route.fullPath,
    className: className,
    children: children,
  });
}

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
function calcNextDepth(currentDepth, matched) {
  var matchedRecord;
  var nextDepth = currentDepth;
  while ((matchedRecord = matched[nextDepth]) && !matchedRecord.component) {
    nextDepth++;
  }
  return nextDepth;
}
function RouterView() {
  var _useContext = horizon.useContext(RouteContext),
    matched = _useContext.matched;
  var _useContext2 = horizon.useContext(ViewDepth),
    depth = _useContext2.depth;
  var nextDepth = horizon.useMemo(
    function () {
      return calcNextDepth(depth, matched);
    },
    [depth]
  );
  var routeRecord = matched[nextDepth];
  if (routeRecord) {
    var component = routeRecord.component,
      props = routeRecord.props;
    var nextComponent = horizon.createElement(component, props);
    return jsxRuntime.jsx(ViewDepth.Provider, {
      value: {
        depth: nextDepth + 1,
      },
      children: jsxRuntime.jsx(CurrentRouteRecord.Provider, {
        value: routeRecord,
        children: nextComponent,
      }),
    });
  }
  return null;
}

function _createForOfIteratorHelper(r, e) {
  var t = ('undefined' != typeof Symbol && r[Symbol.iterator]) || r['@@iterator'];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || (e && r && 'number' == typeof r.length)) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? { done: !0 } : { done: !1, value: r[n++] };
        },
        e: function (r) {
          throw r;
        },
        f: F,
      };
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    );
  }
  var o,
    a = !0,
    u = !1;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return ((a = r.done), r);
    },
    e: function (r) {
      ((u = !0), (o = r));
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    },
  };
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ('string' == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return (
      'Object' === t && r.constructor && (t = r.constructor.name),
      'Map' === t || 'Set' === t
        ? Array.from(r)
        : 'Arguments' === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
          ? _arrayLikeToArray(r, a)
          : void 0
    );
  }
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function normalizeRouteRecord(record) {
  return {
    beforeEnter: record.beforeEnter,
    children: record.children || [],
    component: record.component,
    leaveGuards: new Set(),
    meta: record.meta || {},
    name: record.name,
    path: record.path,
    props: record.props || {},
    redirected: record.redirect,
    updateGuards: new Set(),
  };
}
function initRouter(options) {
  var history = options.history,
    routes = options.routes;
  var matcher = agnosticRouteMatcher(
    routes,
    {
      sensitive: options.sensitive,
      strict: options.strict,
    },
    function (item) {
      return normalizeRouteRecord(item);
    }
  );
  var beforeEachGuards = createCallBackList();
  var beforeResolveGuards = createCallBackList();
  var afterEachGuards = createCallBackList();
  var exceptListeners = createCallBackList();
  var observers = createCallBackList();
  function resolve(to, from) {
    from = _extends({}, from || router.currentRoute);
    if (typeof to === 'string') {
      var normalizedLocation = parseURL(to, from.path);
      var _matchedRoute = matcher.matchPath(
        {
          path: normalizedLocation.path,
        },
        from
      );
      return _extends(normalizedLocation, _matchedRoute);
    }
    var matcherLocation;
    if (to.path != null) {
      matcherLocation = _extends({}, to, {
        path: parseURL(to.path, from.path).path,
      });
    } else {
      var targetParams = _extends({}, to.params);
      for (var _i = 0, _Object$keys = Object.keys(targetParams); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        if (targetParams[key] == null) {
          delete targetParams[key];
        }
      }
      matcherLocation = _extends({}, to, {
        params: targetParams,
      });
    }
    var matchedRoute = matcher.matchPath(matcherLocation, from);
    var fullPath = stringifyUrl(
      _extends(to, {
        path: matchedRoute.path,
      })
    );
    var query = normalizeQuery(to.query);
    var hash = to.hash || '';
    return _extends(
      {
        fullPath: fullPath,
        query: query,
        hash: hash,
      },
      matchedRoute
    );
  }
  async function push(to, redirectFrom) {
    var replace = typeof to === 'string' ? false : to.replace;
    var force = typeof to === 'string' ? false : to.force;
    var target = router.resolve(to);
    var from = router.currentRoute;
    var redirectLocation = extractRedirect(target);
    if (redirectLocation) {
      return push(
        _extends(redirectLocation, {
          replace: to,
          force: force,
        }),
        redirectFrom || target
      );
    }
    target.redirectedFrom = redirectFrom;
    var failure;
    if (!force && isSameRouteLocation(target, from)) {
      failure = createRouterError(ErrorTypes.NAVIGATION_DUPLICATED, {
        to: target,
        from: from,
      });
    }
    return failure
      ? Promise.resolve(failure)
      : triggerGuards(target, from)
          .catch(function (err) {
            return triggerError(err, target, from);
          })
          .then(function (failure) {
            if (failure) {
              Promise.reject('infinite redirect in navigation guard');
            } else {
              doNavigate(target, true, replace);
            }
            triggerAfterEach(target, from);
          });
  }
  function replace(to) {
    var dest = typeof to === 'string' ? parseURL(to) : to;
    return push(
      _extends(dest, {
        replace: true,
      })
    );
  }
  function extractRedirect(to) {
    var lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirected) {
      var redirect = lastMatched.redirected;
      var newTarget = typeof redirect === 'function' ? redirect(to) : redirect;
      if (typeof newTarget === 'string') {
        if (newTarget.includes('?') || newTarget.includes('#')) {
          newTarget = locationToObject(newTarget, router.currentRoute);
        } else {
          newTarget = {
            path: newTarget,
          };
        }
      }
      return _extends(
        {
          query: to.query,
          hash: to.hash,
          params: newTarget.path != null ? {} : to.params,
        },
        newTarget
      );
    }
    return null;
  }
  async function pop(to) {
    var target = router.resolve(to);
    var from = router.currentRoute;
    return triggerGuards(target, from)
      .catch(function (error) {
        return triggerError(error, target, from);
      })
      .then(function (failure) {
        doNavigate(target, false);
        triggerAfterEach(target, from, failure);
      })
      .catch();
  }
  async function triggerGuards(to, from) {
    var guards = [];
    var _analyseChangingRecor = analyseChangingRecord(to, from),
      leavingRecords = _analyseChangingRecor.leavingRecords,
      updateRecords = _analyseChangingRecor.updateRecords,
      enterRecords = _analyseChangingRecor.enterRecords;
    var _iterator = _createForOfIteratorHelper(leavingRecords),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done; ) {
        var record = _step.value;
        record.leaveGuards.forEach(function (guard) {
          guards.push(guardToPromise(guard, to, from));
        });
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return runGuardQueue(guards)
      .then(function () {
        guards = [];
        var _iterator2 = _createForOfIteratorHelper(beforeEachGuards.list()),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
            var beforeEachGuard = _step2.value;
            guards.push(guardToPromise(beforeEachGuard, to, from));
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        return runGuardQueue(guards);
      })
      .then(function () {
        guards = [];
        var _iterator3 = _createForOfIteratorHelper(updateRecords),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
            var record = _step3.value;
            record.updateGuards.forEach(function (guard) {
              guards.push(guardToPromise(guard, to, from));
            });
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        return runGuardQueue(guards);
      })
      .then(function () {
        guards = [];
        var _iterator4 = _createForOfIteratorHelper(enterRecords),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done; ) {
            var record = _step4.value;
            if (record.beforeEnter) {
              if (Array.isArray(record.beforeEnter)) {
                var beforeEnters = record.beforeEnter.map(function (r) {
                  return guardToPromise(r, to, from);
                });
                guards = guards.concat(beforeEnters);
              } else {
                guards.push(guardToPromise(record.beforeEnter, to, from));
              }
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
        return runGuardQueue(guards);
      })
      .then(function () {
        guards = [];
        var _iterator5 = _createForOfIteratorHelper(beforeResolveGuards.list()),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done; ) {
            var _guard = _step5.value;
            guards.push(guardToPromise(_guard, to, from));
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
        return runGuardQueue(guards);
      })
      .catch(function (err) {
        Promise.reject(err);
      });
  }
  function doNavigate(to, triggerHistory, replace) {
    if (triggerHistory) {
      if (replace) {
        history.replace(to.fullPath);
      } else {
        history.push(to.fullPath);
      }
    }
    notifyUpdate({
      currentRoute: to,
    });
  }
  function triggerAfterEach(to, from, failure) {
    afterEachGuards.list().forEach(function (guard) {
      return guard(to, from, failure);
    });
  }
  function triggerError(error, to, from) {
    var _iterator6 = _createForOfIteratorHelper(exceptListeners.list()),
      _step6;
    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done; ) {
        var trigger = _step6.value;
        trigger(error, to, from);
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
    return Promise.reject(error);
  }
  function notifyUpdate(newAttrs) {
    if ('currentRoute' in newAttrs) {
      var prevLocation = router.currentRoute;
      _extends(router, newAttrs);
      observers.list().forEach(function (trigger) {
        trigger(router.currentRoute, prevLocation);
      });
    }
  }
  function install(app) {
    // wrap RouterProvider for App
    app.component('RouterLink', RouterLink);
    app.component('RouterView', RouterView);
    var routerInstance = initRouter(options);
    app.rootComponent = horizon.createElement(
      RouterProvider,
      {
        router: routerInstance,
      },
      app.rootComponent
    );
    app.config.globalProperties.$router = routerInstance;
    Object.defineProperty(app.config.globalProperties, '$route', {
      enumerable: true,
      get: function () {
        return routerInstance.currentRoute;
      },
    });
  }
  function subscribeRouteChange(observer) {
    return observers.add(observer);
  }
  var router = {
    currentRoute: START_LOCATION,
    option: options,
    listening: true,
    go: history.go,
    back: function () {
      return history.go(-1);
    },
    forward: function () {
      return history.go(1);
    },
    push: push,
    pop: pop,
    replace: replace,
    resolve: resolve,
    beforeEach: beforeEachGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterEachGuards.add,
    onError: exceptListeners.add,
    addRoute: function (route) {
      return matcher.addBranch(route);
    },
    removeRoute: function (name) {
      return matcher.delBranch(name);
    },
    hasRoute: function (name) {
      return Boolean(matcher.getNamedBranch(name));
    },
    getRoutes: function () {
      return matcher.branches;
    },
    isReady: function () {
      return Promise.resolve();
    },
    install: install,
    subscribeRouteChange: subscribeRouteChange,
  };
  return router;
}
function analyseChangingRecord(to, from) {
  var leavingRecords = [];
  var updateRecords = [];
  var enterRecords = [];
  var maxLen = Math.max(to.matched.length, from.matched.length);
  var _loop = function () {
    var recordFrom = from.matched[i];
    if (recordFrom) {
      if (
        to.matched.find(function (m) {
          return m === recordFrom;
        })
      ) {
        updateRecords.push(recordFrom);
      } else {
        leavingRecords.push(recordFrom);
      }
    }
    var recordTo = to.matched[i];
    if (recordTo) {
      if (
        from.matched.findIndex(function (m) {
          return m === recordTo;
        }) === -1
      ) {
        enterRecords.push(recordTo);
      }
    }
  };
  for (var i = 0; i < maxLen; i++) {
    _loop();
  }
  return {
    leavingRecords: leavingRecords,
    updateRecords: updateRecords,
    enterRecords: enterRecords,
  };
}
function guardToPromise(guard, to, from) {
  var promise = new Promise(function (resolve, reject) {
    var next = function (valid) {
      if (valid === false) {
        reject(
          createRouterError(ErrorTypes.NAVIGATION_ABORTED, {
            from: from,
            to: to,
          })
        );
      } else if (valid instanceof Error) {
        reject(valid);
      } else if (typeof valid === 'string' || (valid && typeof valid === 'object')) {
        reject(
          createRouterError(ErrorTypes.NAVIGATION_GUARD_REDIRECT, {
            from: to,
            to: valid,
          })
        );
      } else {
        resolve(null);
      }
    };
    var guardReturn = guard(to, from, next);
    var guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3) {
      guardCall = guardCall.then(next);
    }
    guardCall.catch(function (err) {
      return reject(err);
    });
  });
  return function () {
    return promise;
  };
}
function runGuardQueue(guards) {
  return guards.reduce(function (promise, guard) {
    return promise.then(function () {
      return guard();
    });
  }, Promise.resolve());
}

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
function createRouter(option) {
  return initRouter(option);
}
function RouterProvider(props) {
  var children = props.children;
  var router = props.router;
  var currentRoute = router.currentRoute,
    history = router.option.history;
  var unListen = horizon.useRef(null);
  var isMount = horizon.useRef(false);
  var detachObserver = horizon.useRef(null);
  var urlLocation = parseURL(history.location);
  var _useState = horizon.useState(currentRoute),
    location = _useState[0],
    setLocation = _useState[1];
  if (!detachObserver.current) {
    detachObserver.current = router.subscribeRouteChange(function (to) {
      setLocation(to);
    });
  }

  // trigger navigator guards when first entry page
  if (location.fullPath !== urlLocation.fullPath || !isMount.current) {
    void router.push(history.location);
  }
  horizon.useLayoutEffect(function () {
    isMount.current = true;
    if (unListen.current) {
      unListen.current();
    }
    if (detachObserver.current) {
      detachObserver.current();
    }
    detachObserver.current = router.subscribeRouteChange(function (to) {
      setLocation(to);
    });
    unListen.current = history.listen(function (to) {
      if (isMount.current) {
        router.pop(to);
      }
    });
    return function () {
      if (unListen.current) {
        isMount.current = false;
        unListen.current();
        unListen.current = null;
      }
      if (detachObserver.current) {
        detachObserver.current();
        detachObserver.current = null;
      }
    };
  });
  return jsxRuntime.jsx(RouterContext.Provider, {
    value: router,
    children: jsxRuntime.jsx(RouteContext.Provider, {
      value: location,
      children: children,
    }),
  });
}

/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
function onBeforeRouteLeave(leaveGuard) {
  useRegisterGuards('leaveGuards', leaveGuard);
}
function onBeforeRouteUpdate(updateGuard) {
  useRegisterGuards('updateGuards', updateGuard);
}
function useRegisterGuards(name, guard) {
  var match = horizon.useContext(CurrentRouteRecord);
  horizon.useLayoutEffect(function () {
    match[name].add(guard);
    return function () {
      match[name].delete(guard);
    };
  }, []);
  return null;
}

exports.BeforeRouteLeave = onBeforeRouteLeave;
exports.BeforeRouteUpdate = onBeforeRouteUpdate;
exports.RouterLink = RouterLink;
exports.RouterProvider = RouterProvider;
exports.RouterView = RouterView;
exports.START_LOCATION = START_LOCATION;
exports.createRouter = createRouter;
exports.createWebHashHistory = createWebHashHistory;
exports.createWebHistory = createWebHistory;
exports.isNavigationFailure = isNavigationFailure;
exports.onBeforeRouteLeave = onBeforeRouteLeave;
exports.onBeforeRouteUpdate = onBeforeRouteUpdate;
exports.useLink = useLink;
exports.useRoute = useRoute;
exports.useRouteWatch = useRouteWatch;
exports.useRouter = useRouter;
//# sourceMappingURL=vradapter.js.map
