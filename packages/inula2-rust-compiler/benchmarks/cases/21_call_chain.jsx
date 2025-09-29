export default function(){
  const f = () => () => 1;
  return (<div>{f()()}</div>);
}
