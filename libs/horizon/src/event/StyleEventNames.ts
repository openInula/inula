/**
 * style中的动画事件
 */

// style事件浏览器兼容前缀
const vendorPrefixes = {
  animationend: {
    MozAnimation: 'mozAnimationEnd',
    WebkitAnimation: 'webkitAnimationEnd',
    animation: 'animationend',
  },
  animationiteration: {
    MozAnimation: 'mozAnimationIteration',
    WebkitAnimation: 'webkitAnimationIteration',
    animation: 'animationiteration',
  },
  animationstart: {
    MozAnimation: 'mozAnimationStart',
    WebkitAnimation: 'webkitAnimationStart',
    animation: 'animationstart',
  },
  transitionend: {
    MozTransition: 'mozTransitionEnd',
    WebkitTransition: 'webkitTransitionEnd',
    transition: 'transitionend',
  },
};

// 获取属性中对应事件名
function getEventNameByStyle(eventName) {
  const prefixMap = vendorPrefixes[eventName];
  if (!prefixMap) {
    return eventName;
  }
  const style = document.createElement('div').style
  for (const styleProp in prefixMap) {
    if (styleProp in style) {
      return prefixMap[styleProp];
    }
  }
  return eventName;
}

export const STYLE_AMT_END: string = getEventNameByStyle(
  'animationend',
);
export const STYLE_AMT_ITERATION: string = getEventNameByStyle(
  'animationiteration',
);
export const STYLE_AMT_START: string = getEventNameByStyle(
  'animationstart',
);
export const STYLE_TRANS_END: string = getEventNameByStyle(
  'transitionend',
);
