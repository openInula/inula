const LazyComponent = lazy(() => import('./Comp'));

function App() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}


