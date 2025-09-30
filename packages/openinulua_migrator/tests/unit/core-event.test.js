import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/event transform', () => {
  it('renames onChange to onInput for input', async () => {
    const src = `
function A(){
  let v = '';
  return <input value={v} onChange={e => v = e.target.value} />;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/E1.jsx', source: src, onlyRules: ['core/event'] });
    expect(res.source).toMatch(/onInput=\{e => v = e\.target\.value\}/);
    expect(res.source).not.toMatch(/onChange=/);
  });

  it('keeps click handler unchanged', async () => {
    const src = `
function B(){
  let count = 0; function handleClick(){ count++; }
  return <button onClick={handleClick}>ok</button>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/E2.jsx', source: src, onlyRules: ['core/event'] });
    expect(res.source).toMatch(/onClick=\{handleClick\}/);
  });

  it('renames onChange inside textarea', async () => {
    const src = `
function C(){
  let message = '';
  return <textarea value={message} onChange={e => message = e.target.value}/>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/E3.jsx', source: src, onlyRules: ['core/event'] });
    expect(res.source).toMatch(/onInput=\{e => message = e\.target\.value\}/);
  });
});


