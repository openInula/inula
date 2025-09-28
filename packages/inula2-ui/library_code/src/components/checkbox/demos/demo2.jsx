import { CheckboxGroup } from "../index.jsx";

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
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <text style={{width: '12%', textAlign: 'start'}}>定义默认选中和选中:</text>
        <CheckboxGroup
          options={options}
          defaultValue={["Apple"]}
          value={["Apple", "Pear"]}
        />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <text style={{width: '12%', textAlign: 'start'}}>只定义默认选中:</text>
        <CheckboxGroup options={options} defaultValue={["Apple"]} />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <text style={{width: '12%', textAlign: 'start'}}>只定义选中:</text>
        <CheckboxGroup options={options} value={["Apple", "Orange"]} />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <text style={{width: '12%', textAlign: 'start'}}>全禁用:</text>
        <CheckboxGroup options={options} disabled />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <text style={{width: '12%', textAlign: 'start'}}>外部受控:</text>
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
