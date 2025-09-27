import { ComponentRegistry, SmartComponentConfig, RegisteredComponent } from '../types';

class SmartComponentRegistry implements ComponentRegistry {
  private components = new Map<string, RegisteredComponent>();
  private backendUrl = 'http://localhost:8000/api';

  async register(name: string, config: SmartComponentConfig, instance: any): Promise<void> {
    // 本地注册
    this.components.set(name, {
      config,
      instance,
      ref: { current: instance }
    });

    // 准备后端注册数据
    const registrationData = {
      name: config.meta.name,
      description: config.meta.description,
      category: config.meta.category,
      aiPrompts: config.meta.aiPrompts,
      capabilities: config.meta.capabilities,
      tools: Object.entries(config.tools).map(([toolName, tool]: [string, any]) => ({
        name: toolName,
        description: tool.description,
        paramsSchema: tool.paramsSchema
      }))
    };

    // 向后端注册（如果可用）
    try {
      const response = await fetch(`${this.backendUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        console.warn(`后端注册失败: ${response.statusText}`);
      } else {
        console.log(`组件 ${name} 注册成功`);
      }
    } catch (error) {
      console.warn(`向后端注册组件 ${name} 失败:`, error);
    }
  }

  unregister(name: string): void {
    this.components.delete(name);
  }

  getComponent(name: string): RegisteredComponent | undefined {
    return this.components.get(name);
  }

  getAllComponents(): Record<string, RegisteredComponent> {
    const result: Record<string, RegisteredComponent> = {};
    this.components.forEach((component, name) => {
      result[name] = component;
    });
    return result;
  }

  async callTool(componentName: string, toolName: string, params: any): Promise<any> {
    const registeredComponent = this.components.get(componentName);
    
    if (!registeredComponent) {
      throw new Error(`组件 ${componentName} 未注册`);
    }

    const tool = registeredComponent.config.tools[toolName];
    if (!tool) {
      throw new Error(`工具 ${toolName} 在组件 ${componentName} 中不存在`);
    }

    try {
      const result = await tool.cb(registeredComponent.instance, params);
      return result;
    } catch (error) {
      throw new Error(`调用工具 ${toolName} 失败: ${error}`);
    }
  }

  // 获取所有AI提示词
  getAllAIPrompts(): Record<string, string[]> {
    const prompts: Record<string, string[]> = {};
    this.components.forEach((component, name) => {
      prompts[name] = component.config.meta.aiPrompts;
    });
    return prompts;
  }

  // 获取所有组件能力
  getAllCapabilities(): Record<string, string[]> {
    const capabilities: Record<string, string[]> = {};
    this.components.forEach((component, name) => {
      capabilities[name] = component.config.meta.capabilities;
    });
    return capabilities;
  }

  // 根据AI提示词查找组件
  findComponentByPrompt(prompt: string): string[] {
    const matches: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    this.components.forEach((component, name) => {
      const hasMatch = component.config.meta.aiPrompts.some(p => 
        lowerPrompt.includes(p.toLowerCase()) || p.toLowerCase().includes(lowerPrompt)
      );
      if (hasMatch) {
        matches.push(name);
      }
    });

    return matches;
  }
}

// 全局注册表实例
export const globalRegistry = new SmartComponentRegistry();

export default SmartComponentRegistry;