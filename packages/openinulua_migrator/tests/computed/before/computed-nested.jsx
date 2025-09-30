function NestedComputed() {
  const a = 1;
  const b = a + 2;
  const c = b * 3;

  return <div>c 的值：{c}</div>;
}

export default NestedComputed;
