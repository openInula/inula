/**
 * 钩子注入器
 * 根据检测到的版本注入相应的钩子
 */

import { InulaVersion } from '../comm/types';
import { VersionDetector } from '../core/versionDetector';

export class HookInjector {
  private injected = false;
  private currentVersion: InulaVersion | null = null;

  /**
   * 注入钩子
   */
  inject(): void {
    if (this.injected) {
      console.warn('[Inula DevTools] Hook already injected');
      return;
    }

    // 检测版本
    const version = VersionDetector.detect();
    this.currentVersion = version;

    // 根据版本注入相应的脚本
    if (version === InulaVersion.V2) {
      this.injectV2Hook();
    } else {
      this.injectV1Hook();
    }

    this.injected = true;
    console.log(`[Inula DevTools] Hook injected for version ${version}`);
  }

  /**
   * 注入 V2 钩子
   */
  private injectV2Hook(): void {
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        // V2 Hook 代码将在这里注入
        console.log('[Inula DevTools] V2 Hook script loaded');
        
        // 标记版本
        window.__INULA_V2__ = true;
        window.__INULA_DEV_TOOLS_ACTIVE__ = true;
      })();
    `;
    
    if (document.documentElement) {
      document.documentElement.appendChild(script);
      script.remove();
    }
  }

  /**
   * 注入 V1 钩子
   */
  private injectV1Hook(): void {
    // V1 已经有现有的钩子机制
    console.log('[Inula DevTools] Using existing V1 hook');
  }

  /**
   * 监听版本变化并重新注入
   */
  watchAndInject(): () => void {
    const unwatch = VersionDetector.watchVersion((version) => {
      if (version !== this.currentVersion) {
        console.log(`[Inula DevTools] Version changed from ${this.currentVersion} to ${version}`);
        this.injected = false;
        this.inject();
      }
    });

    return unwatch;
  }
}

export const hookInjector = new HookInjector();
