import { allDelegatedNativeEvents } from '../../../libs/horizon/src/event/EventCollection';
import * as LogUtils from './logUtils';

export const stopBubbleOrCapture = (e, value) => {
  LogUtils.log(value)
  e.stopPropagation();
};

export const getEventListeners = (dom) => {
  let ret = true
  let keyArray = [];
  for (var key in dom) {
    keyArray.push(key);
  }
  try {
    allDelegatedNativeEvents.forEach(event => {
      if (!keyArray.includes(event)) {
        ret = false;
        throw new Error('没有挂载全量事件');
      }
    })
  } catch (error) {

  }
  return ret;
};