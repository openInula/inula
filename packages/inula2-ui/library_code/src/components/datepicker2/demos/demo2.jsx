import { DatePicker } from "../index.jsx";
import Tag from "../../tag/index.jsx";
import Icon from "../../icon/index.jsx";

function DatePickerDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "80px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Tag color="geekblue">需要确认的日期选择器</Tag>
        <DatePicker placeholder="请选择日期" needConfirm />
        <DatePicker picker="week" placeholder="请选择周" needConfirm />
        <DatePicker picker="month" placeholder="请选择月份" needConfirm />
        <DatePicker picker="quarter" placeholder="请选择季度" needConfirm />
        <DatePicker picker="year" placeholder="请选择年份" needConfirm />
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Tag color="geekblue">showNow控制今天按钮显示</Tag>
        <DatePicker placeholder="请选择日期" needConfirm showNow={false} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Tag color="geekblue">自定义prefix,suffixIcon图标</Tag>
        <DatePicker
          prefix={<Icon value="check" theme="filled" size={12} />}
          placeholder="prefix"
        />
        <DatePicker
          suffixIcon={<Icon value="check" theme="filled" size={12} />}
          placeholder="suffixIcon"
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Tag color="geekblue">自定义日历title切换图标</Tag>
        <DatePicker
          prevIcon={<Icon value="check" theme="filled" size={12} />}
          style={{ width: 200 }}
          placeholder="prevIcon"
          placement="topLeft"
        />
        <DatePicker
          nextIcon={<Icon value="check" theme="filled" size={12} />}
          style={{ width: 200 }}
          placeholder="nextIcon"
          placement="topLeft"
        />
        <DatePicker
          superPrevIcon={<Icon value="check" theme="filled" size={12} />}
          style={{ width: 200 }}
          placeholder="superPrevIcon"
          placement="topLeft"
        />
        <DatePicker
          superNextIcon={<Icon value="check" theme="filled" size={12} />}
          style={{ width: 200 }}
          placeholder="superNextIcon"
          placement="topLeft"
        />
      </div>
    </div>
  );
}

export default DatePickerDemo;
