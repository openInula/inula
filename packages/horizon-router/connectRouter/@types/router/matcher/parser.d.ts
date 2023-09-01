import { GetURLParams, Parser, ParserOption } from './types';
export type Params<P> = {
    [K in keyof P]?: P[K];
};
export type Matched<P = any> = {
    score: number[];
    params: Params<P>;
    path: string;
    url: string;
    isExact: boolean;
};
export declare function createPathParser<Str extends string>(pathname: Str, option?: ParserOption): Parser<GetURLParams<Str>>;
export declare function createPathParser<P = unknown>(pathname: string, option?: ParserOption): Parser<P>;
/**
 * @description 依次使用pathname与pattern进行匹配，根据匹配分数取得分数最高结果
 */
export declare function matchPath<P = any>(pathname: string, pattern: string | string[], option?: ParserOption): Matched<P> | null;
export declare function generatePath<P = any>(path: string, params: Params<P>): string;
