export const EffectConstant = {
  NoEffect: 0,
  DepsChange: 1, // dependence发生了改变
  LayoutEffect: 2, // 同步触发的effect
  Effect: 4, // 异步触发的effect
};
