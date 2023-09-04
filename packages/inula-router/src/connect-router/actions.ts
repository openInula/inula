import { Action, Path } from '../history/types';

type Location = Partial<Path>

// 定义位置变化和history方法调用的Action type
export enum ActionName {
  LOCATION_CHANGE = '$horizon-router/LOCATION_CHANGE',
  CALL_HISTORY_METHOD = '$horizon-router/CALL_HISTORY_METHOD'
}

// 定义Action的两种数据类型
export type ActionMessage = {
  type: ActionName.LOCATION_CHANGE
  payload: {
    location: Location,
    action: Action
    isFirstRendering: boolean
  }
} | {
  type: ActionName.CALL_HISTORY_METHOD
  payload: {
    method: string,
    args: any
  }
}


export const onLocationChanged = (location: Location, action: Action, isFirstRendering = false): ActionMessage => {
  return {
    type: ActionName.LOCATION_CHANGE,
    payload: {
      location,
      action,
      isFirstRendering,
    },
  };
};

const updateLocation = (method: string): (...args: any) => ActionMessage => {
  return (...args: any) => ({
    type: ActionName.CALL_HISTORY_METHOD,
    payload: {
      method,
      args,
    },
  });
};

export const push = updateLocation('push');
export const replace = updateLocation('replace');
export const go = updateLocation('go');