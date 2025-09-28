function IME({ value, onInput, onCompStart, onCompEnd }) {
  return <input value={value} onInput={onInput} onCompositionStart={onCompStart} onCompositionEnd={onCompEnd} />;
}


