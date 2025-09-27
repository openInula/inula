# Tree 树形控件

## 何时使用

文件夹、组织架构、生物分类、国家地区等等，世间万物的大多数结构都是树形结构。使用`树控件`可以完整展现其中的层级关系，并具有展开收起选择等交互功能。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tree/demo1"
  style="width: 100%; height: 360px; border: 0;"
></iframe>
<h3>基本</h3>
<p>基本的checkbox选中、select选中、展开收起</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Tree } from 'inula-ui';

const TreeDemo = () => {
  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  const onCheck = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };
  const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          disabled: true,
          children: [
            {
              title: 'leaf',
              key: '0-0-0-0',
              disableCheckbox: true,
            },
            {
              title: 'leaf',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [
            {
              title: <span style={{ color: '#1677ff' }}>sss</span>,
              key: '0-0-1-0',
            },
          ],
        },
        { title: 'parent 1-0', key: '0-0-2' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, width: '80%' }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tree
          checkable
          defaultExpandedKeys={['0-0-0', '0-0-1']}
          defaultSelectedKeys={['0-0-1']}
          defaultCheckedKeys={['0-0-0', '0-0-1']}
          onSelect={onSelect}
          onCheck={onCheck}
          treeData={treeData}
        />
      </div>
    </div>
  );
};

export default TreeDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tree/demo2"
  style="width: 100%; height: 420px; border: 0;"
></iframe>
<h3>受控示例</h3>
<p>外部受控控制checkbox选择，select选中，展开收起</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Tree } from 'inula-ui';

const treeData = [
  {
    title: '0-0',
    key: '0-0',
    children: [
      {
        title: '0-0-0',
        key: '0-0-0',
        children: [
          { title: '0-0-0-0', key: '0-0-0-0' },
          { title: '0-0-0-1', key: '0-0-0-1' },
          { title: '0-0-0-2', key: '0-0-0-2' },
        ],
      },
      {
        title: '0-0-1',
        key: '0-0-1',
        children: [
          { title: '0-0-1-0', key: '0-0-1-0' },
          { title: '0-0-1-1', key: '0-0-1-1' },
          { title: '0-0-1-2', key: '0-0-1-2' },
        ],
      },
      {
        title: '0-0-2',
        key: '0-0-2',
      },
    ],
  },
  {
    title: '0-1',
    key: '0-1',
    children: [
      { title: '0-1-0-0', key: '0-1-0-0' },
      { title: '0-1-0-1', key: '0-1-0-1' },
      { title: '0-1-0-2', key: '0-1-0-2' },
    ],
  },
  {
    title: '0-2',
    key: '0-2',
  },
];

const TreeDemo = () => {
  let expandedKeys = ['0-0-0', '0-0-1'];
  let checkedKeys = ['0-0-0'];
  let selectedKeys = [];
  let autoExpandParent = true;

  const onExpand = (expandedKeysValue) => {
    console.log('onExpand', expandedKeysValue);
    expandedKeys = expandedKeysValue;
    autoExpandParent = false;
  };

  const onCheck = (checkedKeysValue) => {
    console.log('onCheck', checkedKeysValue);
    checkedKeys = checkedKeysValue;
  };

  const onSelect = (selectedKeysValue, info) => {
    console.log('onSelect', info);
    selectedKeys = selectedKeysValue;
  };

  return (
    <Tree
      showLine
      checkable
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      onCheck={onCheck}
      checkedKeys={checkedKeys}
      onSelect={onSelect}
      selectedKeys={selectedKeys}
      treeData={treeData}
    />
  );
};

export default TreeDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tree/demo3"
  style="width: 100%; height: 450px; border: 0;"
></iframe>
<h3>自定义图标、连接线</h3>
<p>可以文字前图标和展开按钮图标，支持连接线</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Tree, Icon } from 'inula-ui';

const treeData1 = [
  {
    title: 'parent 1',
    key: '0-0',
    icon: <Icon value="face-smile" theme="filled" color="skyblue" size={14} />,
    children: [
      {
        title: 'leaf',
        key: '0-0-0',
        icon: (
          <Icon value="face-smile" theme="filled" color="skyblue" size={14} />
        ),
      },
      {
        title: 'leaf',
        key: '0-0-1',
        icon: <Icon value="heart" theme="filled" color="skyblue" size={14} />,
      },
    ],
  },
];

const treeData2 = [
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        children: [
          {
            title: 'leaf',
            key: '0-0-0-0',
          },
          {
            title: 'leaf',
            key: '0-0-0-1',
          },
          {
            title: 'leaf',
            key: '0-0-0-2',
          },
        ],
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        children: [
          {
            title: 'leaf',
            key: '0-0-1-0',
          },
        ],
      },
      {
        title: 'parent 1-2',
        key: '0-0-2',
        children: [
          {
            title: 'leaf',
            key: '0-0-2-0',
          },
          {
            title: 'leaf',
            key: '0-0-2-1',
          },
        ],
      },
    ],
  },
];

const TreeDemo = () => {
  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, width: '80%' }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tree
          showIcon
          defaultExpandAll
          defaultSelectedKeys={['0-0-0']}
          switcherIcon={<Icon value="chevron-right" theme="filled" size={14} />}
          treeData={treeData1}
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tree
          showLine
          switcherIcon={<Icon value="chevron-right" theme="filled" size={14} />}
          defaultExpandedKeys={['0-0-0']}
          onSelect={onSelect}
          treeData={treeData2}
        />
      </div>
    </div>
  );
};

export default TreeDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tree/demo4"
  style="width: 100%; height: 400px; border: 0;"
></iframe>
<h3>异步加载</h3>
<p>支持树控件异步加载。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Tree } from 'inula-ui';

const initTreeData = [
  { title: 'Expand to load', key: '0' },
  { title: 'Expand to load', key: '1' },
  { title: 'Tree Node', key: '2', isLeaf: true },
];

const updateTreeData = (list, key, children) =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });

const TreeDemo = () => {
  let treeData = initTreeData;

  const onLoadData = ({ key, children }) =>
    new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      setTimeout(() => {
        treeData = updateTreeData(treeData, key, [
          { title: 'Child Node', key: `${key}-0` },
          { title: 'Child Node', key: `${key}-1` },
        ]);

        resolve();
      }, 1000);
    });

  return <Tree loadData={onLoadData} treeData={treeData} />;
};

export default TreeDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tree/demo5"
  style="width: 100%; height: 400px; border: 0;"
></iframe>
<h3>虚拟列表</h3>
<p>数控件支持虚拟列表。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Tree } from 'inula-ui';

const dig = (path = '0', level = 3) => {
  const list = [];
  for (let i = 0; i < 10; i += 1) {
    const key = `${path}-${i}`;
    const treeNode = {
      title: key,
      key,
    };

    if (level > 0) {
      treeNode.children = dig(key, level - 1);
    }

    list.push(treeNode);
  }
  return list;
};

const treeData = dig();

const TreeDemo = () => (
  <Tree
    checkable
    showLine
    treeData={treeData}
    height={233}
    defaultExpandAll
    titleRender={(item) => {
      const title = item.title;
      return <text>{title}</text>;
    }}
  />
);

export default TreeDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

### Card

| 属性                | 说明                                                                      | 类型                                                                    | 可选值 | 默认值&nbsp;&nbsp;&nbsp;&nbsp; |
| ------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ | ------------------------------ |
| autoExpandParent    | 是否自动展开父节点                                                        | `boolean`                                                               | -      | `false`                        |
| checkable           | 是否显示复选框                                                            | `boolean`                                                               | -      | `false`                        |
| checkedKeys         | 受控选中复选框的树节点                                                    | `string[] \| checkStrictly：{checked: string[], halfChecked: string[]}` | -      | `[]`                           |
| checkStrictly       | 父子节点不再关联，完全受控                                                | `boolean`                                                               | -      | `false`                        |
| defaultCheckedKeys  | 默认选中的树节点                                                          | `string[]`                                                              | -      | `[]`                           |
| defaultExpandAll    | 默认展开所有树节点                                                        | `boolean`                                                               | -      | `false`                        |
| defaultExpandParent | 默认展开父节点                                                            | `boolean`                                                               | -      | `true`                         |
| defaultExpandedKeys | 默认展开指定的树节点                                                      | `string[]`                                                              | -      | `[]`                           |
| expandedKeys        | 受控展开的树节点                                                          | `string[]`                                                              | -      | `[]`                           |
| disabled            | 禁用树                                                                    | `boolean`                                                               | -      | `false`                        |
| height              | 设置虚拟滚动容器高度，设置后内部不再支持横向滚动                          | `number`                                                                | -      | -                              |
| icon                | 标题之前插入自定义图标，需设置 showIcon 为 true                           | `node`                                                                  | -      | -                              |
| loadData            | 异步加载数据，需设置 loadData 属性，返回 Promise 对象，返回值为树节点数据 | `function`                                                              | -      | -                              |
| loadedKeys          | 受控已加载的树节点，用于控制异步加载，需配合 loadData 属性使用            | `string[]`                                                              | -      | `[]`                           |
| multiple            | 是否支持多选                                                              | `boolean`                                                               | -      | `false`                        |
| selectable          | 是否支持选中，为 false 时点击为 check 选中                                | `boolean`                                                               | -      | `true`                         |
| defaultSelectedKeys | 默认选中的树节点，多选需配合 multiple 属性使用                            | `string[]`                                                              | -      | `[]`                           |
| selectedKeys        | 受控选中的树节点，多选需配合 multiple 属性使用                            | `string[]`                                                              | -      | `[]`                           |
| showIcon            | 是否显示图标                                                              | `boolean`                                                               | -      | `false`                        |
| showLine            | 是否显示连接线                                                            | `boolean`                                                               | -      | `false`                        |
| switcherIcon        | 自定义展开图标                                                            | `node`                                                                  | -      | -                              |
| switcherLoadingIcon | 自定义加载中图标                                                          | `node`                                                                  | -      | -                              |
| titleRender         | 自定义渲染节点                                                            | `function`                                                              | -      | -                              |
| rootStyle           | Tree 最外层 style                                                         | `CSSProperties`                                                         | -      | -                              |
| treeData            | 树节点数据                                                                | `array<{key, title, children, (disabled, selectable)}>`                 | -      | -                              |
| virtual             | 是否开启虚拟滚动，设置 false 关闭虚拟滚动                                 | `boolean`                                                               | -      | `false`                        |
| onCheck             | 点击复选框触发                                                            | `function(e)`                                                           | -      | -                              |
| onExpand            | 展开/收起节点时触发                                                       | `function(e)`                                                           | -      | -                              |
| onLoad              | 异步加载数据时触发                                                        | `function(e)`                                                           | -      | -                              |
| onSelect            | 选中/取消选中节点时触发                                                   | `function(e)`                                                           | -      | -                              |
| className           | 自定义类名                                                                | `string`                                                                | -      | -                              |
| style               | 行内样式                                                                  | `CSSProperties`                                                         | -      | -                              |
| ...rest             | 其他属性                                                                  | -                                                                       | -      | -                              |

说明：

- `check、select、expand` 均支持受控。
- 虚拟列表模式一定要设置`height`高度，不然不会生效。
