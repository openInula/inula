import FruitItem from './FruitItem.jsx';

export default function (props) {
  const fruits = ['apple', 'pear', 'motorcycle'];

  function logFruit() {
    console.log(
      useInstance()
        .$children.map(({ fruitName, isChecked }) => `${fruitName}:${isChecked ? '✓' : 'X'}`)
        .join(', ') //returns string like "apple:✓, pear:X, motorcycle:✓"
    );
  }

  return (
    <div>
      <ul>
        {fruits.map(fruit => (
          <FruitItem fruitName={fruit} />
        ))}
      </ul>
      <button
        onClick={() => {
          logFruit();
        }}
      ></button>
    </div>
  );
}
