import { BaseOption, DefaultStateType, History } from './types';
export type BrowserHistoryOption = {
    /**
     * forceRefresh为True时跳转时会强制刷新页面
     */
    forceRefresh?: boolean;
} & BaseOption;
export declare function createBrowserHistory<S = DefaultStateType>(options?: BrowserHistoryOption): History<S>;
