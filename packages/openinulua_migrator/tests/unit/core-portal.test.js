import { describe, it, expect } from 'vitest';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

describe('core/portal transform', () => {
  it('converts createPortal to <Portal target={...}>', async () => {
    const src = `
import { createPortal } from 'react-dom';
const root = document.getElementById('portal-root');
function App(){ return createPortal(<div>Content</div>, root); }
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/POR1.jsx', source: src, onlyRules: ['core/portal'] });
    expect(res.source).toMatch(/<Portal\s+target=\{root\}>\s*<div>Content<\/div>\s*<\/Portal>/);
  });

  it('converts ReactDOM.createPortal call', async () => {
    const src = `
import ReactDOM from 'react-dom';
function App(){ return ReactDOM.createPortal(<span/>, portalRoot); }
`;
    const res = await runJscodeshiftTransforms({ filePath: '/tmp/POR2.jsx', source: src, onlyRules: ['core/portal'] });
    expect(res.source).toMatch(/<Portal\s+target=\{portalRoot\}>\s*<span\/>\s*<\/Portal>/);
  });
});


