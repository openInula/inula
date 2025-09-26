import { InulaNode } from '@cloudsop/horizon';
type AnyProps = Record<string, any>;
/**
 * Custom Hook to simulate Vue's fallthrough attributes functionality
 * @param props Component props
 * @param excludeList Parameters declared as props do not fallthrough
 * @returns fallthrough attributes
 */
export declare function useAttrs<T extends AnyProps>(props: T, excludeList?: (keyof T)[]): Omit<T, keyof T & string>;
type Slots = {
    [key: string]: SlotFunction | InulaNode;
    default?: InulaNode;
};
type SlotFunction = (props: any) => InulaNode;
/**
 * Custom Hook to simulate Vue's useSlots functionality in React
 * @param props Component props
 * @returns An object containing all slots, including the default slot
 */
export declare function useSlots(props: AnyProps): Slots;
export declare function defineExpose<Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed): void;
type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>;
type EmitsOptions = ObjectEmitsOptions | string[];
export declare function defineEmits<T extends EmitsOptions>(emits: T, props: AnyProps): <K extends keyof T>(eventName: K, ...args: Parameters<any>) => void;
export {};
