import { render } from '@openinula/next';

const TreeNode = ({ node, onToggle }) => {
  let isExpanded = true;

  const handleToggle = () => {
    isExpanded = !isExpanded;
    onToggle(node.id, !isExpanded);
  };

  return (
    <div className="tree-node">
      <div onClick={handleToggle} className="tree-node-content">
        <if cond={node.children}>
          <span className={`tree-node-toggle ${isExpanded ? 'expanded' : 'collapsed'}`}>▼</span>
        </if>
        <else>
          <span className="tree-node-toggle"></span>
        </else>
        <span className="tree-node-name">{node.name}</span>
      </div>
      <if cond={isExpanded}>
        <div className="tree-node-children">
          <if cond={node.children}>
            <for each={node.children}>
              {child => {
                return <TreeNode key={child.id} node={child} onToggle={onToggle} />;
              }}
            </for>
          </if>
        </div>
      </if>
    </div>
  );
};

const TreeView = ({ data }) => {
  let expandedNodes = [];

  const handleToggle = (nodeId, isExpanded) => {
    if (isExpanded) {
      expandedNodes = [...expandedNodes, nodeId];
    } else {
      expandedNodes = expandedNodes.filter(id => id !== nodeId);
    }
  };

  return (
    <div className="tree-view">
      <for each={data}>{node => <TreeNode key={node.id} node={node} onToggle={handleToggle} />}</for>
    </div>
  );
};

function App() {
  const arr = [
    {
      name: '我的文档',
      children: [
        {
          name: '工作',
          children: [
            { name: '项目方案.docx' },
            { name: '会议记录.txt' },
            {
              name: '财务报表',
              children: [{ name: '2023年第一季度.xlsx' }, { name: '2023年第二季度.xlsx' }, { name: '年度总结.pptx' }],
            },
          ],
        },
        {
          name: '个人',
          children: [
            { name: '简历.pdf' },
            { name: '家庭照片.jpg' },
            {
              name: '旅行计划',
              children: [{ name: '暑假海岛游.md' }, { name: '冬季滑雪之旅.md' }],
            },
          ],
        },
        { name: '待办事项清单.txt' },
      ],
    },
  ];

  return (
    <div className="app">
      <h1 className="app-title">Tree View</h1>
      <TreeView data={arr} />
    </div>
  );
}

render(App, document.getElementById('main'));
