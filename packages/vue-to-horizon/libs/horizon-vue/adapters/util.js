
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
