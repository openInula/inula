import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/list transform', () => {
  it('converts simple .map to <for>', async () => {
    const src = `
function A({ items }) {
  return <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/L1.jsx', source: src, onlyRules: ['core/list'] });
    expect(res.source).toMatch(/<for\s+each=\{items\}>/);
    expect(res.source).toMatch(/\{\(x, i\) => <li>\{x\}<\/li>\}/);
    expect(res.source).not.toMatch(/key=/);
  });

  it('supports chained expressions before map', async () => {
    const src = `
function B({ users }) {
  return <ul>{users.filter(u => u.active).map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/L2.jsx', source: src, onlyRules: ['core/list'] });
    expect(res.source).toMatch(/each=\{users\.filter\(u => u\.active\)\}/);
    // allow with or without parentheses around single param
    expect(res.source).toMatch(/\{\(?u\)?\s*=>\s*<li>\{u\.name\}<\/li>\}/);
    expect(res.source).not.toMatch(/key=/);
  });

  it('handles block-bodied callbacks with return', async () => {
    const src = `
function C({ nums }) {
  return <div>{nums.map(n => { return <span>{n*n}</span>; })}</div>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/L3.jsx', source: src, onlyRules: ['core/list'] });
    expect(res.source).toMatch(/<for\s+each=\{nums\}>/);
    expect(res.source).toMatch(/\{\(?n\)?\s*=>\s*<span>\{n\*n\}<\/span>\}/);
  });

  it('supports JSX fragment as body', async () => {
    const src = `
function D({ arr }) {
  return <section>{arr.map((v, i) => (<><b>{i}</b><em>{v}</em></>))}</section>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/L4.jsx', source: src, onlyRules: ['core/list'] });
    expect(res.source).toMatch(/<for\s+each=\{arr\}>/);
    // Accept fragment printed with surrounding parentheses
    expect(res.source).toMatch(/\(v,\s*i\)\s*=>\s*\(\s*<>/);
  });
});


