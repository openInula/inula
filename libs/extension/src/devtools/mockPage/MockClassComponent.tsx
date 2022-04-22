import { Component } from 'horizon';

const defaultState = {
  name: 'jenny',
  boolean: true,
};

export default class MockClassComponent extends Component<{fruit: string}, typeof defaultState> {

  state = defaultState;

  render() {
    return (
      <div>
        <button onClick={() => (this.setState({name: 'pika'}))} >update state</button>
        {this.state.name}
        {this.props?.fruit}
      </div>
    );
  }

}