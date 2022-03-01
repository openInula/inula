let dataArray = null;
let isWorking = false;

const injectValue = (value) => {
  if (dataArray === null) {
    dataArray = [value];
  } else {
    dataArray.push(value);
  }
};

const getAndClearValue = () => {
  if (dataArray === null) {
    return [];
  }
  const values = dataArray;
  dataArray = null;
  return values;
};

const reset = () => {
  if (isWorking) {
    throw new Error('Cannot reset while already flushing work.');
  }
  dataArray = null;
}

exports.reset = reset;
exports.injectValue = injectValue;
exports.getAndClearValue = getAndClearValue;
