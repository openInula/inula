import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/suspense-lazy transform (no-op)', () => {
  it('keeps Suspense and lazy usage unchanged', async () => {
    const src = `
const LazyComponent = lazy(() => import('./Comp'));
function App(){ return <Suspense fallback={<div>loading...</div>}><LazyComponent/></Suspense>; }
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/SUS1.jsx', source: src, onlyRules: ['core/suspense-lazy'] });
    expect(res.source.trim()).toBe(src.trim());
  });
});


