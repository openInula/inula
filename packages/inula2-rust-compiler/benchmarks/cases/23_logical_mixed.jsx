export default function(){
  const t = 1, f = 0;
  return (<div>{(t && 'a') || (f && 'b') || 'c'}</div>);
}
