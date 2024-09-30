/**
 * @brief Shallowly compare the deps with the previous deps
 * @param deps
 * @param prevDeps
 * @returns
 */
export function equal(deps: any[], prevDeps: any[]) {
  if (!prevDeps || deps.length !== prevDeps.length) return false;
  return deps.every((dep, i) => !(dep instanceof Object) && prevDeps[i] === dep);
}
