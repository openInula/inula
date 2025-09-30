import { render } from '@openinula/next';
import './index.css';

const Button = ({
  type = 'default', // 样式类型：primary, dashed, text, link
  danger = false,
  ghost = false,
  disabled = false,
  loading = false,
  variant = 'outlined', // outlined | filled | borderless | underlined
  children,
  onClick,
  htmlType = 'button', // 原生 button 类型：button | submit | reset（默认 button，避免表单内默认 submit）
  ...rest
}) => {
  const classNames = [
    'inula-btn',
    `inula-btn-${type}`,
    `inula-btn-${variant}`,
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
      type={htmlType}
      {...rest}
    >
      {loading ? <span className="inula-btn-spinner" /> : null}
      {children}
    </button>
  );
};

export default Button;