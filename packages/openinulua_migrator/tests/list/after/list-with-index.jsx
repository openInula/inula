function NumberedList() {
  const items = ['第一项', '第二项', '第三项'];
  
  return (
    <ul>
      <for each={items}>
        {(item, index) => (
          <li>#{index + 1}: {item}</li>
        )}
      </for>
    </ul>
  );
}


