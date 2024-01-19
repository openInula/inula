import { reactive, computed, watch } from '../index';

describe('test reactive', () => {
  it('two signals, one computed', () => {
    const a = reactive(7);
    const b = reactive(1);
    let callCount = 0;

    const c = computed(() => {
      callCount++;
      return a.get() * b.get();
    });

    watch(() => {
      console.log(a.get());
    });

    expect(a.read()).toBe(7);

    a.set(2);
    expect(c.read()).toBe(2);

    b.set(3);
    expect(c.get()).toBe(6);

    expect(callCount).toBe(2);
    c.read();
    expect(callCount).toBe(2);
  });

  it('reactive is a obj', () => {
    const rObj = reactive({ count: 1 });

    const double = computed(() => {
      return 2 * rObj.count.get();
    });

    watch(() => {
      console.log('count: ', rObj.count.get(), 'double: ', double.get());
    });

    expect(double.read()).toBe(2);

    rObj.count.set(2);

    expect(rObj.count.read()).toBe(2);
    expect(double.read()).toBe(4);
  });

  it('reactive is a array', () => {
    const rObj = reactive({
      items: [
        { name: 'p1', id: 1 },
        { name: 'p2', id: 2 },
      ],
    });

    const doubleId = computed(() => {
      return 2 * rObj.items[0].id.get();
    });

    expect(doubleId.get()).toBe(2);

    rObj.items.set([{ name: 'p11', id: 11 }]);

    expect(doubleId.get()).toBe(22);
  });
});
