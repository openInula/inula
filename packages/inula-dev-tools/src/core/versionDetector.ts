/**
 * 版本检测器
 * 自动检测页面使用的 Inula 版本
 */

import { InulaVersion } from '../comm/types';

export class VersionDetector {
  /**
   * 检测页面中的 Inula 版本
   */
  static detect(): InulaVersion {
    if (typeof window === 'undefined') {
      return InulaVersion.V1;
    }

    const win = window as any;

    // 检测 2.0 版本的特征
    const hasV2Features = 
      // 检查编译后的组件是否包含 2.0 特有的结构
      win.__INULA_NEXT__ ||
      win.__INULA_V2__ ||
      // 检查是否有 CompNode 相关的全局对象
      win.__INULA_COMP_NODES__ ||
      // 检查 DOM 元素上是否有 2.0 特有的属性
      this.checkDOMForV2Features();

    if (hasV2Features) {
      console.log('[Inula DevTools] 检测到 Inula 2.0 项目');
      return InulaVersion.V2;
    }

    // 检测 1.0 版本的特征
    const hasV1Features = 
      win.__INULA_DEV_TOOL_HELPER__ ||
      win.Inula ||
      this.checkDOMForV1Features();

    if (hasV1Features) {
      console.log('[Inula DevTools] 检测到 Inula 1.0 项目');
      return InulaVersion.V1;
    }

    // 默认返回 1.0
    console.warn('[Inula DevTools] 未能明确检测版本，默认使用 1.0');
    return InulaVersion.V1;
  }

  /**
   * 检查 DOM 中是否有 2.0 特征
   */
  private static checkDOMForV2Features(): boolean {
    if (typeof document === 'undefined') return false;

    // 检查 DOM 元素上的属性
    const elements = document.querySelectorAll('[data-inula-next]');
    if (elements.length > 0) return true;

    // 检查脚本标签
    const scripts = Array.from(document.getElementsByTagName('script'));
    const hasNextRuntime = scripts.some(script => 
      script.src.includes('@openinula/next') || 
      script.src.includes('inula-next')
    );

    return hasNextRuntime;
  }

  /**
   * 检查 DOM 中是否有 1.0 特征
   */
  private static checkDOMForV1Features(): boolean {
    if (typeof document === 'undefined') return false;

    // 检查 DOM 元素上的属性
    const elements = document.querySelectorAll('[data-inula-fiber]');
    if (elements.length > 0) return true;

    // 检查脚本标签
    const scripts = Array.from(document.getElementsByTagName('script'));
    const hasV1Runtime = scripts.some(script => 
      script.src.includes('openinula') && !script.src.includes('next')
    );

    return hasV1Runtime;
  }

  /**
   * 监听版本变化
   */
  static watchVersion(callback: (version: InulaVersion) => void): () => void {
    let currentVersion = this.detect();
    callback(currentVersion);

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(() => {
      const newVersion = this.detect();
      if (newVersion !== currentVersion) {
        currentVersion = newVersion;
        callback(newVersion);
      }
    });

    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-inula-next', 'data-inula-fiber'],
      });
    }

    // 返回取消监听的函数
    return () => observer.disconnect();
  }
}
