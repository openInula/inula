import { render } from '@openinula/next';
import './index.css';

const Button = ({
  type = 'default', // primary, dashed, text, link
  danger = false,
  ghost = false,
  disabled = false,
  loading = false,
  children,
  onClick,
  ...rest
}) => {
  const classNames = [
    'inula-btn',
    `inula-btn-${type}`,
    danger ? 'inula-btn-danger' : '',
    ghost ? 'inula-btn-ghost' : '',
    disabled ? 'inula-btn-disabled' : '',
    loading ? 'inula-btn-loading' : '',
  ].filter(Boolean).join(' ');

  console.log('Button props:', rest);

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? <span className="inula-btn-spinner" /> : null}
      {children}
    </button>
  );
};

export default Button;