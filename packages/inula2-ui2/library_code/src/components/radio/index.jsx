// openInula 2.0 Radio 组件
import './index.css';

const sizeMap = {
  large: 'inula-radio-large',
  small: 'inula-radio-small',
  default: '',
};

function Radio({
  checked = false,
  disabled = false,
  readOnly = false,
  value = '',
  name = '',
  label = '',
  onChange,
  size = 'default',
  options,
  style = {},
  className = '',
  variant = 'outlined', // outlined | filled | borderless | underlined
}) {
  // 如果有 options，渲染为 RadioGroup
  if (Array.isArray(options)) {
    return (
      <div className={`inula-radio-group ${className}`} style={style}>
        <for each={options}>
          {(opt, index) => (
            <Radio
              key={`${opt.value}-${index}`}
              value={opt.value}
              label={opt.label}
              checked={opt.checked}
              disabled={opt.disabled || disabled}
              readOnly={opt.readOnly || readOnly}
              name={name}
              size={size}
              onChange={(val, e) => {
                // 确保单选逻辑：先清除所有选中状态，再设置当前选中
                if (onChange) {
                  onChange(val, e);
                }
              }}
            />
          )}
        </for>
      </div>
    );
  }

  function handleChange(e) {
    if (disabled || readOnly) return;
    
    // 确保单选逻辑
    const radioGroup = e.target.closest('.inula-radio-group') || e.target.closest('[class*="radio"]').parentElement;
    if (radioGroup) {
      // 清除同组内其他radio的选中状态
      const otherRadios = radioGroup.querySelectorAll('input[type="radio"]');
      otherRadios.forEach(radio => {
        if (radio !== e.target) {
          radio.checked = false;
          const radioWrapper = radio.closest('.inula-radio');
          if (radioWrapper) {
            radioWrapper.classList.remove('inula-radio-checked');
          }
        }
      });
      
      // 设置当前radio为选中状态
      e.target.checked = true;
      const currentWrapper = e.target.closest('.inula-radio');
      if (currentWrapper) {
        currentWrapper.classList.add('inula-radio-checked');
      }
    }
    
    onChange && onChange(value, e);
  }

  return (
    <label
      className={`inula-radio-wrapper ${sizeMap[size] || ''} inula-radio-${variant}${disabled ? ' inula-radio-wrapper--disabled' : ''}${readOnly ? ' inula-radio-wrapper--readonly' : ''} ${className}`.trim()}
      style={style}
    >
      <span className={`inula-radio${checked ? ' inula-radio-checked' : ''}${disabled ? ' inula-radio-disabled' : ''}${readOnly ? ' inula-radio-readonly' : ''}`.trim()}>
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          readOnly={readOnly}
          onChange={handleChange}
          className="inula-radio-input"
        />
        <span className="inula-radio-inner" />
      </span>
      <span className="inula-radio-label">{label}</span>
    </label>
  );
}

export default Radio;