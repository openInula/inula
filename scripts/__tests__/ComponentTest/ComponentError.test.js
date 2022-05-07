import * as Horizon from '@cloudsop/horizon/index.ts';
import { getLogUtils } from '../jest/testUtils';

describe('Component Error Test', () => {
  const LogUtils = getLogUtils();
  it('createElement不能为null或undefined', () => {
    const NullElement = null;
    const UndefinedElement = undefined;

    jest.spyOn(console, 'error').mockImplementation();
    expect(() => {
      Horizon.render(<NullElement />, document.createElement('div'));
    }).toThrow('Component type is invalid, got: null');

    expect(() => {
      Horizon.render(<UndefinedElement />, document.createElement('div'));
    }).toThrow('Component type is invalid, got: undefined');

    const App = () => {
      return <AppChild />;
    };

    let AppChild = () => {
      return (
        <NullElement />
      );
    };

    expect(() => {
      Horizon.render(<App />, document.createElement('div'));
    }).toThrow('Component type is invalid, got: null');

    AppChild = () => {
      return (
        <UndefinedElement />
      );
    };
    
    expect(() => {
      Horizon.render(<App />, document.createElement('div'));
    }).toThrow('Component type is invalid, got: undefined');
  });
});