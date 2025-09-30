import Select from "../index.jsx";

function Demo2() {
  let value = 'b';

  const options = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c' },
    { label: '选项D', value: 'd' },
  ];

  function handleChange(val) {
    value = val;
  }

  return <Select options={options} value={value} onChange={handleChange} placeholder="Select an option" />
}

export default Demo2; 