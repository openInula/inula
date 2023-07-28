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

import {createProxy} from '../../../../libs/inula/src/inulax/proxy/ProxyHandler';
import {readonlyProxy} from '../../../../libs/inula/src/inulax/proxy/readonlyProxy';
import {describe, beforeEach, afterEach, it, expect} from '@jest/globals';

describe('Proxy', () => {
  const arr = [];

  it('Should not double wrap proxies', async () => {
    const proxy1 = createProxy(arr);

    const proxy2 = createProxy(proxy1);

    expect(proxy1 === proxy2).toBe(true);
  });

  it('Should re-use existing proxy of same object', async () => {
    const proxy1 = createProxy(arr);

    const proxy2 = createProxy(arr);

    expect(proxy1 === proxy2).toBe(true);
  });

  it('Readonly proxy should prevent changes', async () => {
    const proxy1 = readonlyProxy([1]);

    try{
      proxy1.push('a');
      expect(true).toBe(false);//we expect exception above
    }catch(e){
     //expected
    }

    try{
      proxy1[0]=null;
      expect(true).toBe(false);//we expect exception above
    }catch(e){
     //expected
    }

    try{
      delete proxy1[0];
      expect(true).toBe(false);//we expect exception above
    }catch(e){
     //expected
    }
  });
});
