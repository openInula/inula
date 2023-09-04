export declare function memo<Props>(type: any, compare?: (oldProps: Props, newProps: Props) => boolean): {
    vtype: number;
    $$typeof: number;
    type: any;
    compare: (oldProps: Props, newProps: Props) => boolean;
};
