export const stopBubbleOrCapture = (e, value) => {
  const LogUtils = getLogUtils();
  LogUtils.log(value);
  e.stopPropagation();
};

export function triggerClickEvent(container, id) {
  const event = new MouseEvent('click', {
    bubbles: true,
  });
  container.querySelector(`#${id}`).dispatchEvent(event);
}

class LogUtils {
  constructor() {
    this.dataArray = null;
  }

  log = (value) => {
    if (this.dataArray === null) {
      this.dataArray = [value];
    } else {
      this.dataArray.push(value);
    }
  };

  getAndClear = () => {
    if (this.dataArray === null) {
      return [];
    }
    const values = this.dataArray;
    this.dataArray = null;
    return values;
  };

  getNotClear = () => {
    return this.dataArray === null ? [] : this.dataArray;
  };

  clear = () => {
    this.dataArray = this.dataArray ? null : this.dataArray;
  };
}

let logger;
export function getLogUtils() {
  if(!logger) {
    logger = new LogUtils();
  }
  return logger;
}
