let dataArray = null;
let isWorking = false;

const log = (value) => {
  if (dataArray === null) {
    dataArray = [value];
  } else {
    dataArray.push(value);
  }
};

const getAndClear = () => {
  if (dataArray === null) {
    return [];
  }
  const values = dataArray;
  dataArray = null;
  return values;
};

const clear = () => {
  if (isWorking) {
    throw new Error('Cannot reset. There is a working task.');
  }
  dataArray = null;
}

exports.clear = clear;
exports.log = log;
exports.getAndClear = getAndClear;
