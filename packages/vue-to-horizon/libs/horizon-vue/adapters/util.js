
export function reactiveAssign(reactive, obj = {}) {
  Object.keys(obj).forEach(key => {
    reactive[key] = obj[key];
  })
}

export function vForNumber(n, callback) {
  if (n < 1) {
    return;
  }
  return Array.from(new Array(n).keys()).map(i => {
    return callback(i + 1, i);
  })
}

export function classnames(...args) {
  const styleClass = [];
  for (let index = 0; index < args.length; index++) {
    const item = args[index];
    if (item) {
      const type = typeof item;
      if (Array.isArray(item)) {
        styleClass.push(classnames.apply(this, item));
      } else if (type === 'object') {
        Object.keys(item).forEach(k => {
          if (item[k]) {
            styleClass.push(this && this[k] || k);
          }
        });
      } else if (type === 'string' || type === 'number') {
        styleClass.push(this && this[item] || item);
      }
    }
  }
  return styleClass.join(' ');
}
