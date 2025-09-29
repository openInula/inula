import Radio from '../index.jsx';

function Demo1() {
  let selected = 'a';
  
  function handleRadioChange(val) {
    selected = val;
  }
  
  return (
    <div style={{ display: 'flex' }}>
      <Radio label="选项A" value="a" checked={selected === 'a'} onChange={handleRadioChange} />
      <Radio label="选项B" value="b" checked={selected === 'b'} onChange={handleRadioChange} />
    </div>
  );
}

export default Demo1; 