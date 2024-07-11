export { type Properties as CSSProperties } from 'csstype';

// ---- With actual value
export function render(DL: any, idOrEl: string | HTMLElement): void;

export function willMount(fn: () => void): void;
export function didMount(fn: () => void): void;
export function willUnmount(fn: () => void): void;
export function didUnmount(fn: () => void): void;
interface Context<V> {
  value: V;
}

export function createContext<T>(defaultVal: T): Context<T>;
export function useContext<T>(ctx: Context<T>): T;

export const View: any;
export const update: any;
