import { ComponentType, InulaElement } from '@cloudsop/horizon';
interface ComponentsMap {
  [key: string]: ComponentType<any>;
}
interface DynamicComponentProps {
  is: string | ComponentType;
  components?: ComponentsMap;
  [key: string]: any;
}
/**
 * 对标Vue的动态组件，如：<component :is="Math.random() > 0.5 ? Foo : Bar" />
 * @param is
 * @param components
 * @param componentProps
 * @constructor
 */
export declare function DynamicComponent({ is, components, ...componentProps }: DynamicComponentProps): InulaElement;
export {};
