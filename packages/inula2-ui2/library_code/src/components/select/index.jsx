import "./index.css";
import Icon from "../icon";

const Select = ({
    options = [],
    value,
    defaultValue = "",
    disabled = false,
    placeholder = "",
    onChange,
    allowClear = false,
    className = "",
    style = {},
    multiple = false,
    variant = "outlined", // outlined | filled | borderless | underlined
    size = "default", // small | default | large | medium(等同 default)
    ...rest
}) => {
    let isOpen = false;
    let selectedValue = value !== undefined ? value : defaultValue;

    // 判断是否为分组数据
    const isGrouped = options.length > 0 && options[0].options;

    // 扁平化选项数据，用于查找选中项
    const flatOptions = isGrouped
        ? options.reduce((acc, group) => acc.concat(group.options), [])
        : options;

    function handleSelect(val) {
        console.log('val:', val);
        if (disabled) return;
        if (multiple) {
            let newValue = Array.isArray(selectedValue) ? [...selectedValue] : [];
            const idx = newValue.indexOf(val);
            if (idx > -1) {
                newValue.splice(idx, 1);
            } else {
                newValue.push(val);
            }
            if (value === undefined) {
                selectedValue = newValue;
            }
            onChange && onChange(newValue);
        } else {
            if (value === undefined) {
                selectedValue = val;
            }
            onChange && onChange(val);
            isOpen = false;
        }
        if (!multiple) isOpen = false;
        console.log('【渲染时】selectedOptions:', selectedOptions.map(opt => opt.value), typeof selectedValue, selectedValue);
    }

    function handleToggle() {
        if (disabled) return;
        isOpen = !isOpen;
    }

    function handleBlur(e) {
        isOpen = false;
    }

    function handleClear(e) {
        e.stopPropagation();
        if (disabled) return;
        if (multiple) {
            if (value === undefined) {
                selectedValue = [];
            }
            onChange && onChange([]);
        } else {
            if (value === undefined) {
                selectedValue = '';
            }
            onChange && onChange('');
        }
        isOpen = false;
    }

    function handleRemoveTag(e, val) {
        e.stopPropagation();
        if (disabled) return;
        let newValue = Array.isArray(selectedValue) ? selectedValue.filter(v => v !== val) : [];
        if (value === undefined) {
            selectedValue = newValue;
        }
        onChange && onChange(newValue);
    }

    const normalizedSize = size === 'medium' ? 'default' : size;
    const classNames = [
        "inula-select",
        `inula-select-${variant}`,
        `inula-select-${normalizedSize}`,
        disabled ? "inula-select-disabled" : "",
        multiple ? "inula-select-multiple" : "",
        className,
    ].filter(Boolean).join(" ");

    // 使用扁平化的选项数据查找选中项
    const selectedOptions = multiple
        ? flatOptions.filter(opt => Array.from(selectedValue) && selectedValue.includes(opt.value))
        : flatOptions.find(opt => opt.value === selectedValue);

    // 渲染选项列表
    const renderOptions = () => {
        if (isGrouped) {
            return options.length > 0 ? options.map(group => (
                <div key={group.label}>
                    <div className="inula-select-group-title">{group.label}</div>
                    {group.options.map(opt => (
                        <li
                            key={opt.value}
                            className={
                                "inula-select-option" +
                                (multiple && Array.isArray(selectedValue) && selectedValue.includes(opt.value)
                                    ? " inula-select-option-selected"
                                    : !multiple && opt.value === selectedValue
                                        ? " inula-select-option-selected"
                                        : "") +
                                (opt.disabled ? " inula-select-option-disabled" : "")
                            }
                            onClick={() => !opt.disabled && handleSelect(opt.value)}
                        >
                            {opt.label}
                            {multiple && Array.isArray(selectedValue) && selectedValue.includes(opt.value) && (
                                <Icon value="check" theme="filled" size={12} style={{ marginLeft: 4 }} />
                            )}
                        </li>
                    ))}
                </div>
            )) : (
                <li className="inula-select-option inula-select-no-data">
                    暂无数据~
                </li>
            );
        } else {
            return options.length > 0 ? options.map(opt => (
                <li
                    key={opt.value}
                    className={
                        "inula-select-option" +
                        (multiple && Array.isArray(selectedValue) && selectedValue.includes(opt.value)
                            ? " inula-select-option-selected"
                            : !multiple && opt.value === selectedValue
                                ? " inula-select-option-selected"
                                : "") +
                        (opt.disabled ? " inula-select-option-disabled" : "")
                    }
                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                >
                    {opt.label}
                    {multiple && Array.isArray(selectedValue) && selectedValue.includes(opt.value) && (
                        <Icon value="check" theme="filled" size={12} style={{ marginLeft: 4 }} />
                    )}
                </li>
            )) : (
                <li className="inula-select-option inula-select-no-data">
                    暂无数据~
                </li>
            );
        }
    };

    return (

        <div className={classNames} style={style} tabIndex={0} onBlur={handleBlur} {...rest}>
            <div className="inula-select-selection" onClick={handleToggle}>
                {multiple ? (
                    <span className="inula-select-multiple-value">
                        {Array.isArray(selectedOptions) && selectedOptions.length > 0 ? (
                            <for each={selectedOptions}>
                                {(opt) => (
                                    <span className="inula-select-tag" key={opt.value}>
                                        {opt.label}<Icon value="times-circle" theme="filled" size={10} style={{ marginLeft: 4 }} onClick={e => handleRemoveTag(e, opt.value)} />
                                    </span>
                                )}
                            </for>
                        ) : (
                            <span className="inula-select-placeholder">{placeholder}</span>
                        )}
                    </span>
                ) : (
                    <span className={selectedOptions ? "" : "inula-select-placeholder"}>
                        {selectedOptions ? selectedOptions.label : placeholder}
                    </span>
                )}
                <div className="inula-select-arrow-container">
                    {allowClear && ((multiple && selectedOptions && selectedOptions.length > 0) || (!multiple && selectedOptions)) && !disabled && (
                        <span className="inula-select-clear" onClick={handleClear}>
                            <Icon value="times-circle" theme="filled" size={12} />
                        </span>
                    )}
                    <span className="inula-select-arrow">
                        <Icon value="chevron-down" theme="filled" size={10} style={{
                            transition: 'transform 0.2s',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }} />
                    </span>
                </div>
            </div>
            {isOpen && (
                <ul className="inula-select-dropdown">
                    {renderOptions()}
                </ul>
            )}
        </div>
    );
};

export default Select;
