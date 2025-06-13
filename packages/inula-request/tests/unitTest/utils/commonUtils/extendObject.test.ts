import utils from '../../../../src/utils/commonUtils/utils';

describe('extendObject function', () => {
  it('should extend an object with another object', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = utils.extendObject(target, source);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
    expect(target).toEqual({ a: 1, b: 3, c: 4 }); // Target 也会被修改
  });

  it('should bind functions to a given context if "thisArg" option is provided', () => {
    const target = {};
    const source = {
      sayHi() {
        return `Hi, ${this.name}!`;
      },
      name: 'John'
    };
    const thisArg = { name: 'Sarah' };
    const result = utils.extendObject(target, source, thisArg);
    expect(result.sayHi()).toBe('Hi, Sarah!');
  });

  it('should include all properties of the source object if "includeAll" option is set to true', () => {
    const target = { a: 1 };
    const source = { 'b': 2 };
    const result = utils.extendObject(target, source, undefined, { includeAll: true });
    expect(result).not.toEqual({ a: 1, 'b': 2 });
  });
});
