/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

/**
 *
 * 由于 ResizeObserver 对 IE 和低版本主流浏览器不兼容，需要自己实现一套兼容方案
 * 这是一个不依赖任何框架的监听 dom 元素尺寸变化的解决方案
 * 浏览器出于性能考虑，只有 window 的 resize 事件会触发，我们通过 object 标签可以得到
 * 一个 window 对象，让 object dom 元素成为待观测 dom 的子元素，并且和待观测 dom 大小一致。
 * 这样一旦待观测 dom 的大小发生变化，window 的大小也会发生变化，我们就可以通过监听 window
 * 大小变化的方式监听待观测 dom 的大小变化
 *
 * <div id='test>
 *   <object>             --> 和父 div 保持大小一致
 *     <html></html>      --> 添加 resize 事件监听
 *   </object>
 * </div>
 *
 */

function timeout(func) {
  return setTimeout(func, 20);
}

function requestFrame(func) {
  const raf = requestAnimationFrame || timeout;
  return raf(func);
}

function cancelFrame(id) {
  const cancel = cancelAnimationFrame || clearTimeout;
  cancel(id);
}

// 在闲置帧触发回调事件，如果在本次触发前存在未处理回调事件，需要取消未处理回调事件
function resizeListener(event) {
  const win = event.target;
  if (win.__resizeRAF__) {
    cancelFrame(win.__resizeRAF__);
  }
  win.__resizeRAF__ = requestFrame(function () {
    const observeElement = win.__observeElement__;
    observeElement.__resizeCallbacks__.forEach(function (func) {
      func.call(observeElement, observeElement, event);
    });
  });
}

function loadObserver(this: any) {
  // 将待观测元素传递给 object 标签的 window 对象，这样在触发 resize 事件时可以拿到待观测元素
  this.contentDocument.defaultView.__observeElement__ = this.__observeElement__;
  // 给 html 的 window 对象添加 resize 事件
  this.contentDocument.defaultView.addEventListener('resize', resizeListener);
}

export function addResizeListener(element: any, func: any) {
  if (!element.__resizeCallbacks__) {
    element.__resizeCallbacks__ = [func];
    element.style.position = 'relative';
    const observer = document.createElement('object');
    observer.setAttribute(
      'style',
      'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;'
    );
    observer.data = 'about:blank';
    observer.onload = loadObserver;
    observer.type = 'text/html';
    observer['__observeElement__'] = element;
    element.__observer__ = observer;
    element.appendChild(observer);
  } else {
    element.__resizeCallbacks__.push(func);
  }
}

export function removeResizeListener(element, func) {
  element.__resizeCallbacks__.splice(element.__resizeCallbacks__.indexOf(func), 1);
  if (!element.__resizeCallbacks__.length) {
    element.__observer__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
    element.removeChild(element.__observer__);
    element.__observer__ = null;
  }
}
