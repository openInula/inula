/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2022-2022. All rights reserved.
 */

import * as Horizon from '@cloudsop/horizon/index.ts';

describe('Memo Test', () => {
  it('Memo should not make the path wrong', function () {
    let updateApp;

    function Child() {
      const [_, update] = Horizon.useState({});
      updateApp = () => update({});
      return <div></div>;
    }
    const MemoChild = Horizon.memo(Child);

    function App() {
      return (
        <div>
          <MemoChild />
        </div>
      );
    }
    const MemoApp = Horizon.memo(App);
    Horizon.render(
      <div>
        <MemoApp key="1" />
      </div>,
      container
    );
    Horizon.render(
      <div>
        <span></span>
        <MemoApp key="1" />
      </div>,
      container
    );
    expect(() => updateApp()).not.toThrow();
  });
});
