import Input from "../index.jsx";

function Demo6() {
  let value = "";

  function handleInput(e) {
    value = e.target.value;
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <Input
        defaultValue="这是一个输入框"
        allowClear
        placeholder="请输入内容"
      />
      <Input
        type="textarea"
        allowClear
        placeholder="请输入内容"
        autoSize={true}
      />
    </div>
  );
}

export default Demo6;
