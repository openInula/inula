/**
 * 定义vNode的类型
 */
export type VNodeTag = string;

export const TreeRoot = 'TreeRoot'; // tree的根节点，用于存放一些tree级的变量
export const FunctionComponent = 'FunctionComponent';
export const ClassComponent = 'ClassComponent';
export const ClsOrFunComponent = 'ClsOrFunComponent';
export const DomPortal = 'DomPortal';
export const DomComponent = 'DomComponent';
export const DomText = 'DomText';
export const Fragment = 'Fragment';
export const ContextConsumer = 'ContextConsumer';
export const ContextProvider = 'ContextProvider';
export const ForwardRef = 'ForwardRef';
export const Profiler = 'Profiler';
export const SuspenseComponent = 'SuspenseComponent';
export const MemoComponent = 'MemoComponent';
export const LazyComponent = 'LazyComponent';
export const IncompleteClassComponent = 'IncompleteClassComponent';
