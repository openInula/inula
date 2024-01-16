import {reactive as r} from '../src/Reactive';

describe('test reactive', () => {
  it('two signals, one computed', () => {
    const a = r.reactive(7);
    const b = r.reactive(1);
    let callCount = 0;

    const c = r.computed(() => {
      callCount++;
      return a.get() * b.get();
    });

    r.watch(() => {
      console.log(a.get());
    });

    a.set(2);
    expect(c.get()).toBe(2);

    b.set(3);
    expect(c.get()).toBe(6);

    expect(callCount).toBe(2);
    c.read();
    expect(callCount).toBe(2);
  });

  it('reactive is a obj', () => {
    const rObj = r.reactive({count: 1});

    const double = r.computed(() => {
      return 2 * rObj.count.get();
    });

    r.watch(() => {
      console.log('count: ', rObj.count.get(), 'double: ', double.get());
    });

    expect(double.read()).toBe(2);

    rObj.count.set(2);

    expect(rObj.count.read()).toBe(2);
    expect(double.read()).toBe(4);
  });

  it('reactive is a array', () => {
    const rObj = r.reactive({
      items: [
        {name: 'p1', id: 1},
        {name: 'p2', id: 2},
      ],
    });

    const doubleId = r.computed(() => {
      return 2 * rObj.items[0].id.get();
    });

    expect(doubleId.get()).toBe(2);

    rObj.items.set([{name: 'p11', id: 11}]);

    expect(doubleId.get()).toBe(22);
  });
});
