import { PropDetails } from './PropertiesData';
export declare function isNativeElement(tagName: string, props: Record<string, any>): boolean;
export declare function isEventProp(propName: any): boolean;
export declare function isInvalidValue(name: string, value: any, propDetails: PropDetails | null, isNativeTag: boolean): boolean;
export declare function validateProps(type: any, props: any): void;
