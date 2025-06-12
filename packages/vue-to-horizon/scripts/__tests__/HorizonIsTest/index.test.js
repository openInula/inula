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

function App() {
  return <></>;
}

describe('HorizonIs', () => {
  it('should identify horizon elements', () => {
    expect(Horizon.isElement(<div />)).toBe(true);
    expect(Horizon.isElement('span')).toBe(false);
    expect(Horizon.isElement(111)).toBe(false);
    expect(Horizon.isElement(false)).toBe(false);
    expect(Horizon.isElement(null)).toBe(false);
    expect(Horizon.isElement([])).toBe(false);
    expect(Horizon.isElement({})).toBe(false);
    expect(Horizon.isElement(undefined)).toBe(false);

    const TestContext = Horizon.createContext(false);
    expect(Horizon.isElement(<TestContext.Provider />)).toBe(true);
    expect(Horizon.isElement(<TestContext.Consumer />)).toBe(true);
    expect(Horizon.isElement(<></>)).toBe(true);
    expect(Horizon.isElement(<Horizon.Suspense />)).toBe(true);
  });

  it('should identify Fragment', () => {
    expect(Horizon.isFragment(<></>)).toBe(true);
  });

  it('should identify memo component', () => {
    const MemoComp = Horizon.memo(App);
    expect(Horizon.isMemo(<MemoComp />)).toBe(true);
  });

  it('should identify forwardRef', () => {
    const ForwardRefComp = Horizon.forwardRef(App);
    expect(Horizon.isForwardRef(<ForwardRefComp />)).toBe(true);
  });

  it('should identify lazy', () => {
    const LazyComp = Horizon.lazy(() => App);
    expect(Horizon.isLazy(<LazyComp />)).toBe(true);
  });

  it('should identify portal', () => {
    const portal = Horizon.createPortal(<div />, container);
    expect(Horizon.isPortal(portal)).toBe(true);
  });

  it('should identify ContextProvider', () => {
    const TestContext = Horizon.createContext(false);
    expect(Horizon.isContextProvider(<TestContext.Provider />)).toBe(true);
    expect(Horizon.isContextProvider(<TestContext.Consumer />)).toBe(false);
    expect(Horizon.isContextConsumer(<TestContext.Provider />)).toBe(false);
    expect(Horizon.isContextConsumer(<TestContext.Consumer />)).toBe(true);
  });
});
