/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2022-2022. All rights reserved.
 */

import * as Horizon from '@cloudsop/horizon/index.ts';

describe('Diff Algorithm', () => {
  it('null should diff correctly', () => {
    const fn = jest.fn();

    class C extends Horizon.Component {
      constructor() {
        super();
        fn();
      }

      render() {
        return 1;
      }
    }

    let update;

    function App() {
      const [current, setCurrent] = Horizon.useState(1);
      update = setCurrent;
      return (
        <>
          {current === 1 ? <C /> : null}
          {current === 2 ? <C /> : null}
          {current === 3 ? <C /> : null}
        </>
      );
    }

    Horizon.render(<App text="app" />, container);
    expect(fn).toHaveBeenCalledTimes(1);

    update(2);
    expect(fn).toHaveBeenCalledTimes(2);

    update(3);
    expect(fn).toHaveBeenCalledTimes(3);

    update(1);
    expect(fn).toHaveBeenCalledTimes(4);
  });
});
