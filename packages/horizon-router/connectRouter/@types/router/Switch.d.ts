import * as React from 'react';
import { Location } from './index';
export type SwitchProps = {
    location?: Location;
    children?: React.ReactNode;
};
declare function Switch<P extends SwitchProps>(props: P): React.ReactElement | null;
export default Switch;
