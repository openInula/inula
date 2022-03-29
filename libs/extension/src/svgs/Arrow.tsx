interface IArrow {
  director: 'right' | 'down'
}

export default function Arrow({director}: IArrow) {
  let d: string;
  if (director === 'right') {
    d = 'm2 0l12 8l-12 8 z'
  } else if (director === 'down') {
    d = 'm0 2h16 l-8 12 z';
  }
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='8px' height='8px'>
      <path d={d} fill='currentColor'/>
    </svg>
  )
}