import { variablesAnalyze } from '../../src/analyze/Analyzers/variablesAnalyze';
import { ComponentNode } from '../../src/analyze/types';
import { viewAnalyze } from '../../src/analyze/Analyzers/viewAnalyze';
import { genCode, mockAnalyze } from '../mock';
import { describe, expect, it } from 'vitest';
import { findSubCompByName } from './utils';

const analyze = (code: string) => mockAnalyze(code, [variablesAnalyze, viewAnalyze]);
describe('viewAnalyze', () => {
  it('should analyze view', () => {
    const root = analyze(/*js*/ `
      Component(({}) => {
        let name;
        let className;
        let count = name; // 1
        let doubleCount = count * 2; // 2
        let doubleCount2 = doubleCount * 2; // 4
        const Input =  Component(() => {
          let count = 1;
          return <input>{count}{doubleCount}</input>;
        });
        return <div className={className + count}>{doubleCount2}</div>;
      });
    `);
    const div = root.children![0] as any;
    expect(div.children[0].content.depMask).toEqual(0b10000);
    expect(genCode(div.children[0].content.dependenciesNode)).toMatchInlineSnapshot('"[doubleCount2]"');
    expect(div.props.className.depMask).toEqual(0b110);
    expect(genCode(div.props.className.value)).toMatchInlineSnapshot('"className + count"');

    const InputCompNode = findSubCompByName(root, 'Input');
    // @ts-expect-error ignore ts here
    // it's the {count}
    const inputFirstExp = InputCompNode.children![0].children[0];
    expect(inputFirstExp.content.depMask).toEqual(0b100000);
    expect(genCode(inputFirstExp.content.dependenciesNode)).toMatchInlineSnapshot('"[count]"');

    // @ts-expect-error ignore ts here
    // it's the {doubleCount}
    const inputSecondExp = InputCompNode.children[0].children[1];
    expect(inputSecondExp.content.depMask).toEqual(0b1000);
    expect(genCode(inputSecondExp.content.dependenciesNode)).toMatchInlineSnapshot('"[doubleCount]"');
  });

  it('should analyze object state', () => {
    const root = analyze(/*js*/ `
      Component(({}) => {
        const info = {
          firstName: 'John',
          lastName: 'Doe'
        }
        return <h1>{info.firstName}</h1>;
      });
    `);
    const div = root.children![0] as any;
    expect(div.children[0].content.depMask).toEqual(0b1);
    expect(genCode(div.children[0].content.dependenciesNode)).toMatchInlineSnapshot(`"[info?.firstName]"`);
  });
});
