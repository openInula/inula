import {TYPE_FORWARD_REF} from '../../external/JSXElementType';

export function forwardRef(render: Function) {
  return {
    vtype: TYPE_FORWARD_REF,
    render,
  };
}
