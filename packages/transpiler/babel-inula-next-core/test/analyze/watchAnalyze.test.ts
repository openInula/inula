import { functionalMacroAnalyze } from '../../src/analyzer/functionalMacroAnalyze';
import { genCode, mockAnalyze } from '../mock';
import { describe, expect, it } from 'vitest';

const analyze = (code: string) => mockAnalyze(code, [functionalMacroAnalyze]);

describe('watchAnalyze', () => {
  it('should analyze watch expressions', () => {
    const root = analyze(/*js*/ `
      Comp(() => {
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
    if (!root.watch[0].deps) {
      throw new Error('watch deps not found');
    }
    expect(genCode(root.watch[0].deps.node)).toMatchInlineSnapshot('"[a, b]"');
  });
});
