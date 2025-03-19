import { variablesAnalyze } from '../../src/analyze/Analyzers/variablesAnalyze';
import { viewAnalyze } from '../../src/analyze/Analyzers/viewAnalyze';
import { genCode } from '../mock';
import { describe, expect, it } from 'vitest';
import { findSubCompByName } from './utils';
import { mockAnalyze } from './mock';
import { ViewReturnStmt } from '../../src/analyze/types';
import { ExpParticle, ForParticle, HTMLParticle } from '@openinula/reactivity-parser';

const analyze = (code: string) => mockAnalyze(code, [variablesAnalyze, viewAnalyze]);
describe('viewAnalyze', () => {
  it('should analyze view', () => {
    const [root] = analyze(/*js*/ `
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
    const div = (root.body![7] as ViewReturnStmt).value as HTMLParticle;
    const firstExp = div.children[0] as ExpParticle;
    expect(firstExp.content.depIdBitmap).toEqual(0b10000);
    expect(genCode(firstExp.content.dependenciesNode)).toMatchInlineSnapshot('"[doubleCount2]"');
    expect(div.props.className.depIdBitmap).toEqual(0b110);
    expect(genCode(div.props.className.value)).toMatchInlineSnapshot('"className + count"');

    const InputCompNode = findSubCompByName(root, 'Input');
    // @ts-expect-error ignore ts here
    // it's the {count}
    const inputFirstExp = InputCompNode.component.body[2].value.children[0];
    expect(inputFirstExp.content.depIdBitmap).toEqual(0b100000);
    expect(genCode(inputFirstExp.content.dependenciesNode)).toMatchInlineSnapshot('"[count]"');

    // @ts-expect-error ignore ts here
    // it's the {doubleCount}
    const inputSecondExp = InputCompNode.component.body[2].value.children[1];
    expect(inputSecondExp.content.depIdBitmap).toEqual(0b1000);
    expect(genCode(inputSecondExp.content.dependenciesNode)).toMatchInlineSnapshot('"[doubleCount]"');
  });

  it('should analyze object state', () => {
    const [root] = analyze(/*js*/ `
      Component(({}) => {
        const info = {
          firstName: 'John',
          lastName: 'Doe'
        }
        return <h1>{info.firstName}</h1>;
      });
    `);
    const div = (root.body![2] as ViewReturnStmt).value as HTMLParticle;
    const firstExp = div.children[0] as ExpParticle;

    expect(firstExp.content.depIdBitmap).toEqual(0b1);
    expect(genCode(firstExp.content.dependenciesNode)).toMatchInlineSnapshot(`"[info?.firstName]"`);
  });

  it('should analyze for loop', () => {
    const [root] = analyze(/*js*/ `
      Component(({}) => {
        const unused = 0;
        const prefix = 'test';
        const list = [{name: 1}, {name: 2}, {name: 3}];
        const list2 = [{name: 4}, {name: 5}, {name: 6}];
        return <for each={[...list, ...list2]}>{
          ({name}) => <div>{prefix + name}</div>
        }</for>;
      });
    `);
    const forNode = (root.body![5] as ViewReturnStmt).value as ForParticle;
    const exp = (forNode.children[0] as HTMLParticle).children[0] as ExpParticle;
    expect(exp.content.depIdBitmap).toEqual(0b11);
    expect(genCode(exp.content.dependenciesNode)).toMatchInlineSnapshot(`"[name]"`);
  });

  it('should collect key for loop', () => {
    const [root] = analyze(/*js*/ `
      Component(({}) => {
        const unused = 0;
        const prefix = 'test';
        const list = [{name: 1}, {name: 2}, {name: 3}];
        const list2 = [{name: 4}, {name: 5}, {name: 6}];
        return <for each={[...list, ...list2]}>{
          ({name}) => <div key={name}>{prefix + name}</div>
        }</for>;
      });
    `);
    const forNode = (root.body![5] as ViewReturnStmt).value as ForParticle;
    expect(genCode(forNode.key)).toMatchInlineSnapshot(`"name"`);
  });
});
