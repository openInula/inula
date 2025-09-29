import { Checkbox } from "../index.jsx";
import { Tag } from "../../tag/index.jsx";

const CheckboxDemo = () => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">基本状态</Tag >
        <Checkbox>普通Checkbox</Checkbox>
        <Checkbox checked={true}>选中</Checkbox>
        <Checkbox defaultChecked>默认选中</Checkbox>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">indeterminate复选框样式</Tag >
        <Checkbox indeterminate>indeterminate按钮</Checkbox>
        <Checkbox indeterminate checked>
          indeterminate选中
        </Checkbox>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">禁用状态</Tag >
        <Checkbox disabled>禁用未选中</Checkbox>
        <Checkbox disabled checked>
          禁用选中
        </Checkbox>
        <Checkbox disabled defaultChecked>
          禁用默认选中
        </Checkbox>
        <Checkbox indeterminate disabled>
          indeterminate按钮禁用
        </Checkbox>
      </div>
    </div>
  );
};

export default CheckboxDemo;
