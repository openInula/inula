import type {VNode} from '../../renderer/Types';
import {CustomBaseEvent} from './CustomBaseEvent';

export class CustomMouseEvent extends CustomBaseEvent {
  relatedTarget: EventTarget;

  constructor(
    customEvtName: string | null,
    nativeEvtName: string,
    nativeEvt: { [propName: string]: any },
    vNode: VNode,
    target: null | EventTarget
  ) {
    super(customEvtName, nativeEvtName, nativeEvt, vNode, target);

    let relatedTarget = nativeEvt.relatedTarget;
    if (relatedTarget === undefined) {
      if (nativeEvt.fromElement === nativeEvt.srcElement) {
        relatedTarget = nativeEvt.toElement;
      } else {
        relatedTarget = nativeEvt.fromElement;
      }
    }
    this.relatedTarget = relatedTarget;
  }
}
