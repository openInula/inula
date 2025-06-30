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

import { DirectiveComponent } from '../../src/vue/directive';

import { act, useState } from 'openinula';
import { describe, expect, it, vi } from 'vitest';
import '../utils/globalSetup';
import { createApp } from '../../src/vue';

describe('api: app.directive', () => {
  it('should directive work in dom', () => {
    const fnMount = vi.fn();
    const fnUnmounted = vi.fn();
    const fnUpdated = vi.fn();
    const fnClose = vi.fn();
    const fnBind = vi.fn();

    function Comp() {
      const [showPopup, setShowPopup] = useState(true);
      const closePopup = () => {
        setShowPopup(false);
        fnClose();
      };

      return (
        <div>
          {showPopup && (
            // Vue写法：<div v-click-outside:foo.bar="closePopup" v-focus class="popup">
            <DirectiveComponent
              componentName={'div'}
              directives={[
                {
                  name: 'click-outside',
                  arg: 'foo',
                  modifiers: { bar: true },
                  value: closePopup,
                },
                {
                  name: 'focus',
                },
              ]}
              class="popup"
            >
              <div>child</div>
            </DirectiveComponent>
          )}
          <div id={'div'}>点击外部关闭弹窗</div>
        </div>
      );
    }

    const app = createApp(<Comp />);

    app.directive('click-outside', {
      mounted(el, binding) {
        el.clickOutsideEvent = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
        fnMount();
      },
      updated(el, binding) {
        fnUpdated();
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
        fnUnmounted();
      },
    });

    app.directive('focus', {
      bind(el, binding) {
        el.focus();
        fnBind();
      },
    });

    app.mount(global.container);

    act(() => {
      global.container.querySelector('#div')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(fnMount).toHaveBeenCalledTimes(1);
    expect(fnUpdated).toHaveBeenCalledTimes(1);
    expect(fnUnmounted).toHaveBeenCalledTimes(1);
    expect(fnClose).toHaveBeenCalledTimes(1);
    expect(fnBind).toHaveBeenCalledTimes(1);
  });

  it('should directive work in component', () => {
    const fnMount = vi.fn();
    const fnUnmounted = vi.fn();
    const fnUpdated = vi.fn();
    const fnClose = vi.fn();
    const fnBind = vi.fn();

    function Popup() {
      return <div>弹窗</div>;
    }

    function Comp() {
      const [showPopup, setShowPopup] = useState(true);
      const [directiveValue, setDirectiveValue] = useState(1);

      const registerDirectives = {
        'click-outside': {
          mounted(el, binding) {
            fnMount();
          },
          updated(el, binding) {
            if (binding.value !== binding.oldValue) {
              expect(binding.oldValue).toBe(1);
              expect(binding.value).toBe(2);
            }

            fnUpdated();
          },
          unmounted(el) {
            fnUnmounted();
          },
        },
        focus: {
          bind(el, binding) {
            fnBind();
          },
        },
      };
      const closePopup = () => {
        setShowPopup(false);
        fnClose();
      };

      const updateValue = () => {
        setDirectiveValue(2);
      };

      return (
        <div>
          {showPopup && (
            // Vue写法：<div v-click-outside:foo.bar="directiveValue" v-focus class="popup">
            <DirectiveComponent
              componentName={Popup}
              directives={[
                {
                  name: 'click-outside',
                  arg: 'foo',
                  modifiers: { bar: true },
                  value: directiveValue,
                },
                {
                  name: 'focus',
                },
              ]}
              registerDirectives={registerDirectives}
              class="popup"
            >
              <div>child</div>
            </DirectiveComponent>
          )}
          <button id={'update'} onClick={updateValue}>
            更新
          </button>
          <button id={'close'} onClick={closePopup}>
            关闭弹窗
          </button>
        </div>
      );
    }

    const app = createApp(<Comp />);

    app.mount(global.container);

    expect(fnMount).toHaveBeenCalledTimes(1);
    expect(fnBind).toHaveBeenCalledTimes(1);

    act(() => {
      global.container.querySelector('#update')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(fnUpdated).toHaveBeenCalledTimes(2);

    act(() => {
      global.container.querySelector('#close')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(fnUnmounted).toHaveBeenCalledTimes(1);
    expect(fnClose).toHaveBeenCalledTimes(1);
  });

  it('should v-show directive work in component', () => {
    function Popup() {
      return (
        <div style={{ display: 'block' }} id={'popup-div'}>
          弹窗
        </div>
      );
    }

    function Comp() {
      const [showPopup, setShowPopup] = useState(true);

      const closePopup = () => {
        setShowPopup(!showPopup);
      };

      return (
        <div>
          {/* Vue写法：<Popup v-show="showPopup">*/}
          <DirectiveComponent
            componentName={Popup}
            directives={[
              {
                name: 'show',
                value: showPopup,
              },
            ]}
            class="popup"
          >
            <div>child</div>
          </DirectiveComponent>

          <button id={'close'} onClick={closePopup}>
            关闭弹窗
          </button>
        </div>
      );
    }

    const app = createApp(<Comp />);

    app.mount(global.container);

    expect(document.querySelector('#popup-div')!.outerHTML).toBe(
      '<div style="display: block;" id="popup-div">弹窗</div>'
    );

    act(() => {
      global.container.querySelector('#close')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(document.querySelector('#popup-div')!.outerHTML).toBe(
      '<div style="display: none;" id="popup-div">弹窗</div>'
    );
  });
});
