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
        let self;
        let count = 1;
        self = $$createComponent({
          updateState: changed => {}
        });
        return $$initCompNode(self);
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
        let self;
        let count = 1;
        self = $$createComponent({
          didMount: () => {
            {
              console.log('mounted');
            }
          },
          willUnmount: () => {
            {
              console.log('unmounted');
            }
          },
          updateState: changed => {},
          getUpdateViews: () => {
            {
              console.log('will mount');
            }
            console.log(count);
            {
              console.log('will mount2');
            }
            return [[],,];
          }
        });
        return $$initCompNode(self);
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
        let self;
        let count = 1;
        let doubleCount;
        self = $$createComponent({
          updateState: changed => {
            if (changed & 1) {
              if ($$notCached(self, "cache0", [count])) {
                doubleCount = count * 2;
              }
            }
          }
        });
        return $$initCompNode(self);
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
        nn.push("jj")

        ;[count, doubleCount] = (() => {nn.push("nn")})

        return <></>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let count = 1;
        let doubleCount;
        let ff;
        let nn = [];
        let kk;
        self = $$createComponent({
          updateState: changed => {
            if (changed & 1) {
              if ($$notCached(self, "cache0", [count])) {
                $$updateNode(self, doubleCount = count * 2, 2 /*0b10*/);
                ff = count * 2;
                {
                  let nono = 1;
                  console.log(count);
                }
                {
                  let nono = 2;
                  console.log(count);
                }
              }
            }
            if (changed & 7) {
              if ($$notCached(self, "cache1", [count, doubleCount, nn])) {
                kk = count * doubleCount + 100 + nn[1];
              }
            }
          },
          getUpdateViews: () => {
            $$updateNode(self, nn.push("jj"), 4 /*0b100*/);
            $$updateNode(self, [count, doubleCount] = () => {
              $$updateNode(self, nn.push("nn"), 4 /*0b100*/);
            }, 3 /*0b11*/);
            return [[],,];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should generate updateProp', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let prop1_$p$_ = 1

        return <></>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let prop1_$p$_ = 1;
        self = $$createComponent({
          updateState: changed => {},
          updateProp: (propName, newValue) => {
            if (propName === "prop1") {
              prop1_$p$_ = newValue;
            }
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should generate updateProp with multiple props', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let prop1_$p$_ = 1
        let prop2_$p$_ = 1

        return <></>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let prop1_$p$_ = 1;
        let prop2_$p$_ = 1;
        self = $$createComponent({
          updateState: changed => {},
          updateProp: (propName, newValue) => {
            if (propName === "prop2") {
              prop2_$p$_ = newValue;
            } else if (propName === "prop1") {
              prop1_$p$_ = newValue;
            }
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should generate updateProp with updateDerived', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let prop1_$p$_ = 1
        let derived = prop1_$p$_ * 2
        watch(() => {
          console.log(prop1_$p$_)
        })

        return <></>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let prop1_$p$_ = 1;
        let derived;
        self = $$createComponent({
          updateState: changed => {
            if (changed & 1) {
              if ($$notCached(self, "cache0", [prop1_$p$_])) {
                derived = prop1_$p$_ * 2;
                {
                  console.log(prop1_$p$_);
                }
              }
            }
          },
          updateProp: (propName, newValue) => {
            if (propName === "prop1") {
              $$updateNode(self, prop1_$p$_ = newValue, 1 /*0b1*/);
            }
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
});
