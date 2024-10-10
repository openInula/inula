import { functionalMacroAnalyze } from '../../src/analyze/Analyzers/functionalMacroAnalyze';
import { genCode } from '../mock';
import { describe, expect, it } from 'vitest';
import { variablesAnalyze } from '../../src/analyze/Analyzers/variablesAnalyze';
import { mockAnalyze } from './mock';
import { findVarByName } from './utils';

const analyze = (code: string) => mockAnalyze(code, [functionalMacroAnalyze, variablesAnalyze]);

describe('watchAnalyze', () => {
  it('should analyze watch expressions', () => {
    const root = analyze(/*js*/ `
      Comp(() => {
        let a = 0;
        let b = 0;
        watch(() => {
          console.log(a, b);
        });
      })
    `);
    expect(root.watch).toHaveLength(1);
    if (!root?.watch?.[0].callback) {
      throw new Error('watch callback not found');
    }
    expect(genCode(root.watch[0].callback.node)).toMatchInlineSnapshot(`
      "() => {
        console.log(a, b);
      }"
    `);
    if (!root.watch[0].dependency) {
      throw new Error('watch deps not found');
    }
    expect(root.watch[0].dependency.depMask).toBe(0b11);
  });

  it('should support untrack', () => {
    const root = analyze(/*js*/ `
      Comp(() => {
        let a = 0;
        let b = 0;
        watch(() => {
          console.log(untrack(() => a), b);
        })
      })
    `);
    if (!root?.watch?.[0].callback) {
      throw new Error('watch callback not found');
    }
    if (!root.watch[0].dependency) {
      throw new Error('watch deps not found');
    }
    // a is untrack, so it should not be tracked
    expect(findVarByName(root, 'a').bit).toBe(0);
    expect(findVarByName(root, 'b').bit).toBe(1);
    expect(root.watch[0].dependency.depMask).toBe(0b1);
  });

  it('should analyze watch expressions with dependency array', () => {
    const root = analyze(/*js*/ `
      Comp(() => {
        let a = 0;
        let b = 0;
        watch(() => {
          // watch expression
        }, [a, b]);
      })
    `);
    expect(root.watch).toHaveLength(1);
    if (!root?.watch?.[0].callback) {
      throw new Error('watch callback not found');
    }
    expect(genCode(root.watch[0].callback.node)).toMatchInlineSnapshot(`
      "() => {
        // watch expression
      }"
    `);
    if (!root.watch[0].dependency) {
      throw new Error('watch deps not found');
    }
    expect(root.watch[0].dependency.depMask).toBe(0b11);
  });
});
