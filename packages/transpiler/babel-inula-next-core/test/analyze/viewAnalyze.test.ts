import { propertiesAnalyze } from '../../src/analyze/propertiesAnalyze';
import { propsAnalyze } from '../../src/analyze/propsAnalyze';
import { viewAnalyze } from '../../src/analyze/viewAnalyze';
import { genCode, mockAnalyze } from '../mock';
import { describe, expect, it } from 'vitest';

const analyze = (code: string) => mockAnalyze(code, [propsAnalyze, propertiesAnalyze, viewAnalyze]);

describe('watchAnalyze', () => {
  it('should analyze watch expressions', () => {
    const root = analyze(/*js*/ `
      Comp(({name}) => {
        let count = 11
        return <div className={name}>{count}</div>
      })
    `);
    expect(true).toHaveLength(1);
  });
});
