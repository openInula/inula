import '../index.css';
import { CheckableTag } from '../index.jsx';

const Demo4 = () => {
  let checked = [true, false, false, false];
  const tags = ['Movies', 'Books', 'Music', 'Sports'];

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tags.map((tag, i) => (
        <CheckableTag 
          key={tag}
          defaultChecked={checked[i]} 
          onChange={(next) => { checked[i] = next; }}
        >
          {tag}
        </CheckableTag>
      ))}
    </div>
  );
};

export default Demo4;
