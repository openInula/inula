import { IrInstance, IrRequestConfig } from '../../types/interfaces';
import InulaRequest from '../../core/InulaRequest';
import extendInstance from './extendInstance';

function buildInstance(config: IrRequestConfig): IrInstance {
  // 使用上下文 context 将请求和响应的配置和状态集中在一个地方，使得整个 Ir 实例可以共享这些配置和状态，避免了在多个地方重复定义和管理这些配置和状态
  const context = new InulaRequest(config);

  // 将 Ir.prototype.request 方法上下文绑定到 context 上下文，将一个新的函数返回,并将这个新的函数保存到一个 instance 常量中，可以在 instance 实例上使用 Ir 类原型上的方法和属性，同时又可以保证这些方法和属性在当前实例上下文中正确地执行
  const instance = extendInstance(context);

  return instance as any;
}

export default buildInstance;
