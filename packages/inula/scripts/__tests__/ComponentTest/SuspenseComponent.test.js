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
import { Text } from '../jest/commonComponents';
import { getLogUtils } from '../jest/testUtils';

describe('SuspenseComponent Test', () => {
  const LogUtils = getLogUtils();
  const mockImport = jest.fn(async (component) => {
    return { default: component };
  });

  // var EMPTY_OBJECT = {};
  // const mockCreateResource = jest.fn((component) => {
  //   let result = EMPTY_OBJECT;
  //   return () =>{
  //     component().then(res => {
  //       LogUtils.log(res);
  //       result = res;
  //     }, reason => {
  //       LogUtils.log(reason);
  //     });
  //     if(result === EMPTY_OBJECT){
  //       throw component();
  //     }
  //     return result;
  //   };
  // });

  it('挂载lazy组件', async () => {
    // 用同步的代码来实现异步操作
    class LazyComponent extends Inula.Component {
      render() {
        return <Text text={this.props.num} />;
      }
    }

    const Lazy = Inula.lazy(() => mockImport(LazyComponent));

    Inula.render(
      <Inula.Suspense fallback={<Text text="Loading..." />}>
        <Lazy num={5} />
      </Inula.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Loading...']);
    expect(container.textContent).toBe('Loading...');

    await Promise.resolve();
    Inula.render(
      <Inula.Suspense fallback={<Text text="Loading..." />}>
        <Lazy num={5} />
      </Inula.Suspense>,
      container
    );
    expect(LogUtils.getAndClear()).toEqual([5]);
    expect(container.querySelector('p').innerHTML).toBe('5');
  });

});
