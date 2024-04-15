# Todo-list

- [ ] function 2 class.
  - [x] assignment 2 property
  - [x] statement 2 watch func
  - [ ] handle `props` @HQ
    - [x] object destructuring
    - [x] default value
    - [ ] partial object destructuring
    - [ ] nested object destructuring
    - [ ] nested array destructuring
    - [x] alias
  - [x] add `this` @HQ
  - [x] for (jsx-parser) -> playground + benchmark @YH
  - [x] lifecycle @HQ
  - [x] ref @HQ (to validate)
  - [x] env @HQ (to validate)
  - [ ] Sub component
  - [ ] Early Return
  - [ ] custom hook -> Model @YH
- [ ] JSX
  - [x] style
  - [x] fragment
  - [x] ref (to validate)
  - [ ] snippet
  - [x] for


# function component syntax

- [ ] props (destructuring | partial destructuring | default value | alias)
- [ ] variable declaration -> class component property
- [ ] function declaration ( arrow function | async function )-> class method
- [ ] Statement -> watch function
  - [ ] assignment
  - [ ] function call
  - [ ] class method call
  - [ ] for loop
  - [ ] while loop (do while, while, for, for in, for of)
  - [ ] if statement
  - [ ] switch statement
  - [ ] try catch statement
  - [ ] throw statement ? not support
  - [ ] delete expression
- [ ] lifecycle -> LabeledStatement
- [ ] return statement -> render method(Body)
- [ ] iife
- [ ] early return


# Issues
- [ ] partial props destructuring -> support this.$props @YH
```jsx
function Input({onClick, xxx, ...props}) {
  function handleClick() {
    onClick()
  }
  return <input onClick={handleClick} {...props} />
}
```
- [ ] model class declaration should before class component declaration -> use Class polyfill
```jsx
// Code like this will cause error: `FetchModel` is not defined
@Main
@View
class MyComp {
  fetchModel = use(FetchModel, { url: "https://api.example.com/data" })

  Body() {}
}

@Model
class FetchModel {}
```
- [ ] custom hook early return @YH
- [ ] snippet
```jsx
  const H1 = <h1></h1>;
  // {H1}
  const H1 = (name) => <h1 className={name}></h1>;
  // {H1()} <H1/>
  function H1() {
    return <h1></h1>;
  }
  // <H1/>
```
- [ ] Render text and variable, Got Error
```jsx
  // Uncaught DOMException: Failed to execute 'appendChild' on 'Node': This node type does not support this method.
<button>Add, Now is {count}</button>
```

# Proposal
## Watch

自动将Statement包裹Watch的反例：
```jsx
  // 前置操作: 场景为Table组件，需要响应column变化，先置空column，再计算新的columnByKey
  let columnByKey;
  watch: {
    columnByKey = {};
    columns.forEach(col => {
      columnByKey[col.key] = col;
    });
  }
  // 临时变量: 场景为操作前的计算部分临时变量
  watch: {
    let col = columnByKey[sortBy];
    if (
      col !== undefined &&
      col.sortable === true &&
      typeof col.value === "function"
    ) {
      sortFunction = r => col.value(r);
    }
  }
```
