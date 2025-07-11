import { useState, useEffect, createPortal } from 'openinula';
export function Teleport({ to, children }) {
  const container = useState(() => {
    document.createElement('div');
  });

  useEffect(() => {
    to.appendChild(container);

    return () => {
      to.removeChild(container);
    };
  }, [to, container]);

  return createPortal(children, container);
}
