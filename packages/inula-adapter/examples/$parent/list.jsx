import TableItem from 'table-item';
import { expose } from 'vue-horizon';

export default function (props) {
  const { items } = props;

  const filteredIdems = items;

  function setFilterType(type) {
    filteredItems = items.filter(item => item.type === type);
  }

  expose(setFilterType);

  return (
    <table>
      <tr>
        <td>ID</td>
        <td>Product name</td>
        <td>Product type</td>
      </tr>
      {filteredIdems.map(item => (
        <TableItem productId="item.id" productName="item.name" productType="item.type"></TableItem>
      ))}
    </table>
  );
}
