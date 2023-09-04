import utils from '../../../../src/utils/commonUtils/utils';

describe('forEach function', () => {
  it('should do nothing when input is null or undefined', () => {
    const func = jest.fn();
    utils.forEach(null, func);
    utils.forEach(undefined, func);
    expect(func).not.toHaveBeenCalled();
  });

  it('should iterate over array and call function with value, index and array', () => {
    const arr = [1, 2, 3];
    const func = jest.fn();
    utils.forEach(arr, func);
    expect(func).toHaveBeenCalledTimes(3);
    expect(func).toHaveBeenCalledWith(1, 0, arr);
    expect(func).toHaveBeenCalledWith(2, 1, arr);
    expect(func).toHaveBeenCalledWith(3, 2, arr);
  });

  it('should iterate over object and call function with value, key and object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const func = jest.fn();
    utils.forEach(obj, func);
    expect(func).toHaveBeenCalledTimes(3);
    expect(func).toHaveBeenCalledWith(1, 'a', obj);
    expect(func).toHaveBeenCalledWith(2, 'b', obj);
    expect(func).toHaveBeenCalledWith(3, 'c', obj);
  });

  it('should include all properties when options.includeAll is true', () => {
    const obj = Object.create({ c: 3 });
    obj.a = 1;
    obj.b = 2;
    const func = jest.fn();
    utils.forEach(obj, func, { includeAll: true });
    expect(func).toHaveBeenCalledWith(1, 'a', obj);
    expect(func).toHaveBeenCalledWith(2, 'b', obj);
    expect(func).toHaveBeenCalledWith(3, 'c', obj);
  });
});
