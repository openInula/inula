export declare enum KEEP_ALIVE_LIFECYCLE {
    ACTIVATE = "componentDidActivate",
    UNACTIVATE = "componentWillUnactivate"
}
export type LifeCycleFunc = () => unknown;
export declare const useActivatePro: (func: LifeCycleFunc) => void;
export declare const useUnActivatePro: (func: LifeCycleFunc) => void;
export type LifeCycleListener = Record<KEEP_ALIVE_LIFECYCLE, Array<LifeCycleFunc>>;
