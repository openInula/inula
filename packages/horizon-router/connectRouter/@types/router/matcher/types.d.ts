import { Matched, Params } from './parser';
export type Token = {
    type: TokenType;
    value: string;
};
export declare enum TokenType {
    Delimiter = "delimiter",
    Static = "static",
    Param = "param",
    WildCard = "wildcard",
    LBracket = "(",
    RBracket = ")",
    Pattern = "pattern"
}
export interface Parser<P> {
    regexp: RegExp;
    keys: string[];
    parse(url: string): Matched<P> | null;
    compile(params: Params<P>): string;
}
export type ParserOption = {
    caseSensitive?: boolean;
    strictMode?: boolean;
    exact?: boolean;
};
type ClearLeading<U extends string> = U extends `/${infer R}` ? ClearLeading<R> : U;
type ClearTailing<U extends string> = U extends `${infer L}/` ? ClearTailing<L> : U;
type ParseParam<Param extends string> = Param extends `:${infer R}` ? {
    [K in R]: string;
} : {};
type MergeParams<OneParam extends Record<string, any>, OtherParam extends Record<string, any>> = {
    readonly [Key in keyof OneParam | keyof OtherParam]?: string;
};
type ParseURLString<Str extends string> = Str extends `${infer Param}/${infer Rest}` ? MergeParams<ParseParam<Param>, ParseURLString<ClearLeading<Rest>>> : ParseParam<Str>;
export type GetURLParams<U extends string> = ParseURLString<ClearLeading<ClearTailing<U>>>;
export {};
