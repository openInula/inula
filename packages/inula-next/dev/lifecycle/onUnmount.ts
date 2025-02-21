import { compBuilder, createHTMLNode, setHTMLProp } from '../../src';

export const Time = () => {
  const self = compBuilder();
  
  let time = new Date().toLocaleTimeString()
  let interval: number

  self.didMount = () => {
    interval = setInterval(() => {
      self.wave(time = new Date().toLocaleTimeString(), [0b0001])
    }, 1000)
  }

  self.willUnmount = () => {
    clearInterval(interval)
  }

  self.body = () => {
    const $node0 = createHTMLNode('h1');
    setHTMLProp($node0, 'textContent', () => time, [time]);

    return [
      $node0,
      (dirty) => {
        if (dirty & 0b0001) setHTMLProp($node0, 'textContent', () => time, [time]);
      },
    ]
  }

  return self.init();
}