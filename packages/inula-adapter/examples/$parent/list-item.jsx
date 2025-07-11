import { useInstance } from 'vue-inula';

export default function (props) {
  const { productId, productName, productType } = props;

  function filterType(type) {
    useInstance().$parent.setFilterType(type);
  }

  return (
    <tr>
      <td>{productId}</td>
      <td>{productName}</td>
      <td>
        <span
          onClick={() => {
            filterType(productType);
          }}
        >
          {productType}
        </span>
      </td>
    </tr>
  );
}
