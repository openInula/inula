/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React;
let ReactDOM;

describe('ReactDOMSelection', () => {
  beforeEach(() => {
    React = require('horizon-external');
    ReactDOM = require('horizon');
  });

  // Complicated example derived from a real-world DOM tree. Has a bit of
  // everything.
  function getFixture() {
    return ReactDOM.render(
      <div>
        <div>
          <div>
            <div>xxxxxxxxxxxxxxxxxxxx</div>
          </div>
          x
          <div>
            <div>
              x
              <div>
                <div>
                  <div>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
                  <div />
                  <div />
                  <div>xxxxxxxxxxxxxxxxxx</div>
                </div>
              </div>
            </div>
          </div>
          <div />
        </div>
        <div>
          <div>
            <div>
              <div>xxxx</div>
              <div>xxxxxxxxxxxxxxxxxxx</div>
            </div>
          </div>
          <div>xxx</div>
          <div>xxxxx</div>
          <div>xxx</div>
          <div>
            <div>
              <div>
                <div>{['x', 'x', 'xxx']}</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div>xxxxxx</div>
        </div>
      </div>,
      document.createElement('div'),
    );
  }

  it('returns correctly for fuzz test', () => {
    const fixtureRoot = getFixture();
    const allNodes = [fixtureRoot].concat(
      Array.from(fixtureRoot.querySelectorAll('*')),
    );
    expect(allNodes.length).toBe(27);
    allNodes.slice().forEach(element => {
      // Add text nodes.
      allNodes.push(
        ...Array.from(element.childNodes).filter(n => n.nodeType === 3),
      );
    });
    expect(allNodes.length).toBe(41);
  });
});
