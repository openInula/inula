/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

import { calculateTransRate } from '../../../../src/utils/dataUtils/calculateTransRate';

describe('calculateTransRate', () => {
  it('should return undefined when interval is undefined', () => {
    const calc = calculateTransRate(10, undefined);
    expect(calc(1000)).toBeUndefined();
  });

  it('should return correct rate when interval is 2000', () => {
    const calc = calculateTransRate(10, 2000);
    calc(1000);
    expect(calc(1000)).toBeUndefined();
  });

  it('should return correct rate when interval is 2000', () => {
    const calc = calculateTransRate(10, 2000);
    calc(10000000000);
    setTimeout(() => {
      expect(calc(10000010000)).toBe(5000);
    }, 2000);
  });
});
