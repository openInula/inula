import "./index.css";
import Icon from '../icon';

/**
 * 通用 Input 输入框组件
 * 支持受控/非受控、前后缀、数字统计、禁用、尺寸、形态等
 * openinula2.0 响应式兼容
 */
const Input = ({
  value, // 受控模式下输入值
  defaultValue = "", // 非受控模式下初始值
  allowClear = false, // 是否显示清除按钮
  onInput, // 输入事件
  onChange, // 变更事件
  disabled = false, // 是否禁用
  placeholder = "", // 占位符
  type = "text", // 输入类型
  className = "", // 自定义类名
  style = {}, // 自定义样式
  size = "default", // 输入框尺寸 large/default/small
  variant = "outlined", // 形态 outlined/filled/borderless/underlined
  addonBefore, // 前置标签
  addonAfter, // 后置标签
  showCount = false, // 是否显示字数统计
  maxLength = 5000, // 最大长度
  autoSize = false, // 自动调整大小，可以是布尔值或对象 { minRows: 2, maxRows: 6 }
  status, // 新增：输入框状态 error/warning
  ...rest
}) => {
  let innerValue = value !== undefined ? value : defaultValue;
  let count = innerValue.length;
  let showPassword = false; // 密码可见性响应式变量

  // 处理 autoSize 配置
  const getAutoSizeConfig = () => {
    if (!autoSize) return null;

    if (autoSize === true) {
      return { unlimited: true };
    }

    if (typeof autoSize === 'object') {
      return {
        minRows: autoSize.minRows || 2,
        maxRows: autoSize.maxRows || 6
      };
    }

    return null;
  };

  const autoSizeConfig = getAutoSizeConfig();
  const isTextarea = type === 'textarea';

  // 兼容性查找：从任意子节点向上查找 .inula-input-affix-wrapper（不依赖 Element.closest）
  const findAffixWrapper = (startNode) => {
    let node = startNode;
    // 仅在存在且是元素节点时向上遍历
    while (node && node !== document) {
      if (node.classList && node.classList.contains('inula-input-affix-wrapper')) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };

  // 计算 textarea 的样式
  const getTextareaStyle = () => {
    if (!isTextarea || !autoSizeConfig) return {};
    if (autoSizeConfig.unlimited) {
      return {
        resize: 'none',
        overflow: 'auto'
      };
    }
    const lineHeight = size === 'large' ? 24 : size === 'small' ? 18 : 20;
    const padding = size === 'large' ? 12 : size === 'small' ? 8 : 10;
    const borderWidth = 1;
    const minHeight = autoSizeConfig.minRows * lineHeight + padding * 2 + borderWidth * 2;
    const maxHeight = autoSizeConfig.maxRows * lineHeight + padding * 2 + borderWidth * 2;
    return {
      minHeight: `${minHeight}px`,
      maxHeight: `${maxHeight}px`,
      resize: 'none',
      overflow: 'auto'
    };
  };

  // 自动调整 textarea 高度的函数
  const adjustTextareaHeight = (element) => {
    if (!isTextarea || !autoSizeConfig || !element) return;
    element.style.height = 'auto';
    if (autoSizeConfig.unlimited) {
      element.style.height = `${element.scrollHeight}px`;
      return;
    }
    const lineHeight = size === 'large' ? 24 : size === 'small' ? 18 : 20;
    const padding = size === 'large' ? 12 : size === 'small' ? 8 : 10;
    const borderWidth = 1;
    const minHeight = autoSizeConfig.minRows * lineHeight + padding * 2 + borderWidth * 2;
    const maxHeight = autoSizeConfig.maxRows * lineHeight + padding * 2 + borderWidth * 2;
    const scrollHeight = element.scrollHeight;
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    element.style.height = `${newHeight}px`;
  };

  // 事件处理，自动调用父组件传递的 onInput/onChange
  const handleInput = (e) => {
    if (value !== undefined) {
      // 受控：更新统计基于当前输入值
      count = (e && e.target ? e.target.value.length : 0);
      onInput && onInput(e);
      onChange && onChange(e);
    } else {
      // 非受控：同步内部值并更新统计
      innerValue = e.target.value;
      count = innerValue.length;
      onInput && onInput(e);
      onChange && onChange(e.target.value);
    }

    // 如果是 textarea 且启用了 autoSize，调整高度
    if (isTextarea && autoSizeConfig) {
      adjustTextareaHeight(e.target);
    }
  }

  const handleClear = (e) => {
    // 区分受控和非受控模式
    if (value !== undefined) {
      // 受控模式：只调用回调，不修改内部状态
      count = 0;
      onChange && onChange("");
      onInput && onInput({ target: { value: "" } });
    } else {
      // 非受控模式：修改内部状态并调用回调
      innerValue = "";
      count = 0;
      onChange && onChange("");
      onInput && onInput({ target: { value: "" } });
    }

    // 无 ref 方案：从事件 target 向上遍历拿到包装器，再定位到对应的 input/textarea
    const wrapper = e && e.target ? findAffixWrapper(e.target) : null;
    const el = wrapper ? wrapper.querySelector(isTextarea ? 'textarea' : 'input') : null;
    if (el) {
      // 立即同步清空，避免外部受控延迟导致的视觉滞后
      try { el.value = ""; } catch (_) {}
      if (isTextarea && autoSizeConfig) {
        adjustTextareaHeight(el);
      }
      try { el.focus(); } catch (_) {}
    }
  }

  // 密码显示/隐藏切换
  const handleTogglePassword = () => {
    console.log("handleTogglePassword", showPassword);
    showPassword = !showPassword;
  };

  // 拼接输入框样式类名
  const inputClassNames = [
    "inula-input",
    `inula-input-${size}`,
    `inula-input-${variant}`,
    showCount ? "inula-input-has-count" : "",
    allowClear ? "inula-input-has-clear" : "",
    disabled ? "inula-input-disabled" : "",
    status ? `inula-input-${status}` : "",
    isTextarea ? "inula-textarea" : "",
    autoSizeConfig ? "inula-input-auto-size" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // 拼接外层包裹样式类名
  const wrapperClassNames = [
    "inula-input-wrapper",
    addonBefore ? "inula-input-has-addon-before" : "",
    addonAfter ? "inula-input-has-addon-after" : "",
    `inula-input-wrapper-${size}`,
    autoSizeConfig ? "inula-input-wrapper-auto-size" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // 拼接外层包装器样式类名
  const affixWrapperClassNames = [
    "inula-input-affix-wrapper",
    variant === "borderless" ? "inula-input-affix-wrapper-borderless" : "",
    variant === "underlined" ? "inula-input-affix-wrapper-underlined" : "",
    status ? `inula-input-${status}` : "",
    autoSizeConfig ? "inula-input-affix-wrapper-auto-size" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // 不让 rest 里的 className 覆盖 inputClassNames
  // const { className: _ignore, ...restProps } = rest;

  // 渲染
  return (
    <span className={wrapperClassNames} style={style}>
      {/* 前置标签 */}
      {addonBefore && (
        <span className="inula-input-addon inula-input-addon-before">
          {addonBefore}
        </span>
      )}
      <span className={affixWrapperClassNames}>
        {/* 输入框本体，受控/非受控兼容 */}
        {isTextarea ? (
          <textarea
            value={innerValue}
            defaultValue={defaultValue}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            onInput={(e) => handleInput(e)}
            style={getTextareaStyle()}
            className={inputClassNames}
          />
        ) : (
          <input
            type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
            value={innerValue}
            defaultValue={defaultValue}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            onInput={(e) => handleInput(e)}
            // {...restProps}
            className={inputClassNames}
          />
        )}
        {/* 清除按钮（可选） */}
        {allowClear && !disabled && innerValue && (
          <span className="inula-input-clear" onClick={handleClear}>
            <Icon value="xmark" theme="filled" size={14} color="#666" />
          </span>
        )}
        {/* 密码显示/隐藏切换按钮 */}
        {type === 'password' && !disabled && (
          <span className="inula-input-password-toggle" onClick={handleTogglePassword} style={{ marginRight: 12, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <if cond={showPassword}>
              <Icon value='eye' theme="filled" size={12} color="#999" />
            </if>
            <else>
              <Icon value='eye-slash' theme="filled" size={12} color="#999" />
            </else>
          </span>
        )}
        {/* 字数统计（可选） */}
        {showCount && (
          <span className="inula-input-count-inside" aria-live="polite">
            {maxLength ? `${count} / ${maxLength}` : count}
          </span>
        )}
      </span>
      {/* 后置标签 */}
      {addonAfter && (
        <span className="inula-input-addon inula-input-addon-after">
          {addonAfter}
        </span>
      )}
    </span>
  );
};

export default Input;
