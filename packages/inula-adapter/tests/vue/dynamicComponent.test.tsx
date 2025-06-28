/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

import { describe, expect, it } from 'vitest';
import { DynamicComponent } from '../../src/vue/dynamicComponent';
import { render, screen } from '../utils/testingLibrary';
import { createApp } from '../../src/vue';

describe('Dynamic Component', () => {
  it('Should work with Custom Component', () => {
    const CustomComponent = ({ text }) => <div>{text}</div>;
    const components = {
      CustomComponent,
    };

    render(<DynamicComponent is="custom-component" components={components} text="Hello, Custom Component!" />);

    // @ts-ignore
    expect(screen.getByText('Hello, Custom Component!')).toBeInTheDocument();
  });

  it('Should work with global Component', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const CustomComponent = ({ text }) => <div>{text}</div>;

    const app = createApp(<DynamicComponent is="custom-component" text="Hello, Custom Component!" />);

    app.component('CustomComponent', CustomComponent);

    app.mount(container);

    // @ts-ignore
    expect(screen.getByText('Hello, Custom Component!')).toBeInTheDocument();
  });

  it('Should work with DOM elements', () => {
    render(
      <DynamicComponent is="div" data-testid="dynamic-div">
        <DynamicComponent is="span" data-testid="dynamic-span">
          Hello, DOM elements!
        </DynamicComponent>
      </DynamicComponent>
    );

    const divElement = screen.getByTestId('dynamic-div');
    expect(divElement.tagName).toBe('DIV');

    const spanElement = screen.getByTestId('dynamic-span');
    expect(spanElement.tagName).toBe('SPAN');

    // @ts-ignore
    expect(spanElement).toHaveTextContent('Hello, DOM elements!');
  });
});
