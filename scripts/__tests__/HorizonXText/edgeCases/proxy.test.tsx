import {createProxy} from '../../../../libs/horizon/src/horizonx/proxy/ProxyHandler';
import {readonlyProxy} from '../../../../libs/horizon/src/horizonx/proxy/readonlyProxy';
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
