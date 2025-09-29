function Box({ active }) {
  const color = active ? 'red' : 'gray';
  return <div className={active ? 'on' : 'off'} style={`color:${color}`}>Box</div>;
}



