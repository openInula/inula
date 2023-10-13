/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

function ifNullThrows(value) {
  if (value === null) {
    throw new Error('receive a null');
  }

  return value;
}

export function injectSrc(src) {
  const script = document.createElement('script');
  script.src = src;
  script.type = 'text/javascript';
  script.async = false;
  script.onload = function () {
    // 加载完毕后需要移除
    script.remove();
  };

  ifNullThrows(
    document.head
    || document.getElementsByName('head')[0]
    || document.documentElement
  ).appendChild(script);
}

function injectCode(code) {
  const script = document.createElement('script');
  script.textContent = code;

  ifNullThrows(document.documentElement).appendChild(script);
  ifNullThrows(script.parentNode).removeChild(script);
}
