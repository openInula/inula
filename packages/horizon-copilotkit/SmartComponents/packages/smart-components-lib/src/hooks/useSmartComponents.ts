import { useEffect, useCallback } from 'react';
import { globalRegistry } from '../registry';
import { SmartComponentConfig, UseSmartComponentsReturn } from '../types';

export const useSmartComponents = (): UseSmartComponentsReturn => {
  const registerComponent = useCallback(async (
    name: string, 
    config: SmartComponentConfig, 
    instance: any
  ) => {
    await globalRegistry.register(name, config, instance);
  }, []);

  const isRegistered = useCallback((name: string): boolean => {
    return globalRegistry.getComponent(name) !== undefined;
  }, []);

  return {
    registry: globalRegistry,
    registerComponent,
    isRegistered
  };
};

// 自动注册Hook - 扫描页面中的智能组件并自动注册
export const useAutoRegister = () => {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // 查找具有 data-smart-component 属性的元素
            const smartComponents = element.querySelectorAll('[data-smart-component]');
            smartComponents.forEach((el) => {
              const componentType = el.getAttribute('data-smart-component');
              if (componentType) {
                console.log(`发现智能组件: ${componentType}`);
                // 这里可以添加自动注册逻辑
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);
};

export default useSmartComponents;