import { variablesAnalyze } from '../../src/analyzer/variablesAnalyze';
import { propsAnalyze } from '../../src/analyzer/propsAnalyze';
import { ComponentNode } from '../../src/analyzer/types';
import { viewAnalyze } from '../../src/analyzer/viewAnalyze';
import { genCode, mockAnalyze } from '../mock';
import { describe, expect, it } from 'vitest';

const analyze = (code: string) => mockAnalyze(code, [propsAnalyze, variablesAnalyze, viewAnalyze]);
describe('viewAnalyze', () => {
  it('should analyze view', () => {
    const root = analyze(/*js*/ `
      Component(({name ,className}) => {
        let count = name; // 1
        let doubleCount = count* 2; // 2
        let doubleCount2 = doubleCount* 2; // 4
        const Input =  Component(() => {
          let count = 1;
          watch(() => {
            if (doubleCount2 > 10) {
              count++;
            }
            console.log(doubleCount2);
          });
          const update = changed => {
            if (changed & 0x1011) {
              node1.update(_$this0.count, _$this0.doubleCount);
            }
          };
          return <input>{count}{doubleCount}</input>;
        });
        return <div className={className + count}>{doubleCount2}</div>;
      });
    `);
    const div = root.children![0] as any;
    expect(div.children[0].content.dependencyIndexArr).toMatchInlineSnapshot(`
      [
        4,
        3,
        2,
        0,
      ]
    `);
    expect(genCode(div.children[0].content.dependenciesNode)).toMatchInlineSnapshot('"[doubleCount2]"');
    expect(div.props.className.dependencyIndexArr).toMatchInlineSnapshot(`
      [
        1,
        2,
        0,
      ]
    `);
    expect(genCode(div.props.className.value)).toMatchInlineSnapshot('"className + count"');

    // @ts-expect-error ignore ts here
    const InputCompNode = (root.variables[3] as ComponentNode).value;
    expect(InputCompNode.usedPropertySet).toMatchInlineSnapshot(`
      Set {
        "count",
        "doubleCount",
        "name",
      }
    `);
    // it's the {count}
    const inputFirstExp = InputCompNode.children[0].children[0];
    expect(inputFirstExp.content.dependencyIndexArr).toMatchInlineSnapshot(`
      [
        5,
      ]
    `);
    expect(genCode(inputFirstExp.content.dependenciesNode)).toMatchInlineSnapshot('"[count]"');

    // it's the {doubleCount}
    const inputSecondExp = InputCompNode.children[0].children[1];
    expect(inputSecondExp.content.dependencyIndexArr).toMatchInlineSnapshot(`
      [
        3,
        2,
        0,
      ]
    `);
    expect(genCode(inputSecondExp.content.dependenciesNode)).toMatchInlineSnapshot('"[doubleCount]"');
  });
});
