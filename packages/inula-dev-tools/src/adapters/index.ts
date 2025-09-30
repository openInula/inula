/**
 * 适配器工厂
 * 根据版本自动选择合适的适配器
 */

import { InulaVersion, ComponentTreeNode, ComponentDetail } from '../comm/types';
import { V1Adapter } from './v1Adapter';
import { V2Adapter } from './v2Adapter';

export class AdapterFactory {
  private v1Adapter: V1Adapter;
  private v2Adapter: V2Adapter;

  constructor() {
    this.v1Adapter = new V1Adapter();
    this.v2Adapter = new V2Adapter();
  }

  /**
   * 获取适配器
   */
  getAdapter(version: InulaVersion) {
    return version === InulaVersion.V1 ? this.v1Adapter : this.v2Adapter;
  }

  /**
   * 解析组件树
   */
  parseComponentTree(data: any, version: InulaVersion): ComponentTreeNode[] {
    const adapter = this.getAdapter(version);
    return adapter.parseComponentTree(data);
  }

  /**
   * 构建树形结构
   */
  buildTree(nodes: ComponentTreeNode[], version: InulaVersion): ComponentTreeNode[] {
    const adapter = this.getAdapter(version);
    return adapter.buildTree(nodes);
  }

  /**
   * 解析组件详情
   */
  parseComponentDetail(data: any, id: string | number, version: InulaVersion): ComponentDetail {
    const adapter = this.getAdapter(version);
    return adapter.parseComponentDetail(data, id);
  }

  /**
   * 格式化更新数据
   */
  formatUpdateData(id: string | number, ...args: any[]): any {
    // 根据参数数量判断版本
    if (args.length === 3) {
      // V1: attrName, path, value
      return this.v1Adapter.formatUpdateData(id, args[0], args[1], args[2]);
    } else {
      // V2: propName, value
      return this.v2Adapter.formatUpdateData(id, args[0], args[1]);
    }
  }
}

export const adapterFactory = new AdapterFactory();

export { V1Adapter } from './v1Adapter';
export { V2Adapter } from './v2Adapter';
