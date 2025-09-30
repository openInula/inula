import "./index.css";

const Checkbox = ({
  // autoFocus = false,
  defaultChecked = false,
  disabled = false,
  indeterminate = false,
  children,
  checked,
  className,
  style,
  variant = "outlined", // outlined | filled | borderless | underlined
  onChange,
  onBlur,
  onFocus,
  ...rest
}) => {

  const handleBoxChange = (e) => {
    if (checked !== undefined) {
      e.target.checked = checked;
      onChange && onChange(e);
      return;
    }
    if (onChange) {
      onChange(e);
    }
  };

  const classNames = [
    className,
    "inula-checkbox",
    `inula-checkbox-${variant}`,
    disabled ? "inula-checkbox-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inputClassNames = [
    "inula-checkbox-input",
    indeterminate ? "inula-checkbox-indeterminate" : "",
    disabled ? "inula-checkbox-input-disabled" : "",
    indeterminate && disabled ? "inula-checkbox-indeterminate-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const styles = {
    ...style,
    ...(disabled && { cursor: "not-allowed" }),
  };

  return (
    <label className={classNames} style={styles} {...rest}>
      <input
        type="checkbox"
        className={inputClassNames}
        checked={checked !== undefined ? checked : defaultChecked}
        onChange={(e) => handleBoxChange(e)}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
      />
      {children}
    </label>
  );
};

const CheckboxGroup = ({
  defaultValue = [], // [value1, value2,...]
  disabled = false,
  options, // [{value, label, disabled, ...}]
  value, // [value1, value2,...]
  className,
  style,
  onChange,
  ...rest
}) => {
  let checkedValues = value || defaultValue || [];

  const handleBoxChange = (targetValue) => {
    if (value) {
      onChange && onChange(targetValue);
      return;
    }
    if (checkedValues.includes(targetValue)) {
      checkedValues = checkedValues.filter((item) => item !== targetValue);
    } else {
      checkedValues = [...checkedValues, targetValue];
    }
    if (onChange) {
      onChange(checkedValues);
    }
  };

  const classNames = ["inula-checkbox-group", className]
    .filter(Boolean)
    .join(" ");

  const styles = {
    ...style,
  };

  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );

  return (
    <div className={classNames} style={styles} {...rest}>
      <for each={normalizedOptions}>
        {(option, index) => {
          return (
            <Checkbox
              key={`${option.label}-${index}`}
              disabled={disabled || option.disabled}
              checked={value && value.includes(option.value)}
              defaultChecked={defaultValue.includes(option.value)}
              onChange={() => handleBoxChange(option.value)}
              className={option.className || ""}
              style={option.style || {}}
            >
              {option.label}
            </Checkbox>
          );
        }}
      </for>
    </div>
  );
};

export { Checkbox, CheckboxGroup };
