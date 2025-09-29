import Input from "../index.jsx";

function Demo5() {
  let value = "这是一个输入框";

  function handleInput(e) {
    value = e.target.value;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input
        value={value}
        onInput={handleInput}
        showCount
        maxLength={20}
        placeholder="请输入内容"
      />
      <Input
        defaultValue="这是一个输入框"
        showCount
        placeholder="请输入内容"
      />
      <Input
        type="textarea"
        placeholder="带字数统计的自动调整"
        autoSize={true}
        showCount={true}
        maxLength={200}
        style={{ marginBottom: '10px' }}
      />
    </div>
  );
}

export default Demo5;
