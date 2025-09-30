function FruitList() {
  const fruits = ['苹果', '香蕉', '橙子'];
  
  return (
    <ul>
      {fruits.map((fruit, i) => (
        <li key={i}>{fruit}</li>
      ))}
    </ul>
  );
}


