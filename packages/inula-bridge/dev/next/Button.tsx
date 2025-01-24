'use next';

export function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}
