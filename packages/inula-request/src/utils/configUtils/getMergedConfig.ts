import utils from '../commonUtils/utils';
import deepMerge from './deepMerge';

function getMergedConfig(config1: Record<string, any>, config2: Record<string, any>): Record<string, any> {
  config2 = config2 || {};

  // 定义一个默认的合并策略函数，用于返回源对象的属性值，如果源对象的属性值为 undefined，则返回目标对象的属性值
  const defaultMergeStrategy = (a: any, b: any) => (b !== undefined ? b : a);

  // 创建一个对象，用于存储每个属性的合并策略
  const mergeStrategies: Record<string, (a: any, b: any) => any> = {
    url: defaultMergeStrategy,
    method: defaultMergeStrategy,
    baseURL: defaultMergeStrategy,
    data: defaultMergeStrategy,
    params: defaultMergeStrategy,
    headers: (a: any, b: any) => deepMerge(a || {}, b || {}),
    timeout: defaultMergeStrategy,
    responseType: defaultMergeStrategy,
    onUploadProgress: defaultMergeStrategy,
    onDownloadProgress: defaultMergeStrategy,
    cancelToken: defaultMergeStrategy,
  };

  // 使用 deepMerge 函数将 config1 的属性合并到一个新的空对象中，创建一个名为 mergedConfig 的新对象，用于存储合并后的配置
  const mergedConfig = deepMerge({}, config1);

  for (const key in config2) {
    // 从 mergeStrategies 中获取适当的合并策略函数，如果没有特定的合并策略，使用默认的 defaultMergeStrategy 函数
    const mergeStrategy = mergeStrategies[key] || defaultMergeStrategy;

    // 使用合并策略函数计算合并后的属性值，并将其添加到结果配置对象 mergedConfig 中
    mergedConfig[key] = mergeStrategy(config1[key], config2[key]);
  }

  // 返回合并后的配置对象 mergedConfig
  return mergedConfig;
}

export default getMergedConfig;
