/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

import * as Horizon from '@cloudsop/horizon/index.ts';
import * as Renderer from '../../../libs/horizon/src/renderer/Renderer';
import { doc } from 'prettier';

describe('EnterLeaveEventPlugin', () => {
  let container;

  beforeEach(() => {
    jest.resetModules();
    // The container has to be attached for events to fire.
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('should set onMouseLeave relatedTarget properly in iframe', () => {
    const iframe = document.createElement('iframe');
    container.appendChild(iframe);
    const iframeDocument = iframe.contentDocument;
    iframeDocument.write(
      '<!DOCTYPE html><html><head></head><body><div></div></body></html>',
    );
    iframeDocument.close();

    const leaveEvents = [];
    const node = Horizon.render(
      <div
        onMouseLeave={e => {
          e.persist();
          leaveEvents.push(e);
        }}
      />,
      iframeDocument.body.getElementsByTagName('div')[0],
    );

    node.dispatchEvent(
      new MouseEvent('mouseout', {
        bubbles: true,
        cancelable: true,
        relatedTarget: iframe.contentWindow,
      }),
    );

    expect(leaveEvents.length).toBe(1);
    expect(leaveEvents[0].target).toBe(node);
    expect(leaveEvents[0].relatedTarget).toBe(iframe.contentWindow);
  });

  it('should set onMouseEnter relatedTarget properly in iframe', () => {
    const iframe = document.createElement('iframe');
    container.appendChild(iframe);
    const iframeDocument = iframe.contentDocument;
    iframeDocument.write(
      '<!DOCTYPE html><html><head></head><body><div></div></body></html>',
    );
    iframeDocument.close();

    const enterEvents = [];
    const node = Horizon.render(
      <div
        onMouseEnter={e => {
          e.persist();
          enterEvents.push(e);
        }}
      />,
      iframeDocument.body.getElementsByTagName('div')[0],
    );

    node.dispatchEvent(
      new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        relatedTarget: null,
      }),
    );

    expect(enterEvents.length).toBe(1);
    expect(enterEvents[0].target).toBe(node);
    expect(enterEvents[0].relatedTarget).toBe(iframe.contentWindow);
  });

  // Regression test for https://github.com/facebook/Horizon/issues/10906.
  it('should find the common parent after updates', () => {
    let parentEnterCalls = 0;
    let childEnterCalls = 0;
    let parent = null;

    class Parent extends Horizon.Component {
      render() {
        return (
          <div
            onMouseEnter={() => parentEnterCalls++}
            ref={node => (parent = node)}>
            {this.props.showChild && (
              <div onMouseEnter={() => childEnterCalls++}/>
            )}
          </div>
        );
      }
    }

    Horizon.render(<Parent/>, container);
    // The issue only reproduced on insertion during the first update.
    Horizon.render(<Parent showChild={true}/>, container);

    // Enter from parent into the child.
    parent.dispatchEvent(
      new MouseEvent('mouseout', {
        bubbles: true,
        cancelable: true,
        relatedTarget: parent.firstChild,
      }),
    );

    // Entering a child should fire on the child, not on the parent.
    expect(childEnterCalls).toBe(1);
    expect(parentEnterCalls).toBe(0);
  });

  it('should call mouseEnter once from sibling rendered inside a rendered component', done => {
    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();
    const mockFn3 = jest.fn();

    class Parent extends Horizon.Component {
      constructor(props) {
        super(props);
        this.parentEl = Horizon.createRef();
      }

      componentDidMount() {
        Horizon.render(<MouseEnterDetect/>, this.parentEl.current);
      }

      render() {
        return <div ref={this.parentEl} id="parent" onMouseLeave={mockFn3}/>;
      }
    }

    class MouseEnterDetect extends Horizon.Component {
      constructor(props) {
        super(props);
        this.firstEl = Horizon.createRef();
        this.siblingEl = Horizon.createRef();
      }

      componentDidMount() {
        this.siblingEl.current.dispatchEvent(
          new MouseEvent('mouseout', {
            bubbles: true,
            cancelable: true,
            relatedTarget: this.firstEl.current,
          }),
        );
        expect(mockFn1.mock.calls.length).toBe(1);
        expect(mockFn2.mock.calls.length).toBe(1);
        expect(mockFn3.mock.calls.length).toBe(0);
        done();
      }

      render() {
        return (
          <Horizon.Fragment>
            <div ref={this.firstEl} id="first" onMouseEnter={mockFn1}/>
            <div ref={this.siblingEl} id="sibling" onMouseLeave={mockFn2}/>
          </Horizon.Fragment>
        );
      }
    }

    Horizon.render(<Parent/>, container);
  });

  it('should call mouseEnter when pressing a non tracked Horizon node', done => {
    const mockFn = jest.fn();

    class Parent extends Horizon.Component {
      constructor(props) {
        super(props);
        this.parentEl = Horizon.createRef();
      }

      componentDidMount() {
        Horizon.render(<MouseEnterDetect/>, this.parentEl.current);
      }

      render() {
        return <div ref={this.parentEl}/>;
      }
    }

    class MouseEnterDetect extends Horizon.Component {
      constructor(props) {
        super(props);
        this.divRef = Horizon.createRef();
        this.siblingEl = Horizon.createRef();
      }

      componentDidMount() {
        const attachedNode = document.createElement('div');
        this.divRef.current.appendChild(attachedNode);
        attachedNode.dispatchEvent(
          new MouseEvent('mouseout', {
            bubbles: true,
            cancelable: true,
            relatedTarget: this.siblingEl.current,
          }),
        );
        expect(mockFn.mock.calls.length).toBe(1);
        done();
      }

      render() {
        return (
          <div ref={this.divRef}>
            <div ref={this.siblingEl} onMouseEnter={mockFn}/>
          </div>
        );
      }
    }

    Horizon.render(<Parent/>, container);
  });

  it('should work with portals outside of the root that has onMouseLeave', () => {
    const divRef = Horizon.createRef();
    const onMouseLeave = jest.fn();

    function Component() {
      return (
        <div onMouseLeave={onMouseLeave} id="parent">
          {Horizon.createPortal(<div ref={divRef} id="sub"/>, document.body)}
        </div>
      );
    }

    Horizon.render(<Component/>, container);

    // Leave from the portal div
    divRef.current.dispatchEvent(
      new MouseEvent('mouseout', {
        bubbles: true,
        cancelable: true,
        relatedTarget: document.body,
      }),
    );

    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('should work with portals that have onMouseEnter outside of the root ', () => {
    const divRef = Horizon.createRef();
    const otherDivRef = Horizon.createRef();
    const onMouseEnter = jest.fn();

    function Component() {
      return (
        <div ref={divRef}>
          {Horizon.createPortal(
            <div ref={otherDivRef} onMouseEnter={onMouseEnter}/>,
            document.body,
          )}
        </div>
      );
    }

    Horizon.render(<Component/>, container);

    // Leave from the portal div
    divRef.current.dispatchEvent(
      new MouseEvent('mouseout', {
        bubbles: true,
        cancelable: true,
        relatedTarget: otherDivRef.current,
      }),
    );

    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });
});


