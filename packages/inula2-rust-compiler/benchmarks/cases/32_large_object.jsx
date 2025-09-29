function TestComponent() {
  return (
    <div>
      {{
        a: 1,
        b: { c: 2, d: { e: 3, f: { g: 4, h: { i: 5 } } } },
        nested: { deep: { structure: { with: { many: { levels: { of: { nesting: { here: "value" } } } } } } } }
      }}
    </div>
  );
}
