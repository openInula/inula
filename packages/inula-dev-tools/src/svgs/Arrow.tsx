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
  direction: 'up' | 'down';
}

export default function Arrow({ direction: director }: IArrow) {
  let d = '';
  if (director === 'up') {
    d = 'M4 9.5 L5 10.5 L8 7.5 L11 10.5 L12 9.5 L8 5.5 z';
  } else if (director === 'down') {
    d = 'M5 5.5 L4 6.5 L8 10.5 L12 6.5 L11 5.5 L8 8.5z';
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="1rem" height="1rem">
      <path d={d} fill="currentColor" />
    </svg>
  );
}
