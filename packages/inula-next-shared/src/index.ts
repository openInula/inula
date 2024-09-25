export enum InulaNodeType {
  Comp = 0,
  For = 1,
  Cond = 2,
  Exp = 3,
  Hook = 4,
  Context = 5,
  Children = 6,
}

export function getTypeName(type: InulaNodeType): string {
  return InulaNodeType[type];
}
