import utils from '../../../../src/utils/commonUtils/utils';

describe('bind function', () => {
  it('should return a new function', () => {
    const fn = () => {
    };
    const boundFn = utils.bind(fn, {});
    expect(boundFn).toBeInstanceOf(Function);
    expect(boundFn).not.toBe(fn);
  });

  it('should call original function with correct this value', () => {
    const thisArg = { name: 'Alice' };
    const fn = function (this: any) {
      return this["name"];
    };
    const boundFn = utils.bind(fn, thisArg);
    const result = boundFn();
    expect(result).toBe('Alice');
  });

  it('should pass arguments to the original function', () => {
    const fn = (a: number, b: number) => a + b;
    const boundFn = utils.bind(fn, {});
    const result = boundFn(2, 3);
    expect(result).toBe(5);
  });
});
