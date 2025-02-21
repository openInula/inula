export enum InulaNodeType {
  Comp = 0,
  For = 1,
  Cond = 2,
  Exp = 3,
  Hook = 4,
  Context = 5,
  Children = 6,
  Fragment = 7,
  Portal = 8,
  Suspense = 9,
  // ---- Not adding these 2 types because we're using the raw dom nodes and
  //      we don't want to increase memory usage by adding these types to the nodes.
  // HTML = 8,
  // Text = 9,
}
