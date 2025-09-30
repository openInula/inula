import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/error-boundary transform (no-op)', () => {
  it('keeps ErrorBoundary usage unchanged', async () => {
    const src = `
function BuggyComponent(){ throw new Error('出错了'); }
function Fallback({ error }){ return <div>{error.message}</div>; }
function App(){ return <ErrorBoundary fallback={Fallback}><BuggyComponent/></ErrorBoundary>; }
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/ERR1.jsx', source: src, onlyRules: ['core/error-boundary'] });
    expect(res.source.trim()).toBe(src.trim());
  });
});


