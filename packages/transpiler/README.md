# delight-transformer

This is a experimental package to implement [API2.0](https://gitee.com/openInula/rfcs/blob/master/src/002-zouyu-API2.0.md) to [dlight](https://github.com/dlight-js/dlight) class.

## Todo-list

- [ ] function 2 class.
  - [x] assignment 2 property
  - [x] statement 2 watch func
  - [ ] handle `props` @HQ
    - [x] object destructuring
    - [x] default value
    - [ ] partial object destructuring
    - [ ] nested object destructuring
    - [ ] nested array destructuring
    - [ ] alias
  - [x] add `this` @HQ
  - [ ] for (jsx-parser) -> playground + benchmark @YH
  - [ ] lifecycle @HQ
  - [ ] ref @HQ (to validate)
  - [ ] env @HQ (to validate)
  - [ ] Sub component
  - [ ] Early Return
  - [ ] custom hook -> Model @YH
- [ ] JSX
  - [x] style
  - [x] fragment
  - [ ] ref (to validate)
  - [ ] snippet
  - [ ] for

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


# custom hook syntax
TODO

# issues
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
