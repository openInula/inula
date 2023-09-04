import utils from '../../../../src/utils/commonUtils/utils';

describe('forEachEntry function', () => {
  const callback = jest.fn();
  it('should call the callback function for each entry in a plain object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    utils.forEachEntry(obj, callback);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith('a', 1);
    expect(callback).toHaveBeenCalledWith('b', 2);
    expect(callback).toHaveBeenCalledWith('c', 3);
  });

  it('should call the callback function for each entry in a Map object', () => {
    const obj = new Map([['a', 1], ['b', 2], ['c', 3]]);
    utils.forEachEntry(obj, callback);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith('a', 1);
    expect(callback).toHaveBeenCalledWith('b', 2);
    expect(callback).toHaveBeenCalledWith('c', 3);
  });

  it('should not call the callback function for non-enumerable properties', () => {
    const obj = Object.create({}, {
      a: { value: 1, enumerable: true },
      b: { value: 2, enumerable: false },
      c: { value: 3, enumerable: true }
    });
    utils.forEachEntry(obj, callback);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith('a', 1);
    expect(callback).toHaveBeenCalledWith('c', 3);
  });
});
