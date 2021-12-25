import {getVNodeProps} from '../dom/DOMInternalKeys';
import {resetValue} from '../dom/valueHandler';
import {getDomTag} from '../dom/utils/Common';

let updateList = null;

// 受控组件值重新赋值
function updateValue(target: Element) {
  const props = getVNodeProps(target);
  if (props) {
    const type = getDomTag(target);
    resetValue(target, type, props);
  }
}

// 存储队列中缓存组件
export function addValueUpdateList(target: EventTarget): void {
  if (updateList) {
    updateList.push(target);
  } else {
    updateList = [target];
  }
}

// 判断是否需要重新赋值
export function shouldUpdateValue(): boolean {
  return updateList !== null && updateList.length > 0;
}

// 从缓存队列中对受控组件进行赋值
export function updateControlledValue() {
  if (!updateList) {
    return;
  }
  updateList.forEach(item => {
    updateValue(item);
  });
  updateList = null;
}
