import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('watch/useEffect transform', () => {
  it('basic useEffect -> watch', async () => {
    const src = "import { useEffect } from 'react';\nuseEffect(() => { console.log('a'); }, [a]);";
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/W1.jsx', source: src, onlyRules: ['watch/useEffect'] });
    expect(res.source).toMatch(/watch\(\(\) => \{\s*console\.log\('a'\);\s*\}\)/);
    expect(res.source).not.toMatch(/useEffect/);
  });

  it('React.useEffect and alias', async () => {
    const src = "import React, { useEffect as eff } from 'react';\nReact.useEffect(() => foo(), [x]); eff(() => bar(), [y]);";
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/W2.jsx', source: src, onlyRules: ['watch/useEffect'] });
    expect(res.source).toMatch(/watch\(\(\) => foo\(\)\)/);
    expect(res.source).toMatch(/watch\(\(\) => bar\(\)\)/);
    expect(res.source).not.toMatch(/useEffect/);
  });

  it('wraps non-function first arg', async () => {
    const src = "import { useEffect } from 'react';\nuseEffect(foo(), [dep]);";
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/W3.jsx', source: src, onlyRules: ['watch/useEffect'] });
    expect(res.source).toMatch(/watch\(\(\) => foo\(\)\)/);
  });
});

