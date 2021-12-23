import {TYPE_FORWARD_REF} from '../utils/elementType';

export function forwardRef(render: Function) {
  return {
    vtype: TYPE_FORWARD_REF,
    render,
  };
}
