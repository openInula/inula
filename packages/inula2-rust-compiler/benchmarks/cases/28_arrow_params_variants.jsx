export default function(){
  const f1 = x => x+1;
  const f2 = (x,y) => x+y;
  const f3 = (x = 1) => x;
  return (<div>{f1(1)+f2(1,2)+f3()}</div>);
}
