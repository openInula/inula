import { compBuilder } from '../CompNode/node';
import { InulaBaseNode, createExpNode } from '../..';

export function Dynamic({
  component,
  ...rest
}: {
  component: (props: { [key: string]: any }) => InulaBaseNode[];
  [key: string]: any;
}) {
  const self = compBuilder();
  self.addProp('component', $$value => (component = $$value), 1);
  self.addProp(
    '$rest$',
    $$value =>
      (rest = {
        ...rest,
        ...$$value,
      }),
    2
  );
  return self.prepare().init(
    createExpNode(
      () => (typeof component === 'function' ? component(rest) : component),
      () => [component, rest],
      3
    )
  );
}
