export declare function hasSelectionProperties(dom: any): boolean;
export declare function getSelectionInfo(): {
    focusedDom: import("./utils/Interface").InulaDom;
    selectionRange: {
        start: number;
        end: number;
    };
};
export interface SelectionData {
    focusedDom: HTMLInputElement | HTMLTextAreaElement | void;
    selectionRange?: {
        start: number;
        end: number;
    };
}
export declare function resetSelectionRange(preSelectionRangeData: SelectionData): void;
