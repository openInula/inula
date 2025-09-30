import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/if transform', () => {
  it('converts logical && to <if>', async () => {
    const src = `
function A({ ok }) {
  return <div>{ok && <span>ok</span>}</div>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/IF1.jsx', source: src, onlyRules: ['core/if'] });
    expect(res.source).toMatch(/<if\s+cond=\{ok\}>\s*<span>ok<\/span>\s*<\/if>/);
    expect(res.source).not.toMatch(/&&/);
  });

  it('converts ternary to <if>/<else>', async () => {
    const src = `
function B({ flag }) {
  return <div>{flag ? <p>yes</p> : <p>no</p>}</div>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/IF2.jsx', source: src, onlyRules: ['core/if'] });
    expect(res.source).toMatch(/<if\s+cond=\{flag\}>\s*<p>yes<\/p>\s*<\/if>/);
    expect(res.source).toMatch(/<else>\s*<p>no<\/p>\s*<\/else>/);
    expect(res.source).not.toMatch(/\?/);
    expect(res.source).not.toMatch(/:/);
  });

  it('converts nested ternary chain to <if>/<else-if>/<else>', async () => {
    const src = `
function C({ n }) {
  return <div>{n === 1 ? <i>one</i> : n === 2 ? <b>two</b> : <u>other</u>}</div>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/IF3.jsx', source: src, onlyRules: ['core/if'] });
    expect(res.source).toMatch(/<if\s+cond=\{n\s*===\s*1\}>\s*<i>one<\/i>\s*<\/if>/);
    expect(res.source).toMatch(/<else-if\s+cond=\{n\s*===\s*2\}>\s*<b>two<\/b>\s*<\/else-if>/);
    expect(res.source).toMatch(/<else>\s*<u>other<\/u>\s*<\/else>/);
  });

  it('converts logical || fallback to <if cond={!cond}>', async () => {
    const src = `
function D({ value }) {
  return <div>{value || <span>fallback</span>}</div>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/IF4.jsx', source: src, onlyRules: ['core/if'] });
    expect(res.source).toMatch(/<if\s+cond=\{!\(?value\)?\}>\s*<span>fallback<\/span>\s*<\/if>/);
    expect(res.source).not.toMatch(/\|\|/);
  });
});


