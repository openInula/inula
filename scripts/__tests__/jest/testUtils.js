import { allDelegatedNativeEvents } from '../../../libs/horizon/src/event/EventCollection';
//import * as LogUtils from './logUtils';

export const stopBubbleOrCapture = (e, value) => {
  const LogUtils = getLogUtils();
  LogUtils.log(value);
  e.stopPropagation();
};

export const getEventListeners = (dom) => {
  let ret = true;
  let keyArray = [];
  for (let key in dom) {
    keyArray.push(key);
  }
  console.log(keyArray);
  console.log('---------------------------------');
  console.log(allDelegatedNativeEvents);
  try {
    allDelegatedNativeEvents.forEach(event => {
      if (!keyArray.includes(event)) {
        ret = false;
        throw new Error('没有挂载全量事件');
      }
    });
  } catch (error) {
    console.log(error);
  }
  return ret;
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