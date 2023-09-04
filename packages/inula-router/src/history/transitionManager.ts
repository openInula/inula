import { Action, CallBackFunc, ConfirmationFunc, Listener, Location, Navigation, Prompt, TManager } from './types';

class TransitionManager<S> implements TManager<S> {
  private prompt: Prompt<S>;
  private listeners: Listener<S>[];

  constructor() {
    this.prompt = null;
    this.listeners = [];
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

  // 使用发布订阅模式管理history的监听者
  public addListener(func: Listener<S>): () => void {
    let isActive = true;
    const listener = (args: Navigation<S>) => {
      if (isActive) {
        func(args);
      }
    };
    this.listeners.push(listener);
    return () => {
      isActive = false;
      // 移除对应的监听者
      this.listeners = this.listeners.filter(item => item !== listener);
    };
  }

  public notifyListeners(args: Navigation<S>) {
    for (const listener of this.listeners) {
      listener(args);
    }
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
