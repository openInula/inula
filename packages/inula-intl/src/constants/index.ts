/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

/**
 * \\(?:u\{[a-fA-F0-9]+}) 匹配形如 \u{0020} 的 Unicode 转义字符。
 * \\x[a-fA-F0-9]{2} 匹配形如 \x0A 的十六进制转义字符。
 * [nrtf'"] 匹配常见的转义字符：\n（换行符）、\r（回车符）、\t（制表符）、\f（换页符）、\'（单引号）和 \"（双引号）。
 */
export const UNICODE_REG = /\\(?:u\{[a-fA-F0-9]+}|x[a-fA-F0-9]{2}|[nrtf'"])/g;

// Horizon需要被保留静态常量
export const HORIZON_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true,
};

// JavaScript 需要被保留原生静态属性
export const NATIVE_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true,
};

// Horizon ForwardRef 组件的静态属性需要被保留
export const HORIZON_FORWARD_REF_STATICS = {
  vtype: true,
  render: true,
  defaultProps: true,
  key: true,
  type: true,
};

// React ForwardRef 组件的静态属性需要被保留
export const REACT_FORWARD_REF_STATICS = {
  $$typeof: true, // horizon 'vtype': true
  render: true, // render
  defaultProps: true, // props
  displayName: true,
  propTypes: true, // type: type,
};

export const FORWARD_REF_STATICS = {...HORIZON_FORWARD_REF_STATICS, ...REACT_FORWARD_REF_STATICS};

// Horizon Memo 组件的静态属性需要被保留
export const HORIZON_MEMO_STATICS = {
  vtype: true, // horizon 'vtype': true
  compare: true,
  defaultProps: true,
  type: true,
};

// 默认复数规则
export const DEFAULT_PLURAL_KEYS = ['zero', 'one', 'two', 'few', 'many', 'other'];

