/// <reference types="react" />
import { History, Location } from './index';
import { Matched } from './matcher/parser';
export type RouterContextValue = {
    history: History;
    location: Location;
    match: Matched | null;
};
declare const RouterContext: import("react").Context<RouterContextValue>;
export default RouterContext;
