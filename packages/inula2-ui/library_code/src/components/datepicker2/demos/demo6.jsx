import { RangePicker } from "../index.jsx";
import Tag from "../../tag/index.jsx";

function RangePickerDemo() {
  const handleChange = (value) => {
    console.log("选择的值:", value);
  };

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
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          五种picker-range日期选择器
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <RangePicker placeholder="请选择日期" onChange={handleChange} />
          <RangePicker picker="week" placeholder="请选择周" />
          <RangePicker picker="month" placeholder="请选择月份" />
          <RangePicker picker="quarter" placeholder="请选择季度" />
          <RangePicker picker="year" placeholder="请选择年份" />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          三种size-range日期选择器
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <RangePicker size="small" placeholder="小尺寸" />
          <RangePicker size="default" placeholder="默认尺寸" />
          <RangePicker size="large" placeholder="大尺寸" />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          禁用状态range日期选择器
        </Tag>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <RangePicker disabled placeholder="禁用状态" />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          四种varient-range日期选择器
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <RangePicker placeholder="outlined" />
          <RangePicker variant="filled" placeholder="filled" />
          <RangePicker variant="borderless" placeholder="borderless" />
          <RangePicker variant="underline" placeholder="underline" />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: 10,
        }}
      >
        <Tag color="geekblue" size="large">
          两种status-range日期选择器
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <RangePicker status="error" placeholder="error" placement="topLeft" />
          <RangePicker
            status="warning"
            placeholder="warning"
            placement="topLeft"
          />
        </div>
      </div>
    </div>
  );
}

export default RangePickerDemo;
