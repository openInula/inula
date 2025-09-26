export declare type Node = {
    id: number;
    order: number;
};
export declare function add(node: Node): void;
export declare function first(): Node | null;
export declare function shift(): Node | null;
export declare function remove(node: Node): void;
