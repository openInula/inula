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

describe('Memo Test', () => {
  it('Memo should not make the path wrong', function () {
    let updateApp;

    function Child() {
      const [_, update] = Inula.useState({});
      updateApp = () => update({});
      return <div></div>;
    }
    const MemoChild = Inula.memo(Child);

    function App() {
      return (
        <div>
          <MemoChild />
        </div>
      );
    }
    const MemoApp = Inula.memo(App);
    Inula.render(
      <div>
        <MemoApp key="1" />
      </div>,
      container
    );
    Inula.render(
      <div>
        <span></span>
        <MemoApp key="1" />
      </div>,
      container
    );
    expect(() => updateApp()).not.toThrow();
  });
});
