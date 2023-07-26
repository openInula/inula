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

function App() {
  return <></>;
}

describe('InulaIs', () => {
  it('should identify inula elements', () => {
    expect(Inula.isElement(<div />)).toBe(true);
    expect(Inula.isElement('span')).toBe(false);
    expect(Inula.isElement(111)).toBe(false);
    expect(Inula.isElement(false)).toBe(false);
    expect(Inula.isElement(null)).toBe(false);
    expect(Inula.isElement([])).toBe(false);
    expect(Inula.isElement({})).toBe(false);
    expect(Inula.isElement(undefined)).toBe(false);

    const TestContext = Inula.createContext(false);
    expect(Inula.isElement(<TestContext.Provider />)).toBe(true);
    expect(Inula.isElement(<TestContext.Consumer />)).toBe(true);
    expect(Inula.isElement(<></>)).toBe(true);
    expect(Inula.isElement(<Inula.Suspense />)).toBe(true);
  });

  it('should identify Fragment', () => {
    expect(Inula.isFragment(<></>)).toBe(true);
  });

  it('should identify memo component', () => {
    const MemoComp = Inula.memo(App);
    expect(Inula.isMemo(<MemoComp />)).toBe(true);
  });

  it('should identify forwardRef', () => {
    const ForwardRefComp = Inula.forwardRef(App);
    expect(Inula.isForwardRef(<ForwardRefComp />)).toBe(true);
  });

  it('should identify lazy', () => {
    const LazyComp = Inula.lazy(() => App);
    expect(Inula.isLazy(<LazyComp />)).toBe(true);
  });

  it('should identify portal', () => {
    const portal = Inula.createPortal(<div />, container);
    expect(Inula.isPortal(portal)).toBe(true);
  });

  it('should identify ContextProvider', () => {
    const TestContext = Inula.createContext(false);
    expect(Inula.isContextProvider(<TestContext.Provider />)).toBe(true);
    expect(Inula.isContextProvider(<TestContext.Consumer />)).toBe(false);
    expect(Inula.isContextConsumer(<TestContext.Provider />)).toBe(false);
    expect(Inula.isContextConsumer(<TestContext.Consumer />)).toBe(true);
  });
});
