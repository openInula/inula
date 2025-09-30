import Radio from '../index.jsx';

function Demo5() {
  let selected = 'a';
  function handleRadioChange(val) {
    selected = val;
  }
  return (
    <div style={{ display: 'flex' }}>
      <Radio label="只读A" value="a" checked={selected === 'a'} readOnly onChange={handleRadioChange} />
      <Radio label="只读B" value="b" checked={selected === 'b'} readOnly onChange={handleRadioChange} />
    </div>
  );
}
export default Demo5; 