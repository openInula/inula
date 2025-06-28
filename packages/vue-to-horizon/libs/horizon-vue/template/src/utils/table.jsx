import { flattenArray } from './utils';

function enhanceCell(cellTemplate, scope) {
  return window.horizon.cloneElement(cellTemplate, scope);
}

export function Table(props) {
  const data = props.data.value;
  let emptyTemplate = () => <div>no table data</div>;
  const columns = flattenArray(props.children).filter(child => {
    if (child.vtype === 12 && child.props.name === 'empty') {
      emptyTemplate = child;
    }
    return child.vtype === 1 && child.type.name === 'TableColumn';
  });
  const columnLabels = [];
  const columnData = [];

  const cellTemplates = [];

  columns.forEach(column => {
    columnLabels.push(column.props.label);
    columnData.push(data?.map(row => row[column.key]) || []);
  });

  return (
    <table
      style={{
        width: '100%',
      }}
      id={props['v-addId-table']}
    >
      {data && columnData?.length ? (
        [
          <tr>
            {columnLabels.map(label => (
              <th
                style={{
                  textAlign: 'left',
                }}
              >
                {label}
              </th>
            ))}
          </tr>,
          columnData[0].map((nill, rowIndex) => (
            <tr>
              {columnData.map((colData, colIndex) => (
                <td>{enhanceCell(columns[colIndex], { row: data[rowIndex], $index: rowIndex })}</td>
                // <td>{colData[rowIndex]}</td>
              ))}
            </tr>
          )),
        ]
      ) : (
        <slot v-if="!data?.length" name="empty"></slot>
      )}
    </table>
  );
}

export function TableColumn(props) {
  let template;

  if (Array.isArray(props?.children)) {
    template = props.children.find(child => child.vtype === 12 && child.props.name === 'default');
  } else if (props?.children?.vtype === 12) {
    template = props.children;
  }

  return template?.props?.children({ ...props, children: null });
}
