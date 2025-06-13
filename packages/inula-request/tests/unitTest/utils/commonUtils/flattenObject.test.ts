import utils from '../../../../src/utils/commonUtils/utils';

describe('flattenObject function', () => {
  it('should return an empty object if the source object is null or undefined', () => {
    expect(utils.flattenObject(null)).toEqual({});
    expect(utils.flattenObject(undefined)).toEqual({});
  });

  it('should flatten a simple object', () => {
    const sourceObj = { a: 1, b: 'hello', c: true };
    const destObj = utils.flattenObject(sourceObj);
    expect(destObj).toEqual({ a: 1, b: 'hello', c: true });
  });

  it('should flatten an object with a prototype', () => {
    const parentObj = { a: 1 };
    const sourceObj = Object.create(parentObj);
    sourceObj.b = 'hello';
    sourceObj.c = true;
    const destObj = utils.flattenObject(sourceObj);
    expect(destObj).toEqual({ a: 1, b: 'hello', c: true });
  });

  it('should filter out properties based on a property filter function', () => {
    const sourceObj = { a: 1, b: 'hello', c: true };
    const propFilter = (prop: string | symbol) => prop !== 'b';
    const destObj = utils.flattenObject(sourceObj, undefined, undefined, propFilter);
    expect(destObj).toEqual({ a: 1, c: true });
  });
});
