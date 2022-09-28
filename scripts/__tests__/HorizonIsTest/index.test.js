/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2022-2022. All rights reserved.
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
    const memo = Horizon.memo(App);
    expect(Horizon.isMemo(memo)).toBe(true);
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
  });
});
