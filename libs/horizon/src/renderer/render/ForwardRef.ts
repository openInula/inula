import type {VNode} from '../Types';
import {captureRender as funCaptureRender} from './FunctionComponent';

export function captureRender(processing: VNode, shouldUpdate?: boolean): VNode | null {
  return funCaptureRender(processing, shouldUpdate);
}

export function bubbleRender() {}

