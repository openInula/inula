import Inula, { computed, createRef, reactive, render } from '../../../src/index';

describe('测试 computed', () => {
  it('在class组件render中使用computed', () => {
    let rObj;
    let appInst;
    const ref = createRef();
    const fn = jest.fn();

    class App extends Inula.Component {
      constructor(props) {
        super(props);

        appInst = this;

        this.state = {
          name: 1,
        };

        this._rObj = reactive(1);
        rObj = this._rObj;
      }

      render() {
        const computedVal = computed(() => {
          fn();
          return this._rObj.get() + '!!!';
        });

        return <div ref={ref}>{computedVal}</div>;
      }
    }

    render(<App />, container);
    expect(ref.current.innerHTML).toEqual('1!!!'); // computed执行2次
    expect(fn).toHaveBeenCalledTimes(1);
    rObj.set('2');
    expect(ref.current.innerHTML).toEqual('2!!!');
    expect(fn).toHaveBeenCalledTimes(2); // computed执行2次

    // 触发组件重新渲染
    appInst.setState({ name: 2 });

    expect(fn).toHaveBeenCalledTimes(3); // 生成新的一个computation，再执行了1次，computed总共执行3次

    rObj.set('3');
    expect(ref.current.innerHTML).toEqual('3!!!');

    expect(fn).toHaveBeenCalledTimes(5); // 两个computation各执行了一次，computed总共执行5次
  });
});
