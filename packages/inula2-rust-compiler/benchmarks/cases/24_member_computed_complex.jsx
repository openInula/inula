export default function(){
  const key = 'n1';
  const obj = { n1: 'v1', n2: 'v2' };
  return (<div>{obj[key]}</div>);
}
