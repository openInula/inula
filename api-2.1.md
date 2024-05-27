# Identify a Component/hook
## 1. Auto detection config turned on in Babel
```json
{
  "autoNamingDetection": true
}
```
Will follow the following rules:
* For Components:
  1. Inside a .jsx file
  2. Function/ArrowFunction Named as PascalCase
  ```jsx
  // ✅
  function MyComp() {
    return (
      <div>
        <h1>Hello</h1>
      </div>
    )
  }
  // ❌
  function foo() {
    return (
      <div>
        <h1>Hello</h1>
      </div>
    )
  }
  ```
* For hooks:
  1. Function/ArrowFunction starts with "use"
  ```jsx
  // ✅
  function useMyHook() {
    return 1
  }
  // ❌
  function foo() {
    return 2
  ```
## 2. Manual detection
No naming convention is required. The user will have to manually wrap the function with `Component` or `Hook` function.

* For Components, wrapped with `Component` function
```jsx
const myComp = Component(function() {
  return (
    <div>
      <h1>Hello</h1>
    </div>
  )
})
```
* For hooks, wrapped with `Hook` function
```jsx
const myHook = Hook(function() {
  return 1
})
```


# States/Computed
```jsx
function MyComp() {
  let a, b
  let count = 100
  let doubleCount = count * 2
  let [a1, a2, a3] = getArray()
  ...
}

```

```jsx
class MyComp extends View {
  // Multiple declarations in one line
  a
  b
  // Single declaration
  count = 100
  // Computed states
  doubleCount = this.count * 2

  // Deconstructing assignment
  a1
  a2
  a3
  // Using @Watch to deconstruct
  @Watch
  _$deconstruct_$id$() {
    [this.a1, this.a2, this.a3] = getArray()
  }
}
```

# Props

## Step 1: Collect props/destructured/restProps
### Deconstructed in the function signature
```jsx
function MyComp({ prop1, prop2: [p20, p21], ...otherProps }) {
  ...
}
```
Collected as:
```js
props = ["prop1", "prop2"]
destructured = [
  ["prop2": astOf("[p20, p21]")],
]
restProps = "otherProps"
```
### Deconstructing assignment / Direct usage in the function body
#### 1. Deconstructing assignment
```jsx
function MyComp(props) {
  const { prop1, prop2: [p20, p21], ...otherProps } = props
  ...
}
```
Collected as:
```js
props = ["prop1", "prop2"]
destructured = [
  ["prop2", astOf("[p20, p21]")],
]
restProps = "otherProps"
```
After:
* Delete this statement

#### 2. Direct usage
```jsx
function MyComp(props) {
  let prop1 = props.prop1
  let [p20, p21] = props.prop2
  // Not just assignment, but also any other type of usage
  console.log(props.prop3)
  ...
}
```
collected as:
```js
props = ["prop1", "prop2", "prop3"]
destructured = []  // The reason why it's empty is that the deconstructed props are treated like Computed States
restProps = null
```
After:
* Replace all `props.propName` with `propName`

Goals of these two "After"s:
* Make sure no `props` is used in the function body

## Step2: Generate Props in class
With the collected props/destructured/restProps:
```jsx
props = ["prop1", "prop2"]
destructured = [
  ["prop2", astOf("[p20, p21]")],
]
restProps = "otherProps"
```
Generate:
```jsx
class MyComp extends View {
  // Props with @Prop decorator
  @Prop prop1
  @Prop prop2

  // Destructured props, same logic as Computed States
  p20
  p21
  @Watch
  _$deconstruct_$id$() {
    [this.p20, this.p21] = this.prop2
  }

  // Rest props
  @RestProps otherProps
}
```

## Things to note
1. Multiple deconstructed statements are allowed:
```jsx
function MyComp(props) {
  const { prop1, prop2: [p20, p21] } = props
  const { prop1: p1, prop2: [p20A, p21A] } = props
  ...
}
```
will be collected as:
```js
props = ["prop1", "prop2"]
destructured = [
  ["prop2", astOf("[p20, p21]")],
  ["prop2", astOf("[p20A, p21A)")]
] // this is why destructured is an array of arrays instead of an object
```
and be generated into:
```jsx
class MyComp extends View {
  @Prop prop1
  @Prop prop2

  p20
  p21
  @Watch
  _$deconstruct_$id1$() {
    [this.p20, this.p21] = this.prop2
  }

  p20A
  p21A
  @Watch
  _$deconstruct_$id2$() {
    [this.p20A, this.p21A] = this.prop2
  }
}
```

2. Multiple restProps are NOT allowed:
```jsx
function MyComp(props) {
  const { prop1, prop2, ...otherProps1 } = props
  const { prop2, prop3, ...otherProps2 } = props
  ...
}
```
Will throw an error because this will confuse the compiler what props are explicitly used and what are collected as restProps.

3. Anywhere that `props` is used in the function body will be replaced with the prop name directly:
```jsx
function MyComp(props) {
  let p1 = props.prop1
  console.log(props.prop2)
  console.log(props.prop3.xx[0].yy)
  ...
}
```
will be replaced as:
```jsx
class MyComp extends View {
  @Prop prop1
  @Prop prop2
  @Prop prop3

  p1 = this.prop1

  willMount() {
    console.log(this.prop2)
    console.log(this.prop3.xx[0].yy)
  }
}
```

# For loops
`for` tag basic usage (just like solid's For):
```jsx
function MyComp() {
  let arr = [1, 2, 3]
  return (
    <for each={arr}> {(item) => 
      <div>{item}</div>
    }</for>
  )
}
```


## functional syntax level support
### 1. React inherited flavor: Expression mapping
```jsx
function MyComp() {
  let arr = [1, 2, 3]
  return (
    <>
      {arr.map(item => <div>{item}</div>)}
    </>
  )
}
```
when it's detected as a `map` function and the returned value is a JSX, it will be converted into a `for` tag(for better performance):
```jsx
function MyComp() {
  let arr = [1, 2, 3]
  return (
    <for each={arr}> {(item) => 
      <div>{item}</div>
    }</for>
  )
}
```
NOTE: only detect the last map function:
```jsx
function MyComp() {
  let arr = [1, 2, 3]
  return (
    <>
      {
        Object.values(arr)
          .map(item => <h1>{item}</h1>)
          .map(item => <div>{item}</div>)
      }
    </>
  )
}
```
will be converted into:
```jsx
function MyComp() {
  let arr = [1, 2, 3]
  return (
    <for each={
      Object.values(arr)
        .map(item => <h1>{item}</h1>)
    }>{(item) => 
      <div>{item}</div>
    }</for>
  )
}
```

### 2. Children
1. Simple returned value (no local variables). Children will be treated as regular elements/components
```jsx
function MyComp() {
  return (
    <for each={arr}>{(item) => 
      <div>{item}</div>
    }</for>
  )
}
```
children collected in the parser will only be:
```jsx
<div>{item}</div>
```

2. With local variables. Transformed into a new Component:
```jsx
function MyComp() {
  return (
    <for each={arr}>{(info) => {
      const { item } = info
      return <div>{item}</div>
    }}</for>
  )
}
```
will be converted into:
```jsx
function MyComp() {
  function Comp_$id$({ info }) {
    const { item } = info
    return <div>{item}</div>
  }

  return (
    <for each={arr}>{(info) => (
      <Comp_$id$ info={info}/>  
    )}</for>
  )
}
```
which creates a new component for the children and converts the children into the first situation(1. Simple returned value)

## Key prop
Just like React, we can add a `key` prop to first level children of the `for` tag:
```jsx
function MyComp() {
  let arr = [1, 2, 3]
  return (
    <for each={arr}> {(item) => 
      <div key={item}>{item}</div>
    }</for>
  )
}
```


# JSX
JSX is tricky because we need to allow different types of JSX to be used in the function body. 

Let's consider a piece of JSX:
```jsx
function MyComp() {
  let count = 0
  let jsxSlice = <div>{count}</div>
  ...
}
```
We have different options:
1. jsx -> array of nodes

we can use an IIFE to convert the JSX into an array of nodes:
```jsx
class MyComp extends View {
  count = 0
  jsxSlice = (() => {
    const node0 = createElement("div")
    node0.textContent = this.count
    return node0
  })()
}
```
This looks good but when `count` changes, the whole `jsxSlice` will be re-calculated, which means elements will be re-created. This is not good for performance.

So instead of using an IIFE, we can first extract the JSX into a nested component:
```jsx
function MyComp() {
  let count = 0
  function Comp_$id$() {
    return <div>{count}</div>
  }
  let jsxSlice = <Comp_$id$/>
  ...
}
```
In this case, no matter how many times `count` changes, the `jsxSlice` will not be re-calculated, we only need to call the update function of the `Comp_$id$` component.

So we'll convert this type of JSX into a nested component:
```jsx
class MyComp extends View {
  count = 0
  // Use an IIFE to return a class because we need to forward the parent's this. X in _$thisX represents the level of nesting
  // Also it needs to be static(not a state variable)
  @Static Comp_$id$ = (() => {
    const _$this0 = this
    return class extends View {
      willUnmount() {
        // Remove all parent level when unmount
        clear(_$this0)
      }
      Body() {
        const node0 = createElement("div")
        const node1 = new ExpressionNode(_$this0.count)
        appendChild(node0, [node1])

        const update = changed => {
          if (changed & 0x0001) {
            node1.update(_$this0.count)
          }
        }
        // Because we need to confine the changed scope, we put update into all parent level's updates
        this._$updates.add(update) // current level
        _$this0._$updates.add(update) // parent level
        // _$this1._$updates.add(update) // if there's a third level
        return node0
      }
    }
  })()

  jsxSlice = new this.Comp_$id$()
}
```

A more complex example:
```jsx
function MyComp() {
  let count = 100
  const jsxSlice = <div>{count}</div>
  const jsxArray = [<div>1</div>, <div>{count}</div>]
  function jsxFunc() {
    // This is a function that returns JSX 
    // because the function name is smallCamelCased
    return <div>{count}</div>
  }
  function InternalComp({ doubleCount }) {
    return (
      <div>
        {count /* This is Parent's state */}
        {doubleCount /* This is current's prop */}
      </div>
    )
  }

  return (
    <div>
      {jsxSlice}
      {jsxArray}
      {jsxFunc()}
      <InternalComp doubleCount={count * 2}/>
    </div>
  )
}
```
first, we convert the JSX into nested components:
```jsx
function MyComp() {
  let count = 100
  function Comp_$id1$() {
    return <div>{count}</div>
  }
  const jsxSlice = <Comp_$id1$/>
  function Comp_$id2$() {
    return <div>1</div>
  }
  function Comp_$id3$() {
    return <div>{count}</div>
  }
  const jsxArray = [<Comp_$id2$/>, <Comp_$id3$/>]
  function jsxFunc() {
    function Comp_$id4$() {
      return <div>{count}</div>
    }
    // This is a function that returns JSX 
    // because the function name is smallCamelCased
    return <Comp_$id4$/>
  }
  function InternalComp({ doubleCount }) {
    return (
      <div>
        {count /* This is Parent's state */}
        {doubleCount /* This is current's prop */}
      </div>
    )
  }

  return (
    <div>
      {jsxSlice}
      {jsxArray}
      {jsxFunc()}
      <InternalComp doubleCount={count * 2}/>
    </div>
  )
}
```
will be converted into:
```jsx
class MyComp extends View {
  count = 100
  // $$count = 0x0001 // Indicate count is the first state

  @Static Comp_$id1$ = (() => {
    const _$this0 = this
    return class extends View {
      willUnmount() {
        // Remove all parent level when unmount
        clear(_$this0)
      }
      Body() {
        const node0 = createElement("div")
        const node1 = new ExpressionNode(_$this0.count)
        appendChild(node0, [node1])
        const update = changed => {
          if (changed & 0x0001) {
            node1.update(_$this0.count)
          }
        }
        this._$updates.add(update)
        _$this0._$updates.add(update)
        return node0
      }
    }
  })()
  jsxSlice = new this.Comp_$id$(null, [...this._$scopes, this])

  @Static Comp_$id2$ = class extends View {
    Body() {
      const node0 = createElement("div")
      node0.textContent = "1"
      return node0
    }
  }
  Comp_$id3$ = /*same as Comp_$id1$*/
  jsxArray = [new this.Comp_$id2$(), new this.Comp_$id3$()]

  jsxFunc() {
    const Comp_$id4$ = /*same as Comp_$id1$*/
    return new Comp_$id4$()
  }
  @Static InternalComp = (() => {
    const _$this0 = this
    return class extends View {
      @Prop doubleCount
      // $$doubleCount = 0x0010 // Index will be INHERITED from the parent!
      willUnmount() {
        // Remove all parent level when unmount
        clear(_$this0)
      }
      Body() {
        const node1 = createElement("div")
        const node2 = new ExpressionNode(_$this0.count)
        const node3 = new ExpressionNode(this.doubleCount)
        appendChild(node1, [node2, node3])
        const update = changed => {
          if (changed & 0x0001) {
            node2.update(_$this0.count)
          }
          if (changed & 0x0010) {
            node3.update(this.doubleCount)
          }
        }
        this._$updates.add(update)
        _$this0._$updates.add(update)
        return [node1]
      }
    }
  })()

  Body() {
    const node0 = createElement("div")
    const node1 = new ExpressionNode(this.jsxSlice)
    const node2 = new ExpressionNode(this.jsxArray)
    const node3 = new ExpressionNode(this.jsxFunc())
    const node4 = new this.InternalComp({
      doubleCount: this.count * 2
    })
    // second argument is the parent scopes, use this to access parent's states/variables
  
    appendChild(node0, [node1, node2, node3, node4])
    const update = changed => {
      if (changed & 0x0001) {
        // _$this0.jsxFunc will be re-called
        node3.update(this.jsxFunc(this.count))
        // doubleCount prop will be updated due to count change
        node4.updateProp("doubleCount", this.count * 2)
      }
    }
    this._$updates.add(update)
    return node0
  }
}
```

# Early return
Early return is also tricky....

```jsx
function MyComp() {
  let count = 100
  if (count === 100) {
    return <div>100</div>
  }
  let flag = true
  return <div>Not 100 {flag}</div>
}
```
it will be converted in a functional level:
```jsx
function MyComp() {
  let count = 100
  function Comp_$id1$() {
    return <div>100</div>
  }
  function Comp_$id2$() {
    let flag = true
    return <div>Not 100 {flag}</div>
  }

  return (
    <>
      <if condition={count === 100}>
        <Comp_$id1$/>
      </if>
      <else>
        <Comp_$id2$ />
      </else>
    </>
  )
}
```
and then be converted into class using the same jsx logic as the previous section.

A more complex example:
```jsx
function MyComp() {
  let count = 100
  if (count === 100) {
    return <div>100</div>
  }
  let flag = true
  if (flag) {
    let cc = 0
    if (cc === 200) {
      return <div>cc is 200</div>
    } else if (cc === 100) {
      return <div>cc is 100</div>
    }
    return <div>Flag is true</div>
  }
  return <div>Not 100 {flag}</div>
}
```
will be converted into:
```jsx
function MyComp() {
  let count = 100
  function Comp_$id1$() {
    return <div>100</div>
  }
  function Comp_$id2$() {
    let flag = true
    function Comp_$id3$() {
      let cc = 0
      function Comp_$id4$() {
        return <div>cc is 200</div>
      }
      function Comp_$id5$() {
        return <div>cc is 100</div>
      }
      function Comp_$id6$() {
        return <div>Flag is true</div>
      }
      return (
        <>
          <if cond={cc === 200}>
            <Comp_$id4$/>
          </if>
          <else-if cond={cc === 100}>
            <Comp_$id5$/>
          </else-if>
          <else>
            <Comp_$id6$/>
          </else>
        </>
      )
    }
    function Comp_$id7$() {
      return <div>Not 100 {flag}</div>
    }
    return (
      <>
        <if cond={flag}>
          <Comp_$id3$/>
        </if>
        <else>
          <Comp_$id7$/>
        </else>
      </>
    )
  }
  return (
    <>
      <if cond={count === 100}>
        <Comp_$id1$/>
      </if>
      <else>
        <Comp_$id2$/>
      </else>
    </>
  )
}
```
Same rule will be applied to switch statements(TBD).

## How to pass view props to another component
Consider the following 3 types of solutions:
1. A calculated jsx slice:
```jsx
function MyComp1() {
  let count = 0
  return <Comp view={<div>{count}</div>}/>
}
function Comp({ view }) {
  return <>{view}</>
}
```
will be converted into:
```jsx
class MyComp1 extends View {
  count = 0
  @Static Comp_$id$ = (() => {
    const _$this0 = this
    return class extends View {
      willUnmount() {
        // Remove all parent level when unmount
        clear(_$this0)
      }
      Body() {
        const node0 = createElement("div")
        const node1 = new ExpressionNode(_$this0.count)
        appendChild(node0, [node1])
        const update = changed => {
          if (changed & 0x0001) {
            node1.update(_$this0.count)
          }
        }
        this._$updates.add(update)
        return node0
      }
    }
  })()
  Body() {
    const node0 = new Comp({
      view: new this.Comp_$id$()
    })
   
    return node0
  }
}

class Comp extends View {
  @Prop view

  Body() {
    const node0 = new Fragment()
    const node1 = new ExpressionNode(this.view)
    appendChild(node0, [node1])
    const update = changed => {
      if (changed & 0x0001) {
        node1.update(this.view)
      }
    }
    this._$updates.add(update)
    return node0
  }
}
```
In this case, the `view` prop is a calculated JSX slice, but updating the `count` state won't re-render the whole view, only the `count` part inside the `Comp_$id$` component. So feel free to use it!

2. Functional nested Component:
```jsx
function MyComp2() {
  let count = 0
  function SubComp() {
    return <div>{count}</div>
  }
  return <Comp View={SubComp}/>
}
function Comp({ View }) {
  return <View/>
}
```
will be converted into:
```jsx
class MyComp2 extends View {
  count = 0
  @Static SubComp = (() => {
    const _$this0 = this
    return class extends View {
      willUnmount() {
        // Remove all parent level when unmount
        clear(_$this0)
      }
      Body() {
        const node0 = createElement("div")
        const node1 = new ExpressionNode(_$this0.count)
        appendChild(node0, [node1])
        const update = changed => {
          if (changed & 0x0001) {
            node1.update(_$this0.count)
          }
        }
        this._$updates.add(update)
        _$this0._$updates.add(update)
        return node0
      }
    }
  })()
  Body() {
    const node0 = new Comp({
      View: this.SubComp
    })
    return node0
  }
}
class Comp extends View {
  @Prop View

  Body() {
    const node0 = new this.View()
    return node0
  }
}
```
This is a good way to pass props to another component if you want to add some props in the `Comp`.

3. Functional calculated JSX slice:
```jsx
function MyComp3() {
  let count = 0
  return <Comp viewFunc={() => <div>{count}</div>}/>
}
function Comp({ viewFunc }) {
  return <>{viewFunc()}</>
}
```
will be converted into:
```jsx
class MyComp3 extends View {
  count = 0
  Body() {
    const node0 = new Fragment()
    const node1 = new Comp({
      viewFunc: () => {
        const Comp_$id$ = (() => {
          const _$this0 = this
          return class extends View {
            willUnmount() {
              // Remove all parent level when unmount
              clear(_$this0)
            }
            Body() {
              const node0 = createElement("div")
              const node1 = new ExpressionNode(_$this0.count)
              appendChild(node0, [node1])
              const update = changed => {
                if (changed & 0x0001) {
                  node1.update(_$this0.count)
                }
              }
              this._$updates.add(update)
              return node0
            }
          }
        })()
        return new Comp_$id$()
      }
    })
    appendChild(node0, [node1])
    const update = changed => {
      if (changed & 0x0001) {
        node1.updateProp("viewFunc", () => {
          const Comp_$id$ = (() => {
            const _$this0 = this
            return class extends View {
              willUnmount() {
                clear(_$this0)
              }
              Body() {
                const node0 = createElement("div")
                const node1 = new ExpressionNode(_$this0.count)
                appendChild(node0, [node1])
                const update = changed => {
                  if (changed & 0x0001) {
                    node1.update(_$this0.count)
                  }
                }
                this._$updates.add(update)
                _$this0._$updates.add(update)
                return node0
              }
            }
          })()
          return new Comp_$id$()
        })
      }
    }
    this._$updates.add(update)
    return node0
  }
}

```
All the view will be re-calculated when the `count` state changes. So Don't Ever Use This!

# Statements
## 1. Assignment will be converted to class properties as stated above
## 2. If statements will be treated as part of the early return logic
## 3. All other statements will be converted as part of the willMount lifecycle
```jsx
function MyComp() {
  let count = 100
  console.log(count)
  console.log("Hello")
  anyFunction()
  ...
}
```
will be converted as:
```jsx
class MyComp extends View {
  count = 100

  willMount() {
    console.log(this.count)
    console.log("Hello")
    anyFunction()
  }
}
```

# Lifecycle
## 1. willMount
```jsx
function MyComp() {
  let count = 100
  console.log("willMount1")
  willMount(() => {
    const a = 1
    console.log("willMount2")
  })
  willMount(() => {
    const a = 1
    console.log("willMount3")
  })
}
```
will be converted as:
```jsx
class MyComp extends View {
  count = 100

  willMount() {
    console.log("willMount1")
    // transform into iife because of its internal variables
    (() => {
      const a = 1
      console.log("willMount2")
    })()
    (() => {
      const a = 1
      console.log("willMount3")
    })()
  }
}
```

## 2. didMount/willUnmount/didUnmount
```jsx
function MyComp() {
  didMount(() => {
    console.log("didMount")
  })
  willUnmount(async () => {
    console.log("willUnmount")
  })
  didUnmount(() => {
    console.log("didUnmount")
  })
}
```
will be converted as:
```jsx
class MyComp extends View {
  didMount() {
    (() => {
      console.log("didMount")
    })()
  }
  willUnmount() {
    (async () => {
      console.log("willUnmount")
    })()
  }
  didUnmount() {
    (() => {
      console.log("didUnmount")
    })()
  }
}
```

# Watch
```jsx
function MyComp() {
  let count = 100
  watch(() => {
    console.log(count)
  })
}
```
will be converted as:
```jsx
class MyComp extends View {
  count = 100

  @Watch
  _$watch_$id$() {
    console.log(this.count)
  }
}
```
With manual dependencies:
```jsx
function MyComp() {
  let count = 100
  let doubleCount = count * 2
  watch(() => {
    console.log(count, doubleCount)
  }, [count, doubleCount])
}
```
will be converted as:
```jsx
class MyComp extends View {
  count = 100
  doubleCount = this.count * 2
  @Watch("count", "doubleCount")
  _$watch_$id$() {
    console.log(this.count)
  }
}
```
NOTE: convert `identifier` to `string literal` in the `@Watch` decorator



# Hook
Same logic as the Component
```jsx
function useMyHook() {
  let count = 100

  return count
}
```
will be converted into:
```jsx
class MyHook extends Model {
  count = 100

  _$return = this.count
}
```

used in a component:
```jsx
function MyComp() {
  const count = useMyHook()
  return <div>{count}</div>
}
```
will be converted into:
```jsx
class MyComp extends View {
  count = use(useMyHook)._$return

  Body() {
    toBeCompiled(<div>{this.count}</div>)
  }
}
```
Basically turn `useMyHook(props)` into a property of `use(useMyHook, props)._$return`. The logic for props handling is the same as the Component.

NOTE: We have a constraint here that we only accept `an object of props` like we do in the `Component` function.

Another example:
```jsx
function useMyHook() {
  let count = 100
  let doubleCount = count * 2

  return { count, doubleCount }
}
```
will be converted into:
```jsx
class MyHook extends Model {
  count = 100
  doubleCount = this.count * 2

  _$return = { count: this.count, doubleCount: this.doubleCount }
}
```

used in a component:
```jsx
function MyComp() {
  const { count, doubleCount } = useMyHook()
  return <div>{count} {doubleCount}</div>
}
```
will be converted into:
```jsx
class MyComp extends View {
  count
  doubleCount
  @Watch
  _$deconstruct_$id$() {
    const { count, doubleCount } = use(useMyHook)._$return
    this.count = count
    this.doubleCount = doubleCount
  }

  Body() {
    toBeCompiled(<div>{this.count} {this.doubleCount}</div>)
  }
}
```

Early return in hooks:
```jsx
function useMyHook() {
  let count = 100
  if (count === 100) {
    return 100
  }
  let flag = count === 200
  return flag
}
```
will be converted first into:
```jsx
function useMyHook() {
  let count = 100
  function Hook_$id1$() {
    return count
  }
  function Hook_$id2$() {
    let flag = count === 200
    return flag
  }

  if (count === 100) {
    return Hook_$id1$()
  } else {
    return Hook_$id2$()
  }
}
```
and then into:
```jsx
class useMyHook extends Model {
  count = 100

  Hook_$id1$ = (() => {
    const _$this0 = this
    return class {
      _$return = _$this0.count
    }
  })()

  Hook_$id2$ = (() => {
    const _$this0 = this
    return class {
      _$return = _$this0.count === 200
    }
  })()

  _$return = (() => {
    let ifIdx, model
    if (this.count === 100) {
      if (ifIdx !== 0) {
        ifIdx = 0
        model = use(this.Hook_$id1$)._$return
      }
    } else {
      if (ifIdx !== 1) {
        ifIdx = 1
        model = use(this.Hook_$id2$)._$return
      }
    }

    return model
  })()
}
```



# Compilers
Starter Example:
```jsx
function MyComp(props) {
  let { prop1, prop2: [p20, p21], ...otherProps } = props
  let count = 100
  let data = props.data
  const jsxSlice = <div>{count}</div>

  const jsxFunc = () => {
    return <div>{count}</div>
  }

  function InnerComp() {
    let newCount = 100
    return <div>{newCount}</div>
  }
  console.log("hello")
  didMount(() => {
    console.log("didMount")
  })

  if (count === 100) {
    return <div>100</div>
  }

  let flag = true

  return (
    <div>
      {flag}
      <h1>{count}</h1>
      <for each={data}> {(item) => { 
        const {id, data} = item
        return <div key={id}>{data}</div>
      }}</for>
      {data.map(item => <div>{item}</div>)}
      {jsxSlice}
      <InnerComp />
    </div>
  )
}
```

## 1. Auto Naming Compiler
```jsx
const MyComp = Component(props => {
  let { prop1, prop2: [p20, p21], ...otherProps } = props
  let count = 100
  let data = props.data
  const jsxSlice = <div>{count}</div>

  const jsxFunc = () => {
    return <div>{count}</div>
  }

  const InnerComp = Component(() => {
    let newCount = 100
    return <div>{newCount}</div>
  })

  console.log("hello")
  didMount(() => {
    console.log("didMount")
  })

  if (count === 100) {
    return <div>100</div>
  }

  let flag = true
  
  return (
    <div>
      {flag}
      <h1>{count}</h1>
      <for each={data}> {(item, idx) => { 
        const {id, data} = item
        return <div key={id}>{data}{idx}</div>
      }}</for>
      {data.map(item => <div>{item}</div>)}
      {jsxSlice}
      <InnerComp />
    </div>
  )
})
```

## 2. JSX Slice Compiler
Identify all non-returning JSX expressions
```jsx
const MyComp = Component(props => {
  let { prop1, prop2: [p20, p21], ...otherProps } = props
  let count = 100
  let data = props.data

  const jsxSlice = new (Component(() => {
    return <div>{count}</div>
  }))()

  const jsxFunc = () => {
    return new (Component(() => {
      return <div>{count}</div>
    }))()
  }

  const InnerComp = Component(() => {
    let newCount = 100
    return <div>{newCount}</div>
  })

  console.log("hello")
  didMount(() => {
    console.log("didMount")
  })

  if (count === 100) {
    return <div>100</div>
  }

  let flag = true

  return (
    <div>
      {flag}
      <h1>{count}</h1>
      <for each={data}> {(item, idx) => { 
        const {id, data} = item
        return <div key={id}>{data}{idx}</div>
      }}</for>
      {data.map(item => <div>{item}</div>)}
      {jsxSlice}
      <InnerComp />
    </div>
  )
})
```

## 3. For Loop Compiler - mapping to for tag
```jsx
const MyComp = Component(props => {
  let { prop1, prop2: [p20, p21], ...otherProps } = props
  let count = 100
  let data = props.data

  const jsxSlice = new (Component(() => {
    return <div>{count}</div>
  }))()

  const jsxFunc = () => {
    return new (Component(() => {
      return <div>{count}</div>
    }))()
  }

  const InnerComp = Component(() => {
    let newCount = 100
    return <div>{newCount}</div>
  })

  console.log("hello")
  didMount(() => {
    console.log("didMount")
  })

  if (count === 100) {
    return <div>100</div>
  }

  let flag = true

  return (
    <div>
      {flag}
      <h1>{count}</h1>
      <for each={data}> {(item, idx) => { 
        const {id, data} = item
        return <div key={id}>{data}{idx}</div>
      }}</for>
      <for each={data}> {(item) => (
        <div>{item}</div>
      )}</for>
      {jsxSlice}
      <InnerComp />
    </div>
  )
})
```

## 4. For Loop Compiler - sub component extraction
```jsx
const MyComp = Component(props => {
  let { prop1, prop2: [p20, p21], ...otherProps } = props
  let count = 100
  let data = props.data

  const jsxSlice = new (Component(() => {
    return <div>{count}</div>
  }))()

  const jsxFunc = () => {
    return new (Component(() => {
      return <div>{count}</div>
    }))()
  }

  const InnerComp = Component(() => {
    let newCount = 100
    return <div>{newCount}</div>
  })

  console.log("hello")
  didMount(() => {
    console.log("didMount")
  })

  if (count === 100) {
    return <div>100</div>
  }

  const Comp_je104nt = Component(({ item, idx }) => {
    const {id, data} = item
    return <div key={id}>{data}{idx}</div>
  })

  return (
    <div>
      <h1>{count}</h1>
      <for each={data}> {(item, idx) => (
        <Comp_$id1$ item={item} idx={idx}/>
      )}</for>
      <for each={data}> {(item) => (
        <div>{item}</div>
      )}</for>
      {jsxSlice}
      <InnerComp />
    </div>
  )
})
```

## 5. Early return Compiler
```jsx
const MyComp = Component(props => {
  let { prop1, prop2: [p20, p21], ...otherProps } = props
  let count = 100
  let data = props.data

  const jsxSlice = new (Component(() => {
    return <div>{count}</div>
  }))()

  const jsxFunc = () => {
    return new (Component(() => {
      return <div>{count}</div>
    }))()
  }

  const InnerComp = Component(() => {
    let newCount = 100
    return <div>{newCount}</div>
  })

  console.log("hello")
  didMount(() => {
    console.log("didMount")
  })

  const Comp_je104nt = Component(({ item, idx }) => {
    const {id, data} = item
    return <div key={id}>{data}{idx}</div>
  })

  const Comp_jf91a2 = Component(() => {
    return <div>100</div>
  })

  const Comp_ao528j = Component(() => {
    let flag = true
    return (
      <div>
        {flag}
        <h1>{count}</h1>
        <for each={data}> {(item, idx) => (
          <Comp_$id1$ item={item} idx={idx}/>
        )}</for>
        <for each={data}> {(item) => (
          <div>{item}</div>
        )}</for>
        {jsxSlice}
        <InnerComp />
      </div>
    )
  })

  return (
    <if cond={count === 100}>
      <Comp_jf91a2/>
    </if>
    <else>
      <Comp_ao528j/>
    </else>
  )
})
```

----
Till now, all the implicit components are created, we can now recursively convert them into classes.
----

## 6. Props Compiler
```jsx
const MyComp = Component({ prop1, prop2, data, ...otherProps } => {
  let p20, p21
  watch(() => {
    [p20, p21] = prop2
  })
  let count = 100

  // let data = data -> automatically deleted
  const jsxSlice = new (Component(() => {
    return <div>{count}</div>
  }))()

  const jsxFunc = () => {
    return new (Component(() => {
      return <div>{count}</div>
    }))()
  }

  const InnerComp = Component(() => {
    let newCount = 100
    return <div>{newCount}</div>
  })

  console.log("hello")
  didMount(() => {
    console.log("didMount")
  })

  const Comp_je104nt = Component(({ item, idx }) => {
    let id, data
    watch(() => {
      {id, data} = item
    })
    return <div key={id}>{data}{idx}</div>
  })

  const Comp_jf91a2 = Component(() => {
    return <div>100</div>
  })

  const Comp_ao528j = Component(() => {
    let flag = true
    return (
      <div>
        {flag}
        <h1>{count}</h1>
        <for each={data}> {(item, idx) => (
          <Comp_$id1$ item={item} idx={idx}/>
        )}</for>
        <for each={data}> {(item) => (
          <div>{item}</div>
        )}</for>
        {jsxSlice}
        <InnerComp />
      </div>
    )
  })

  return (
    <if cond={count === 100}>
      <Comp_jf91a2/>
    </if>
    <else>
      <Comp_ao528j/>
    </else>
  )
})
```


## 7. Class converter
`jsxSlice` and other inner components will be tagged as `InnerComponents`, with extra `_$this` scope:
```jsx
const MyComp = class extends View {
  @Prop prop1
  @Prop prop2
  @Prop data
  @RestProps otherProps

  p20
  p21
  @Watch
  _$watch_aei1nf$() {
    [p20, p21] = this.prop2
  }

  count = 100

  jsxSlice = new class extends View {
    Body() {
      <div>{count}</div>
    }
  }()

  jsxFunc = () => {
    return new class extends View {
      Body() {
        <div>{count}</div>
      }
    }()
  }

  InnerComp = class extends View {
    newCount = 100
    Body() {
      <div>{newCount}</div>
    }
  }

  Comp_je104nt = class extends View {
    @Prop item
    @Prop idx
    id
    data
    @Watch
    _$watch_15oae3$() {
      {id, data} = this.item
    }

    Body() {
      <div key={id}>{data}{idx}</div>
    }
  }

  Comp_jf91a2 = class extends View {
    Body() {
      <div>100</div>
    }
  }

  Comp_ao528j = class extends View {
    flag = true
    Body() {
      <div>
        {flag}
        <h1>{count}</h1>
        <for each={data}> {(item, idx) => (
          <Comp_$id1$ item={item} idx={idx}/>
        )}</for>
        <for each={data}> {(item) => (
          <div>{item}</div>
        )}</for>
        {jsxSlice}
        <InnerComp />
      </div>
    }
  }

  willMount() {
    console.log("hello")
  }
  didMount() {
    (() => {
      console.log("didMount")
    })()
  }


  Body() {
    <if cond={count === 100}>
      <Comp_jf91a2 />
    </if>
    <else>
      <Comp_ao528j />
    </else>
  }
}
```

## 8. This converter
Auto add `this` to variables also record the `_$thisX` scope to auto add:
```jsx
const MyComp = class extends View {
  @Prop prop1
  @Prop prop2
  @Prop data
  @RestProps otherProps

  p20
  p21
  @Watch
  _$watch_aei1nf$() {
    [this.p20, this.p21] = this.prop2
  }

  count = 100

  jsxSlice = new ((() => {
    const _$this0 = this
    return class extends View {
      Body() {
        <div>{_$this0.count}</div>
      }
    }
  })())()

  jsxFunc = () => {
    return new ((() => {
      const _$this0 = this
      return class extends View {
        Body() {
          <div>{_$this0.count}</div>
        }
      }
    })())()
  }

  InnerComp = class extends View {
    newCount = 100
    Body() {
      <div>{this.newCount}</div>
    }
  }

  Comp_je104nt = class extends View {
    @Prop item
    @Prop idx
    id
    data
    @Watch
    _$watch_15oae3$() {
      {this.id, this.data} = this.item
    }

    Body() {
      <div key={this.id}>{this.data}{this.idx}</div>
    }
  }

  Comp_jf91a2 = class extends View {
    Body() {
      <div>100</div>
    }
  }

  Comp_ao528j = (() => {
    const _$this0 = this
    return class extends View {
      flag = true
      Body() {
        <div>
          {this.flag}
          <h1>{_$this0.count}</h1>
          <for each={_$this0.data}> {(item, idx) => (
            <_$this0.Comp_$id1$ item={item} idx={idx}/>
          )}</for>
          <for each={_$this0.data}> {(item) => (
            <div>{item}</div>
          )}</for>
          {_$this0.jsxSlice}
          <_$this0.InnerComp />
        </div>
      }
    }
  })()

  willMount() {
    console.log("hello")
  }
  didMount() {
    (() => {
      console.log("didMount")
    })()
  }


  Body() {
    <if cond={this.count === 100}>
      <this.Comp_jf91a2 />
    </if>
    <else>
      <this.Comp_ao528j />
    </else>
  }
}
```

## 8. Decorator Compiler


## 9. JSX Compiler
InnerComponent need to
1. add a `willUnmount` lifecycle to clear the parent updates.
2. push the `update` function to all the parent's updates.

```jsx
  InnerComp = class extends View {
    newCount = 100
    Body() {
      <div>{this.newCount}</div>
    }
  }
```
To
```jsx
  InnerComp = class extends View {
    newCount = 100
    willUnmount() {
      clear(this)
    }
    Body() {
      const node0 = createElement("div")
      const node1 = new ExpressionNode(this.newCount)
      appendChild(node0, [node1])
      const update = changed => {
        if (changed & 0x0001) {
          node1.update(this.newCount)
        }
      }
      this._$updates.add(update)
      return node0
    }
  }
```



# function vs class
```jsx
function MyComp() {
  let count = 100
  return <MyComp2 count={count}/>
}
```
to
```jsx
class MyComp extends View {
  count = 100
  Body() {
    const node0 = new MyComp2({
      count: this.count
    })
    return node0
  }
}
```

vs
```jsx
function MyComp(props) {
  return new class extends View {
    @Prop count
    Body() {
      const node0 = MyComp2({
        count: this.count
      })
      return node0
    }
  }(props)
}

MyComp({ count: 100 })
// or
<MyComp count={100}/>
```


```jsx
// declare
class Comp extends View {}
// use
new Comp(props, children)

// declare
function Comp(props, children) {
  return new class extends View {}(props, children)
}
// use
Comp(props, children)
```


```jsx
function MyComp({ defaultCount }) {
  let count = defaultCount
  return <div>{count}</div>
}

function App() {
  return <MyComp defaultCount={200} />
}

function App2() {
  const comp = MyComp({defaultCount: 200})

  console.log(comp)
  return <>
    {MyComp({defaultCount: 200})}
  </>
}

```
```js
class MyComp {
  @Prop defaultCount
  count
  Body() {
    <div>{this.count}</div>
  }
}
class App {
  Body() {
    const node0 = new MyComp({
      defaultCount: 200
    })
  }
}
```
```js
class MyCompInternalaefaefaefea {
    @Prop defaultCount
    count
    Body() {
      <div>{this.count}</div>
    }
  }
function Factory(cls) {
  return ...args => new cls(...args)
}
const MyComp = Factory(MyCompInternalaefaefaefea)

function App() {
  class AppInternal {
    Body() {
      const node0 = MyComp()
    }
  }

  return new AppInternal()
}
function App2() {
  return <>
    {MyComp({defaultCount: 200})}
  </>
}
function App() {
  class AppInternal {
    Body() {
      const node0 = new Fragment()
      const node1 = new ExpressionNode(
        MyComp({defaultCount: 200})
      )
      appendChild(node0, [node1])

      return node0
    }
  }

  return new AppInternal()
}
```











to
```jsx
function MyComp({ defaultCount }) {
  let count = defaultCount
  return div(null, [count]) 
}

function MyComp2() {
  return MyComp({ defaultCount: 200 })
}
```
