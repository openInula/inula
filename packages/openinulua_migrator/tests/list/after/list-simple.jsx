function FruitList() {
  const fruits = ['苹果', '香蕉', '橙子'];
  
  return (
    <ul>
      <for each={fruits}>
        {(fruit, i) => <li>{fruit}</li>}
      </for>
    </ul>
  );
}


