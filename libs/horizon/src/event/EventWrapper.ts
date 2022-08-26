// 兼容IE的event key
import { AnyNativeEvent } from './Types';

const uniqueKeyMap = new Map([
  ['Esc', 'Escape'],
  ['Spacebar', ' '],
  ['Left', 'ArrowLeft'],
  ['Up', 'ArrowUp'],
  ['Right', 'ArrowRight'],
  ['Down', 'ArrowDown'],
  ['Del', 'Delete'],
]);

const noop = (): void => {};

// 兼容IE浏览器，无法修改Event属性
export class WrappedEvent {
  customEventName: string;
  nativeEvent: AnyNativeEvent;
  nativeEventType: string;
  type: string;
  key: string;
  currentTarget: EventTarget | null = null;

  stopPropagation: () => void;
  preventDefault: () => void;

  // 适配Keyboard键盘事件该函数不能由合成事件调用
  getModifierState?: (keyArgs: string) => boolean;
  // 适配老版本事件api
  persist = noop;

  constructor(customEventName: string, nativeEvtName: string, nativeEvent: AnyNativeEvent) {
    for (const name in nativeEvent) {
      this[name] = nativeEvent[name];
      if(name === 'getModifierState') {
        const keyBoardEvent = nativeEvent as KeyboardEvent;
        this.getModifierState = (keyArg) => keyBoardEvent.getModifierState(keyArg);
      }
    }
    // stopPropagation和preventDefault 必须通过Event实例调用
    this.stopPropagation = () => nativeEvent.stopPropagation();
    this.preventDefault = () => nativeEvent.preventDefault();

    // custom事件自定义属性
    this.customEventName = customEventName;
    this.nativeEvent = nativeEvent;
    // 保存原生的事件类型，因为下面会修改
    this.nativeEventType = nativeEvent.type;

    this.type = nativeEvtName;

    // 兼容IE的event key
    const orgKey = (nativeEvent as any).key;
    this.key = uniqueKeyMap.get(orgKey) || orgKey;
  }

  isDefaultPrevented(): boolean {
    return this.nativeEvent.defaultPrevented;
  }

  isPropagationStopped(): boolean {
    return this.nativeEvent.cancelBubble;
  }
}

// 创建普通自定义事件对象实例，和原生事件对应
export function decorateNativeEvent(
  customEventName: string,
  nativeEvtName: string,
  nativeEvent: AnyNativeEvent
): WrappedEvent {
  return new WrappedEvent(customEventName, nativeEvtName, nativeEvent);
}
