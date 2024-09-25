import { transform } from '@babel/standalone';
import preset from '@openinula/babel-preset-inula-next';

const code = /*js*/ `
console.log('ok');

const Comp = Component(() => {
  const prop1_$p$_ = 1
  const prop2_$p$_ = 1

  return <></>
})
`;

const result = transform(code, {
  presets: [preset],
}).code;

console.log(result);
