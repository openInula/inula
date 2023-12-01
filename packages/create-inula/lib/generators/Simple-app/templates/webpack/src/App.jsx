/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import Inula from 'openinula';
import './styles.css';

class App extends Inula.Component {
  render() {
    return (
      <div class="container">
        <div class="hero">
          <h1 class="hero-title animate__animated animate__bounceInDown">欢迎来到 Inula 项目!</h1>
          <p class="hero-subtitle animate__animated animate__bounceInUp">你已成功创建你的第一个 Inula 项目</p>
        </div>
        <div class="content">
          <div class="card animate__animated animate__zoomIn">
            <h2>开始吧</h2>
            <p>
              编辑 <code>src/App.js</code> 并保存以重新加载。
            </p>
          </div>
          <div class="card animate__animated animate__zoomIn">
            <h2>了解更多</h2>
          <p>
            要了解 Inula，查看{' '}
            <a href="https://openinula.org" target="_blank">Inula 官网</a>
          </p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
