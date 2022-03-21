import * as Horizon from '@cloudsop/horizon/index.ts';

describe('useReducer Hook Test', () => {
  const { useReducer } = Horizon;

  it('简单使用useReducer', () => {
    const intlCar = { logo: '', price: 0 };
    let dispatch;
    const App = () => {
      const carReducer = (state, action) => {
        switch (action.logo) {
          case 'ford':
            return {
              ...intlCar,
              logo: 'ford',
              price: 76
            };
          case 'bmw':
            return {
              ...intlCar,
              logo: 'bmw',
              price: 100
            };
          case 'benz':
            return {
              ...intlCar,
              logo: 'benz',
              price: 80
            };
          default:
            return {
              ...intlCar,
              logo: 'audi',
              price: 88
            };
        }
      }
      const [car, carDispatch] = useReducer(carReducer, intlCar);
      dispatch = carDispatch;
      return (
        <div>
          <p>{car.logo}</p>
          <p id={'senP'}>{car.price}</p>
        </div>
      )
    }
    Horizon.render(<App />, container);
    expect(container.querySelector('p').innerHTML).toBe('');
    expect(container.querySelector('#senP').innerHTML).toBe('0');
    // 触发bmw
    dispatch({ logo: 'bmw' });
    expect(container.querySelector('p').innerHTML).toBe('bmw');
    expect(container.querySelector('#senP').innerHTML).toBe('100');
    // 触发carReducer里的switch的default项
    dispatch({ logo: 'wrong logo' });
    expect(container.querySelector('p').innerHTML).toBe('audi');
    expect(container.querySelector('#senP').innerHTML).toBe('88');
  });
});
