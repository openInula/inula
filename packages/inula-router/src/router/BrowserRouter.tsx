import Inula from 'openinula';
import { useRef, InulaNode } from 'openinula';
import Router from './Router';
import { createBrowserHistory } from '../history/browerHistory';
import { ConfirmationFunc, History } from '../history/types';

export type BaseRouterProps = {
  basename: string;
  getUserConfirmation: ConfirmationFunc;
  children?: InulaNode;
};

export type BrowserRouterProps = BaseRouterProps & {
  forceRefresh: boolean;
};

function BrowserRouter<P extends Partial<BrowserRouterProps>>(props: P) {
  // 使用Ref持有History对象，防止重复渲染
  let historyRef = useRef<History>();

  if (historyRef.current === null || historyRef.current === undefined) {
    historyRef.current = createBrowserHistory({
      basename: props.basename,
      forceRefresh: props.forceRefresh,
      getUserConfirmation: props.getUserConfirmation,
    });
  }

  return <Router history={historyRef.current}>{props.children}</Router>;
}

export default BrowserRouter;