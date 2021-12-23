/**
 * 暂时用于解决测试代码无法运行问题，估计是：测试代码会循环或者重复依赖
 */

import type {
  UseContextHookType,
  UseReducerHookType,
  UseStateHookType
} from '../Types';

const UseStateHookMapping: {val: (null | UseStateHookType)} = {val: null};
const UseReducerHookMapping: {val: (null | UseReducerHookType)} = {val: null};
const UseContextHookMapping: {val: (null | UseContextHookType)} = {val: null};

const hookMapping = {
  UseStateHookMapping,
  UseReducerHookMapping,
  UseContextHookMapping,
}

export default hookMapping;
