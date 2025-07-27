export function flattenArray(items) {
  const result = [];
  if (!Array.isArray(items)) {
    return [items];
  }
  items.forEach(item => result.push(...flattenArray(item)));
  return result;
}
