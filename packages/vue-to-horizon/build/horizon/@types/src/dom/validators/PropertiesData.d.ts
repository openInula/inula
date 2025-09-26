export declare enum PROPERTY_TYPE {
    BOOLEAN = 0,
    STRING = 1,
    SPECIAL = 2,
    BOOLEAN_STR = 3
}
export declare type PropDetails = {
    propName: string;
    type: PROPERTY_TYPE;
    attrName: string;
    attrNS: string | null;
};
export declare function getPropDetails(name: string): PropDetails | null;
