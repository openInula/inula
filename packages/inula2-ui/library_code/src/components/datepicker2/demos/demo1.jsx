import { DatePicker } from "../index.jsx";
import Tag from "../../tag/index.jsx";

function Demo1() {
  const handleChange = (value) => {
    console.log("选择的值:", value);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "500px",
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
        <Tag color="geekblue">五种picker基本日期选择器</Tag>
        <DatePicker placeholder="请选择日期" onChange={handleChange} />
        <DatePicker picker="week" placeholder="请选择周" />
        <DatePicker picker="month" placeholder="请选择月份" />
        <DatePicker picker="quarter" placeholder="请选择季度" />
        <DatePicker picker="year" placeholder="请选择年份" />
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Tag color="geekblue">不同尺寸日期选择器</Tag>
        <DatePicker size="small" placeholder="小尺寸" />
        <DatePicker size="default" placeholder="默认尺寸" />
        <DatePicker size="large" placeholder="大尺寸" />
      </div>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <Tag color="geekblue">禁用状态基本日期选择器</Tag>
        <DatePicker disabled placeholder="禁用状态" />
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Tag color="geekblue">四种varient变体基本选择器</Tag>
        <DatePicker placeholder="outlined" placement="topLeft" />
        <DatePicker variant="filled" placeholder="filled" placement="topLeft" />
        <DatePicker
          variant="borderless"
          placeholder="borderless"
          placement="topLeft"
        />
        <DatePicker
          variant="underline"
          placeholder="underline"
          placement="topLeft"
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Tag color="geekblue">两种status基本日期选择器</Tag>
        <DatePicker status="error" placeholder="error" placement="topLeft" />
        <DatePicker
          status="warning"
          placeholder="warning"
          placement="topLeft"
        />
      </div>
    </div>
  );
}

export default Demo1;
