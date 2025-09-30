const portalRoot = document.getElementById('portal-root');

function App() {
  return (
    <Portal target={portalRoot}>
      <div>Portal Content</div>
    </Portal>
  );
}


