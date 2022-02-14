import {horizonEventToNativeMap} from './const';

// 需要委托的horizon事件和原生事件对应关系
export const allDelegatedHorizonEvents = new Map();
// 所有委托的原生事件集合
export const allDelegatedNativeEvents = new Set();

horizonEventToNativeMap.forEach((dependencies, horizonEvent) => {
  allDelegatedHorizonEvents.set(horizonEvent, dependencies);
  allDelegatedHorizonEvents.set(horizonEvent + 'Capture', dependencies);

  dependencies.forEach(d => {
    allDelegatedNativeEvents.add(d);
  });
});
