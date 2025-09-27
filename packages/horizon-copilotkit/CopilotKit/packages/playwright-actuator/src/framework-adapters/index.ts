/**
 * Framework Adapters Index
 * 导出所有框架适配器
 */

export {
  ReactEventAdapter,
  getReactAdapter,
  triggerReactChangeEvent,
  triggerReactInputEvent,
  triggerReactClickEvent,
  type ReactSyntheticEvent,
  type ReactEventTriggerResult
} from './react-adapter.js';

export {
  OpenInulaEventAdapter,
  getOpenInulaAdapter,
  triggerOpenInulaChangeEvent,
  triggerOpenInulaInputEvent,
  triggerOpenInulaClickEvent,
  type OpenInulaEvent,
  type OpenInulaEventTriggerResult
} from './openinula-adapter.js';

// 未来可以添加其他框架适配器，例如：
// export { VueEventAdapter } from './vue-adapter.js';
// export { AngularEventAdapter } from './angular-adapter.js';