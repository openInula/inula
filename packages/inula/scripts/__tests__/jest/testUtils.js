/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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
