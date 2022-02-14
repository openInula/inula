
// 支持的输入框类型
const supportedInputTypes = ['color', 'date', 'datetime', 'datetime-local', 'email', 'month',
  'number', 'password', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'];

export function isTextInputElement(dom?: HTMLElement): boolean {
  if (dom instanceof HTMLInputElement) {
    return supportedInputTypes.includes(dom.type);
  }

  const nodeName = dom && dom.nodeName && dom.nodeName.toLowerCase();
  return nodeName === 'textarea';
}


// 例：dragEnd -> onDragEnd
export function addOnPrefix(name) {
  if (!name) {
    return '';
  }
  return 'on' + name[0].toUpperCase() + name.slice(1);
}
