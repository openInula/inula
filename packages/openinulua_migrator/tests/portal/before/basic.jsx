import { createPortal } from 'react-dom';

const portalRoot = document.getElementById('portal-root');

function App() {
  return createPortal(
    <div>Portal Content</div>,
    portalRoot
  );
}


