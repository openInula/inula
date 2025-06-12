declare function mapChildren(children: any, func: Function, context?: any): Array<any>;
declare const Children: {
    forEach: (children: any, func: any, context?: any) => void;
    map: typeof mapChildren;
    count: (children: any) => number;
    only: (children: any) => any;
    toArray: (children: any) => any[];
};
export { Children };
