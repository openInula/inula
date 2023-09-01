import * as React from 'react';
import { History } from '../history/types';
export type RouterProps = {
    history: History;
    children?: React.ReactNode;
};
declare function Router<P extends RouterProps>(props: P): JSX.Element;
export default Router;
