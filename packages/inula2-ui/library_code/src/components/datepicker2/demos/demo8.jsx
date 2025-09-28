import { RangePicker } from "../index.jsx";
import Button from "../../button/index.jsx";
import Tag from "../../tag/index.jsx";

function RangePickerDemo() {
  let open = false;
  let defaultOpen = false;
  let placement = "bottomLeft";
  let picker = "date";
  let size = "default";

  const handleControllOpenChange = (isOpen) => {
    open = !isOpen;
  };

  const handleChange = (value) => {
    console.log("选择的值:", value);
  };

  const handleOpenChange = (isOpen) => {
    console.log(isOpen);
  };

  const handlePanleChange = (value, mode) => {
    console.log(value, mode);
  };

  const handleClickOk = (value) => {
    console.log("ok", value);
  };

  const onBlur = () => {
    console.log(111);
  };

  const onFocus = () => {
    console.log(111);
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
          自定义回调函数的range日期选择器
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
            placeholder="onChange"
            showNow={false}
            onChange={handleChange}
          />
          <RangePicker
            placeholder="onOpenChange"
            onOpenChange={handleOpenChange}
          />
          <RangePicker
            placeholder="onPanleChange"
            onPanleChange={handlePanleChange}
          />
          <RangePicker
            placeholder="onClickOk"
            needConfirm
            onOk={handleClickOk}
          />
          <RangePicker
            placeholder="onBlur & onFocus"
            style={{ width: 150 }}
            onBlur={onBlur}
            onFocus={onFocus}
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
          浮层弹出受控示例
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <RangePicker placeholder="defaultOpen" defaultOpen={defaultOpen} />
          <RangePicker
            placeholder="open受控"
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={handleControllOpenChange}
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
          控制日历弹出位置
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <RangePicker
            placeholder="placement & picker & size"
            style={{ width: 700 }}
            placement={placement}
            picker={picker}
            size={size}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            alignItems: "center",
            gap: 10,
            width: 600,
          }}
        >
          <Button onClick={() => (placement = "bottomLeft")}>bottomLeft</Button>
          <Button onClick={() => (placement = "bottomRight")}>
            bottomRight
          </Button>
          <Button onClick={() => (placement = "topLeft")}>topLeft</Button>
          <Button onClick={() => (placement = "topRight")}>topRight</Button>
          <Button onClick={() => (picker = "date")}>date</Button>
          <Button onClick={() => (picker = "week")}>week</Button>
          <Button onClick={() => (picker = "month")}>month</Button>
          <Button onClick={() => (picker = "quarter")}>quarter</Button>
          <Button onClick={() => (picker = "year")}>year</Button>
          <Button onClick={() => (size = "small")}>small</Button>
          <Button onClick={() => (size = "default")}>default</Button>
          <Button onClick={() => (size = "large")}>large</Button>
        </div>
      </div>
    </div>
  );
}

export default RangePickerDemo;
