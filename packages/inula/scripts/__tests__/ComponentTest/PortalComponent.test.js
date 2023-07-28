/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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
import { getLogUtils } from '../jest/testUtils';
import dispatchChangeEvent from '../utils/dispatchChangeEvent';

describe('PortalComponent Test', () => {
  const LogUtils = getLogUtils();

  it('将子节点渲染到存在于父组件以外的 DOM 节点', () => {
    const portalRoot = document.createElement('div');

    class PortalApp extends Inula.Component {
      constructor(props) {
        super(props);
        this.element = portalRoot;
      }

      render() {
        return Inula.createPortal(this.props.child, this.element);
      }
    }

    Inula.render(<PortalApp child={<div>PortalApp</div>} />, container);
    expect(container.textContent).toBe('');
    // <div>PortalApp</div>被渲染到了portalRoot而非container
    expect(portalRoot.textContent).toBe('PortalApp');

    Inula.unmountComponentAtNode(container);
    expect(container.textContent).toBe('');
    expect(portalRoot.textContent).toBe('');
  });

  it('渲染多个Portal', () => {
    const portalRoot1st = document.createElement('div');
    const portalRoot2nd = document.createElement('div');

    class PortalApp extends Inula.Component {
      constructor(props) {
        super(props);
        this.element = portalRoot1st;
        this.newElement = portalRoot2nd;
      }

      render() {
        return [
          Inula.createPortal(this.props.child, this.element),
          Inula.createPortal(this.props.child, this.newElement),
        ];
      }
    }

    Inula.render(<PortalApp child={<div>PortalApp</div>} />, container);
    expect(container.textContent).toBe('');
    // <div>PortalApp</div>被渲染到了portalRoot而非container
    expect(portalRoot1st.textContent).toBe('PortalApp');
    expect(portalRoot2nd.textContent).toBe('PortalApp');

    Inula.unmountComponentAtNode(container);
    expect(container.textContent).toBe('');
    expect(portalRoot1st.textContent).toBe('');
    expect(portalRoot2nd.textContent).toBe('');
  });

  it('渲染最近的Portal', () => {
    const portalRoot1st = document.createElement('div');
    const portalRoot2nd = document.createElement('div');
    const portalRoot3rd = document.createElement('div');

    class PortalApp extends Inula.Component {
      constructor(props) {
        super(props);
        this.element = portalRoot1st;
        this.newElement = portalRoot2nd;
        this.element3rd = portalRoot3rd;
      }

      render() {
        return [
          <div>PortalApp1st</div>,
          Inula.createPortal(
            [<div>PortalApp4</div>, Inula.createPortal(this.props.child, this.element3rd)],
            this.element
          ),
          <div>PortalApp2nd</div>,
          Inula.createPortal(this.props.child, this.newElement),
        ];
      }
    }

    Inula.render(<PortalApp child={<div>PortalApp</div>} />, container);
    expect(container.textContent).toBe('PortalApp1stPortalApp2nd');
    // <div>PortalApp4</div>会挂载在this.element上
    expect(portalRoot1st.textContent).toBe('PortalApp4');
    expect(portalRoot2nd.textContent).toBe('PortalApp');
    expect(portalRoot3rd.textContent).toBe('PortalApp');

    Inula.unmountComponentAtNode(container);
    expect(container.textContent).toBe('');
    expect(portalRoot1st.textContent).toBe('');
    expect(portalRoot2nd.textContent).toBe('');
  });

  it('改变Portal的参数', () => {
    const portalRoot = document.createElement('div');

    class PortalApp extends Inula.Component {
      constructor(props) {
        super(props);
        this.element = portalRoot;
      }

      render() {
        return Inula.createPortal(this.props.child, this.element);
      }
    }

    Inula.render(<PortalApp key="portal" child={<div>PortalApp</div>} />, container);
    expect(container.textContent).toBe('');
    expect(portalRoot.textContent).toBe('PortalApp');

    Inula.render(<PortalApp key="portal" child={<div>AppPortal</div>} />, container);
    expect(container.textContent).toBe('');
    expect(portalRoot.textContent).toBe('AppPortal');

    Inula.render(<PortalApp key="portal" child={['por', 'tal']} />, container);
    expect(container.textContent).toBe('');
    expect(portalRoot.textContent).toBe('portal');

    Inula.render(<PortalApp key="portal" child={null} />, container);
    expect(container.textContent).toBe('');
    expect(portalRoot.textContent).toBe('');

    Inula.unmountComponentAtNode(container);
    expect(container.textContent).toBe('');
    expect(portalRoot.textContent).toBe('');
  });

  it('通过Portal进行事件冒泡', () => {
    const portalRoot = document.createElement('div');
    const buttonRef = Inula.createRef();

    class PortalApp extends Inula.Component {
      constructor(props) {
        super(props);
        this.element = portalRoot;
      }

      render() {
        return Inula.createPortal(this.props.child, this.element);
      }
    }

    const Child = () => {
      return (
        <div>
          <button ref={buttonRef}>Click</button>
        </div>
      );
    };

    const App = () => {
      const handleClick = () => {
        LogUtils.log('bubble click event');
      };

      const handleCaptureClick = () => {
        LogUtils.log('capture click event');
      };

      return (
        <div onClickCapture={handleCaptureClick()} onClick={handleClick()}>
          <PortalApp child={<Child />}></PortalApp>
        </div>
      );
    };
    Inula.render(<App />, container);
    const event = document.createEvent('Event');
    event.initEvent('click', true, true);
    buttonRef.current.dispatchEvent(event);

    expect(LogUtils.getAndClear()).toEqual([
      // 从外到内先捕获再冒泡
      'capture click event',
      'bubble click event',
    ]);
  });

  it('Create portal at app root should not add event listener multiple times', () => {
    const btnRef = Inula.createRef();

    class PortalApp extends Inula.Component {
      constructor(props) {
        super(props);
      }

      render() {
        return Inula.createPortal(this.props.child, container);
      }
    }

    const onClick = jest.fn();

    class App extends Inula.Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div>
            <button onClick={onClick} ref={btnRef}></button>
            <PortalApp />
          </div>
        );
      }
    }

    Inula.render(<App />, container);
    btnRef.current.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('#76 Portal onChange should activate', () => {
    class Dialog extends Inula.Component {
      node;

      constructor(props) {
        super(props);
        this.node = window.document.createElement('div');
        window.document.body.appendChild(this.node);
      }

      render() {
        return Inula.createPortal(this.props.children, this.node);
      }
    }

    let showPortalInput;
    const fn = jest.fn();
    const inputRef = Inula.createRef();

    function App() {
      const Input = () => {
        const [show, setShow] = Inula.useState(false);
        showPortalInput = setShow;

        Inula.useEffect(() => {
          setTimeout(() => {
            setShow(true);
          }, 0);
        }, []);

        if (!show) {
          return null;
        }

        return <input onChange={fn} ref={inputRef} />;
      };

      return (
        <div>
          <Dialog>
            <Input />
          </Dialog>
        </div>
      );
    }

    Inula.render(<App />, container);
    showPortalInput(true);
    jest.advanceTimersToNextTimer();
    dispatchChangeEvent(inputRef.current, 'test');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
