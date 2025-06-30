import { useRef, defineExpose } from 'vue-inula';
export default function (props) {
  const { fruitName } = props;

  const isChecked = useRef(false);

  function toggleChecked() {
    isChecked.value = !isChecked.value;
  }

  defineExpose({ isChecked, fruitName });

  return (
    <li>
      <input
        type="checkbox"
        checked={isChecked.value}
        onClick={() => {
          toggleChecked();
        }}
      />
      {fruitName}
    </li>
  );
}
