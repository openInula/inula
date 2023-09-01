import { ReactNode } from 'react';
import { ConfirmationFunc } from '../history/types';
export type BaseRouterProps = {
    basename: string;
    getUserConfirmation: ConfirmationFunc;
    children?: ReactNode;
};
export type BrowserRouterProps = BaseRouterProps & {
    forceRefresh: boolean;
};
declare function BrowserRouter<P extends Partial<BrowserRouterProps>>(props: P): JSX.Element;
export default BrowserRouter;
