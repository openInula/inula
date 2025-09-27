import { Checkbox, CheckboxGroup } from "../index.jsx";

const plainOptions = ['Apple', 'Pear', 'Orange'];
const defaultCheckedList = ['Apple', 'Orange'];

const CheckboxDemo = () => {
  let checkedList = defaultCheckedList;
  let checkAll = plainOptions.length === checkedList.length;
  let indeterminate = checkedList.length > 0 && checkedList.length < plainOptions.length;

  const onChange = (list) => {
    checkedList = list;
  };

  const onCheckAllChange = (e) => {
    checkedList = e.target.checked ? plainOptions : [];
  };

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} defaultChecked={checkAll}>
        Check all
      </Checkbox>
      <CheckboxGroup options={plainOptions} defaultValue={checkedList} onChange={onChange} />
    </div>
  );
};

export default CheckboxDemo;