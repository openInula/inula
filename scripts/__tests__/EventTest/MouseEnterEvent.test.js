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

import * as Inula from '../../../libs/inula/index';

describe('mouseenter和mouseleave事件测试', () => {
  let container;

  beforeEach(() => {
    jest.resetModules();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('在iframe中mouseleave事件的relateTarget属性', () => {
    const iframe = document.createElement('iframe');
    container.appendChild(iframe);
    const iframeDocument = iframe.contentDocument;
    iframeDocument.write(
      '<!DOCTYPE html><html><head></head><body><div></div></body></html>',
    );
    iframeDocument.close();

    const leaveEvents = [];
    const node = Inula.render(
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

  it('在iframe中mouseenter事件的relateTarget属性', () => {
    const iframe = document.createElement('iframe');
    container.appendChild(iframe);
    const iframeDocument = iframe.contentDocument;
    iframeDocument.write(
      '<!DOCTYPE html><html><head></head><body><div></div></body></html>',
    );
    iframeDocument.close();

    const enterEvents = [];
    const node = Inula.render(
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

  it('从新渲染的子组件触发mouseout事件，子组件响应mouseenter事件，父节点不响应', () => {
    let parentEnterCalls = 0;
    let childEnterCalls = 0;
    let parent = null;

    class Parent extends Inula.Component {
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

    Inula.render(<Parent/>, container);
    Inula.render(<Parent showChild={true}/>, container);

    parent.dispatchEvent(
      new MouseEvent('mouseout', {
        bubbles: true,
        cancelable: true,
        relatedTarget: parent.firstChild,
      }),
    );
    expect(childEnterCalls).toBe(1);
    expect(parentEnterCalls).toBe(0);
  });

  it('render一个新组件，兄弟节点触发mouseout事件，mouseenter事件响应一次', done => {
    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();
    const mockFn3 = jest.fn();

    class Parent extends Inula.Component {
      constructor(props) {
        super(props);
        this.parentEl = Inula.createRef();
      }

      componentDidMount() {
        Inula.render(<MouseEnterDetect/>, this.parentEl.current);
      }

      render() {
        return <div ref={this.parentEl} id="parent" onMouseLeave={mockFn3}/>;
      }
    }

    class MouseEnterDetect extends Inula.Component {
      constructor(props) {
        super(props);
        this.firstEl = Inula.createRef();
        this.siblingEl = Inula.createRef();
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
          <Inula.Fragment>
            <div ref={this.firstEl} id="first" onMouseEnter={mockFn1}/>
            <div ref={this.siblingEl} id="sibling" onMouseLeave={mockFn2}/>
          </Inula.Fragment>
        );
      }
    }

    Inula.render(<Parent/>, container);
  });

  it('未被inula管理的节点触发mouseout事件，mouseenter事件也能正常触发', done => {
    const mockFn = jest.fn();

    class Parent extends Inula.Component {
      constructor(props) {
        super(props);
        this.parentEl = Inula.createRef();
      }

      componentDidMount() {
        Inula.render(<MouseEnterDetect/>, this.parentEl.current);
      }

      render() {
        return <div ref={this.parentEl}/>;
      }
    }

    class MouseEnterDetect extends Inula.Component {
      constructor(props) {
        super(props);
        this.divRef = Inula.createRef();
        this.siblingEl = Inula.createRef();
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

    Inula.render(<Parent/>, container);
  });

  it('外部portal节点触发的mouseout事件，根节点的mouseleave事件也能响应', () => {
    const divRef = Inula.createRef();
    const onMouseLeave = jest.fn();

    function Component() {
      return (
        <div onMouseLeave={onMouseLeave} id="parent">
          {Inula.createPortal(<div ref={divRef} id="sub"/>, document.body)}
        </div>
      );
    }

    Inula.render(<Component/>, container);

    divRef.current.dispatchEvent(
      new MouseEvent('mouseout', {
        bubbles: true,
        cancelable: true,
        relatedTarget: document.body,
      }),
    );

    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('外部portal节点触发的mouseout事件，根节点的mouseEnter事件也能响应', () => {
    const divRef = Inula.createRef();
    const otherDivRef = Inula.createRef();
    const onMouseEnter = jest.fn();

    function Component() {
      return (
        <div ref={divRef}>
          {Inula.createPortal(
            <div ref={otherDivRef} onMouseEnter={onMouseEnter}/>,
            document.body,
          )}
        </div>
      );
    }

    Inula.render(<Component/>, container);

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


