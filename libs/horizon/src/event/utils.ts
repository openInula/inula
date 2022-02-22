
export function isInputElement(dom?: HTMLElement): boolean {
  if (dom instanceof HTMLInputElement || dom instanceof HTMLTextAreaElement) {
    return true;
  }
  return false;
}

export function setPropertyWritable(obj, propName) {
  const desc = Object.getOwnPropertyDescriptor(obj, propName);
  if (!desc || !desc.writable) {
    Object.defineProperty(obj, propName, { writable : true });
  }
}
