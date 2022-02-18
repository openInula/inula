
export function isInputElement(dom?: HTMLElement): boolean {
  if (dom instanceof HTMLInputElement || dom instanceof HTMLTextAreaElement) {
    return true;
  }
  return false;
}


// 例：dragEnd -> onDragEnd
export function addOnPrefix(name) {
  if (!name) {
    return '';
  }
  return 'on' + name[0].toUpperCase() + name.slice(1);
}

export function setPropertyWritable(obj, propName) {
  const desc = Object.getOwnPropertyDescriptor(obj, propName);
  if (!desc || !desc.writable) {
    Object.defineProperty(obj, propName, { writable : true });
  }
}
