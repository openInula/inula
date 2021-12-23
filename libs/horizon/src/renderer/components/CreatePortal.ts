import {TYPE_PORTAL} from '../utils/elementType';
import type {PortalType} from '../Types';

export function createPortal(
  children: any,
  outerDom: any,
  key: string = null,
): PortalType {
  return {
    vtype: TYPE_PORTAL,
    key: key == null ? null : '' + key,
    children,
    outerDom,
  };
}
