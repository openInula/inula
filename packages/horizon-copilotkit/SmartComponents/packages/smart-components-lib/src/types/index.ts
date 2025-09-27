import { ReactNode, RefObject } from 'react';

// 基础组件工具接口
export interface ComponentTool {
  name: string;
  description: string;
  paramsSchema: any;
  cb: (instance: any, value: any) => any;
}

// 组件元数据
export interface SmartComponentMeta {
  name: string;
  description: string;
  category: 'form' | 'input' | 'display' | 'layout' | 'feedback';
  aiPrompts: string[];
  capabilities: string[];
  version: string;
}

// 智能组件配置
export interface SmartComponentConfig {
  meta: SmartComponentMeta;
  tools: Record<string, ComponentTool>;
}

// 注册的组件实例
export interface RegisteredComponent {
  config: SmartComponentConfig;
  instance: any;
  ref: RefObject<any>;
}

// 组件注册表
export interface ComponentRegistry {
  register: (name: string, config: SmartComponentConfig, instance: any) => Promise<void>;
  unregister: (name: string) => void;
  getComponent: (name: string) => RegisteredComponent | undefined;
  getAllComponents: () => Record<string, RegisteredComponent>;
  callTool: (componentName: string, toolName: string, params: any) => Promise<any>;
}

// Hook返回类型
export interface UseSmartComponentsReturn {
  registry: ComponentRegistry;
  registerComponent: (name: string, config: SmartComponentConfig, instance: any) => Promise<void>;
  isRegistered: (name: string) => boolean;
}

// AI识别相关
export interface AIComponentPrompts {
  [componentName: string]: string[];
}

export interface ComponentCapabilities {
  [componentName: string]: string[];
}

// 导出的组件Props类型
export interface SmartComponentProps {
  'data-smart-component'?: string;
  onRegister?: (name: string, instance: any) => void;
  children?: ReactNode;
}