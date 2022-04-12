let dataArray = null;

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
  dataArray = dataArray ? null : dataArray;
};

exports.clear = clear;
exports.log = log;
exports.getAndClear = getAndClear;
