import * as Horizon from '@cloudsop/horizon/index.ts';
import { clearStore, createStore, useStore } from '../../../../libs/horizon/src/horizonx/store/StoreHandler';
import { Text, triggerClickEvent } from '../../jest/commonComponents';
import { getObserver } from '../../../../libs/horizon/src/horizonx/proxy/ProxyHandler';

describe('测试 Class VNode 清除时，对引用清除', () => {
  const { unmountComponentAtNode } = Horizon;
  let container = null;
  let globalState = {
    name: 'bing dun dun',
    isWin: true,
    isShow: true,
  };

  beforeEach(() => {
    // 创建一个 DOM 元素作为渲染目标
    container = document.createElement('div');
    document.body.appendChild(container);

    createStore({
      id: 'user',
      state: globalState,
      actions: {
        setWin: (state, val) => {
          state.isWin = val;
        },
        hide: state => {
          state.isShow = false;
        },
        updateName: (state, val) => {
          state.name = val;
        },
      },
    });
  });

  afterEach(() => {
    // 退出时进行清理
    unmountComponentAtNode(container);
    container.remove();
    container = null;

    clearStore('user');
  });

  it('test observer.clearByNode', () => {
    class App extends Horizon.Component {
      userStore = useStore('user');

      render() {
        return (
          <div>
            <button id={'hideBtn'} onClick={this.userStore.hide}>
              toggle
            </button>
            {this.userStore.isShow && <Parent />}
          </div>
        );
      }
    }

    class Parent extends Horizon.Component {
      userStore = useStore('user');

      setWin = () => {
        this.userStore.setWin(!this.userStore.isWin);
      };

      render() {
        return (
          <div>
            <button id={'toggleBtn'} onClick={this.setWin}>
              toggle
            </button>
            {this.userStore.isWin && <Child />}
          </div>
        );
      }
    }

    class Child extends Horizon.Component {
      userStore = useStore('user');

      render() {
        // this.userStore.updateName(this.userStore.name === 'bing dun dun' ? 'huo dun dun' : 'bing dun dun');

        return (
          <div>
            <Text id={'name'} text={`name: ${this.userStore.name}`} />
            <Text id={'isWin'} text={`isWin: ${this.userStore.isWin}`} />
          </div>
        );
      }
    }

    Horizon.render(<App />, container);

    // Parent and Child hold the isWin key
    expect(getObserver(globalState).keyVNodes.get('isWin').size).toBe(2);

    Horizon.act(() => {
      triggerClickEvent(container, 'toggleBtn');
    });
    // Parent hold the isWin key
    expect(getObserver(globalState).keyVNodes.get('isWin').size).toBe(1);

    Horizon.act(() => {
      triggerClickEvent(container, 'toggleBtn');
    });
    // Parent and Child hold the isWin key
    expect(getObserver(globalState).keyVNodes.get('isWin').size).toBe(2);

    Horizon.act(() => {
      triggerClickEvent(container, 'hideBtn');
    });
    // no component hold the isWin key
    expect(getObserver(globalState).keyVNodes.get('isWin')).toBe(undefined);
  });
});
