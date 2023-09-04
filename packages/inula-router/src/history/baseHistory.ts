import { HistoryProps, Listener, Navigation, Prompt } from './types';
import transitionManager from './transitionManager';

// 抽取BrowserHistory和HashHistory中相同的方法
export function getBaseHistory<S>(
  transitionManager: transitionManager<S>,
  setListener: (delta: number) => void,
  browserHistory: History,
) {
  function go(step: number) {
    browserHistory.go(step);
  }

  function goBack() {
    browserHistory.go(-1);
  }

  function goForward() {
    browserHistory.go(1);
  }

  function listen(listener: Listener<S>): () => void {
    const cancel = transitionManager.addListener(listener);
    setListener(1);
    return () => {
      setListener(-1);
      cancel();
    };
  }

  let isBlocked = false;

  function block(prompt: Prompt<S> = false): () => void {
    const unblock = transitionManager.setPrompt(prompt);
    if (!isBlocked) {
      setListener(1);
      isBlocked = true;
    }
    return () => {
      if (isBlocked) {
        isBlocked = false;
        setListener(-1);
      }
      unblock();
    };
  }

  function getUpdateStateFunc(historyProps: HistoryProps<S>) {
    return function (nextState: Navigation<S> | undefined) {
      if (nextState) {
        Object.assign(historyProps, nextState);
      }
      historyProps.length = browserHistory.length;
      const args = { location: historyProps.location, action: historyProps.action };
      transitionManager.notifyListeners(args);
    };
  }

  return { go, goBack, goForward, listen, block, getUpdateStateFunc };
}
