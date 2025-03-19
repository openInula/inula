import { compBuilder, createFragmentNode, createHTMLNode, setHTMLProp, delegateEvent, createForNode } from "../src";

export const ForTest = () => {
  const self = compBuilder()

  // let data = [1, 2, 3, 4, 5]; // 0b0001
  let dataWithKey = [{
    key: 1,
    value: 1
  }, {
    key: 2,
    value: 2
  }]

  const addData = () => {
    self.wave(dataWithKey.push({
      key: dataWithKey.length + 1,
      value: dataWithKey.length + 1
    }), 0b001);
  }

  const removeData = () => {
    self.wave(dataWithKey.pop(), 0b001);
  }

  const shuffleData = () => {
    self.wave(dataWithKey.sort(() => Math.random() - 0.5), 0b001);
  }

  return self.prepare().init(
    createFragmentNode(
      createHTMLNode('button', node => {
        setHTMLProp(node, 'textContent', () => 'Add Data', [], 0b0001);
        delegateEvent(node, 'click', addData);
      }),
      createHTMLNode('button', node => {
        setHTMLProp(node, 'textContent', () => 'Remove Data', [], 0b0001);
        delegateEvent(node, 'click', removeData);
      }),
      createHTMLNode('button', node => {
        setHTMLProp(node, 'textContent', () => 'Shuffle Data', [], 0b0001);
        delegateEvent(node, 'click', shuffleData);
      }),
      createForNode(
        () => dataWithKey.map(item => item.value), 
        () => dataWithKey.map(item => item.key),
        (node, updateItemFuncArr, item, key, idx) =>  {
          updateItemFuncArr[idx] = (newItem, newIdx) => {
            item = newItem
            idx = newIdx
          }
          return [
            createHTMLNode('div', node => {
              setHTMLProp(node, 'textContent', () => `${item} at ${idx} with key ${key}`, [item, idx], 0b0001);
            }
          ),
      ]},
      0b0001
    ),
    )
  )
}
