import { it, describe, expect } from 'vitest';
import { transform } from './transform';

describe('fn2Class', () => {
  it('should transform state assignment', () => {
    expect(
      //language=JSX
      transform(`
        export default function Name() {
          let name = 'John';

          return <h1>{name}</h1>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "class Name extends View {
        name = 'John';
        Body() {
          return <h1>{this.name}</h1>;
        }
      }
      export { Name as default };"
    `);
  });

  it('should transform state modification ', () => {
    expect(
      transform(`
      function MyApp() {
        let count = 0;
        return <div onClick={() => count++}>{count}</div>
      }
    `)
    ).toMatchInlineSnapshot(`
      "class MyApp extends View {
        count = 0;
        Body() {
          return <div onClick={() => this.count++}>{this.count}</div>;
        }
      }"
    `);
  });

  it('should not transform variable out of scope', () => {
    expect(
      //language=JSX
      transform(`
        const name = "John";
        export default function Name() {
          return <h1>{name}</h1>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "const name = \\"John\\";
      class Name extends View {
        Body() {
          return <h1>{name}</h1>;
        }
      }
      export { Name as default };"
    `);
  });

  it('should transform function declaration', () => {
    expect(
      //language=JSX
      transform(`
        const name = "John";

        function Name() {
          function getName() {
            return name;
          }

          const onClick = () => {
            console.log(getName());
          }
          return <h1 onClick={onClick}>{name}</h1>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "const name = \\"John\\";
      class Name extends View {
        getName() {
          return name;
        }
        onClick = () => {
          console.log(this.getName());
        };
        Body() {
          return <h1 onClick={this.onClick}>{name}</h1>;
        }
      }"
    `);
  });

  it('should not transform function parameter to this', () => {
    expect(
      //language=JSX
      transform(`
        function Name() {
          let name = 'Doe'

          function getName(name) {
            return name + '!'
          }

          const onClick = () => {
            console.log(getName('John'));
          }
          return <h1 onClick={onClick}>{name}</h1>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "class Name extends View {
        name = 'Doe';
        getName(name) {
          return name + '!';
        }
        onClick = () => {
          console.log(this.getName('John'));
        };
        Body() {
          return <h1 onClick={this.onClick}>{this.name}</h1>;
        }
      }"
    `);
  });

  it('should not transform constant data', () => {
    expect(
      //language=JSX
      transform(`
        const name = "John";
        export default function Name() {
          return <h1>{name}</h1>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "const name = \\"John\\";
      class Name extends View {
        Body() {
          return <h1>{name}</h1>;
        }
      }
      export { Name as default };"
    `);
  });

  it('should transform derived assignment', () => {
    expect(
      //language=JSX
      transform(`
        export default function NameComp() {
          let firstName = "John";
          let lastName = "Doe";
          let fullName = \`\${firstName} \${lastName}\`

          return <h1>{fullName}</h1>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "class NameComp extends View {
        firstName = \\"John\\";
        lastName = \\"Doe\\";
        fullName = \`\${this.firstName} \${this.lastName}\`;
        Body() {
          return <h1>{this.fullName}</h1>;
        }
      }
      export { NameComp as default };"
    `);
  });

  it('should transform watch from  call expression', () => {
    expect(
      //language=JSX
      transform(`
        export default function CountComp() {
          let count = 0;
          console.log(count);

          return <div>{count}</div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "class CountComp extends View {
        count = 0;
        @Watch
        _watch() {
          console.log(this.count);
        }
        Body() {
          return <div>{this.count}</div>;
        }
      }
      export { CountComp as default };"
    `);
  });

  it('should transform watch from block statement', () => {
    expect(
      //language=JSX
      transform(`
        export default function CountComp() {
          let count = 0;
          let countDown;
          let color
          for (let i = 0; i < count; i++) {
            console.log(\`The count change to: \${i}\`);
          }
          for (let i = 0; i < dbCount; i++) {
            console.log('color changed:', getColor());
          }
          function ()
          return <>
            <button onClick={() => count++}>Add</button>
            <div>{count}</div>
          </>;
        };
      `)
    ).toMatchInlineSnapshot(
      `
      "class CountComp extends View {
        count = 0;
        @Watch
        _watch() {
          for (let i = 0; i < this.count; i++) {
            console.log(\`The count change to: \${i}\`);
          }
        }
        Body() {
          return <>
                  <button onClick={() => this.count++}>Add</button>
                  <div>{this.count}</div>
                </>;
        }
      }
      export { CountComp as default };
      ;"
    `
    );
  });

  it('should transform watch from if statement', () => {
    expect(
      //language=JSX
      transform(`
        export default function CountComp() {
          let count = 0;
          if (count > 0) {
            console.log(\`The count is greater than 0\`);
          }

          return <div>{count}</div>;
        }
      `)
    ).toMatchInlineSnapshot(`
      "class CountComp extends View {
        count = 0;
        @Watch
        _watch() {
          if (this.count > 0) {
            console.log(\`The count is greater than 0\`);
          }
        }
        Body() {
          return <div>{this.count}</div>;
        }
      }
      export { CountComp as default };"
    `);
  });

  it('should transform function component reactively', () => {
    expect(
      transform(`
      function MyComp() {
  let count = 0
  return <>
    <h1 count='123'>Hello dlight fn, {count}</h1>
    <button onClick={() => count +=1}>Add</button>
    <Button />
  </>
}`)
    ).toMatchInlineSnapshot(`
  "class MyComp extends View {
    count = 0;
    Body() {
      return <>
      <h1 count='123'>Hello dlight fn, {this.count}</h1>
      <button onClick={() => this.count += 1}>Add</button>
      <Button />
    </>;
    }
  }"
`);
  });
});
