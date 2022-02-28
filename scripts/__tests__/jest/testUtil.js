if (process.env.NODE_ENV !== 'production') {
  (function () {
    let dataArray = null;
    let isFlushing = false;

    const unstable_yieldValue = (value) => {
      if (dataArray === null) {
        dataArray = [value];
      } else {
        dataArray.push(value);
      }
    };

    const unstable_clearYields = () => {
      if (dataArray === null) {
        return [];
      }
      const values = dataArray;
      dataArray = null;
      return values;
    };

    const reset = () => {
      if (isFlushing) {
        throw new Error('Cannot reset while already flushing work.');
      }
      dataArray = null;
    }

    exports.reset = reset;
    exports.unstable_yieldValue = unstable_yieldValue;
    exports.unstable_clearYields = unstable_clearYields;
  })();
}
