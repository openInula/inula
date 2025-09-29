export default function(){
  const b = { y: 2 };
  const o = { x: 1, ...b };
  return (<div>{o.x + o.y}</div>);
}
