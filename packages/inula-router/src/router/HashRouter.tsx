import Inula from '@cloudsop/horizon';
import { useRef } from '@cloudsop/horizon';
import { History } from '../history/types';
import { BaseRouterProps } from './BrowserRouter';
import { createHashHistory, urlHashType } from '../history/hashHistory';
import Router from './Router';

export type HashRouterProps = BaseRouterProps & {
  hashType: urlHashType;
};

function HashRouter<P extends Partial<HashRouterProps>>(props: P) {
  let historyRef = useRef<History>();
  if (historyRef.current === null || historyRef.current === undefined) {
    historyRef.current = createHashHistory({
      basename: props.basename,
      getUserConfirmation: props.getUserConfirmation,
      hashType: props.hashType,
    });
  }

  return <Router history={historyRef.current}>{props.children}</Router>;
}

export default HashRouter;