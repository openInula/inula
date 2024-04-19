import { describe, expect, it } from 'vitest';
import { transform } from './presets';

describe('fn2Class', () => {
  it('should transform jsx', () => {
    expect(
      transform(`
  @View
  class A {
    Body() {
      return <div></div>
    }
  }`)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, TryNode as $$TryNode, SnippetNode as $$SnippetNode, PropView as $$PropView, render as $$render } from "@dlightjs/dlight";
      class A extends View {
        Body() {
          let $node0;
          $node0 = $$createElement("div");
          return [$node0];
        }
      }"
    `);
  });

  it('should transform jsx with reactive', () => {
    expect(
      transform(`
  @Main
  @View
  class A {
    count = 1
    Body() {
      return <div onClick={() => this.count++}>{this.count}</div>
    }
  }`)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, TryNode as $$TryNode, SnippetNode as $$SnippetNode, PropView as $$PropView, render as $$render } from "@dlightjs/dlight";
      class A extends View {
        count = 1;
        $$count = 1;
        Body() {
          let $node0, $node1;
          this._$update = $changed => {
            if ($changed & 1) {
              $node1 && $node1.update(() => this.count, [this.count]);
            }
          };
          $node0 = $$createElement("div");
          $$delegateEvent($node0, "click", () => this._$ud(this.count++, "count"));
          $node1 = new $$ExpNode(this.count, [this.count]);
          $$insertNode($node0, $node1, 0);
          $node0._$nodes = [$node1];
          return [$node0];
        }
      }
      $$render("main", A);"
    `);
  });

  it('should transform fragment', () => {
    expect(
      transform(`
  @View
  class A {
    Body() {
      return <>
        <div></div>
      </>
    }
  }`)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, TryNode as $$TryNode, SnippetNode as $$SnippetNode, PropView as $$PropView, render as $$render } from "@dlightjs/dlight";
      class A extends View {
        Body() {
          let $node0;
          $node0 = $$createElement("div");
          return [$node0];
        }
      }"
    `);
  });

  it('should transform function component', () => {
    expect(
      transform(`
  function MyApp() {
    let count = 0;
    return <div onClick={() => count++}>{count}</div>
  }`)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, TryNode as $$TryNode, SnippetNode as $$SnippetNode, PropView as $$PropView, render as $$render } from "@dlightjs/dlight";
      class MyApp extends View {
        count = 0;
        $$count = 1;
        Body() {
          let $node0, $node1;
          this._$update = $changed => {
            if ($changed & 1) {
              $node1 && $node1.update(() => this.count, [this.count]);
            }
          };
          $node0 = $$createElement("div");
          $$delegateEvent($node0, "click", () => this._$ud(this.count++, "count"));
          $node1 = new $$ExpNode(this.count, [this.count]);
          $$insertNode($node0, $node1, 0);
          $node0._$nodes = [$node1];
          return [$node0];
        }
      }"
    `);
  });

  it('should transform function component reactively', () => {
    expect(
      transform(`
      function MyComp() {
  let count = 0
  return <>
    <h1>Hello dlight fn, {count}</h1>
    <button onClick={() => count +=1}>Add</button>
    <Button />
  </>
}`)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, TryNode as $$TryNode, SnippetNode as $$SnippetNode, PropView as $$PropView, render as $$render } from "@dlightjs/dlight";
      class MyComp extends View {
        count = 0;
        $$count = 1;
        Body() {
          let $node0, $node1, $node2, $node3, $node4;
          this._$update = $changed => {
            if ($changed & 1) {
              $node2 && $node2.update(() => this.count, [this.count]);
            }
          };
          $node0 = $$createElement("h1");
          $node1 = $$createTextNode("Hello dlight fn, ", []);
          $$insertNode($node0, $node1, 0);
          $node2 = new $$ExpNode(this.count, [this.count]);
          $$insertNode($node0, $node2, 1);
          $node0._$nodes = [$node1, $node2];
          $node3 = $$createElement("button");
          $$delegateEvent($node3, "click", () => this._$ud(this.count += 1, "count"));
          $node3.textContent = "Add";
          $node4 = new Button();
          $node4._$init(null, null, null, null);
          return [$node0, $node3, $node4];
        }
      }"
    `);
  });

  it('should transform children props', () => {
    expect(
      transform(`
      function App({ children}) {
        return <h1>{children}</h1>
      }
    `)
    ).toMatchInlineSnapshot(`
      "import { createElement as $$createElement, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, TryNode as $$TryNode, SnippetNode as $$SnippetNode, PropView as $$PropView, render as $$render } from "@dlightjs/dlight";
      class App extends View {
        get children() {
          return this._$children;
        }
        Body() {
          let $node0, $node1;
          $node0 = $$createElement("h1");
          $node1 = new $$ExpNode(this.children, []);
          $$insertNode($node0, $node1, 0);
          $node0._$nodes = [$node1];
          return [$node0];
        }
      }"
    `);
  });

  it('should transform component composition', () => {
    expect(
      transform(`
    function ArrayModification({name}) {
      let arr = 1
      return <section>
        <div>{arr}</div>
      </section>
    }

    function MyComp() {
      return <>
        <ArrayModification name="1" />
      </>
    }
  `)
    ).toMatchInlineSnapshot(`
    "import { createElement as $$createElement, setStyle as $$setStyle, setDataset as $$setDataset, setEvent as $$setEvent, delegateEvent as $$delegateEvent, setHTMLProp as $$setHTMLProp, setHTMLAttr as $$setHTMLAttr, setHTMLProps as $$setHTMLProps, setHTMLAttrs as $$setHTMLAttrs, createTextNode as $$createTextNode, updateText as $$updateText, insertNode as $$insertNode, ForNode as $$ForNode, CondNode as $$CondNode, ExpNode as $$ExpNode, EnvNode as $$EnvNode, TryNode as $$TryNode, SnippetNode as $$SnippetNode, PropView as $$PropView, render as $$render } from "@dlightjs/dlight";
    class ArrayModification extends View {
      $p$name;
      name;
      arr = 1;
      $$arr = 2;
      Body() {
        let $node0, $node1, $node2;
        this._$update = $changed => {
          if ($changed & 2) {
            $node2 && $node2.update(() => this.arr, [this.arr]);
          }
        };
        $node0 = ArrayModification.$t0.cloneNode(true);
        $node1 = $node0.firstChild;
        $node2 = new $$ExpNode(this.arr, [this.arr]);
        $$insertNode($node1, $node2, 0);
        return [$node0];
      }
      static $t0 = (() => {
        let $node0, $node1;
        $node0 = $$createElement("section");
        $node1 = $$createElement("div");
        $node0.appendChild($node1);
        return $node0;
      })();
    }
    class MyComp extends View {
      Body() {
        let $node0;
        $node0 = new ArrayModification();
        $node0._$init([["name", "1", []]], null, null, null);
        return [$node0];
      }
    }"
  `);
  });
});
