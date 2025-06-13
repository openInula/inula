import type { Action, CallBackFunc, ConfirmationFunc, Location, Prompt, TManager } from './types';

class TransitionManager<S> implements TManager<S> {
  private prompt: Prompt<S>;

  constructor() {
    this.prompt = null;
  }

  public setPrompt(prompt: Prompt<S>): () => void {
    this.prompt = prompt;

    // 清除Prompt
    return () => {
      if (this.prompt === prompt) {
        this.prompt = null;
      }
    };
  }

  public confirmJumpTo(
    location: Location<S>,
    action: Action,
    userConfirmationFunc: ConfirmationFunc,
    callBack: CallBackFunc
  ) {
    if (this.prompt !== null) {
      const result = typeof this.prompt === 'function' ? this.prompt(location, action) : this.prompt;
      if (typeof result === 'string') {
        typeof userConfirmationFunc === 'function' ? userConfirmationFunc(result, callBack) : callBack(true);
      } else {
        callBack(result !== false);
      }
    } else {
      callBack(true);
    }
  }
}

export default TransitionManager;
