import { Location } from './index';
import { Action } from '../history/types';
type PromptProps = {
    message?: string | ((location: Partial<Location>, action: Action) => void);
    when?: boolean | ((location: Partial<Location>) => boolean);
};
declare function Prompt<P extends PromptProps>(props: P): JSX.Element;
export default Prompt;
