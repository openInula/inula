import "./index.css";

const Switch = ({
  defaultChecked = false,
  defaultValue = defaultChecked,
  disabled = false,
  loading = false,
  size = "default",  //default, small
  checked,
  onChange,
  onClick,
  className,
  style,
  checkedChildren,
  unCheckedChildren,
  variant = "outlined", // outlined | filled | borderless | underlined
}) => {
  let isChecked = checked !== undefined ? checked : defaultChecked || defaultValue;

  const classNames = (
    isChecked
      ? [
          "inula-switch",
          "inula-switch-checked",
          `inula-switch-${variant}`,
          size && `inula-switch-${size}`,
          disabled && "inula-switch-checked-disabled",
          loading && "inula-switch-checked-loading",
          className,
        ]
      : [
          "inula-switch",
          `inula-switch-${variant}`,
          size && `inula-switch-${size}`,
          disabled && "inula-switch-disabled",
          loading && "inula-switch-loading",
          className,
        ]
  )
    .filter(Boolean)
    .join(" ");

  // console.log("classNames", classNames);

  const btnClassNames = [
    "inula-switch-btn",
    isChecked ? "inula-switch-btn-checked" : "",
    loading && "inula-switch-loading" 
  ].filter(Boolean).join(" ");

  const contentClassNames = [
    "inula-switch-content",
    isChecked ? "inula-switch-content-checked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const styles = {
    ...style,
  };

  const handleSwitchChange = (e) => {
    
    if (disabled || loading) return;

    if (checked !== undefined) {
      e.target.checked = checked;
      isChecked = checked;
      if (onChange) {
        onChange(e);
      }
      if (onClick) {
        onClick(e);
      }
      return;
    }

    isChecked = e.target.checked;
    if (onChange) {
      onChange(e);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <label style={styles} className={classNames}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleSwitchChange}
        disabled={disabled}
        style={{ display: "none" }}
      />

      <div className="inula-switch-expand">
        {checkedChildren || unCheckedChildren}
      </div>

      <div className={btnClassNames}>
        {loading && <div className="inula-switch-loading-circle"></div>}
      </div>

      <div className={contentClassNames}>
        {isChecked ? checkedChildren : unCheckedChildren}
      </div>
    </label>
  );
};

export default Switch;
