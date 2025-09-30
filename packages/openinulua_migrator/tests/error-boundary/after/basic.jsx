function BuggyComponent() {
  throw new Error('出错了');
  return <div>不会渲染</div>;
}

const Fallback = error => <div>{error.message}</div>;

function App() {
  return (
    <ErrorBoundary fallback={Fallback}>
      <BuggyComponent />
    </ErrorBoundary>
  );
}


