import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/props transform (no-op)', () => {
  it('leaves basic prop passing unchanged', async () => {
    const src = `
function Welcome({ name }) { return <h1>你好，{name}！</h1>; }
function App() { return <Welcome name="OpenInula" />; }
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/P1.jsx', source: src, onlyRules: ['core/props'] });
    expect(res.source.trim()).toBe(src.trim());
  });

  it('leaves default value destructuring unchanged', async () => {
    const src = `
function UserProfile({ name = '匿名', age = 0 }) {
  return (<div><p>姓名：{name}</p><p>年龄：{age}</p></div>);
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/P2.jsx', source: src, onlyRules: ['core/props'] });
    expect(res.source.trim()).toBe(src.trim());
  });
});


