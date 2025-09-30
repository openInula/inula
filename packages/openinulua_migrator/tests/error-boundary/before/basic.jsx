function BuggyComponent() {
  throw new Error('出错了');
}

function Fallback({ error }) {
  return <div>{error.message}</div>;
}

function App() {
  return (
    <ErrorBoundary fallback={Fallback}>
      <BuggyComponent />
    </ErrorBoundary>
  );
}


