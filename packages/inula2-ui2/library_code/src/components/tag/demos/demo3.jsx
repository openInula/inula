import '../index.css';
import Tag from '../index.jsx';

const Demo3 = () => {
  let tags = ['Unremovable', 'Tag 2', '大家读'];
  let newIndex = 1;

  const handleClose = (removed) => {
    tags = tags.filter(t => t !== removed);
  };

  const addTag = () => {
    const next = `New Tag ${newIndex++}`;
    tags = [...tags, next];
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {tags.map((tag, i) => (
        <Tag
          key={tag}
          closable={i !== 0}
          onClose={() => handleClose(tag)}
        >
          {tag}
        </Tag>
      ))}
      <Tag bordered closable={false} onClick={addTag} className="inula-tag-dashed">+ New Tag</Tag>
    </div>
  );
};

export default Demo3;