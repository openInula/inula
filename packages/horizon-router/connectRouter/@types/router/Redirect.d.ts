import { Matched } from './matcher/parser';
import { Location } from './index';
export type RedirectProps = {
    to: string | Partial<Location>;
    push?: boolean;
    path?: string;
    from?: string;
    exact?: boolean;
    strict?: boolean;
    readonly computed?: Matched | null;
};
declare function Redirect<P extends RedirectProps>(props: P): JSX.Element;
export default Redirect;
