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

import * as Inula from '../../../../libs/inula/index';
import * as LogUtils from '../../jest/logUtils';
import {clearStore, createStore, useStore} from '../../../../libs/inula/src/inulax/store/StoreHandler';
import {Text, triggerClickEvent} from '../../jest/commonComponents';
import {getObserver} from '../../../../libs/inula/src/inulax/proxy/ProxyHandler';
import {describe, it, beforeEach, afterEach, expect} from '@jest/globals';

describe('测试VNode清除时，对引用清除', () => {
  const {unmountComponentAtNode} = Inula;
  let container:HTMLElement|null = null;
  let globalState = {
    name: 'bing dun dun',
    isWin: true,
    isShow: true
  };

  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);

    createStore({
      id: 'user',
      state: globalState,
      actions: {
        setWin: (state, val) => {
          state.isWin = val;
        },
        hide: (state) => {
          state.isShow = false;
        }
      },
    });
  });

  afterEach(() => {
    // 退出时进行清理
    unmountComponentAtNode(container);
    container?.remove();
    container = null;
    LogUtils.clear();

    clearStore('user');
  });

  it('test observer.clearByNode', () => {
    class App extends Inula.Component {
      userStore = useStore('user');

      render() {
        return <div>
          <button id={'hideBtn'} onClick={this.userStore?.hide}>
            toggle
          </button>
          {this.userStore?.isShow && <Parent/>}
        </div>;
      }
    }

    class Parent extends Inula.Component {
      userStore = useStore('user');

      setWin = () => {
        this.userStore?.setWin(!this.userStore.isWin);
      }

      render() {
        return <div>
          <button id={'toggleBtn'} onClick={this.setWin}>
            toggle
          </button>
          {this.userStore?.isWin && <Child/>}
        </div>;
      }
    }

    class Child extends Inula.Component {
      userStore = useStore('user');

      render() {
        return <div>
          <Text id={'name'} text={`name: ${this.userStore?.name}`}/>
          <Text id={'isWin'} text={`isWin: ${this.userStore?.isWin}`}/>
        </div>;
      }
    }

    Inula.render(<App/>, container);

    // Parent and Child hold the isWin key
    expect(getObserver(globalState).keyVNodes.get('isWin').size).toBe(2);

    Inula.act(() => {
      triggerClickEvent(container, 'toggleBtn');
    });
    // Parent hold the isWin key
    expect(getObserver(globalState).keyVNodes.get('isWin').size).toBe(1);

    Inula.act(() => {
      triggerClickEvent(container, 'toggleBtn');
    });
    // Parent and Child hold the isWin key
    expect(getObserver(globalState).keyVNodes.get('isWin').size).toBe(2);

    Inula.act(() => {
      triggerClickEvent(container, 'hideBtn');
    });
    // no component hold the isWin key
    expect(getObserver(globalState).keyVNodes.get('isWin')).toBe(undefined);
  });
});
