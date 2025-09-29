import Select from "../index.jsx";

function Demo8() {

  const options = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c', disabled: true },
    { label: '选项D', value: 'd' },
  ];

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <Select options={options} variant="outlined" placeholder="Select an option" />
      <Select options={options} variant="filled" placeholder="Select an option" />
      <Select options={options} size="small" variant="borderless" placeholder="Select an option" />
      <Select options={options} size="small" variant="underlined" placeholder="Select an option" />
    </div>
  )
}

export default Demo8; 