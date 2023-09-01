import { Action, Path } from '../history/types';
type Location = Partial<Path>;
export declare enum ActionName {
    LOCATION_CHANGE = "$horizon-router/LOCATION_CHANGE",
    CALL_HISTORY_METHOD = "$horizon-router/CALL_HISTORY_METHOD"
}
export type ActionMessage = {
    type: ActionName.LOCATION_CHANGE;
    payload: {
        location: Location;
        action: Action;
        isFirstRendering: boolean;
    };
} | {
    type: ActionName.CALL_HISTORY_METHOD;
    payload: {
        method: string;
        args: any;
    };
};
export declare const onLocationChanged: (location: Location, action: Action, isFirstRendering?: boolean) => ActionMessage;
export declare const push: (...args: any) => ActionMessage;
export declare const replace: (...args: any) => ActionMessage;
export declare const go: (...args: any) => ActionMessage;
export {};
