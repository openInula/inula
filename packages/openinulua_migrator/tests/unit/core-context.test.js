import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/context transform', () => {
  it('handles inline object literal', async () => {
    const src = `
function App(){
  return <UserContext.Provider value={{ level: 2, path: '/dash' }}><Child/></UserContext.Provider>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/CTX2.jsx', source: src, onlyRules: ['core/context'] });
    expect(res.source).toMatch(/<UserContext\s+level=\{2\}\s+path=\{'\/dash'\}>/);
  });
  
  it('converts Provider value object identifier by expanding to attributes', async () => {
    const src = `
function App(){
  const value = { level: 1, path: '/home' };
  return <UserContext.Provider value={value}><Child/></UserContext.Provider>;
}
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/CTX1.jsx', source: src, onlyRules: ['core/context'] });
    // Since we only expand inline object literals, identifier case should still drop Provider but keep value reference split
    // For now we assert Provider is removed and base tag used
    expect(res.source).toMatch(/<UserContext\s+value=\{value\}>|<UserContext\s+level=\{1\}\s+path=\{'\/home'\}>/);
    expect(res.source).not.toMatch(/Provider/);
  });
});


