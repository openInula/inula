
export function createRegExp(expression: string) {
  let str = expression;
  if (str[0] === '/') {
    str = str.slice(1);
  }
  if (str[str.length - 1] === '/') {
    str = str.slice(0, str.length - 1);
  }
  try {
    return new RegExp(str, 'i');
  } catch (err) {
    return null;
  }
}