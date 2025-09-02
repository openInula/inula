
// BEGIN GENERATED TESTS: inula index exports
// Note: Detected testing framework: jest. These tests use the BDD API (describe/it/expect)
// and should run under both Vitest and Jest without additional imports.
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auto-generated tests focusing on the index.ts aggregator exports.
 * Primary goals:
 *  - Validate default export shape and that named exports align with default members.
 *  - Ensure important utilities are exported and have expected runtime types.
 *  - Confirm type-only exports (e.g., Action) are not present at runtime exports.
 */

import Inula, * as IndexModule from './index';

describe('packages/inula/src/index exports', () => {
  it('default export is an object and import did not throw', () => {
    expect(typeof Inula).toBe('object');
    expect(Inula).toBeTruthy();
  });

  it('version is a non-empty string and matches default export', () => {
    expect(typeof IndexModule.version).toBe('string');
    expect(IndexModule.version.length).toBeGreaterThan(0);
    expect(IndexModule.version).toBe(Inula.version);
  });

  const expectedDefaultKeys = [
    'Children',
    'createRef',
    'Component',
    'PureComponent',
    'createContext',
    'forwardRef',
    'lazy',
    'memo',
    'useDebugValue',
    'useCallback',
    'useContext',
    'useEffect',
    'useImperativeHandle',
    'useLayoutEffect',
    'useMemo',
    'useReducer',
    'useRef',
    'useState',
    'createElement',
    'cloneElement',
    'isValidElement',
    'render',
    'createRoot',
    'createPortal',
    'unstable_batchedUpdates',
    'findDOMNode',
    'unmountComponentAtNode',
    'act',
    'flushSync',
    'createStore',
    'useStore',
    'clearStore',
    'reduxAdapter',
    'watch',
    'isFragment',
    'isElement',
    'isValidElementType',
    'isForwardRef',
    'isLazy',
    'isMemo',
    'isPortal',
    'isContextProvider',
    'isContextConsumer',
    'ForwardRef',
    'Memo',
    'Fragment',
    'Profiler',
    'StrictMode',
    'Suspense',
    'version',
  ] as const;

  it('exposes expected keys on default export', () => {
    expectedDefaultKeys.forEach((k) => {
      expect((Inula as any)).toHaveProperty(k);
    });
  });

  it('named exports equal default export properties for all shared members', () => {
    expectedDefaultKeys.forEach((k) => {
      expect((IndexModule as any)[k]).toBe((Inula as any)[k]);
    });
  });

  it('toRaw is exported as a named export but not present on default export', () => {
    expect('toRaw' in (Inula as any)).toBe(false);
    expect((IndexModule as any).toRaw).toBeDefined();
    expect(typeof (IndexModule as any).toRaw).toBe('function');
  });

  it('type-only export Action does not exist at runtime', () => {
    // Type-only re-exports must not appear on the JS module namespace object.
    expect('Action' in (IndexModule as any)).toBe(false);
  });
});

describe('basic element and utility behaviors (non-DOM)', () => {
  const {
    createElement,
    cloneElement,
    isValidElement,
    isValidElementType,
    isElement,
    Fragment,
    createRef,
  } = IndexModule as any;

  it('createRef returns an object with a current property', () => {
    const ref = createRef();
    expect(ref).toBeTruthy();
    expect(ref).toHaveProperty('current');
  });

  it('createElement produces a value recognized by isValidElement', () => {
    const el = createElement('div', { id: 'x' }, 'hello');
    expect(isValidElement(el)).toBe(true);
  });

  it('cloneElement returns a distinct element that is still valid', () => {
    const el = createElement('span', null, 'a');
    const cloned = cloneElement(el, { id: 'b' });
    expect(cloned).not.toBe(el);
    expect(isValidElement(cloned)).toBe(true);
  });

  it('Fragment can be used to create a valid element and its type is valid', () => {
    const fragEl = createElement(Fragment, null);
    expect(isValidElement(fragEl)).toBe(true);
    expect(isValidElementType(Fragment)).toBe(true);
  });

  it('isElement identifies non-elements as false', () => {
    expect(isElement({})).toBe(false);
    expect(isElement(42 as any)).toBe(false);
    expect(isElement(null as any)).toBe(false);
    expect(isElement(undefined as any)).toBe(false);
  });
});

describe('exported function types are callable (smoke checks only)', () => {
  const functionLikeKeys = [
    'createRef',
    'createContext',
    'forwardRef',
    'lazy',
    'memo',
    'useDebugValue',
    'useCallback',
    'useContext',
    'useEffect',
    'useImperativeHandle',
    'useLayoutEffect',
    'useMemo',
    'useReducer',
    'useRef',
    'useState',
    'createElement',
    'cloneElement',
    'createPortal',
    'unstable_batchedUpdates',
    'findDOMNode',
    'unmountComponentAtNode',
    'act',
    'flushSync',
    'createStore',
    'useStore',
    'clearStore',
    'watch',
    'isFragment',
    'isElement',
    'isValidElementType',
    'isForwardRef',
    'isLazy',
    'isMemo',
    'isPortal',
    'isContextProvider',
    'isContextConsumer',
  ] as const;

  it('exports listed keys as functions (or callable entities)', () => {
    functionLikeKeys.forEach((k) => {
      const v = (Inula as any)[k];
      expect(v).toBeDefined();
      expect(typeof v).toBe('function');
    });
  });
});

// END GENERATED TESTS
// END GENERATED TESTS: inula index exports