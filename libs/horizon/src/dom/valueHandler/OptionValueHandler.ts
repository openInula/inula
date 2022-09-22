import { Children } from '../../external/ChildrenUtil';
import { Props } from '../utils/Interface';

// 把 const a = 'a'; <option>gir{a}ffe</option> 转成 giraffe
function concatChildren(children) {
  let content = '';
  Children.forEach(children, function(child) {
    content += child;
  });

  return content;
}

export function getOptionPropsWithoutValue(dom: Element, props: Props) {
  const content = concatChildren(props.children);

  return {
    ...props,
    children: content || undefined, // 覆盖children
  };
}
