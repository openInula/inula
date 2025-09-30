import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/components transform (no-op)', () => {
  it('leaves children slot usage unchanged', async () => {
    const src = `
function Panel({ title, children }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/CMP1.jsx', source: src, onlyRules: ['core/components'] });
    expect(res.source.trim()).toBe(src.trim());
  });
});


