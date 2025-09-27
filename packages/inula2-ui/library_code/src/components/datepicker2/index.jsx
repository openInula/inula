import { didMount, watch, createContext, useContext } from "@openinula/next";
import "./index.css";
import Icon from "../icon";
import Button from "../button";
import {
  calculateDaysInYearMonth,
  calculateFirstWeekDayInYearMonth,
  calculateCurWeek,
  calculateRenderDateItems,
  calculateRenderYQMItems,
  calculateRenderWeekItems,
  calculateNextRange,
  getTodayDate,
  formatDate,
  formatDateToObject,
  formatDateToYearMonth,
  compareDate,
  isEqualedDate,
  isInRangeDate,
} from "./utils";

const ValueContext = createContext({
  confirmValue: "",
  selectValue: "",
});

const RangeValueContext = createContext({
  startConfirmValue: "",
  endConfirmValue: "",
  startSelectValue: "",
  endSelectValue: "",
  rangeHoverValue: "",
  rangeDefaultValue: "",
  focusState: "00",
});

const DatePicker = ({
  allowClear, //自定义清除按钮
  autoFocus = false, //自动获取焦点
  cellRender, //自定义单元格内容
  components, //自定义面板
  defaultOpen, //是否默认展开控制弹层
  disabled = false, //禁用
  disabledDate, //不可选择的日期
  format, //设置日期格式
  order = true, //多选、范围事是否自动排序
  preserveInvalidOnBlur = false, //失去焦点是否要清空输入框内无效内容
  getPopupContainer, //自定义浮层的容器，默认为body上新建div
  inputReadOnly = false, //设置输入框只读
  minDate, //最小日期
  maxDate, //最大日期
  needConfirm, //是否需要确认按钮
  open, //控制弹层是否展开
  // panekRender, //自定义渲染面板
  picker = "date", //设置选择器类型, date | week | month | quarter | year
  placeholder, //输入框提示文字
  placement, //选择器弹出的位置bottomLeft | bottomRight | toLeft | toRight
  prefix, //自定义前缀
  prevIcon, //自定义上一个图标-月
  nextIcon, //自定义下一个图标-月
  suffixIcon, //自定义后缀
  superNextIcon, //自定义下一个图标-年
  superPrevIcon, //自定义上一个图标-年
  size = "middle", //input大小，large高40px,small24px,default32px
  variant = "outlined", // outlined | borderless | filled | underlined
  status, //设置校验状态
  onOpenChange,
  onPanleChange,
  className, //自定义类名
  style,
}) => {
  let selectValue = "";
  let confirmValue = "";
  let isOpen = initialOpen;
  let isClearIcon = false;
  let curYear;
  let curMonth;
  let hoverValue;
  let inputRef;

  watch(() => {
    if (defaultPickerValue || defaultValue) {
      const parsedYearMonth = formatDateToYearMonth(
        defaultPickerValue || defaultValue,
        "",
        picker
      );
      curYear = parsedYearMonth?.year || new Date().getFullYear();
      curMonth = parsedYearMonth?.month || new Date().getMonth() + 1;
      if (defaultValue) confirmValue = defaultValue;
    } else {
      curYear = new Date().getFullYear();
      curMonth = new Date().getMonth() + 1;
    }
  });

  watch(() => {
    if (open !== undefined) {
      isOpen = open;
    }
  });

  const initialPlaceholder = () => {
    if (placeholder) return placeholder;
    switch (picker) {
      case "date":
        return "请选择日期";
      case "week":
        return "请选择周";
      case "month":
        return "请选择月份";
      case "quarter":
        return "请选择季度";
      case "year":
        return "请选择年份";
      default:
        return "请选择日期";
    }
  };

  //选择某个日期
  const handleSelect = (type, item) => {
    console.log(type, item);
    switch (type) {
      case "date": {
        selectValue = `${item.year}-${item.month}-${item.day}`;
        if (item.year !== curYear) curYear = item.year;
        if (item.month !== curMonth) curMonth = item.month;
        break;
      }
      case "week": {
        selectValue = `${curYear}-${item.week}周`;
        if (item.year !== curYear) curYear = item.year;
        if (item.month !== curMonth) curMonth = item.month;
        break;
      }
      case "month": {
        selectValue = `${curYear}-${item.month}`;
        break;
      }
      case "quarter": {
        selectValue = `${curYear}-Q${item.quarter}`;
        break;
      }
      case "year": {
        selectValue = `${item.year}`;
        if (item.year !== curYear) curYear = item.year;
        break;
      }
      default: {
        break;
      }
    }
    if (!needConfirm) {
      hoverValue = "";
      confirmValue = formatDate(selectValue, defaultValue, format, picker);
      if (onChange) onChange(selectValue);
      if (!defaultPickerValue) {
        if (item.year !== curYear || (item.month && item.month !== curMonth)) {
          if (onPanleChange) onPanleChange({ curYear, curMonth }, picker);
        }
        if (item.year && item.year !== curYear) curYear = item.year;
        if (item.month && type !== "month" && item.month !== curMonth)
          curMonth = item.month;
      } else {
        if (onPanleChange) onPanleChange(selectValue, picker);
        curYear = formatDateToYearMonth(defaultPickerValue, "", picker)?.year;
        curMonth = formatDateToYearMonth(defaultPickerValue, "", picker)?.month;
      }
      handleChangeOpen("close");
    }
  };

  const mouseEnterItem = (type, item) => {
    let tempValue;
    switch (type) {
      case "date": {
        tempValue = `${item.year}-${item.month}-${item.day}`;
        break;
      }
      case "week": {
        tempValue = `${item.year}-${item.week}周`;
        break;
      }
      case "month": {
        tempValue = `${item.year}-${item.month}`;
        break;
      }
      case "quarter": {
        tempValue = `${item.year}-Q${item.quarter}`;
        break;
      }
      case "year": {
        tempValue = `${item.year}`;
        break;
      }
      default: {
        handleChangeOpen("close");
        break;
      }
    }
    hoverValue = formatDate(tempValue, defaultValue, format, picker);
  };

  const mouseLeaveItem = () => {
    hoverValue = "";
  };

  const handleConfirm = () => {
    confirmValue = selectValue;
    isOpen = false;
  };

  //targer: year | month， action: add minus
  const handleChangeTitle = (target, action) => {
    if (target === "year") {
      curYear = action === "add" ? curYear + 1 : curYear - 1;
    } else {
      if (action === "add") {
        if (curMonth === 12) {
          curMonth = 1;
          curYear += 1;
        } else curMonth += 1;
      } else {
        if (curMonth === 1) {
          curMonth = 12;
          curYear -= 1;
        } else curMonth -= 1;
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (isClearIcon) {
      selectValue = "";
      confirmValue = "";
      isClearIcon = false;
    }
  };

  const handleOnBlur = () => {
    if (onBlur) {
      onBlur();
    }
    if (defaultPickerValue) {
      curYear = formatDateToYearMonth(defaultPickerValue, "", picker)?.year;
      curMonth = formatDateToYearMonth(defaultPickerValue, "", picker)?.month;
    }
    handleChangeOpen("close");
  };

  const handleOnFocus = () => {
    if (onFocus) onFocus();
    handleChangeOpen("open");
  };

  const handleChangeOpen = (action) => {
    if (action === "open") {
      if (onOpenChange && isOpen === false) onOpenChange(isOpen);
      else isOpen = true;
    } else if (action === "close") {
      if (selectValue) selectValue = "";
      inputRef.blur();
      if (onOpenChange && isOpen === true) onOpenChange(isOpen);
      else isOpen = false;
    }
  };

  const inputContainerClassNames = [
    "inula-datepicker-input-container",
    size === "large" && "inula-datepicker-input-container-large",
    size === "small" && "inula-datepicker-input-container-small",
    disabled && "inula-datepicker-input-container-disabled",
    variant === "filled" && "inula-datepicker-input-container-filled",
    variant === "outlined" && "inula-datepicker-input-container-outlined",
    variant === "borderless" && "inula-datepicker-input-container-borderless",
    variant === "underline" && "inula-datepicker-input-container-underline",
    status === "error" && "inula-datepicker-input-container-error",
    status === "warning" && "inula-datepicker-input-container-warning",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inputClassNames = [
    "inula-datepicker-input",
    size === "large" && "inula-datepicker-input-large",
    size === "small" && "inula-datepicker-input-small",
    disabled && "inula-datepicker-input-disabled",
    variant === "filled" && "inula-datepicker-input-filled",
    variant === "outlined" && "inula-datepicker-input-outlined",
    variant === "borderless" && "inula-datepicker-input-borderless",
    variant === "underline" && "inula-datepicker-input-underline",
    status === "error" && "inula-datepicker-input-error",
    status === "warning" && "inula-datepicker-input-warning",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="inula-datepicker">
      <div
        className={inputContainerClassNames}
        style={style}
        onClick={() => {
          if (disabled) return;
          handleChangeOpen("open");
          if (inputRef) inputRef.focus();
        }}
      >
        <if cond={prefix}>
          <div className={inputIconClassNames}>{prefix}</div>
        </if>
        <input
          className={inputClassNames}
          disabled={disabled}
          type="text"
          placeholder={initialPlaceholder()}
          value={confirmValue == undefined ? "" : confirmValue}
          onClick={() => (isOpen = true)}
          onBlur={() => (isOpen = false)}
        ></input>
        <div
          className={[
            "inula-datepicker-input-icon",
            disabled && "icon-disabled",
          ]
            .filter(Boolean)
            .join(" ")}
          onMouseEnter={() => confirmValue && (isClearIcon = true)}
          onMouseLeave={() => (isClearIcon = false)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            handleClear(e);
          }}
        >
          <if cond={!isClearIcon}>
            <Icon
              value="calendar"
              theme="filled"
              size={14}
              color="rgba(0,0,0,0.25)"
            />
          </if>
          <else>
            <div className="clear">
              <Icon value="xmark" theme="filled" size={8} color="#fff" />
            </div>
          </else>
        </div>
      </div>
      <ValueContext confirmValue={confirmValue} selectValue={selectValue}>
        <Calendar
          type={picker}
          size={size}
          curYear={curYear}
          curMonth={curMonth}
          isOpen={open !== undefined ? open : isOpen}
          placement={placement}
          defaultValue={defaultValue}
          disabledDate={disabledDate}
          minDate={minDate}
          maxDate={maxDate}
          needConfirm={needConfirm}
          showNow={showNow}
          prevIcon={prevIcon}
          nextIcon={nextIcon}
          superPrevIcon={superPrevIcon}
          superNextIcon={superNextIcon}
          onSelect={handleSelect}
          handleChangeTitle={handleChangeTitle}
          handleConfirm={handleConfirm}
          mouseEnterItem={mouseEnterItem}
          mouseLeaveItem={mouseLeaveItem}
          onOk={onOk}
        />
      </ValueContext>
    </div>
  );
};

const RangePicker = ({
  allowClear, //自定义清除按钮
  showNow = true, //是否展示“今天”按钮
  autoFocus = false, //自动获取焦点
  inputReadOnly = false, //设置输入框只读
  defaultOpen = false, //是否默认展开控制弹层
  disabled = false, //禁用
  disabledDate, //不可选择的日期
  format, //设置日期格式
  onChange, //时间变化回调
  onOk, //点击确定回调
  open, //控制弹层是否展开
  initialOpen = open !== undefined ? open : defaultOpen || false,
  order = true,
  defaultPickerValue, //默认面板日期，每次打开面板会被重置到该日期，格式为YYYY-MM-DD
  defaultValue = ["", ""], //默认值，与format对应，如果开始或结束时间为null或undefined，日期范围将是一个开区间
  minDate, //最小日期
  maxDate, //最大日期
  needConfirm, //是否需要确认按钮 // panekRender, //自定义渲染面板
  picker = "date", //设置选择器类型, date | week | month | quarter | year
  placeholder, //输入框提示文字
  placement = "bottomLeft", //选择器弹出的位置bottomLeft | bottomRight | toLeft | toRight
  prefix, //自定义前缀
  prevIcon, //自定义上一个图标-月
  nextIcon, //自定义下一个图标-月
  suffixIcon, //自定义后缀
  superNextIcon, //自定义下一个图标-年
  superPrevIcon, //自定义上一个图标-年
  size = "middle", //input大小，large高40px,small24px,default32px
  variant = "outlined", // outlined | borderless | filled | underlined
  status, //设置校验状态
  onOpenChange,
  onPanleChange,
  onBlur,
  onFocus,
  className, //自定义类名
  style,
}) => {
  let hoverValue;
  let startConfirmValue = "";
  let endConfirmValue = "";
  let focusState = "00";
  let isOpen = initialOpen;
  let startSelectValue = "";
  let endSelectValue = "";
  let isClearIcon = false;
  let curYear;
  let curMonth;
  let startInputRef;
  let endInputRef;

  didMount(() => {
    if (defaultValue) {
      const parsedYearMonth = formatDateToYearMonth(
        defaultValue[0],
        "",
        picker
      );
      curYear = parsedYearMonth?.year || new Date().getFullYear();
      curMonth = parsedYearMonth?.month || new Date().getMonth() + 1;
      if (defaultValue[0] && defaultValue[1]) {
        startConfirmValue = compareDate(
          defaultValue[0],
          defaultValue[1],
          picker
        )
          ? defaultValue[0]
          : defaultValue[1];
        endConfirmValue = compareDate(defaultValue[0], defaultValue[1], picker)
          ? defaultValue[1]
          : defaultValue[0];
      }
    } else {
      curYear = new Date().getFullYear();
      curMonth = new Date().getMonth() + 1;
    }
  });

  watch(() => {
    if (open !== undefined) {
      isOpen = open;
    }
  });

  const initialPlaceholder = (inputType) => {
    if (placeholder) {
      if (String.prototype.toString.call(inputType).slice(8, -1) !== "Array") {
        return placeholder;
      } else {
        if (inputType === "start") {
          return placeholder[0];
        } else {
          return placeholder[1];
        }
      }
    }

    switch (picker) {
      case "date":
        return "请选择日期";
      case "week":
        return "请选择周";
      case "month":
        return "请选择月份";
      case "quarter":
        return "请选择季度";
      case "year":
        return "请选择年份";
      default:
        return "请选择日期";
    }
  }; //选择某个日期

  const handleSelect = (type, item) => {
    switch (type) {
      case "date": {
        if (focusState === "10")
          startSelectValue = `${item.year}-${item.month}-${item.day}`;
        else if (focusState === "01")
          endSelectValue = `${item.year}-${item.month}-${item.day}`;
        break;
      }
      case "week": {
        if (focusState === "10")
          startSelectValue = `${item.year}-${item.week}周`;
        else if (focusState === "01")
          endSelectValue = `${item.year}-${item.week}周`;
        break;
      }
      case "month": {
        if (focusState === "10")
          startSelectValue = `${item.year}-${item.month}`;
        else if (focusState === "01")
          endSelectValue = `${item.year}-${item.month}`;
        break;
      }
      case "quarter": {
        if (focusState === "10")
          startSelectValue = `${item.year}-Q${item.quarter}`;
        else if (focusState === "01")
          endSelectValue = `${item.year}-Q${item.quarter}`;
        break;
      }
      case "year": {
        if (focusState === "10") startSelectValue = `${item.year}`;
        else if (focusState === "01") endSelectValue = `${item.year}`;
        break;
      }
      default: {
        handleChangeOpen("close");
        break;
      }
    }

    if (!needConfirm) {
      hoverValue = "";

      if (focusState === "10") {
        startConfirmValue = formatDate(
          startSelectValue,
          defaultValue[0],
          format,
          picker
        );
        focusState = "01";
        endInputRef.focus();
      } else if (focusState === "01") {
        endConfirmValue = formatDate(
          endSelectValue,
          defaultValue[1],
          format,
          picker
        );
        focusState = "10";
        startInputRef.focus();
      }

      if (!defaultPickerValue) {
        switch (type) {
          case "date":
          case "week": {
            if (curYear < item.year) {
              curYear = item.year;
              curMonth = 1;
            } else if (curYear > item.year) {
              curYear = item.year;
              curMonth = 12;
            } else {
              if (item.month > curMonth + 1 || item.month < curMonth) {
                curMonth = item.month;
              }
            }
            break;
          }
          case "month":
          case "quarter": {
            if (Math.abs(curYear - item.year) > 1) curYear = item.year;
            break;
          }
          case "year": {
            if (
              Math.floor(curYear / 10) * 10 + 20 === item.year ||
              Math.floor(curYear / 10) * 10 - 1 === item.year
            )
              curYear = item.year;
          }
        }
      } else {
        if (onPanleChange)
          onPanleChange(startSelectValue, endSelectValue, picker);
        curYear = formatDateToYearMonth(defaultPickerValue, "", picker)?.year;
        curMonth = formatDateToYearMonth(defaultPickerValue, "", picker)?.month;
      }

      if (onChange) onChange(startSelectValue, endSelectValue);
      if (startConfirmValue && endConfirmValue) handleChangeOpen("close", item);
    }
  };

  const mouseEnterItem = (type, item) => {
    let tempValue;

    switch (type) {
      case "date": {
        tempValue = `${item.year}-${item.month}-${item.day}`;
        break;
      }
      case "week": {
        tempValue = `${item.year}-${item.week}周`;
        break;
      }
      case "month": {
        tempValue = `${item.year}-${item.month}`;
        break;
      }
      case "quarter": {
        tempValue = `${item.year}-Q${item.quarter}`;
        break;
      }
      case "year": {
        tempValue = `${item.year}`;
        break;
      }

      default: {
        handleChangeOpen("close");
        break;
      }
    }

    hoverValue = formatDate(tempValue, defaultValue[0], format, picker);
  };

  const mouseLeaveItem = () => {
    hoverValue = "";
  };

  const handleConfirm = () => {
    hoverValue = "";
    let item;

    if (focusState === "10") {
      if (!startSelectValue) return;
      startConfirmValue = formatDate(
        startSelectValue,
        defaultValue[0],
        format,
        picker
      );
      item = formatDateToObject(startSelectValue, "", picker);
      focusState = "01";
      endInputRef.focus();
    } else if (focusState === "01") {
      if (!endSelectValue) return;
      endConfirmValue = formatDate(
        endSelectValue,
        defaultValue[1],
        format,
        picker
      );
      item = formatDateToObject(endSelectValue, "", picker);
      focusState = "10";
      startInputRef.focus();
    }

    if (!defaultPickerValue) {
      switch (picker) {
        case "date":
        case "week": {
          if (curYear < item.year) {
            curYear = item.year;
            curMonth = 1;
          } else if (curYear > item.year) {
            curYear = item.year;
            curMonth = 12;
          } else {
            if (item.month > curMonth + 1 || item.month < curMonth) {
              curMonth = item.month;
            }
          }
          break;
        }
        case "month":
        case "quarter": {
          if (Math.abs(curYear - item.year) > 1) curYear = item.year;
          break;
        }
        case "year": {
          if (
            Math.floor(curYear / 10) * 10 + 20 === item.year ||
            Math.floor(curYear / 10) * 10 - 1 === item.year
          )
            curYear = item.year;
        }
      }
    } else {
      if (onPanleChange)
        onPanleChange(startSelectValue, endSelectValue, picker);
      curYear = formatDateToYearMonth(defaultPickerValue, "", picker)?.year;
      curMonth = formatDateToYearMonth(defaultPickerValue, "", picker)?.month;
    }

    if (onChange) onChange(startSelectValue, endSelectValue);

    if (startConfirmValue && endConfirmValue) handleChangeOpen("close");
  };

  //target: year | month， action: add minus
  const handleChangeTitle = (target, action, type = "date") => {
    if (onPanleChange)
      onPanleChange({ curYear, curMonth }, endSelectValue, picker);

    if (target === "year") {
      if (type === "year")
        curYear = action === "add" ? curYear + 10 : curYear - 10;
      else curYear = action === "add" ? curYear + 1 : curYear - 1;
    } else {
      if (action === "add") {
        if (curMonth === 12) {
          curMonth = 1;
          curYear += 1;
        } else curMonth += 1;
      } else {
        if (curMonth === 1) {
          curMonth = 12;
          curYear -= 1;
        } else curMonth -= 1;
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (isClearIcon) {
      startSelectValue = "";
      endSelectValue = "";
      startConfirmValue = "";
      endConfirmValue = "";
      isClearIcon = false;
    }
  };

  const handleOnBlur = (curRef) => {
    if (onBlur) {
      onBlur();
    }

    if (defaultPickerValue) {
      curYear = formatDateToYearMonth(defaultPickerValue, "", picker)?.year;
      curMonth = formatDateToYearMonth(defaultPickerValue, "", picker)?.month;
    }

    if (curRef === "start" && focusState === "10") {
      focusState = "00";
      handleChangeOpen("close");
    } else if (curRef === "end" && focusState === "01") {
      focusState = "00";
      handleChangeOpen("close");
    }
  };

  const handleOnFocus = (curRef) => {
    if (onFocus) onFocus();
    handleChangeOpen("open");

    if (curRef === "start") {
      focusState = "10";
    } else {
      focusState = "01";
    }
  };

  const handleOnClickContainer = () => {
    if (disabled) return;
    handleChangeOpen("open");

    if (focusState === "00") {
      startInputRef.focus();
    }
  };

  const handleChangeOpen = (action) => {
    if (action === "open") {
      if (onOpenChange && isOpen === false) onOpenChange(isOpen);
      else isOpen = true;
    } else if (action === "close") {
      startSelectValue = "";
      endSelectValue = "";
      if (startConfirmValue && endConfirmValue && order) {
        if (!compareDate(startConfirmValue, endConfirmValue, picker)) {
          const temp = startConfirmValue;
          startConfirmValue = endConfirmValue;
          endConfirmValue = temp;
        }
      }
      startInputRef.blur();
      endInputRef.blur();
      if (onOpenChange && isOpen === true) onOpenChange(isOpen);
      else isOpen = false;
    }
  };

  const inputContainerClassNames = [
    "inula-datepicker-input-container",
    "range-container",
    size === "large" && "inula-datepicker-input-container-large",
    size === "small" && "inula-datepicker-input-container-small",
    disabled && "inula-datepicker-input-container-disabled",
    variant === "filled" && "inula-datepicker-input-container-filled",
    variant === "outlined" && "inula-datepicker-input-container-outlined",
    variant === "borderless" && "inula-datepicker-input-container-borderless",
    variant === "underline" && "inula-datepicker-input-container-underline",
    status === "error" && "inula-datepicker-input-container-error",
    status === "warning" && "inula-datepicker-input-container-warning",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const startInputClassNames = [
    "inula-datepicker-input",
    "range-input",
    size === "large" && "inula-datepicker-input-large",
    size === "small" && "inula-datepicker-input-small",
    focusState === "10" && hoverValue && "inula-datepicker-input-hover-value",
  ]
    .filter(Boolean)
    .join(" ");

  const endInputClassNames = [
    "inula-datepicker-input",
    "range-input",
    size === "large" && "inula-datepicker-input-large",
    size === "small" && "inula-datepicker-input-small",
    focusState === "01" && hoverValue && "inula-datepicker-input-hover-value",
  ]
    .filter(Boolean)
    .join(" ");

  const inputIconClassNames = [
    "inula-datepicker-input-icon",
    disabled && "icon-disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="inula-datepicker">
      <div
        className={inputContainerClassNames}
        style={style}
        onClick={() => handleOnClickContainer()}
      >
        <if cond={prefix}>
          <div className={inputIconClassNames}>{prefix}</div>
        </if>
        {/* start */}
        <input
          className={startInputClassNames}
          ref={startInputRef}
          disabled={disabled}
          {...(inputReadOnly && { readOnly: true })}
          autoFocus={autoFocus}
          type="text"
          placeholder={initialPlaceholder("start")}
          value={
            focusState === "10"
              ? hoverValue ||
                (startConfirmValue !== "" ? startConfirmValue : "")
              : startConfirmValue !== ""
              ? startConfirmValue
              : ""
          }
          onClick={(e) => e.stopPropagation()}
          onBlur={() => handleOnBlur("start")}
          onFocus={() => handleOnFocus("start")}
        ></input>

        <Icon
          value="arrow-right-long"
          theme="filled"
          color="rgba(0,0,0,0.25)"
          size={12}
          style={{ margin: "0 4px" }}
        />
        {/* end */}
        <input
          className={endInputClassNames}
          ref={endInputRef}
          disabled={disabled}
          {...(inputReadOnly && { readOnly: true })}
          autoFocus={autoFocus}
          type="text"
          placeholder={initialPlaceholder("end")}
          value={
            focusState === "01"
              ? hoverValue || (endConfirmValue !== "" ? endConfirmValue : "")
              : endConfirmValue !== ""
              ? endConfirmValue
              : ""
          }
          onClick={(e) => e.stopPropagation()}
          onBlur={() => handleOnBlur("end")}
          onFocus={() => handleOnFocus("end")}
        ></input>

        <div
          className={inputIconClassNames}
          onMouseEnter={() => {
            if (startConfirmValue || endConfirmValue) isClearIcon = true;
          }}
          onMouseLeave={() => (isClearIcon = false)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            handleClear(e);
          }}
        >
          <div
            className={inputIconClassNames}
            onMouseEnter={() => {
              if (startConfirmValue || endConfirmValue) isClearIcon = true;
            }}
            onMouseLeave={() => (isClearIcon = false)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleClear()}
          ></div>

          <if cond={!isClearIcon}>
            {suffixIcon ? (
              suffixIcon
            ) : (
              <Icon
                value="calendar"
                theme="filled"
                size={14}
                color="rgba(0,0,0,0.25)"
              />
            )}
          </if>
          <else>
            {allowClear ? (
              allowClear
            ) : (
              <div className="clear">
                <Icon value="xmark" theme="filled" size={8} color="#fff" />
              </div>
            )}
          </else>
        </div>
      </div>
      <RangeValueContext
        startConfirmValue={startConfirmValue}
        endConfirmValue={endConfirmValue}
        startSelectValue={startSelectValue}
        endSelectValue={endSelectValue}
        rangeDefaultValue={defaultValue}
        rangeHoverValue={hoverValue}
        focusState={focusState}
      >
        <Calendar
          type={picker}
          mode="range"
          size={size}
          curYear={curYear}
          curMonth={curMonth}
          isOpen={open !== undefined ? open : isOpen}
          placement={placement}
          defaultValue=""
          disabledDate={disabledDate}
          minDate={minDate}
          maxDate={maxDate}
          needConfirm={needConfirm}
          showNow={showNow}
          prevIcon={prevIcon}
          nextIcon={nextIcon}
          superPrevIcon={superPrevIcon}
          superNextIcon={superNextIcon}
          onSelect={handleSelect}
          handleChangeTitle={handleChangeTitle}
          handleConfirm={handleConfirm}
          mouseEnterItem={mouseEnterItem}
          mouseLeaveItem={mouseLeaveItem}
          onOk={onOk}
        />
      </RangeValueContext>
    </div>
  );
};

const Calendar = ({
  type = "date",
  mode = "date",
  size = "default",
  curYear = new Date().getFullYear(),
  curMonth = new Date().getMonth() + 1,
  curDay = new Date().getDate(),
  isOpen = false,
  placement,
  defaultValue,
  disabledDate,
  minDate,
  maxDate,
  needConfirm,
  handleConfirm,
  prevIcon,
  nextIcon,
  superPrevIcon,
  superNextIcon,
}) => {
  const { selectValue, confirmValue } = useContext(ValueContext);
  const { rangeDefaultValue } = useContext(RangeValueContext);

  const today = `${new Date().getFullYear()}-${
    new Date().getMonth() + 1
  }-${new Date().getDate()}`;

  const calendarClassNames = ["inula-calendar", !isOpen && "closed"]
    .filter(Boolean)
    .join(" ");

  //通过minDate、maxDate、disabledDate判断元素是否为禁用
  const isDisabled = (item) => {
    if (!minDate && !maxDate && !disabledDate) return false;
    const miniDate = formatDateToObject(minDate, "", type);
    const maxiDate = formatDateToObject(maxDate, "", type);
    const disabledDates = disabledDate
      ? disabledDate.map((date) => formatDateToObject(date, "", type))
      : null;
    switch (type) {
      case "date": {
        if (miniDate) {
          if (item.year < miniDate.year) return true;
          else if (item.year === miniDate.year && item.month < miniDate.month)
            return true;
          else if (
            item.year === miniDate.year &&
            item.month === miniDate.month &&
            item.day <= miniDate.day
          )
            return true;
        }

        if (maxiDate) {
          if (item.year > maxiDate.year) return true;
          else if (item.year === maxiDate.year && item.month > maxiDate.month)
            return true;
          else if (
            item.year === maxiDate.year &&
            item.month === maxiDate.month &&
            item.day >= maxiDate.day
          )
            return true;
        }

        if (disabledDates)
          for (const date of disabledDates)
            if (
              date.year === item.year &&
              date.month === item.month &&
              date.day === item.day
            )
              return true;
        break;
      }

      case "week": {
        if (miniDate) {
          if (item.year < miniDate.year) return true;
          else if (item.year === miniDate.year && item.week <= miniDate.week)
            return true;
        }

        if (maxiDate) {
          if (item.year > maxiDate.year) return true;
          else if (item.year === maxiDate.year && item.week >= maxiDate.week)
            return true;
        }

        if (disabledDates)
          for (const date of disabledDates)
            if (date.year === item.year && date.week === item.week) return true;
        break;
      }

      case "month": {
        if (miniDate) {
          if (item.year < miniDate.year) return true;
          else if (item.year === miniDate.year && item.month <= miniDate.month)
            return true;
        }

        if (maxiDate) {
          if (item.year > maxiDate.year) return true;
          else if (item.year === maxiDate.year && item.month >= maxiDate.month)
            return true;
        }

        if (disabledDates)
          for (const date of disabledDates)
            if (date.year === item.year && date.month === item.month)
              return true;
        break;
      }

      case "quarter": {
        if (miniDate) {
          if (item.year < miniDate.year) return true;
          else if (
            item.year === miniDate.year &&
            item.quarter <= miniDate.quarter
          )
            return true;
        }

        if (maxiDate) {
          if (item.year > maxiDate.year) return true;
          else if (
            item.year === maxiDate.year &&
            item.quarter >= maxiDate.quarter
          )
            return true;
        }

        if (disabledDates)
          for (const date of disabledDates)
            if (date.year === item.year && date.quarter === item.quarter)
              return true;
        break;
      }

      case "year": {
        if (miniDate && item.year <= miniDate.year) return true;
        if (maxiDate && item.year >= maxiDate.year) return true;

        if (disabledDates)
          for (const date of disabledDates)
            if (date.year === item.year) return true;
        break;
      }
    }

    return false;
  };

  const getGridColumns = () => {
    switch (type) {
      case "date":
        return 7;
      case "week":
        return 1;
      case "month":
        return 3;
      case "quarter":
        return 4;
      case "year":
        return 3;
      default:
        return 7;
    }
  };

  //日历头部
  const CalendarHeader = () => {
    return (
      <div className="inula-calendar-header">
        <div className="inula-calendar-header-left">
          {superPrevIcon ? (
            superPrevIcon
          ) : (
            <Icon
              value="angles-left"
              theme="filled"
              size={14}
              color="rgba(0,0,0,0.45)"
              onClick={() => handleChangeTitle("year", "minus")}
            />
          )}
          {type === "date" ||
            (type === "week" &&
              (prevIcon ? (
                prevIcon
              ) : (
                <Icon
                  value="chevron-left"
                  theme="filled"
                  size={14}
                  color="rgba(0,0,0,0.45)"
                  onClick={() => handleChangeTitle("month", "minus")}
                />
              )))}
        </div>

        <div
          className={[
            "inula-calendar-header-title",
            mode === "range" && "range-title",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <text>
            <if cond={type === "date" || type === "week"}>
              {`${curYear}年   ${curMonth}月`}
            </if>
            <else-if cond={type === "month" || type === "quarter"}>
              {`${curYear}年`}
            </else-if>
            <else>{`${Math.floor(curYear / 10) * 10}年-${
              Math.floor(curYear / 10) * 10 + 9
            }年`}</else>
          </text>

          <if cond={mode === "range"}>
            <if cond={type === "date" || type === "week"}>
              {`${calculateNextRange(curYear, curMonth, type).nextYear}年   ${
                calculateNextRange(curYear, curMonth, type).nextMonth
              }月`}
            </if>
            <else-if cond={type === "month" || type === "quarter"}>
              {`${calculateNextRange(curYear, curMonth, type).nextYear}年`}
            </else-if>
            <else>{`${
              Math.floor(
                calculateNextRange(curYear, curMonth, type).nextYear / 10
              ) * 10
            }年-${
              Math.floor(
                calculateNextRange(curYear, curMonth, type).nextYear / 10
              ) *
                10 +
              9
            }年`}</else>
          </if>
        </div>

        <div className="inula-calendar-header-right">
          {type === "date" ||
            (type === "week" &&
              (nextIcon ? (
                nextIcon
              ) : (
                <Icon
                  value="chevron-right"
                  theme="filled"
                  size={14}
                  color="rgba(0,0,0,0.45)"
                  onClick={() => handleChangeTitle("month", "add")}
                />
              )))}
          {superNextIcon ? (
            superNextIcon
          ) : (
            <Icon
              value="angles-right"
              theme="filled"
              size={14}
              color="rgba(0,0,0,0.45)"
              onClick={() => handleChangeTitle("year", "add")}
            />
          )}
        </div>
      </div>
    );
  };

  //日历内容
  const CalendarContent = () => {
    return (
      <div
        className="inula-calendar-content"
        style={{ "--grid-columns": getGridColumns() }}
      >
        <if cond={type === "date"}>
          <for each={["一", "二", "三", "四", "五", "六", "日"]}>
            {(item) => (
              <div key={item} className="inula-calendar-content-weekday">
                {item}
              </div>
            )}
          </for>
          <for each={calculateRenderDateItems(curYear, curMonth)}>
            {(item, index) => (
              <CalendarContentItem
                key={`${item}-${index}`}
                type={type}
                item={item}
                defaultValue={defaultValue}
                disabled={isDisabled(item)}
                onClick={handleClick}
                onMouseEnter={handleMounseEnter}
                onMouseLeave={handleMounseLeave}
              />
            )}
          </for>
        </if>
        <else-if cond={type === "week"}>
          <div className="inula-calendar-content-week-row-header">
            <for each={[" ", "一", "二", "三", "四", "五", "六", "日"]}>
              {(item) => (
                <div key={item} className="inula-calendar-content-weekday">
                  {item}
                </div>
              )}
            </for>
          </div>
          <for each={calculateRenderWeekItems(curYear, curMonth)}>
            {(row, index) => (
              <div
                key={`${row}-${index}`}
                className={[
                  "inula-calendar-content-week-row",
                  selectValue !== ""
                    ? selectValue === `${row[0].year}-${row[0].week}`
                    : confirmValue
                    ? isEqualedDate(confirmValue, row[0], "week")
                    : isEqualedDate(defaultValue, row[0], "week") &&
                      "inula-calendar-content-week-row-selected",
                  isDisabled(row[0]) &&
                    "inula-calendar-content-week-row-disabled",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={(e) => handleClick(e, "week", row[0])}
                onMouseEnter={() => handleMounseEnter("week", row[0])}
                onMouseLeave={() => handleMounseLeave(row[0])}
              >
                <for each={row}>
                  {(item, index) => (
                    <CalendarContentItem
                      key={`${item}-${index}`}
                      type={type}
                      item={item}
                      disabled={isDisabled(item)}
                      onClick={handleClick}
                      className="week-container"
                    />
                  )}
                </for>
              </div>
            )}
          </for>
        </else-if>
        <else-if cond={type === "month"}>
          <for each={calculateRenderYQMItems("month", curYear)}>
            {(item, index) => (
              <CalendarContentItem
                key={`${item}-${index}`}
                type={type}
                item={item}
                defaultValue={defaultValue}
                disabled={isDisabled(item)}
                onClick={handleClick}
                onMouseEnter={handleMounseEnter}
                onMouseLeave={handleMounseLeave}
                className="month-container"
              />
            )}
          </for>
        </else-if>
        <else-if cond={type === "quarter"}>
          <for each={calculateRenderYQMItems("quarter", curYear)}>
            {(item, index) => (
              <CalendarContentItem
                key={`${item}-${index}`}
                type={type}
                item={item}
                defaultValue={defaultValue}
                disabled={isDisabled(item)}
                onClick={handleClick}
                onMouseEnter={handleMounseEnter}
                onMouseLeave={handleMounseLeave}
                className="quarter-container"
              />
            )}
          </for>
        </else-if>
        <else>
          <for each={calculateRenderYQMItems("year", curYear)}>
            {(item, index) => (
              <CalendarContentItem
                key={`${item}-${index}`}
                type={type}
                item={item}
                defaultValue={defaultValue}
                disabled={isDisabled(item)}
                onClick={handleClick}
                onMouseEnter={handleMounseEnter}
                onMouseLeave={handleMounseLeave}
                className="year-container"
              />
            )}
          </for>
        </else>
      </div>
    );
  };

  const CalendarRangeContent = () => {
    return (
      <div className="inula-calendar-range-content">
        <div
          className="inula-calendar-content inula-range-calendar-content"
          style={{ "--grid-columns": getGridColumns() }}
        >
          <if cond={type === "date"}>
            <for each={["一", "二", "三", "四", "五", "六", "日"]}>
              {(item) => (
                <div key={item} className="inula-calendar-content-weekday">
                  {item}
                </div>
              )}
            </for>
            <for each={calculateRenderDateItems(curYear, curMonth)}>
              {(item, index) => (
                <CalendarContentItem
                  key={`${item}-${index}`}
                  type={type}
                  mode={mode}
                  item={item}
                  defaultValue={rangeDefaultValue[0]}
                  disabled={isDisabled(item)}
                  onClick={handleClick}
                  onMouseEnter={handleMounseEnter}
                  onMouseLeave={handleMounseLeave}
                />
              )}
            </for>
          </if>
          <else-if cond={type === "week"}>
            <div className="inula-calendar-content-week-row-header">
              <for each={[" ", "一", "二", "三", "四", "五", "六", "日"]}>
                {(item) => (
                  <div key={item} className="inula-calendar-content-weekday">
                    {item}
                  </div>
                )}
              </for>
            </div>
            <for each={calculateRenderWeekItems(curYear, curMonth)}>
              {(row, index) => (
                <div
                  className={[
                    "inula-calendar-content-week-row",
                    selectValue === `${row[0].year}-${row[0].week}周` &&
                      "inula-calendar-content-week-row-selected",
                    !selectValue &&
                      rangeDefaultValue[0] ===
                        formatDate(
                          `${row[0].year}-${row[0].week}周`,
                          rangeDefaultValue[0],
                          "",
                          "week"
                        ) &&
                      "inula-calendar-content-week-row-selected",
                    isDisabled(row[0]) &&
                      "inula-calendar-content-week-row-disabled",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={index}
                  onClick={() =>
                    !isDisabled(row[0]) && onSelect && onSelect("week", row[0])
                  }
                  onMouseEnter={() =>
                    !isDisabled(row[0]) && mouseEnterItem("week", row[0])
                  }
                  onMouseLeave={() => !isDisabled(row[0]) && mouseLeaveItem()}
                >
                  <for each={row}>
                    {(item, index) => (
                      <CalendarContentItem
                        key={`${item}-${index}`}
                        type={type}
                        mode={mode}
                        item={item}
                        disabled={isDisabled(item)}
                        onClick={handleClick}
                        className="week-container"
                      />
                    )}
                  </for>
                </div>
              )}
            </for>
          </else-if>
          <else-if cond={type === "month"}>
            <for each={calculateRenderYQMItems("month", curYear)}>
              {(item, index) => (
                <CalendarContentItem
                  key={`${item}-${index}`}
                  type={type}
                  mode={mode}
                  item={item}
                  defaultValue={rangeDefaultValue[0]}
                  disabled={isDisabled(item)}
                  onClick={handleClick}
                  onMouseEnter={handleMounseEnter}
                  onMouseLeave={handleMounseLeave}
                  className="month-container"
                />
              )}
            </for>
          </else-if>
          <else-if cond={type === "quarter"}>
            <for each={calculateRenderYQMItems("quarter", curYear)}>
              {(item, index) => (
                <CalendarContentItem
                  key={`${item}-${index}`}
                  type={type}
                  mode={mode}
                  item={item}
                  defaultValue={rangeDefaultValue[0]}
                  disabled={isDisabled(item)}
                  onClick={handleClick}
                  onMouseEnter={handleMounseEnter}
                  onMouseLeave={handleMounseLeave}
                  className="quarter-container"
                />
              )}
            </for>
          </else-if>
          <else>
            <for each={calculateRenderYQMItems("year", curYear)}>
              {(item, index) => (
                <CalendarContentItem
                  key={`${item}-${index}`}
                  type={type}
                  mode={mode}
                  item={item}
                  defaultValue={rangeDefaultValue[0]}
                  disabled={isDisabled(item)}
                  onClick={handleClick}
                  onMouseEnter={handleMounseEnter}
                  onMouseLeave={handleMounseLeave}
                  className="year-container"
                />
              )}
            </for>
          </else>
        </div>
        <div
          className="inula-calendar-content inula-range-calendar-content"
          style={{ "--grid-columns": getGridColumns() }}
        >
          <if cond={type === "date"}>
            <for each={["一", "二", "三", "四", "五", "六", "日"]}>
              {(item) => (
                <div key={item} className="inula-calendar-content-weekday">
                  {item}
                </div>
              )}
            </for>
            <for
              each={calculateRenderDateItems(
                calculateNextRange(curYear, curMonth, type).nextYear,
                calculateNextRange(curYear, curMonth, type).nextMonth
              )}
            >
              {(item, index) => (
                <CalendarContentItem
                  key={`${item}-${index}`}
                  type={type}
                  mode={mode}
                  item={item}
                  defaultValue={rangeDefaultValue[1]}
                  disabled={isDisabled(item)}
                  onClick={handleClick}
                  onMouseEnter={handleMounseEnter}
                  onMouseLeave={handleMounseLeave}
                />
              )}
            </for>
          </if>
          <else-if cond={type === "week"}>
            <div className="inula-calendar-content-week-row-header">
              <for each={[" ", "一", "二", "三", "四", "五", "六", "日"]}>
                {(item) => (
                  <div key={item} className="inula-calendar-content-weekday">
                    {item}
                  </div>
                )}
              </for>
            </div>
            <for
              each={calculateRenderWeekItems(
                calculateNextRange(curYear, curMonth, type).nextYear,
                calculateNextRange(curYear, curMonth, type).nextMonth
              )}
            >
              {(row, index) => (
                <div
                  className={[
                    "inula-calendar-content-week-row",
                    selectValue === `${row[0].year}-${row[0].week}周` &&
                      "inula-calendar-content-week-row-selected",
                    !selectValue &&
                      rangeDefaultValue[1] ===
                        formatDate(
                          `${row[0].year}-${row[0].week}周`,
                          rangeDefaultValue[1],
                          "",
                          "week"
                        ) &&
                      "inula-calendar-content-week-row-selected",
                    isDisabled(row[0]) &&
                      "inula-calendar-content-week-row-disabled",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={index}
                  onClick={() =>
                    !isDisabled(row[0]) && onSelect && onSelect("week", row[0])
                  }
                  onMouseEnter={() =>
                    !isDisabled(row[0]) && mouseEnterItem("week", row[0])
                  }
                  onMouseLeave={() => !isDisabled(row[0]) && mouseLeaveItem()}
                >
                  <for each={row}>
                    {(item, index) => (
                      <CalendarContentItem
                        key={`${item}-${index}`}
                        type={type}
                        mode={mode}
                        item={item}
                        disabled={isDisabled(item)}
                        onClick={handleClick}
                        className="week-container"
                      />
                    )}
                  </for>
                </div>
              )}
            </for>
          </else-if>
          <else-if cond={type === "month"}>
            <for
              each={calculateRenderYQMItems(
                "month",
                calculateNextRange(curYear, curMonth, type).nextYear
              )}
            >
              {(item, index) => (
                <CalendarContentItem
                  key={`${item}-${index}`}
                  type={type}
                  mode={mode}
                  item={item}
                  defaultValue={rangeDefaultValue[1]}
                  disabled={isDisabled(item)}
                  onClick={handleClick}
                  onMouseEnter={handleMounseEnter}
                  onMouseLeave={handleMounseLeave}
                  className="month-container"
                />
              )}
            </for>
          </else-if>
          <else-if cond={type === "quarter"}>
            <for
              each={calculateRenderYQMItems(
                "quarter",
                calculateNextRange(curYear, curMonth, type).nextYear
              )}
            >
              {(item, index) => (
                <CalendarContentItem
                  key={`${item}-${index}`}
                  type={type}
                  mode={mode}
                  item={item}
                  defaultValue={rangeDefaultValue[1]}
                  disabled={isDisabled(item)}
                  onClick={handleClick}
                  onMouseEnter={handleMounseEnter}
                  onMouseLeave={handleMounseLeave}
                  className="quarter-container"
                />
              )}
            </for>
          </else-if>
          <else>
            <for
              each={calculateRenderYQMItems(
                "year",
                calculateNextRange(curYear, curMonth, type).nextYear
              )}
            >
              {(item, index) => (
                <CalendarContentItem
                  key={`${item}-${index}`}
                  type={type}
                  mode={mode}
                  item={item}
                  defaultValue={rangeDefaultValue[1]}
                  disabled={isDisabled(item)}
                  onClick={handleClick}
                  onMouseEnter={handleMounseEnter}
                  onMouseLeave={handleMounseLeave}
                  className="year-container"
                />
              )}
            </for>
          </else>
        </div>
      </div>
    );
  };

  //日历底部
  const CalendarFooter = () => {
    const justifyContent = () => {
      if (type === "date" && needConfirm) return "space-between";
      if (type === "date" && !needConfirm) return "center";
      if (type !== "date" && needConfirm) return "flex-end";
      return "center";
    };

    return (
      <div
        className="inula-calendar-footer"
        style={{ justifyContent: justifyContent() }}
      >
        <if cond={type === "date"}>
          <div
            className="inula-calendar-footer-today"
            onClick={() => onSelect && onSelect("date", getTodayDate())}
          >
            今天
          </div>
        </if>
        <if cond={needConfirm}>
          <Button
            disabled={selectValue == undefined}
            className="inula-calendar-footer-confirm"
            onClick={handleConfirm}
          >
            确定
          </Button>
        </if>
      </div>
    );
  };

  return (
    <div className={calendarClassNames} onMouseDown={(e) => e.preventDefault()}>
      <CalendarHeader />
      <if cond={mode === "range"}>
        <CalendarRangeContent />
      </if>
      <else>
        <CalendarContent />
      </else>

      <if cond={(type === "date" && showNow) || needConfirm}>
        <CalendarFooter />
      </if>
    </div>
  );
};

const CalendarContentItem = ({
  type = "date", //日历类型
  mode = "date",
  item, //item日期信息{year, quarter, month, week, day, isThisTitleRange}
  defaultValue, //默认日期
  disabled, //是否禁用
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}) => {
  const { confirmValue, selectValue } = useContext(ValueContext);
  const {
    startConfirmValue,
    endConfirmValue,
    startSelectValue,
    endSelectValue,
    focusState,
    rangeHoverValue,
  } = useContext(RangeValueContext);

  const today = `${new Date().getFullYear()}-${
    new Date().getMonth() + 1
  }-${new Date().getDate()}`;

  const isTody =
    (type === "date" || "week") &&
    today === `${item.year}-${item.month}-${item.day}`;

  const defaultString = (item) => {
    switch (type) {
      case "date":
        return `${item.year}-${item.month}-${item.day}`;
      case "week":
        return `${item.year}-${item.week}周`;
      case "month":
        return `${item.year}-${item.month}`;
      case "quarter":
        return `${item.year}-Q${item.quarter}`;
      case "year":
        return `${item.year}`;
    }
  };

  const itemContainerClassNames = [
    "item-container",
    disabled && "item-container-disabled",
    isInRangeDate(
      focusState,
      rangeHoverValue,
      startConfirmValue,
      endConfirmValue,
      startSelectValue,
      endSelectValue,
      item,
      type
    ) && "item-container-in-range",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const itemClassNames = [
    "inula-calendar-content-date-item",
    !item.isThisTitleRange &&
      "inula-calendar-content-date-item-notThisTitleRange",
    isTody && "inula-calendar-content-date-item-today",
    type !== "week" &&
      item.isThisTitleRange &&
      mode === "date" &&
      (selectValue
        ? selectValue === defaultString(item)
        : confirmValue
        ? isEqualedDate(confirmValue, item, type)
        : isEqualedDate(defaultValue, item, type)) &&
      "inula-calendar-content-date-item-selected",
    type !== "week" &&
      item.isThisTitleRange &&
      mode === "range" &&
      !(focusState === "10" && rangeHoverValue) &&
      (startSelectValue
        ? startSelectValue === defaultString(item)
        : startConfirmValue
        ? isEqualedDate(startConfirmValue, item, type)
        : isEqualedDate(defaultValue, item, type)) &&
      "inula-calendar-content-date-item-selected",
    type !== "week" &&
      item.isThisTitleRange &&
      mode === "range" &&
      !(focusState === "01" && rangeHoverValue) &&
      (endSelectValue
        ? endSelectValue === defaultString(item)
        : endConfirmValue
        ? isEqualedDate(endConfirmValue, item, type)
        : isEqualedDate(defaultValue, item, type)) &&
      "inula-calendar-content-date-item-selected",
    type !== "week" &&
      item.isThisTitleRange &&
      mode === "range" &&
      rangeHoverValue &&
      isEqualedDate(rangeHoverValue, item, type) &&
      "inula-calendar-content-date-item-selected",
    disabled && "inula-calendar-content-date-item-disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={itemContainerClassNames}
      onMouseEnter={() => onMouseEnter && onMouseEnter(type, item)}
      onMouseLeave={() => onMouseLeave && onMouseLeave(item)}
    >
      <div className={itemClassNames} onClick={(e) => onClick(e, type, item)}>
        <if cond={type === "date"}>{item.day}</if>
        <else-if cond={type === "week"}>{item.day || item.week}</else-if>
        <else-if cond={type === "month"}>{`${item.month}月`}</else-if>
        <else-if cond={type === "quarter"}>{`Q${item.quarter}`}</else-if>
        <else>{item.year}</else>
      </div>
    </div>
  );
};

export { DatePicker, RangePicker };
