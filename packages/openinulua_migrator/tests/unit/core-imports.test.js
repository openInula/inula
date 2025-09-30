import { describe, it, expect } from 'vitest';
import exec from '../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/imports transform', () => {
  it('removes unused default React import', async () => {
    const source = "import React from 'react';\nexport const A = () => <div/>;\n";
    const result = await runJscodeshiftTransforms({
      filePath: '/tmp/A.jsx',
      source,
      onlyRules: ['core/imports'],
    });
    expect(result.source).not.toMatch(/from\s+['\"]react['\"]/);
  });
});

