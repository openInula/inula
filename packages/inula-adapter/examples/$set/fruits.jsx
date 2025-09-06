import { reactive } from 'vue-inula';

export default function (props) {
  const fruits = reactive([
    { name: 'apple', amount: 3 },
    { name: 'pear', amount: 0 },
  ]);

  function decrement(fruit) {
    fruit.amount--;
  }
  function increment(fruit) {
    fruit.amount++;
  }
  function addFruit() {
    const fruitName = useInstance().$refs.newFruit.value;
    this.$set(fruits, fruits.length, { name: fruitName, amount: 0 }); // how should we do this? Will use of reactive  handle this case automaticaly?
    useInstance().$refs.newFruit.value = '';
  }

  return (
    <div>
      <ul>
        {fruits.map(fruit => (
          <li>
            <p>Fruit: {fruit.name}</p>
            <p>
              Amount:{' '}
              <button
                onClick={() => {
                  decrement(fruit);
                }}
              >
                -
              </button>{' '}
              {fruit.amount}{' '}
              <button
                onClick={() => {
                  increment(fruit);
                }}
              >
                +
              </button>
            </p>
          </li>
        ))}
      </ul>
      <p>
        <input ref="newFruit" type="text" placeholder="fruit name" />
        <button
          onClick={() => {
            addFruit();
          }}
        >
          Add fruit
        </button>
      </p>
    </div>
  );
}
