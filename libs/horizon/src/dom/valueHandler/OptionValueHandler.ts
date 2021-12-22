import * as Horizon from '../../external/Horizon';
import {IProperty} from '../utils/Interface';

// 把 const a = 'a'; <option>gir{a}ffe</option> 转成 giraffe
function concatChildren(children) {
  let content = '';
  Horizon.Children.forEach(children, function(child) {
    content += child;
  });

  return content;
}

export function getOptionPropsWithoutValue(dom: Element, properties: IProperty) {
  const content = concatChildren(properties.children);

  return {
    ...properties,
    children: content || undefined, // 覆盖children
  };
}
