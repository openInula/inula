import inula from 'inulajs';
import './index.css';

function App() {
  return (
    <div class="container">
        <div class="hero">
            <h1 class="hero-title animate__animated animate__bounceInDown">欢迎来到 Inula 项目!</h1>
            <p class="hero-subtitle animate__animated animate__bounceInUp">你已成功创建你的第一个 Inula 项目</p>
        </div>
        <div class="content">
            <div class="card animate__animated animate__zoomIn">
                <h2>开始吧</h2>
                <p>编辑 <code>src/index.jsx</code> 并保存以重新加载。</p>
            </div>
            <div class="card animate__animated animate__zoomIn">
                <h2>了解更多</h2>
                <p>要了解 Inula，查看 <a href="https://inula-docs.com" target="_blank">Inula 文档</a></p>
            </div>
        </div>
      </div>
  );
}

inula.render(<App />, document.getElementById('root'));
