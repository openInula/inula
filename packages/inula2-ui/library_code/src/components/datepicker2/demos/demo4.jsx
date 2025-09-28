import { DatePicker } from "../index.jsx";
import Tag from "../../tag/index.jsx";

function DatePickerDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        flexWrap: "wrap",
        padding: "20px",
      }}
    >
      <Tag color="geekblue">范围和选中限制</Tag>
      <DatePicker
        minDate={"2025-08-12"}
        maxDate={"2025-10-24"}
        disabledDate={["2025-09-11"]}
        placeholder="日期范围限定"
        style={{ width: 200 }}
      />
      <DatePicker
        minDate={"2025-30周"}
        maxDate={"2025-38周"}
        disabledDate={["2025-33周"]}
        placeholder={"周日期范围限定"}
        style={{ width: 200 }}
        picker="week"
      />
      <DatePicker
        minDate={"2024-08"}
        maxDate={"2026-01"}
        disabledDate={["2025-08"]}
        placeholder={"月日期范围限定"}
        style={{ width: 200 }}
        picker="month"
      />
      <DatePicker
        minDate={"2023-Q3"}
        maxDate={"2027-Q1"}
        disabledDate={["2025-Q1"]}
        placeholder={"季度日期范围限定"}
        style={{ width: 200 }}
        picker="quarter"
      />
      <DatePicker
        minDate={"2000"}
        maxDate={"2060"}
        disabledDate={["2028"]}
        placeholder={"年日期范围限定"}
        style={{ width: 200 }}
        picker="year"
      />
    </div>
  );
}

export default DatePickerDemo;
