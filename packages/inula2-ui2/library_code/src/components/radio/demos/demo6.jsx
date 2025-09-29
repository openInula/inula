import Radio from '../index.jsx';

function Demo6() {
  let selected = 'a';
  function handleRadioChange(val) {
    selected = val;
  }
  const options = [
    { label: 'A', value: 'a', checked: selected === 'a' },
    { label: 'B(禁用)', value: 'b', checked: selected === 'b', disabled: true },
    { label: 'C(只读)', value: 'c', checked: selected === 'c', readOnly: true },
  ];
  return (
    <Radio name="group6" options={options} onChange={handleRadioChange} />
  );
}
export default Demo6; 