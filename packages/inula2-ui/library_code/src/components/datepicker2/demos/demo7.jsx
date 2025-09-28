import { RangePicker } from "../index.jsx";
import Icon from "../../icon/index.jsx";
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
        maxWidth: "800px",
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
          需要确认的rang日期选择器
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <RangePicker placeholder="请选择日期" needConfirm showNow={false} />
          <RangePicker picker="week" placeholder="请选择周" needConfirm />
          <RangePicker picker="month" placeholder="请选择月份" needConfirm />
          <RangePicker picker="quarter" placeholder="请选择季度" needConfirm />
          <RangePicker picker="year" placeholder="请选择年份" needConfirm />
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
          自定义前后缀图标和title切换图标的range日期选择器
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <RangePicker
            prefix={<Icon value="check" theme="filled" size={12} />}
            placeholder="prefix"
          />
          <RangePicker
            suffixIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="suffixIcon"
          />
          <RangePicker
            prevIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="prevIcon"
          />
          <RangePicker
            nextIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="nextIcon"
          />
          <RangePicker
            superPrevIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="superPrevIcon"
          />
          <RangePicker
            superNextIcon={<Icon value="check" theme="filled" size={12} />}
            placeholder="superNextIcon"
          />
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
          带defaultValue的range日期选择器
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <RangePicker
            defaultValue={["2024-03-10", "2024-04-20"]}
            placeholder="日期-默认值"
          />
          <RangePicker
            defaultValue={["2024-37周", "2024-40周"]}
            placeholder="周数-默认值"
            picker="week"
          />
          <RangePicker
            defaultValue={["2024-10", "2025-10"]}
            picker="month"
            placeholder="月-默认值"
          />
          <RangePicker
            defaultValue={["2024-Q1", "2025-Q4"]}
            picker="quarter"
            placeholder="季度-默认值"
          />
          <RangePicker
            defaultValue={["2024", "2036"]}
            picker="year"
            placeholder="年-默认值"
          />
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
          带日期范围限制的range日期选择器
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <RangePicker
            minDate={"2025-08-12"}
            maxDate={"2025-10-24"}
            disabledDate={["2025-09-11"]}
            placeholder="日期范围限定"
          />
          <RangePicker
            minDate={"2025-30周"}
            maxDate={"2025-38周"}
            disabledDate={["2025-33周"]}
            placeholder={"周日期范围限定"}
            picker="week"
          />
          <RangePicker
            minDate={"2024-08"}
            maxDate={"2026-01"}
            disabledDate={["2025-08"]}
            placeholder={"月日期范围限定"}
            picker="month"
          />
          <RangePicker
            minDate={"2023-Q3"}
            maxDate={"2027-Q1"}
            disabledDate={["2025-Q1"]}
            placeholder={"季度日期范围限定"}
            picker="quarter"
          />
          <RangePicker
            minDate={"2000"}
            maxDate={"2060"}
            disabledDate={["2028"]}
            placeholder={"年日期范围限定"}
            picker="year"
            placement="topLeft"
          />
        </div>
      </div>
    </div>
  );
}

export default RangePickerDemo;
