import { render } from '@openinula/next';
import './index.css';

function App() {
  let count = 0;

  const handleCount = () => {
    count++;
  };

  return (
    <div className="container">
      <div className="hero">
        <h1 className="hero-title animate__animated animate__fadeInDown">欢迎使用 inula-next!</h1>
        <p className="hero-subtitle animate__animated animate__fadeInUp">你已经成功创建了一个 inula-next 项目</p>

        {/* 简化后的计数器 */}
        <div className="counter-wrapper animate__animated animate__fadeIn">
          <div className="counter-display">
            <span>{count}</span>
          </div>
          <button onClick={handleCount} className="counter-btn">
            点击计数
          </button>
        </div>
      </div>

      <div className="content">
        <div className="card animate__animated animate__fadeInLeft">
          <h2>快速开始</h2>
          <p>
            编辑 <code>src/index.jsx</code> 文件并保存，页面将自动刷新。
          </p>
        </div>
        <div className="card animate__animated animate__fadeInRight">
          <h2>探索更多</h2>
          <p>
            查看{' '}
            <a
              href="https://gitee.com/openInula/rfcs/blob/master/src/002-zouyu-API2.0.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              官方文档
            </a>{' '}
            以了解更多关于 inula-next 的功能。
          </p>
        </div>
        <div className="card animate__animated animate__fadeInUp">
          <h2>加入社区</h2>
          <p>
            加入我们的{' '}
            <a href="https://openinula.net/" target="_blank" rel="noopener noreferrer">
              社区
            </a>
            ，与其他开发者交流并获取帮助。
          </p>
        </div>
      </div>
    </div>
  );
}

render(<App />, document.getElementById('root'));
