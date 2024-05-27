```js
function MyComp({prop1}) {
  let count = 1
  let doubleCount = count * 2

  const updateCount = () => {
    count++
  }

  return <div>{prop1}</div>;
}
```

```js
function MyComp() {
  let prop1$$prop

  let count = 1
  let doubleCount = count * 2
  let update$$doubleCount = () => {
    if (cached()) return
    doubleCount = count * 2
  }

  const updateCount = () => {
    viewModel.update(count++)
  }

  // ----
  const node = createElement('div')
  setProps(node, "textContent", [prop1])

  const viewModel = Inula.createElement({
    node,
    updateProp: (propName, value) => {
      if (propName === 'prop1') {
        prop1$$prop = value
      }
    },
    updateState: (changed) => {
      if (changed & 0x1) {
        update$$doubleCount()
      }
    },
    updateView: (changed) => {
      if (changed & 0x1) {
        setProps(node, "textContent", [prop1$$prop])
      }
    }
  })

  return viewModel
}
```

