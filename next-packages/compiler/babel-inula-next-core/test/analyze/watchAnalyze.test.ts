import { functionalMacroAnalyze } from '../../src/analyze/Analyzers/functionalMacroAnalyze';
import { genCode } from '../mock';
import { describe, expect, it } from 'vitest';
import { variablesAnalyze } from '../../src/analyze/Analyzers/variablesAnalyze';
import { mockAnalyze } from './mock';
import { findVarByName } from './utils';

const analyze = (code: string) => mockAnalyze(code, [functionalMacroAnalyze, variablesAnalyze]);

describe('watchAnalyze', () => {
  it('should analyze watch expressions', () => {
    const [root] = analyze(/*js*/ `
      Comp(() => {
        let a = 0;
        let b = 0;
        watch(() => {
          console.log(a, b);
        });
      })
    `);
    const watchStmt = root.body[3]; // watch is the 4th node
    if (!(watchStmt.type === 'watch')) {
      throw new Error('watch callback not found');
    }
    expect(genCode(watchStmt.callback.node)).toMatchInlineSnapshot(`
      "() => {
        console.log(a, b);
      }"
    `);
    if (!watchStmt.dependency) {
      throw new Error('watch deps not found');
    }
    expect(watchStmt.dependency.depIdBitmap).toBe(0b11);
  });

  it('should support untrack', () => {
    const [root] = analyze(/*js*/ `
      Comp(() => {
        let a = 0;
        let b = 0;
        watch(() => {
          console.log(untrack(() => a), b);
        })
      })
    `);

    const watchStmt = root.body[3]; // watch is the 4th node
    if (!(watchStmt.type === 'watch')) {
      throw new Error('watch callback not found');
    }
    if (!watchStmt.callback) {
      throw new Error('watch callback not found');
    }
    if (!watchStmt.dependency) {
      throw new Error('watch deps not found');
    }
    expect(findVarByName(root, 'a').reactiveId).toBe(1);
    expect(findVarByName(root, 'b').reactiveId).toBe(2);
    // a is untrack, so it should not be tracked
    expect(watchStmt.dependency.depIdBitmap).toBe(0b10);
  });

  it('should analyze watch expressions with dependency array', () => {
    const [root] = analyze(/*js*/ `
      Comp(() => {
        let a = 0;
        let b = 0;
        watch(() => {
          // watch expression
        }, [a, b]);
      })
    `);
    const watchStmt = root.body[3]; // watch is the 4th node
    if (!(watchStmt.type === 'watch')) {
      throw new Error('watch callback not found');
    }
    expect(genCode(watchStmt.callback.node)).toMatchInlineSnapshot(`
      "() => {
        // watch expression
      }"
    `);
    if (!watchStmt.dependency) {
      throw new Error('watch deps not found');
    }
    expect(watchStmt.dependency.depIdBitmap).toBe(0b11);
  });
});
