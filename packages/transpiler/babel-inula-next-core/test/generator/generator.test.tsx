import { describe, expect, it } from 'vitest';
import { transform } from './mock';

describe('generate', () => {
  it('should generate createComponent', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let count = 1

        return <></>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let count = 1;
        return $$self.prepare().init($$createFragmentNode());
      }"
    `);
  });

  it('should collect lifecycle', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let count = 1

        willMount(() => {
          console.log('will mount')
        })

        console.log(count)

        willMount(() => {
          console.log('will mount2')
        })

        didMount(() => {
          console.log('mounted')
        })

        willUnmount(() => {
          console.log('unmounted')
        })

        return <></>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let count = 1;
        $$self.willMount(() => {
          console.log('will mount');
        });
        console.log(count);
        $$self.willMount(() => {
          console.log('will mount2');
        });
        $$self.didMount(() => {
          console.log('mounted');
        });
        $$self.willUnmount(() => {
          console.log('unmounted');
        });
        return $$self.prepare().init($$createFragmentNode());
      }"
    `);
  });

  it('should generate updateState', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let count = 1
        let doubleCount = count * 2

        return <></>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let count = 1;
        let doubleCount;
        $$self.deriveState(() => (doubleCount = count * 2), () => [count], 1);
        return $$self.prepare().init($$createFragmentNode());
      }"
    `);
  });

  it('should generate updateState with multiple states', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let count = 1
        let doubleCount = count * 2
        let ff = count * 2
        let nn = []
        let kk = count * doubleCount + 100 + nn[1]

        watch(() => {
          let nono = 1
          console.log(count)
        })
        watch(() => {
          let nono = 2
          console.log(count)
        })
        nn.push("jj");

        let _ = nn[0];

        return <></>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        const $$self = $$compBuilder();
        let count = 1;
        let doubleCount;
        $$self.deriveState(() => (doubleCount = count * 2), () => [count], 1);
        let ff;
        $$self.deriveState(() => (ff = count * 2), () => [count], 1);
        let nn = [];
        let kk;
        $$self.deriveState(() => (kk = count * doubleCount + 100 + nn[1]), () => [count, doubleCount, nn], 7);
        $$self.watch(() => {
          let nono = 1;
          console.log(count);
        }, () => [count], 1);
        $$self.watch(() => {
          let nono = 2;
          console.log(count);
        }, () => [count], 1);
        $$self.wave(nn.push("jj"), 4 /*0b100*/);
        let _;
        $$self.deriveState(() => (_ = nn[0]), () => [nn], 4);
        return $$self.prepare().init($$createFragmentNode());
      }"
    `);
  });

  it('should generate updateProp', () => {
    const code = transform(/*js*/ `
      const Comp = Component(({ prop1 }) => {

        return <div>{prop1}</div>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp({
        prop1
      }) {
        const $$self = $$compBuilder();
        $$self.addProp("prop1", value => prop1 = value, 1);
        return $$self.prepare().init($$createHTMLNode("div", null, $$createExpNode(() => prop1, () => [prop1], 1)));
      }"
    `);
  });

  it('should generate updateProp with multiple props', () => {
    const code = transform(/*js*/ `
      const Comp = Component(({ prop1, prop2 }) => {
        return <>{prop1 + prop2}</>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp({
        prop1,
        prop2
      }) {
        const $$self = $$compBuilder();
        $$self.addProp("prop1", value => prop1 = value, 1);
        $$self.addProp("prop2", value => prop2 = value, 2);
        return $$self.prepare().init($$createFragmentNode($$createExpNode(() => prop1 + prop2, () => [prop1, prop2], 3)));
      }"
    `);
  });

  it('should generate updateProp with updateDerived', () => {
    const code = transform(/*js*/ `
      const Comp = Component(({ prop1 }) => {
        let derived = prop1 * 2
        watch(() => {
          console.log(prop1)
        })

        return <></>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp({
        prop1
      }) {
        const $$self = $$compBuilder();
        $$self.addProp("prop1", value => prop1 = value, 1);
        let derived;
        $$self.deriveState(() => (derived = prop1 * 2), () => [prop1], 1);
        $$self.watch(() => {
          console.log(prop1);
        }, () => [prop1], 1);
        return $$self.prepare().init($$createFragmentNode());
      }"
    `);
  });
});
