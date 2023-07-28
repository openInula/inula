import { AnyNativeEvent } from './Types';
export declare class WrappedEvent {
    customEventName: string;
    nativeEvent: AnyNativeEvent;
    nativeEventType: string;
    type: string;
    key: string;
    currentTarget: EventTarget | null;
    target: HTMLElement;
    relatedTarget: HTMLElement;
    stopPropagation: () => void;
    preventDefault: () => void;
    propagationStopped: boolean;
    isPropagationStopped: () => boolean;
    getModifierState?: (keyArgs: string) => boolean;
    persist: () => void;
    constructor(customEventName: string, nativeEvtName: string, nativeEvent: AnyNativeEvent);
    isDefaultPrevented(): boolean;
}
export declare function decorateNativeEvent(customEventName: string, nativeEvtName: string, nativeEvent: AnyNativeEvent): WrappedEvent;
