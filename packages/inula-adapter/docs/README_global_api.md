## 全局 API

1、createApp() 用法如下：
```jsx
import { createApp } from 'openinula';

function App() {
  return <div>Hello World</div>;
}
const app = createApp(<App>);

app.mount('#app');
```

2、createSSRApp() 不支持

3、app.mount() 用法如下：
```jsx
import { createApp } from 'openinula';

function App() {
  return <div>Hello World</div>;
}
const app = createApp(<App>);

app.mount('#app');

```

4、app.unmount() 用法如下：
```jsx
import { createApp } from 'openinula';

function App() {
  return <div>Hello World</div>;
}
const app = createApp(<App>);

app.mount('#app');

app.unmount();
```

5、app.component() 不支持

6、app.directive() 不支持

7、app.use() 用法如下：
```jsx
const PluginA = {
  install: (app, arg1, arg2) => app.provide('bar', arg1 + arg2),
}

const app = createApp(Root)
app.use(PluginA)

```

8、app.mixin() 不支持，需要手动修改，下面举个在plugin中使用mixin的例子：
Vue的mixin用法如下：
```js
import Timer from '../timer';

function startTimer(oCallback, iInterval) {
  let timer = setInterval(function () {
    oCallback();
  }, iInterval);
  this.arrTimer.push(timer);
  return timer;
}

function endTimer(timer) {
  if (timer != undefined) {
    for (let i = 0; i < this.arrTimer.length; i++) {
      if (this.arrTimer[i] == timer) {
        this.arrTimer.splice(i, 1);
        break;
      }
    }
    clearInterval(timer);
  }
}

function mountEvent(strSubject, oCallback) {
  this.Bus.on(strSubject, oCallback);
  this.arrMountEvent.push({
    subject: strSubject,
    callback: oCallback,
  });
}

let isInstalled = false;
export default {
  install(projectVue) {
    if (isInstalled) {
      return;
    }
    isInstalled = true;

    projectVue.mixin({
      data() {
        return {
          arrTimer: [],
          arrMountEvent: [],
        };
      },
      beforeUnmount() {
        this.arrTimer.forEach(oTimer => {
          Timer.endTimer(oTimer, this);
        });
        this.arrMountEvent.forEach(oMountEvent => {
          this.Bus.off(oMountEvent.subject, oMountEvent.callback);
        });
      },
    });

    // 1.定时器处理
    projectVue.config.globalProperties.$startTimer = startTimer;
    projectVue.config.globalProperties.$endTimer = endTimer;

    // 1.mounted事件处理
    projectVue.config.globalProperties.$mountEvent = mountEvent;
  },
};
```
openinula中需要修改为hook，改法如下：
```jsx
import { useReactive, onBeforeUnmount } from 'adapters/vue-openinula';
import Timer from '../timer';

export function useEventHook() {
  const data = useReactive({
    arrTimer: [],
    arrMountEvent: [],
  });

  onBeforeUnmount(() => {
    data.arrTimer.forEach(oTimer => {
      Timer.endTimer(oTimer, this);
    });
    data.arrMountEvent.forEach(oMountEvent => {
      this.Bus.off(oMountEvent.subject, oMountEvent.callback);
    });
  });

  function startTimer(oCallback, iInterval) {
    let timer = setInterval(function () {
      oCallback();
    }, iInterval);
    data.arrTimer.push(timer);
    return timer;
  }

  function endTimer(timer) {
    if (timer != undefined) {
      for (let i = 0; i < data.arrTimer.length; i++) {
        if (data.arrTimer[i] == timer) {
          data.arrTimer.splice(i, 1);
          break;
        }
      }
      clearInterval(timer);
    }
  }

  function mountEvent(strSubject, oCallback) {
    // this.Bus.on(strSubject, oCallback);
    data.arrMountEvent.push({
      subject: strSubject,
      callback: oCallback,
    });
  }

  return { startTimer, endTimer, mountEvent };
}
```
使用方式对比如下：
```jsx
// 使用vue中的使用
export default {
  data() {
    return {};
  },
  methods: {
    showLog(logId) {
      this.$startTimer(
        () => {
          self.queryAutoLog();
        },
        1000,
      );
    },
  },
}

// openinula中使用
export default (props) => {
  const {$startTimer} = useEventHook();

  const dataReactive = reactive({});
  const showLog = () => {
    $startTimer(
      () => {
        self.queryAutoLog();
      },
      1000,
    );
  };
}
```

9、app.provide() 不支持

10、app.runWithContext() 不支持

11、app.version 用法如下：
```jsx
import { createApp } from 'openinula';
function App() {
  return <div>Hello World</div>;
}
const app = createApp(<App>);
console.log(app.version);
```
12、app.config
13、app.config.errorHandler 不支持
14、app.config.warnHandler 不支持
15、app.config.performance 不支持
16、app.config.compilerOptions 不支持

17、app.config.globalProperties
1. 支持给app.config.globalProperties赋值，通过useGlobalProperties使用，用法如下：
```jsx
const Comp = () => {
  // this.foo 转成：
  const foo = useGlobalProperties('foo');
  const { bar } = useGlobalProperties();
  return (
    <div>
      <span id={'foo'}>
        {foo}, {bar}
      </span>
    </div>
  );
};

const app = createApp(<Comp />);
// 设置globalProperties
app.config.globalProperties.foo = 'hello';
app.config.globalProperties.bar = 'inula';

app.mount(global.container);
```
2. 但是如果给app.config.globalProperties赋值是函数，同时函数中使用了this，需要手动修改：
```jsx
app.config.globalProperties.foo = function() {
  // this是undefined，需要手动修改
  return this.bar;
}

// 修改为，把使用的内容传入
app.config.globalProperties.foo = function(bar) {
  return bar;
}
```

18、app.config.optionMergeStrategies 不支持
