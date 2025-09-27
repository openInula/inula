import { DatePicker } from "../index.jsx";
import Tag from "../../tag/index.jsx";

function DatePickerDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6,1fr)",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <Tag color="geekblue">日期默认值</Tag>
        <DatePicker defaultValue="2024-03-10" placeholder="日期-默认值" />
        <DatePicker defaultValue="2024-37周" placeholder="周数-默认值" />
        <DatePicker
          defaultValue="2024-10"
          picker="month"
          placeholder="月-默认值"
        />
        <DatePicker
          defaultValue="2024-Q1"
          picker="quarter"
          placeholder="季度-默认值"
        />
        <DatePicker defaultValue="2024" picker="year" placeholder="年-默认值" />
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Tag color="geekblue">calendar浮窗面板默认值</Tag>
        <DatePicker defaultPickerValue="2024-10-09" placeholder="默认面板" />
        <DatePicker
          defaultPickerValue="2024-37周"
          placeholder="默认面板"
          picker="week"
        />
        <DatePicker
          defaultPickerValue="2024-10"
          placeholder="默认面板"
          picker="month"
        />
        <DatePicker
          defaultPickerValue="2024-Q3"
          placeholder="默认面板"
          picker="quarter"
        />
        <DatePicker
          defaultPickerValue="2024-10-09"
          placeholder="默认面板"
          picker="year"
        />
      </div>
    </div>
  );
}

export default DatePickerDemo;
