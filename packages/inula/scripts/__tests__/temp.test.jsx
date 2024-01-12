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

import { useRef, useState } from 'openinula';

let interval;

function HooksComponent() {
  const renderCount = ++useRef(0).current;

  const [count, setCount] = useState(0);

  if (!interval) {
    interval = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  }

  return (
    <div>
      <div>组件渲染次数:{renderCount}</div>
      <div>Count:{count}</div>
    </div>
  );
}


import { useRef, useReactive, useComputed } from 'openinula';

function ReactiveComponent() {
  const renderCount = ++useRef(0).current;

  const data = useReactive({ count: 0 });
  const countText = useComputed(() => {
    return `Count: ${data.count.get()}`;
  });

  setInterval(() => {
    data.count.set(c => c + 1);
  }, 1000);

  return (
    <div>
      <div>组件渲染次数:{renderCount}</div>
      <div>{countText}</div>
    </div>
  );
}


import { createStore } from 'openinula';

const getStore = createStore({
  id: 'value',
  state: {
    val: 0,
  },
  actions: {
    plusOne(state) {
      state.val += 1;
    },
    plusValue(state, value) {
      state.val += value;
    },
  },
});

function App() {
  const store = getStore();

  return (
    <>
      <h1>{store.val}</h1>
      {/*修改state值*/}
      <button onClick={() => store.plusOne()}>+1</button>
    </>
  );
}

import { BrowserRouter, Link, Route, Switch } from 'inula-router';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Link to="/">Main page</Link> | <Link to="/page1">Page 1</Link> | <Link to="/page2">Page 2</Link>
      </div>

      <Switch>
        <Route path="/page2">
          <h1>I'm Page 2</h1>
        </Route>
        <Route path="/page1">
          <h1>I'm Page 1</h1>
        </Route>
        <Route path="/">
          <h1>I'm Page</h1>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}


import { useState, render } from 'openinula';
import { IntlProvider, FormattedMessage } from 'inula-intl';

export const App = () => {
  // 英文资源
  const en = {
    text: 'Welcome to the Inula-intl component!',
    button: 'click me!',
  };

  // 中文资源
  const zh = {
    text: '欢迎使用Inula-intl组件！',
    button: '点我！',
  };

  const [locale, setLocale] = useState('zh');
  const messages = locale === 'zh' ? zh : en;

  return (
    <IntlProvider locale={locale} messages={messages}>
      <div>
        <h2>Inula-intl 国际化</h2>
        <pre>
          <FormattedMessage id="text" />
          <FormattedMessage id="text" />
          <FormattedMessage id="text" />
          <button
            className="Button"
            onClick={() => {
              setLocale(locale === 'zh' ? 'en' : 'zh');
            }}
          >
            <FormattedMessage id={'button'} />
          </button>
          <br />
        </pre>
      </div>
    </IntlProvider>
  );
};

/**
 *  index.tsx
 */
function render() {
  render(
    <>
      <App/>
    </>,
    document.querySelector('#root')
  );
}

render();


// 使用自定义配置发送GET请求
import hr from 'inula-request';

hr.get('https://www.example.com/data', {
  params: {
    id: 123,
    sortBy: 'name',
  },
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Authorization: 'your-token',
  },
})
  .then(response => {
    // 处理响应数据
  })
  .catch(error => {
    // 处理错误
  });

// 配置使用实时数据流
import { useHR } from 'inula-request';

const App = () => {
  const options = {
    pollingInterval: 3000,
    enablePollingOptimization: true,
    limitation: { minInterval: 500, maxInterval: 4000 },
  };
  const { data, error } = useHR('https://www.example.com', null, options);

  return (
    <div>
      <pre>{error ? error.message : data}</pre>
    </div>
  );
};

import { createStore } from 'openInula';

export const getStore = createStore({
  state: {
    visible: false,
    value: 0,
    title: ''
  },
  actions: {
    showProgress: (state, title) => {
      state.visible = true;
      state.tilte = title;
    },
    hideProgress: (state) => {
      state.visible = false;
    },
    updateProgress: (state, value) => {
      state.value = value;
    }
  }
});




// 1. constant.js
export const SHOW_PROGRESS = 'SHOW_PROGRESS';
export const HIDE_PROGRESS = 'HIDE_PROGRESS';
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS';

// 2. action.js
import { SHOW_PROGRESS, HIDE_PROGRESS, UPDATE_PROGRESS } from './constant';

export const showProgress = title => {
  return {
    type: SHOW_PROGRESS,
    visible: true,
    title,
  };
};

export const hideProgress = () => {
  return {
    type: HIDE_PROGRESS,
    visible: false,
  };
};

export const updateProgress = value => {
  return {
    type: UPDATE_PROGRESS,
    value,
  };
};

// 3. reducer.js
import { SHOW_PROGRESS, HIDE_PROGRESS, UPDATE_PROGRESS } from './constant';

const INIT_STATE = {
  visible: false,
  value: 0,
  title: '',
};

export function Progress(state = INIT_STATE, action) {
  switch (action.type) {
    case SHOW_PROGRESS:
      return {
        ...state,
        visible: action.visible,
        title: action.title,
      };
    case HIDE_PROGRESS:
      return {
        ...state,
        visible: action.visible,
      };
    case UPDATE_PROGRESS:
      return {
        ...state,
        value: action.value,
      };
    default:
      return state;
  }
}

// 4. index.js
import { showProgress, hideProgress, updateProgress } from './action';
import { Progress } from './reducer';

export {
  showProgress,
  hideProgress,
  updateProgress,
  Progress
};
