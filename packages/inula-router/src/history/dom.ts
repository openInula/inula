export function isBrowser(): boolean {
  return typeof window !== 'undefined' && window.document && typeof window.document.createElement === 'function';
}

export function getDefaultConfirmation(message: string, callBack: (result: boolean) => void) {
  callBack(window.confirm(message));
}

// 判断浏览器是否支持pushState方法，pushState是browserHistory实现的基础
export function isSupportHistory(): boolean {
  return isBrowser() && window.history && 'pushState' in window.history;
}

// 判断浏览器是否支持PopState事件
export function isSupportsPopState(): boolean {
  return window.navigator.userAgent.indexOf('Trident') === -1;
}
