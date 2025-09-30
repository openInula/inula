import Input from '../index.jsx';

let password = '';

function handlePasswordInput(e) {
  password = e.target.value;
}


const Demo9 = () => {
  return  <Input type="password" showPassword={true} placeholder="请输入密码" value={password} onInput={handlePasswordInput}/>
} 

export default Demo9;