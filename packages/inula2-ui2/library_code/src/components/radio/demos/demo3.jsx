import Radio from '../index.jsx';

function Demo3() {
  let selected = 'a';
  
  function handleRadioChange(val) {
    selected = val;
  }
  
  return (
    <div style={{ display: 'flex' }}>
      <Radio label="大号" value="a" checked={selected === 'a'} onChange={handleRadioChange} size="large" />
      <Radio label="默认" value="b" checked={selected === 'b'} onChange={handleRadioChange} size="default" />
      <Radio label="小号" value="c" checked={selected === 'c'} onChange={handleRadioChange} size="small" />
    </div>
  );
}

export default Demo3; 