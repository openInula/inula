export const codeSamples = [
  {
    id: 1,
    title: "入门",
    code: `import { render } from '@openinula/next';
 
 function HelloWorld() {
  return <h1>Hello World!</h1>;
}

render(HelloWorld(), document.getElementById('app'));`,
  },
  {
    id: 2,
    title: "组件",
    code: `import { render } from '@openinula/next';
 
 function App() {
  return <h1>This is my first component</h1>;
}

render(App(), document.getElementById('app'));`,
  },
  {
    id: 3,
    title: "状态管理",
    code: `import { render } from '@openinula/next';
 
 function UserInput() {
  let count = 0;
  function incrementCount() {
    count = count + 1;
  }

  return (
    <>
      <h1>{count}</h1>
      <button onClick={incrementCount}>Add 1</button>
    </>
  );
}

render(UserInput(), document.getElementById('app'));
`,
  },
  {
    id: 4,
    title: "计算属性",
    code: `import { render } from '@openinula/next';

 function DoubleCounter() {
  let count = 0;
  // 计算值：double 会自动随着 count 变化
  const double = count * 2;
 
  return (
    <div>
      <p>当前计数：{count}</p>
      <p>双倍值：{double}</p>
      <button onClick={() => count++}>增加</button>
    </div>
  );
}

render(<DoubleCounter />, document.getElementById('app'));`,
  },
  {
    id: 5,
    title: "监听系统",
    code: `import { render, watch} from '@openinula/next';

 function MultiWatch() {
  let a = 1;
  let b = 2;
 
  watch(() => {
    console.log('a 变化：' + a);
  });
  watch(() => {
    console.log('b 变化：' + b);
  });
 
  return (
    <div>
      <button onClick={() => a++}>a++</button>
      <button onClick={() => b++}>b++</button>
    </div>
  );
}

render(<MultiWatch />, document.getElementById('app'));`,
  },
  {
    id: 6,
    title: "条件渲染",
    code: `import { render } from '@openinula/next';

function TrafficLight() {
  let lightIndex = 0;

  let light = lightIndex ? 'green' : 'red';

  function nextLight() {
    lightIndex = (lightIndex + 1) % 2;
  }

  return (
    <>
      <button onClick={nextLight}>Next light</button>
      <p>Light is: {light}</p>
      <p>
        You must:
        <if cond={light === 'red'}>
          <span>STOP</span>
        </if>
        <else-if cond={light === 'green'}>
          <span>GO</span>
        </else-if>
      </p>
    </>
  );
}

render(TrafficLight(), document.getElementById('app'));
`,
  },
  {
    id: 7,
    title: "列表渲染",
    code: `import { render } from '@openinula/next';

function FruitList() {
  const fruits = ['苹果', '香蕉', '橙子'];
  
  return (
    <ul>
      <for each={fruits}>
        {(fruit) => <li>{fruit}</li>}
      </for>
    </ul>
  );
}

render(<FruitList />, document.getElementById('app'));`,
  },
  {
    id: 8,
    title: "事件处理",
    code: `import { render } from '@openinula/next';

function ClickCounter() {
  let count = 0;
  
  function handleClick() {
    count++;
  }
  
  return (
    <button onClick={handleClick}>
      点击次数：{count}
    </button>
  );
}

render(<ClickCounter />, document.getElementById('app'));`,
  },
  {
    id: 9,
    title: "生命周期",
    code: `import { render } from '@openinula/next';

function PageTitle() {
  let counts = 0;
  didMount(() => {
    counts = counts + 5;
  });
  return <p>页面标题：{counts}</p>;
}

render(<PageTitle />, document.getElementById('app'));`,
  },
];

export const getCodeById = (id: number): string | null => {
  console.log(
    "getCodeById called with ID:",
    id,
    "Available samples:",
    codeSamples.map((s) => ({ id: s.id, title: s.title }))
  );
  const sample = codeSamples.find((sample) => sample.id === id);
  if (sample) {
    console.log("Found sample:", sample.title);
    return sample.code;
  } else {
    console.warn("No sample found for ID:", id);
    return null;
  }
};
