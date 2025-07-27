/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

import * as Horizon from '@cloudsop/horizon/index.ts';

describe('Dom Attribute', () => {
    it('属性值为null或undefined时，不会设置此属性', () => {
        Horizon.render(<div id="div" />, container);
        expect(container.querySelector('div').getAttribute('id')).toBe('div');
        Horizon.render(<div id={null} />, container);
        expect(container.querySelector('div').hasAttribute('id')).toBe(false);
        Horizon.render(<div id={undefined} />, container);
        expect(container.querySelector('div').hasAttribute('id')).toBe(false);
    });

    it('可以设置未知的属性', () => {
        Horizon.render(<div abcd="abcd" />, container);
        expect(container.querySelector('div').hasAttribute('abcd')).toBe(true);
        expect(container.querySelector('div').getAttribute('abcd')).toBe('abcd');
    });

    it('未知属性的值为null或undefined时，不会设置此属性', () => {
        Horizon.render(<div abcd={null} />, container);
        expect(container.querySelector('div').hasAttribute('abcd')).toBe(false);
        Horizon.render(<div abcd={undefined} />, container);
        expect(container.querySelector('div').hasAttribute('abcd')).toBe(false);
    });

    it('未知属性的值为数字时，属性值会转为字符串', () => {
        Horizon.render(<div abcd={0} />, container);
        expect(container.querySelector('div').getAttribute('abcd')).toBe('0');
        Horizon.render(<div abcd={-3} />, container);
        expect(container.querySelector('div').getAttribute('abcd')).toBe('-3');
        Horizon.render(<div abcd={123.45} />, container);
        expect(container.querySelector('div').getAttribute('abcd')).toBe('123.45');
    });

    it('访问节点的标准属性时可以拿到属性值，访问节点的非标准属性时会得到undefined', () => {
        Horizon.render(<div id={'div'} abcd={0} />, container);
        expect(container.querySelector('div').id).toBe('div');
        expect(container.querySelector('div').abcd).toBe(undefined);
    });

    it('特性方法', () => {
        Horizon.render(<div id={'div'} abcd={0} />, container);
        expect(container.querySelector('div').hasAttribute('abcd')).toBe(true);
        expect(container.querySelector('div').getAttribute('abcd')).toBe('0');
        container.querySelector('div').setAttribute('abcd', 4);
        expect(container.querySelector('div').getAttribute('abcd')).toBe('4');
        container.querySelector('div').removeAttribute('abcd');
        expect(container.querySelector('div').hasAttribute('abcd')).toBe(false);
    });

    it('特性大小写不敏感', () => {
        Horizon.render(<div id={'div'} abcd={0} />, container);
        expect(container.querySelector('div').hasAttribute('abcd')).toBe(true);
        expect(container.querySelector('div').hasAttribute('ABCD')).toBe(true);
        expect(container.querySelector('div').getAttribute('abcd')).toBe('0');
        expect(container.querySelector('div').getAttribute('ABCD')).toBe('0');
    });

    it('使用 data- 开头的特性时，会映射到DOM的dataset属性且中划线格式会变成驼峰格式', () => {
        Horizon.render(<div />, container);
        container.querySelector('div').setAttribute('data-first-name', 'Tom');
        expect(container.querySelector('div').dataset.firstName).toBe('Tom');
    });

    it('style 自动加px', () => {
      const div = Horizon.render(<div style={{width: 10, height: 20}}/>, container);
      expect(window.getComputedStyle(div).getPropertyValue('width')).toBe('10px');
      expect(window.getComputedStyle(div).getPropertyValue('height')).toBe('20px');
    });

    it('空字符串做属性名', () => {
      const emptyStringProps = { '': '' };
      expect(() => {
        Horizon.render(<div {...emptyStringProps}/>, container);
      }).not.toThrow();
    });
});
