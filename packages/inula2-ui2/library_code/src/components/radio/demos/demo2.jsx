import Radio from '../index.jsx';

function Demo2() {
  let selected = 'a';
  function handleRadioChange(val) {
    selected = val;
  }
  const options = [
    { label: '选项A', value: 'a', checked: selected === 'a' },
    { label: '选项B', value: 'b', checked: selected === 'b' },
    { label: '选项C', value: 'c', checked: selected === 'c' },
  ];
  return (
    <Radio name="group2" options={options} onChange={handleRadioChange} />
  );
}
export default Demo2; 