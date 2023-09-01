import { BaseRouterProps } from './BrowserRouter';
import { urlHashType } from '../history/hashHistory';
export type HashRouterProps = BaseRouterProps & {
    hashType: urlHashType;
};
declare function HashRouter<P extends Partial<HashRouterProps>>(props: P): JSX.Element;
export default HashRouter;
