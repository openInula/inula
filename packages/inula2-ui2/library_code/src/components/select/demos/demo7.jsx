import Select from "../index.jsx";

function Demo7() {
  let values = []; 

  const options = [
    {
      label: '热门城市',
      options: [
        { value: 'Shanghai', label: '上海' },
        { value: 'Beijing', label: '北京' },
      ],
    },
    {
      label: '城市名',
      options: [
        { value: 'Chengdu', label: '成都' },
        { value: 'Shenzhen', label: '深圳' },
        { value: 'Guangzhou', label: '广州' },
        { value: 'Dalian', label: '大连' },
      ],
    },
  ];

  function handleChange(val) {
    values = [...val]; 
  }

  return <Select options={options} multiple onChange={handleChange} placeholder="Select an option" />
}

export default Demo7; 