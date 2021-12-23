import {TYPE_MEMO} from '../utils/elementType';

export function memo<Props>(type, compare?: (oldProps: Props, newProps: Props) => boolean) {
  return {
    vtype: TYPE_MEMO,
    type: type,
    compare: compare === undefined ? null : compare,
  };
}
