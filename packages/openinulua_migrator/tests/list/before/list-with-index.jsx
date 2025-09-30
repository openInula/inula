function NumberedList() {
  const items = ['第一项', '第二项', '第三项'];
  
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>#{index + 1}: {item}</li>
      ))}
    </ul>
  );
}


