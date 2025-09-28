export default function(){
  const a = null, b = 0, c = 'x';
  return (<div>{(a ?? b) ?? c}</div>);
}
