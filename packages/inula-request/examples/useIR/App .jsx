import Inula, { useState } from 'inulajs';
import { useIR } from '../../index';

const App = () => {

  const [message, setMessage] = useState('等待发送请求...');
  const [isSent, setSend] = useState(false);
  const options = {
    pollingInterval: 3000,
    enablePollingOptimization: true,
    limitation: {minInterval: 500, maxInterval: 4000}
  };
  const {data} = useIR('http://localhost:3001/', null, options);

  const handleClick = () => {
    setSend(true);
  }

  return (
    <>
      <header>useHR Test</header>
      <div className="container">
        <div className="card">
          <h2 style={{whiteSpace: "pre-wrap"}}>{options ? `实时数据流已激活\n更新间隔：${options?.pollingInterval} ms`
            : '实时数据流未激活'}</h2>
          <pre>{isSent ? data : message}</pre>
        </div>
      </div>
      <div className="button">
        <button onClick={handleClick}>点击发送请求</button>
      </div>
    </>
  );
}

export default App;
