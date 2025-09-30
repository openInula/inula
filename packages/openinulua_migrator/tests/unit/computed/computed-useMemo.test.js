import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('computed/useMemo transform', () => {
  it('converts variable declarator useMemo to direct expression', async () => {
    const src = "import { useMemo } from 'react';\nconst a = 1;\nconst b = useMemo(() => a * 2, [a]);\n";
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/M1.jsx', source: src, onlyRules: ['computed/useMemo'] });
    expect(res.source).toMatch(/const b = a \* 2/);
  });

  it('handles React.useMemo and alias', async () => {
    const src = "import React, { useMemo as m } from 'react';\nconst a = 1;\nconst b = React.useMemo(() => a + 3, [a]);\nconst c = m(() => a + b, [a,b]);\n";
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/M2.jsx', source: src, onlyRules: ['computed/useMemo'] });
    expect(res.source).toMatch(/const b = a \+ 3/);
    expect(res.source).toMatch(/const c = a \+ b/);
  });
});

