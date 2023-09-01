import { Action, CallBackFunc, ConfirmationFunc, Listener, Location, Navigation, Prompt, TManager } from './types';
declare class TransitionManager<S> implements TManager<S> {
    private prompt;
    private listeners;
    constructor();
    setPrompt(prompt: Prompt<S>): () => void;
    addListener(func: Listener<S>): () => void;
    notifyListeners(args: Navigation<S>): void;
    confirmJumpTo(location: Location<S>, action: Action, userConfirmationFunc: ConfirmationFunc, callBack: CallBackFunc): void;
}
export default TransitionManager;
