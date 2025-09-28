export default function(){
  const a = 0, b = 2, c = 3;
  return (<div>{a ? b : (a || c ? b + c : c)}</div>);
}
