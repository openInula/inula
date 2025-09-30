import { CheckboxGroup } from "../index.jsx";
import { Tag } from "../../tag/index.jsx";

const CheckboxDemo = () => {
  let checkedList = ["Apple", "Pear"];

  const options = [
    { label: "Apple", value: "Apple", disabled: true },
    { label: "Pear", value: "Pear" },
    { label: "Orange", value: "Orange" },
  ];

  const onChange = (list) => {
    checkedList = list;
  };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">定义默认选中和选中:</Tag>
        <CheckboxGroup
          options={options}
          defaultValue={["Apple"]}
          value={["Apple", "Pear"]}
        />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">只定义默认选中</Tag>
        <CheckboxGroup options={options} defaultValue={["Apple"]} />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">只定义选中</Tag>
        <CheckboxGroup options={options} value={["Apple", "Orange"]} />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">全禁用</Tag>
        <CheckboxGroup options={options} disabled />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">外部受控</Tag>
        <CheckboxGroup
          options={options}
          defaultValue={checkedList}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default CheckboxDemo;
