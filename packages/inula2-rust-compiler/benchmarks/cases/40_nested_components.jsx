const Label = ({ text }) => <span className="label">{text}</span>;

function Panel({ title, onClose }) {
  return <div className="panel" onClick={onClose}><Label text={title} /></div>;
}
/*
TS-CLI 只处理第一个组件
问题：TS-CLI 只输出了 Label 组件的代码，没有输出 Panel 组件的代码
原因：TS-CLI 似乎只处理文件中的第一个组件，或者有特定的组件处理逻辑
影响：这导致无法进行有效的一致性比较
*/


