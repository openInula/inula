import { HistoryProps, Listener, Navigation, Prompt } from './types';
import transitionManager from './transitionManager';
export declare function getBaseHistory<S>(transitionManager: transitionManager<S>, setListener: (delta: number) => void, browserHistory: History): {
    go: (step: number) => void;
    goBack: () => void;
    goForward: () => void;
    listen: (listener: Listener<S>) => () => void;
    block: (prompt?: Prompt<S>) => () => void;
    getUpdateStateFunc: (historyProps: HistoryProps<S>) => (nextState: Navigation<S> | undefined) => void;
};
