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
import {describe, beforeEach, afterEach, it, expect} from '@jest/globals';

describe('测试 Class VNode 清除时，对引用清除', () => {
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
        },
        updateName: (state, val) => {
          state.name = val;
        },
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
    class Child extends Inula.Component {
      userStore = useStore('user');

      render() {
        if(!this.userStore) return <div />;
        // Do not modify the store data in the render method. Otherwise, an infinite loop may occur.
        this.userStore.updateName(this.userStore.name === 'bing dun dun' ? 'huo dun dun' : 'bing dun dun');

        return <div>
          <Text id={'name'} text={`name: ${this.userStore.name}`}/>
          <Text id={'isWin'} text={`isWin: ${this.userStore.isWin}`}/>
        </div>;
      }
    }

    expect(() => {
      Inula.render(<Child/>, container);
    }).toThrow('The number of updates exceeds the upper limit 50.\n' +
      '      A component maybe repeatedly invokes setState on componentWillUpdate or componentDidUpdate.');

  });
});
