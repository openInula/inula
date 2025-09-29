export default function(){
  const t = true;
  return (((<div>{(t && 'k') ?? 'z'}</div>)));
}
