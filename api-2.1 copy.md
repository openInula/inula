
```jsx
propAppendix = "_$p$"
deconAppendix = "_$d$"
nodePrefix = "_$n$"
```

```jsx
function MyComp({ prop1, prop2: [p20, p21], ...otherProps }) {
  let count = 100
  let doubleCount = count * 2
  const increment = () => {
    count++
  }

  console.log("hello")
  didMount(() => {
    console.log("didMount")
  })

  function InnerComp() {
    let count = p20
    return <div>{count + doubleCount}</div>
  }

  return (
    <div>
      <h1 onClick={increment}>{count}</h1>
      {p20}
      <InnerComp />
    </div>
  )
}
```

```jsx  
const MyComp = Inula.identifyComponent(({prop1, prop2, ...otherProps}) => {
  let prop1${propAppendix} = prop1
  let prop2${propAppendix}${deconAppendix} = prop2
  let p20
  let p21
  let otherProps${propAppendix} = otherProps

  Inula.watch(() => {
    [p20, p21] = prop2${propAppendix}${deconAppendix}
  })


  let count = 100 
  let doubleCount = count * 2 
  const increment = () => {
    count++
  }

  console.log("hello")
  didMount(() => {
    console.log("didMount")
  })

  const InnerComp = Inula.identifyComponent(() => {
    let count = p20
    return <div>{count+doubleCount}</div>
  })


  return (
    <div>
      <h1 onClick={increment}>{count}</h1>
      {p20}
      <InnerComp />
    </div>
  )
})
```

```jsx  
const MyComp = Inula.identifyComponent(({prop1, prop2, ...otherProps}) => {
  let self

  // ---- Pre-compiled Props
  let prop1${propAppendix} = prop1
  let prop2${propAppendix}${deconAppendix} = prop2 // 0b1
  let p20 // 0b10
  let p21
  let otherProps${propAppendix} = otherProps

  let count = 100 // 0b100
  let doubleCount = count * 2  // 0b1000 <- because it's used in InnerComp!
  const increment = () => {
    self.updateDerived(count++, 0x100)
  }

  // ---- Pre-compiled Inner Component
  const InnerComp = Inula.identifyComponent(() => {
    let self
    let count = p20 // 0b10000

    let ${nodePrefix}0 = Inula.createElement('div')
    Inula.initHTMLProp(${nodePrefix}0, "textContent", count + doubleCount, [count, doubleCount])
    self = Inula.createComponent({
      baseNode: ${nodePrefix}0,
      updateView: changed => {
        if (changed & 0b11000) {
          Inula.elementNotCached(${nodePrefix}0, "textContent", [count, doubleCount]) && 
            ${nodePrefix}0.textContent = count + doubleCount
        }
      },
      updateState: changed => {
        if (changed & 0b10) {
          Inula.notCached(self, "p20", [p20]) &&
            count = p20
        }
      }
    })

    return self
  })

  // ---- Nodes
  let ${nodePrefix}0 = Inula.createElement('div')
  let ${nodePrefix}1 = Inula.createElement('h1')
  Inula.initHTMLProp(${nodePrefix}1, "textContent", count, [count])
  Inula.delegateEvent(${nodePrefix}1, "click", increment)
  Inula.insertNode(${nodePrefix}0, ${nodePrefix}1, 0)
  let ${nodePrefix}2 = Inula.createText(doubleCount, [doubleCount])
  Inula.insertNode(${nodePrefix}0, ${nodePrefix}2, 1)
  let ${nodePrefix}3 = InnerComp()
  Inula.insertNode(${nodePrefix}0, ${nodePrefix}3, 2)

  self = Inula.createComponent({
    willMount: () => {
      console.log("hello")
    },
    didMount: () => {
      {
        console.log("didMount")
      }
    },
    baseNode: ${nodePrefix}0,
    updateView: changed => {
      if (changed & 0x4) {
        if (Inula.elementNotCached(${nodePrefix}1, "textContent", [count]))
          ${nodePrefix}1.textContent = count
      }
      if (changed & 0x8) {
        if (Inula.textNotCached(${nodePrefix}2, [p20]))
          ${nodePrefix}2.textContent = p20
      }
    },
    updateProp: (propName, newValue) => {
      if (propName === 'prop1') {
        prop1${propAppendix} = newValue
      } else if (propName === 'prop2') {
        self.updateDerived(
          prop2${propAppendix}${deconAppendix} = newValue,
          0x1
        )
      } else {
        otherProps${propAppendix}[propName] = newValue
      }
    },
    updateState: (changed) => {
      if (changed & 0x1) {
        if (Inula.notCached(self, "prop2${propAppendix}${deconAppendix}", [prop2${propAppendix}${deconAppendix}])) {
          self.updateDerived([p20, p21] = prop2${propAppendix}${deconAppendix}, 0b0010)
        }
      }
      if (changed & 0x4) {
        self.updateDerived(doubleCount = count * 2, 0b1000)
      }
      // ---- Only do so with inner component
      ${nodePrefix}3.updateState(changed)

      // ---- self.updateDerived will automatically collected all the changes in one tick and merge them into one viewChanged bit and call updateView. This function in "return" will be called together with self.updateView
      return viewChanged => {
        ${nodePrefix}3.updateView(viewChanged) 
      }
    }
  })
  return self
})
```