import { createProxy } from '../../../../libs/horizon/src/horizonx/proxy/ProxyHandler';

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
});
