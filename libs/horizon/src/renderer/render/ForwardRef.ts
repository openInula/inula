import type {VNode} from '../Types';
import {captureRender as funCaptureRender} from './FunctionComponent';

export function captureRender(processing: VNode): VNode | null {
  return funCaptureRender(processing);
}

export function bubbleRender() {}

