
export function isInputElement(dom?: HTMLElement): boolean {
  return dom instanceof HTMLInputElement || dom instanceof HTMLTextAreaElement;

}

export function setPropertyWritable(obj, propName) {
  const desc = Object.getOwnPropertyDescriptor(obj, propName);
  if (!desc || !desc.writable) {
    Object.defineProperty(obj, propName, { writable : true });
  }
}
