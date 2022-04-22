import * as Horizon from '@cloudsop/horizon/index.ts';

describe('Dom Textarea', () => {
  it('设置value', () => {
    let realNode = Horizon.render(<textarea value='text' />, container);
    expect(realNode.getAttribute('value')).toBe(null);
    expect(realNode.value).toBe('text');
    realNode = Horizon.render(<textarea value={0} />, container);
    expect(realNode.getAttribute('value')).toBe(null);
    expect(realNode.value).toBe('0');
    realNode = Horizon.render(<textarea value={true} />, container);
    expect(realNode.getAttribute('value')).toBe(null);
    expect(realNode.value).toBe('true');
    realNode = Horizon.render(<textarea value={false} />, container);
    expect(realNode.getAttribute('value')).toBe(null);
    expect(realNode.value).toBe('false');
  });

  it('设置value为对象', () => {
    let textareaValue = {
      toString: () => {
        return 'Vue';
      }
    };
    const textareaNode = (
      <textarea value={textareaValue} />
    );
    const realNode = Horizon.render(textareaNode, container);
    expect(realNode.value).toBe('Vue');
    textareaValue = {
      toString: () => {
        return 'React';
      }
    };
    const newTextareaNode = <textarea value={textareaValue} />;
    // 改变value会影响select的状态
    Horizon.render(newTextareaNode, container);
    expect(realNode.value).toBe('React');
  });

  it('受控组件value不变', () => {
    let realNode = Horizon.render(<textarea value='text' />, container);
    expect(realNode.getAttribute('value')).toBe(null);
    expect(realNode.value).toBe('text');
    // 先修改
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    ).set.call(realNode, 'textabc');
    // 再触发事件
    container.querySelector('textarea').dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: true,
      }),
    );
    // 组件受控，想要改变value，需要通过onChange改变state
    expect(realNode.value).toBe('text');
  });

  it('设置defaultValue', () => {
    let defaultVal = 'Vue';
    const textareaNode = <textarea defaultValue={defaultVal} />;
    let realNode = Horizon.render(textareaNode, container);
    expect(realNode.value).toBe('Vue');

    defaultVal = 'React';
    // 改变defaultValue没有影响
    realNode = Horizon.render(textareaNode, container);
    expect(realNode.value).toBe('Vue');

    Horizon.unmountComponentAtNode(container);
    defaultVal = 0;
    realNode = Horizon.render(<textarea defaultValue={defaultVal} />, container);
    expect(realNode.value).toBe('0');

    Horizon.unmountComponentAtNode(container);
    defaultVal = true;
    realNode = Horizon.render(<textarea defaultValue={defaultVal} />, container);
    expect(realNode.value).toBe('true');

    Horizon.unmountComponentAtNode(container);
    defaultVal = false;
    realNode = Horizon.render(<textarea defaultValue={defaultVal} />, container);
    expect(realNode.value).toBe('false');

    Horizon.render(<textarea>123</textarea>, container);
    expect(realNode.value).toBe('false');
  });

  it('设置defaultValue为对象', () => {
    let textareaValue = {
      toString: () => {
        return 'Vue';
      }
    };
    const textareaNode = (
      <textarea defaultValue={textareaValue} />
    );
    const realNode = Horizon.render(textareaNode, container);
    expect(realNode.value).toBe('Vue');

  });

  it('设置defaultValue后,select不受控', () => {
    const textareaNode = <textarea defaultValue={'text'} />;
    let realNode = Horizon.render(textareaNode, container);
    expect(realNode.value).toBe('text');

    // 先修改
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    ).set.call(realNode, 'ABC');
    // 再触发事件
    container.querySelector('textarea').dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: true,
      }),
    );
    // 鼠标改变textarea生效
    Horizon.render(textareaNode, container);
    expect(realNode.value).toBe('ABC');
  });

  it('受控与非受控切换', () => {
    // 非受控切换为受控
    let realNode = Horizon.render(<textarea defaultValue='text' />, container);
    expect(realNode.value).toBe('text');
    Horizon.render(<textarea value='newtext' onChange={() => {}} />, container);
    expect(realNode.value).toBe('newtext');

    Horizon.unmountComponentAtNode(container);
    // 受控切换为非受控
    realNode = Horizon.render(<textarea value='text' onChange={() => {}} />, container);
    expect(realNode.value).toBe('text');
    Horizon.render(<textarea defaultValue='newtext' onChange={() => {}} />, container);
    expect(realNode.value).toBe('text');
  });

  it('textarea的孩子', () => {
    let realNode = Horizon.render(<textarea>{1234}</textarea>, container);
    expect(realNode.value).toBe('1234');
    realNode = Horizon.render(<textarea>{5678}</textarea>, container);
    // realNode.value依旧为1234
    expect(realNode.value).toBe('1234');
  });

});