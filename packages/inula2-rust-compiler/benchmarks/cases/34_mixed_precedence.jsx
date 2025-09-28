function TestComponent() {
  return (
    <div>
      {(a ?? b) && c || (d ?? e) && f}
    </div>
  );
}
