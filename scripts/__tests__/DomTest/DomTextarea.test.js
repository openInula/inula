/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import * as Inula from '../../../libs/inula/index';

describe('Dom Textarea', () => {
  it('设置value', () => {
    let realNode = Inula.render(<textarea value='text' />, container);
    expect(realNode.getAttribute('value')).toBe(null);
    expect(realNode.value).toBe('text');
    realNode = Inula.render(<textarea value={0} />, container);
    expect(realNode.getAttribute('value')).toBe(null);
    expect(realNode.value).toBe('0');
    realNode = Inula.render(<textarea value={true} />, container);
    expect(realNode.getAttribute('value')).toBe(null);
    expect(realNode.value).toBe('true');
    realNode = Inula.render(<textarea value={false} />, container);
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
    const realNode = Inula.render(textareaNode, container);
    expect(realNode.value).toBe('Vue');
    textareaValue = {
      toString: () => {
        return 'React';
      }
    };
    const newTextareaNode = <textarea value={textareaValue} />;
    // 改变value会影响select的状态
    Inula.render(newTextareaNode, container);
    expect(realNode.value).toBe('React');
  });

  it('设置defaultValue', () => {
    let defaultVal = 'Vue';
    const textareaNode = <textarea defaultValue={defaultVal} />;
    let realNode = Inula.render(textareaNode, container);
    expect(realNode.value).toBe('Vue');

    defaultVal = 'React';
    // 改变defaultValue没有影响
    realNode = Inula.render(textareaNode, container);
    expect(realNode.value).toBe('Vue');

    Inula.unmountComponentAtNode(container);
    defaultVal = 0;
    realNode = Inula.render(<textarea defaultValue={defaultVal} />, container);
    expect(realNode.value).toBe('0');

    Inula.unmountComponentAtNode(container);
    defaultVal = true;
    realNode = Inula.render(<textarea defaultValue={defaultVal} />, container);
    expect(realNode.value).toBe('true');

    Inula.unmountComponentAtNode(container);
    defaultVal = false;
    realNode = Inula.render(<textarea defaultValue={defaultVal} />, container);
    expect(realNode.value).toBe('false');

    Inula.render(<textarea>123</textarea>, container);
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
    const realNode = Inula.render(textareaNode, container);
    expect(realNode.value).toBe('Vue');

  });

  it('设置defaultValue后,select不受控', () => {
    const textareaNode = <textarea defaultValue={'text'} />;
    let realNode = Inula.render(textareaNode, container);
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
    Inula.render(textareaNode, container);
    expect(realNode.value).toBe('ABC');
  });

  it('受控与非受控切换', () => {
    // 非受控切换为受控
    let realNode = Inula.render(<textarea defaultValue='text' />, container);
    expect(realNode.value).toBe('text');
    Inula.render(<textarea value='newtext' onChange={() => { }} />, container);
    expect(realNode.value).toBe('newtext');

    Inula.unmountComponentAtNode(container);
    // 受控切换为非受控
    realNode = Inula.render(<textarea value='text' onChange={() => { }} />, container);
    expect(realNode.value).toBe('text');
    Inula.render(<textarea defaultValue='newtext' onChange={() => { }} />, container);
    expect(realNode.value).toBe('text');
  });

  it('textarea的孩子', () => {
    let realNode = Inula.render(<textarea>{1234}</textarea>, container);
    expect(realNode.value).toBe('1234');
    realNode = Inula.render(<textarea>{5678}</textarea>, container);
    // realNode.value依旧为1234
    expect(realNode.value).toBe('1234');
  });

});
