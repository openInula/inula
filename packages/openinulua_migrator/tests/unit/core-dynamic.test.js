import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/dynamic transform', () => {
  it('rewrites variable component to <Dynamic component={...}>', async () => {
    const src = `
function Hello(){ return <div>Hello</div>; }
function World(){ return <div>World</div>; }
function App({ condition }){
  const Comp = condition ? Hello : World;
  return <Comp />;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/DYN1.jsx', source: src, onlyRules: ['core/dynamic'] });
    expect(res.source).toMatch(/<Dynamic\s+component=\{condition\s*\?\s*Hello\s*:\s*World\}/);
  });

  it('rewrites identifier to Dynamic with props', async () => {
    const src = `
function Hello({ name }){ return <div>Hello {name}</div>; }
function App(){ const Comp = Hello; return <Comp name="Inula"/>; }
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/DYN2.jsx', source: src, onlyRules: ['core/dynamic'] });
    expect(res.source).toMatch(/<Dynamic\s+component=\{Hello\}\s+name=\"Inula\"\s*\/>/);
  });
});


