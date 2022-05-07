import { allDelegatedNativeEvents } from '../../../libs/horizon/src/event/EventCollection';
//import * as LogUtils from './logUtils';

export const stopBubbleOrCapture = (e, value) => {
  const LogUtils = getLogUtils();
  LogUtils.log(value);
  e.stopPropagation();
};

function listAllEventListeners() {
  const allElements = Array.prototype.slice.call(document.querySelectorAll('*'));
  allElements.push(document);
  allElements.push(window);

  const types = [];

  for (let ev in window) {
    if (/^on/.test(ev)) types[types.length] = ev;
  }

  let elements = [];
  for (let i = 0; i < allElements.length; i++) {
    const currentElement = allElements[i];
    for (let j = 0; j < types.length; j++) {
      if (typeof currentElement[types[j]] === 'function') {
        elements.push({
          'node': currentElement,
          'type': types[j],
          'func': currentElement[types[j]].toString(),
        });
      }
    }
  }

  return elements.sort(function(a,b) {
    return a.type.localeCompare(b.type);
  });
}

export const getEventListeners = (dom) => {
  console.table(listAllEventListeners());



  // let ret = true;
  // let keyArray = [];
  // for (let key in dom) {
  //   if (/^on/.test(key)) keyArray.push(key);
  // }
  // console.log(getEventListeners);
  // console.log('---------------------------------');
  // console.log(allDelegatedNativeEvents);
  // try {
  //   allDelegatedNativeEvents.forEach(event => {
  //     if (!keyArray.includes(event)) {
  //       ret = false;
  //       throw new Error('没有挂载全量事件');
  //     }
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
  // return ret;
};

export function triggerClickEvent(container, id) {
  const event = new MouseEvent('click', {
    bubbles: true,
  });
  container.querySelector(`#${id}`).dispatchEvent(event);
}

class LogUtils {
  constructor() {
    this.dataArray = null;
  }

  log = (value) => {
    if (this.dataArray === null) {
      this.dataArray = [value];
    } else {
      this.dataArray.push(value);
    }
  };

  getAndClear = () => {
    if (this.dataArray === null) {
      return [];
    }
    const values = this.dataArray;
    this.dataArray = null;
    return values;
  };

  getNotClear = () => {
    return this.dataArray === null ? [] : this.dataArray;
  };

  clear = () => {
    this.dataArray = this.dataArray ? null : this.dataArray;
  };
}

let logger;
export function getLogUtils() {
  if(!logger) {
    logger = new LogUtils();
  }
  return logger;
}