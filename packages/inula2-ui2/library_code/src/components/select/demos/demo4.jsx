import Select from "../index.jsx";

function Demo4() {
  let value = '';

  const options = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c' },
    { label: '选项D', value: 'd' },
  ];

  function handleChange(val) {
    value = val;
  }

  return <Select options={options} defaultValue="d" onChange={handleChange} placeholder="Select an option" />
}

export default Demo4; 