type StringRegexList = string | RegExp | (string | RegExp)[];
interface KeepAliveProps {
    include?: StringRegexList;
    max?: number;
    exclude?: StringRegexList;
    children?: any;
}
export default function KeepAlive({ children, exclude, include, max }: KeepAliveProps): any;
export {};
