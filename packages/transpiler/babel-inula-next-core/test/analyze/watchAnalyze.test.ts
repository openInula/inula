import { functionalMacroAnalyze } from '../../src/analyzer/functionalMacroAnalyze';
import { genCode, mockAnalyze } from '../mock';
import { describe, expect, it } from 'vitest';
import { variablesAnalyze } from '../../src/analyzer/variablesAnalyze';

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
    if (!root.watch[0].depMask) {
      throw new Error('watch deps not found');
    }
    expect(root.watch[0].depMask).toBe(0b11);
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
    if (!root.watch[0].depMask) {
      throw new Error('watch deps not found');
    }
    expect(root.watch[0].depMask).toBe(0b11);
  });
});
