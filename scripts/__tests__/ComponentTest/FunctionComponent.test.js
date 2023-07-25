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

import * as Horizon from '@cloudsop/horizon/index.ts';
describe('FunctionComponent Test', () => {
  it('渲染无状态组件', () => {
    const App = (props) => {
      return <p>{props.text}</p>;
    };

    Horizon.render(<App text='app' />, container);
    expect(container.querySelector('p').innerHTML).toBe('app');
  });

  it('更新无状态组件', () => {
    const App = (props) => {
      return <p>{props.text}</p>;
    };

    Horizon.render(<App text='app' />, container);
    expect(container.querySelector('p').innerHTML).toBe('app');

    Horizon.render(<App text='ABC' />, container);
    expect(container.querySelector('p').innerHTML).toBe('ABC');

    Horizon.render(<App text='abc' />, container);
    expect(container.querySelector('p').innerHTML).toBe('abc');
  });

  it('卸载无状态组件', () => {
    const App = (props) => {
      return <p>{props.text}</p>;
    };

    Horizon.render(<App text='app' />, container);
    expect(container.querySelector('p').innerHTML).toBe('app');

    Horizon.unmountComponentAtNode(container);
    expect(container.querySelector('p')).toBe(null);
  });

  it('渲染空组件返回空子节点', () => {
    const App = () => {
      return <div />;
    };

    const realNode = Horizon.render(<App />, container);
    expect(realNode).toBe(null);
  });

  it('测试函数组件的defaultProps：Horizon.memo(Horizon.forwardRef(()=>{}))两层包装的场景后，defaultProps依然正常', () => {
    const App = () => {
      return <DefaultPropsCompMemo />;
    };

    const DefaultPropsComp = Horizon.forwardRef(props => {
      return <div>{props.name}</div>;
    });
    DefaultPropsComp.defaultProps = {
      name: 'Hello!',
    };
    const DefaultPropsCompMemo = Horizon.memo(DefaultPropsComp);

    Horizon.render(<App />, container);
    expect(container.querySelector('div').innerHTML).toBe('Hello!');
  });

  it('测试', () => {
    const App = () => {
      return <StyleComp />;
    };

    const StyleComp = props => {
      return <div style={{ '--max-segment-num': 10 }}>{props.name}</div>;
    };

    Horizon.render(<App />, container);
    expect(container.querySelector('div').style['_values']['--max-segment-num']).toBe(10);
  });

});
