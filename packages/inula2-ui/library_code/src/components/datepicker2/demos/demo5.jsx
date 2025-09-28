import { DatePicker } from "../index.jsx";
import Button from "../../button/index.jsx";
import Tag from "../../tag/index.jsx";

function DatePickerDemo() {
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
      <div>
        <Tag color="geekblue" size="large">
          回调函数示例
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          <DatePicker
            placeholder="onChange"
            showNow={false}
            onChange={handleChange}
          />
          <DatePicker
            placeholder="onOpenChange"
            onOpenChange={handleOpenChange}
          />
          <DatePicker
            placeholder="onPanleChange"
            onPanleChange={handlePanleChange}
          />
          <DatePicker
            placeholder="onClickOk"
            needConfirm
            onOk={handleClickOk}
          />
          <DatePicker
            placeholder="onBlur & onFocus"
            style={{ width: 150 }}
            onBlur={onBlur}
            onFocus={onFocus}
          />
        </div>
      </div>
      <div>
        <Tag color="geekblue" size="large">
          open受控示例
        </Tag>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <DatePicker placeholder="defaultOpen" defaultOpen={defaultOpen} />
          <DatePicker
            placeholder="open受控"
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={handleControllOpenChange}
          />
        </div>
      </div>
      <div>
        <Tag color="geekblue" size="large">
          日历弹出位置控制
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
          <DatePicker
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

export default DatePickerDemo;
