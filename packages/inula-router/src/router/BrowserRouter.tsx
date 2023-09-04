import * as React from 'react';
import { useRef, ReactNode } from 'react';
import Router from './Router';
import { createBrowserHistory } from '../history/browerHistory';
import { ConfirmationFunc, History } from '../history/types';

export type BaseRouterProps = {
  basename: string;
  getUserConfirmation: ConfirmationFunc;
  children?: ReactNode;
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