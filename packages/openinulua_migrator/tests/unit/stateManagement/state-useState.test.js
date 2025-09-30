import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

function runAll(source, filePath = '/tmp/tmp.jsx', onlyRules) {
  return runJscodeshiftTransforms({
    filePath,
    source,
    onlyRules, // when null => run all
  });
}

describe('state/useState transform', () => {
  it('decl converts to let and setter to direct assignment', async () => {
    const source = "import { useState } from 'react';\nfunction A(){ const [count, setCount] = useState(0); setCount(1); return <p>{count}</p>; }";
    const res = await runAll(source, '/tmp/A.jsx', ['state/useState', 'core/imports']);
    expect(res.source).toMatch(/let\s+count\s*=\s*0/);
    expect(res.source).toMatch(/count\s*=\s*1/);
    expect(res.source).not.toMatch(/from\s+['\"]react['\"]/);
  });

  it('functional update becomes assignment using state identifier', async () => {
    const source = "import { useState } from 'react';\nfunction A(){ const [n, setN] = useState(0); setN(p => p + 1); return <p>{n}</p>; }";
    const res = await runAll(source, '/tmp/B.jsx', ['state/useState', 'core/imports']);
    expect(res.source).toMatch(/n\s*=\s*n\s*\+\s*1/);
  });

  it('lazy initializer unwraps arrow function', async () => {
    const source = "import { useState } from 'react';\nfunction A(){ const [x, setX] = useState(() => 42); return <p>{x}</p>; }";
    const res = await runAll(source, '/tmp/C.jsx', ['state/useState', 'core/imports']);
    expect(res.source).toMatch(/let\s+x\s*=\s*42/);
  });

  it('object update remains an assignment of new object', async () => {
    const source = "import { useState } from 'react';\nfunction A(){ const [user, setUser] = useState({age: 1}); setUser({...user, age: 2}); return <p>{user.age}</p>; }";
    const res = await runAll(source, '/tmp/D.jsx', ['state/useState', 'core/imports']);
    expect(res.source).toMatch(/user\s*=\s*\{\s*\.\.\.user,\s*age:\s*2\s*\}/);
  });

  it('array update remains an assignment of new array', async () => {
    const source = "import { useState } from 'react';\nfunction A(){ const [todos, setTodos] = useState([]); setTodos([...todos, 1]); return <ul/> }";
    const res = await runAll(source, '/tmp/E.jsx', ['state/useState', 'core/imports']);
    expect(res.source).toMatch(/todos\s*=\s*\[\s*\.\.\.todos,\s*1\s*\]/);
  });
});

