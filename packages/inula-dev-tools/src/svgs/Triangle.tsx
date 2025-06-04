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

interface IArrow {
  director: 'right' | 'down';
}

export default function Triangle({ director }: IArrow) {
  let d = '';
  if (director === 'right') {
    d = 'm2 0l12 8l-12 8 z';
  } else if (director === 'down') {
    d = 'm0 2h16 l-8 12 z';
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="8px" height="8px">
      <path d={d} fill="currentColor" />
    </svg>
  );
}
