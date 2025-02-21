/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { describe, expect, it } from 'vitest';
import { compile } from './mock';
import jsxSlicePlugin from '../../src/sugarPlugins/jsxSlicePlugin';
import mapping2ForPlugin from '../../src/sugarPlugins/mapping2ForPlugin';
import autoNamingPlugin from '../../src/sugarPlugins/autoNamingPlugin';

const mock = (code: string) => compile([autoNamingPlugin, mapping2ForPlugin, jsxSlicePlugin], code);

describe('jsx slice', () => {
  it('should work with jsx slice', () => {
    expect(
      mock(`
        function App() {
          const a = <div></div>
        }
      `)
    ).toMatchInlineSnapshot(`
      "const App = Component(() => {
        const JSX_div = Component(() => <div></div>);
        const a = $$createCompNode(JSX_div);
      });"
    `);
  });

  it('should support multi level jsx', () => {
    // expect(
    //   mock(`
    //     function App() {
    //       const content = <div>
    //         <header>
    //           <h1>Title</h1>
    //         </header>
    //         <main>
    //           <p>Content</p>
    //         </main>
    //       </div>;
    //     }
    //   `)
    // ).toMatchInlineSnapshot(`
    //   "const App = Component(() => {
    //     const JSX_div = Component(() => <div>
    //               <header>
    //                 <h1>Title</h1>
    //               </header>
    //               <main>
    //                 <p>Content</p>
    //               </main>
    //             </div>);
    //     const content = $$Comp(JSX_div);
    //   });"
    // `);
  });
  it('should work with jsx slice in ternary operator', () => {
    // expect(
    //   mock(`
    //   function App() {
    //     const a = true ? <Table.Col></Table.Col> : <div></div>
    //   }
    // `)
    // ).toMatchInlineSnapshot(`
    //   "const App = Component(() => {
    //     const JSX_div = Component(() => <div>
    //               <header>
    //                 <h1>Title</h1>
    //               </header>
    //               <main>
    //                 <p>Content</p>
    //               </main>
    //             </div>);
    //     const content = $$createCompNode(JSX_div);
    //   });"
    // `);
  });

  it('should work with jsx slice in arr', () => {
    // expect(
    //   mock(`
    //   function App() {
    //     const arr = [<div></div>,<h1></h1>]
    //   }
    // `)
    // ).toMatchInlineSnapshot(`
    //   "const App = Component(() => {
    //     const JSX_Table_Col = Component(() => <Table.Col></Table.Col>);
    //     const JSX_div = Component(() => <div></div>);
    //     const a = true ? $$createCompNode(JSX_Table_Col) : $$createCompNode(JSX_div);
    //   });"
    // `);
  });

  it('should work with jsx slice in jsx attribute', () => {
    // expect(
    //   mock(`
    //   function App() {
    //     return <div icon={<Icon />}></div>
    //   }
    // `)
    // ).toMatchInlineSnapshot(`
    //   "const App = Component(() => {
    //     const JSX_div = Component(() => <div></div>);
    //     const JSX_h = Component(() => <h1></h1>);
    //     const arr = [$$createCompNode(JSX_div), $$createCompNode(JSX_h)];
    //   });"
    // `);
  });

  it('fragment should work', () => {
    // expect(
    //   mock(`
    //   function App() {
    //     const a = <>{test}</>
    //     const b = cond ? <><div></div></> : <><span></span></>
    //   }
    // `)
    // ).toMatchInlineSnapshot(`
    //   "const App = Component(() => {
    //     const JSX_Icon = Component(() => <Icon />);
    //     return <div icon={$$createCompNode(JSX_Icon)}></div>;
    //   });"
    // `);
  });

  // TODO: Fix this test
  it('should work with jsx slice in function', () => {
    // function App() {
    //   const fn = ([x, y, z]) => {
    //     return <div>{x}, {y}, {z}</div>
    //   }
    //
    //   return <div>{fn([1, 2, 3])}</div>
    // }
  });

  it('should not transform jsx in return of arrow for, transform jsx not in return of arrow', () => {
    // expect(
    //   mock(`
    //   function Colors() {
    //     const colors = ['red', 'green', 'blue'];
    //     return (
    //    <ul>
    //         <for each={colors}>{color => {
    //           const fn = (color) => {
    //             return <div>{color}</div> // should be transformed
    //           }
    //           return <li>{fn(color)}</li>  // should not transformed
    //         }}</for>
    //       </ul>
    //     );
    //   }
    // `)
    // ).toMatchInlineSnapshot(`
    //   "const App = Component(() => {
    //     const JSX_Fragment = Component(() => <>{test}</>);
    //     const a = $$createCompNode(JSX_Fragment);
    //     const JSX_Fragment2 = Component(() => <><div></div></>);
    //     const JSX_Fragment3 = Component(() => <><span></span></>);
    //     const b = cond ? $$createCompNode(JSX_Fragment2) : $$createCompNode(JSX_Fragment3);
    //   });"
    // `);
  });

  it('should transform jsx in arrow', () => {
    // expect(
    //   mock(`
    //   function Colors() {
    //     return (
    //       <App render={(color) => <ul><li>{color}</li></ul>
    //       }>
    //       </App>
    //     );
    //   }
    // `)
    // ).toMatchInlineSnapshot(`
    //   "const Colors = Component(() => {
    //     const colors = ['red', 'green', 'blue'];
    //     return <ul>
    //               <for each={colors}>{color => {
    //           const fn = color => {
    //             const JSX_div = Component(() => <div>{color}</div>);
    //             return $$createCompNode(JSX_div); // should be transformed
    //           };
    //           return <li>{fn(color)}</li>; // should not transformed
    //         }}</for>
    //             </ul>;
    //   });"
    // `);
  });
  it('should transform jsx in return', () => {
    expect(
      mock(`
      function Colors() {
        return (
          <App render={(color) => {
            return  <ul><li>{color}</li></ul>;
          }
          }>
          </App>
        );
      }
    `)
    ).toMatchInlineSnapshot(`
      "const Colors = Component(() => {
        return <App render={color => {
          const JSX_ul = Component(() => <ul><li>{color}</li></ul>);
          return $$createCompNode(JSX_ul);
        }}>
                </App>;
      });"
    `);
  });
  it('should not transform jsx of arrow in for', () => {
    // expect(
    //   mock(`
    //   function App() {
    //   const arr = [0, 1, 2];
    //   return <for each={arr}>{item => <div>{item}</div>}</for>;
    // }
    // `)
    // ).toMatchInlineSnapshot(`
    //   "const Colors = Component(() => {
    //     return <App render={color => {
    //       const JSX_ul = Component(() => <ul><li>{color}</li></ul>);
    //       return $$createCompNode(JSX_ul);
    //     }}>
    //             </App>;
    //   });"
    // `);
  });

  it('should not transform jsx of arrow in map', () => {
    expect(
      mock(`
      function MyComp() {
      const arr = [1, 2, 3];
      return (
        <>
          {arr.map(item =>
            <div>{item}</div>
          )}
        </>
      );
    }
    `)
    ).toMatchInlineSnapshot(`
      "const MyComp = Component(() => {
        const arr = [1, 2, 3];
        return <>
                <for each={arr}>{item => <div>{item}</div>}</for>
              </>;
      });"
    `);
  });

  it('should not transform jsx in return of component', () => {
    // expect(
    //   mock(`
    //   const Folder = ({ name, children }) => {
    //     const { level } = useContext(FileContext);
    //     return (
    //       <FileContext level={level + 1}>
    //         <div>
    //           <h1>{\`Folder: ${name}, level:\`}</h1>
    //           {children}
    //         </div>
    //       </FileContext>
    //     );
    //   };
    // `)
    // ).toMatchInlineSnapshot(`
    //   "const Folder = Component(({
    //     name,
    //     children
    //   }) => {
    //     const {
    //       level
    //     } = useContext(FileContext);
    //     return <FileContext level={level + 1}>
    //               <div>
    //                 <h1>{\`Folder: , level:\`}</h1>
    //                 {children}
    //               </div>
    //             </FileContext>;
    //   });"
    // `);
  });
});
