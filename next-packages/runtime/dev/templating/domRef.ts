import { compBuilder, createHTMLNode, setHTMLProp } from '../../src';

export const DomRef = () => {
  const self = compBuilder();
  let inputElement: HTMLInputElement;

  self.didMount = () => {
    inputElement.focus()
  }
  self.body = () => {
    const $node0 = createHTMLNode('input');
    inputElement = $node0 as unknown as HTMLInputElement;

    return [
      $node0,
      (dirty) => {
      },
    ]
  };
  return self.init();
}