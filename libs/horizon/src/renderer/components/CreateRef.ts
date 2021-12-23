import type {RefType} from '../Types';

export function createRef(): RefType {
  return {
    current: null,
  };
}
