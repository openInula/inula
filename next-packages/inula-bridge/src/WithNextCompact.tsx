import { compBuilder, createHTMLNode } from '@openinula/next';
import { createElement, render } from 'openinula';

export default function withNextCompat(component) {
  function NextComponent(props) {
    const self = compBuilder();
    self.addProp(
      '$whole$',
      value =>
        (props = {
          ...props,
          ...value,
        }),
      1
    );

    let div;

    function renderLegacy(props) {
      render(createElement(component, props), div!);
    }

    self.watch(
      () => {
        if (div) {
          renderLegacy(props);
        }
      },
      () => [props],
      1
    );

    self.didMount(() => {
      renderLegacy(props);
    });

    return self.prepare().init(
      createHTMLNode('div', node => {
        div = node;
      })
    );
  }
  return NextComponent;
}
