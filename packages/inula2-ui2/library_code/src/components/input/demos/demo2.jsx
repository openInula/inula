import Input from "../index.jsx";
import Tag from "../../tag/index.jsx"

function Demo2() {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex',  gap: 8, alignItems: 'flex-start' }}>
        <Tag color="geekblue">input</Tag>
        <Input size="small" placeholder="小尺寸" />
        <Input size="default" placeholder="默认尺寸" />
        <Input size="large" placeholder="大尺寸" />
      </div>
      <div style={{ display: 'flex',  gap: 8, alignItems: 'flex-start' }}>
        <Tag color="geekblue">textarea</Tag>
        <Input
          type="textarea"
          placeholder="小尺寸"
          size="small"
          autoSize={true}
          style={{ marginBottom: '10px' }}
        />
        <Input
          type="textarea"
          placeholder="默认尺寸"
          size="default"
          autoSize={true}
          style={{ marginBottom: '10px' }}
        />
        <Input
          type="textarea"
          placeholder="大尺寸"
          size="large"
          autoSize={true}
          style={{ marginBottom: '10px' }}
        />
      </div>
    </div>
  );

}

export default Demo2;
