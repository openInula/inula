import Icon from '../icon/index.jsx';
import './index.css';

const PRESET_COLORS = [
  'magenta','red','volcano','orange','gold','lime','green','cyan','blue','geekblue','purple',
  'success','processing','warning','error','default'
];

const classNames = (...args) => args.filter(Boolean).join(' ');

const isPresetColor = (color) => PRESET_COLORS.includes(String(color));

const Tag = ({
  children,
  color = 'default',
  icon,
  closable = false,
  onClose,
  bordered = true,
  size = 'default', // small | default | large
  round = false,
  disabled = false,
  className = '',
  style = {},
  onClick,
  ...rest
}) => {
  const isPreset = isPresetColor(color);
  const customStyle = !isPreset && color ? { backgroundColor: color, borderColor: color, color: '#fff', ...style } : style;

  const tagCls = classNames(
    'inula-tag',
    `inula-tag-${size}`,
    bordered ? '' : 'inula-tag-borderless',
    isPreset ? `inula-tag-${color}` : 'inula-tag-custom',
    round ? 'inula-tag-round' : '',
    disabled ? 'inula-tag-disabled' : '',
    className,
  );

  const handleClose = (e) => {
    e && e.stopPropagation && e.stopPropagation();
    if (disabled) return;
    onClose && onClose(e);
  };

  return (
    <span className={tagCls} style={customStyle} onClick={onClick} {...rest}>
      {icon ? <Icon value={icon} size={12} /> : null}
      <span className="inula-tag-content">{children}</span>
      {closable ? (
        <Icon value="close" size={12} onClick={handleClose} />
      ) : null}
    </span>
  );
};

const CheckableTag = ({
  children,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  className = '',
  ...rest
}) => {
  let innerChecked = checked;
  if (innerChecked == null) innerChecked = defaultChecked;

  const toggle = (e) => {
    if (disabled) return;
    const next = !innerChecked;
    onChange && onChange(next, e);
    if (checked == null) {
      innerChecked = next; // 非受控时，交由运行时响应式体系处理
    }
  };

  return (
    <Tag
      {...rest}
      className={classNames('inula-tag-checkable', innerChecked ? 'inula-tag-checkable-checked' : '', className)}
      onClick={toggle}
      closable={false}
    >
      {children}
    </Tag>
  );
};

export { Tag, CheckableTag };
export default Tag;


