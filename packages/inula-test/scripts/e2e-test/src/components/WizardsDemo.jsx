import React from 'react';
import { Button, Wizards } from '@cloudsop/eview-ui';

export default class WizardsDemo extends React.Component {

  state = {
    index: 1,
    disabled: false
  };
  next = () => {
    this.setState({
      index: this.state.index + 1
    })
  };
  pre = () => {
    this.setState({
      index: this.state.index - 1
    })
  };

  data = [{ text: 'Basic Information', value: '1' }, { text: 'Condition', value: '2' }, { text: 'Action', value: '3' }]
  render() {
    const param = {
      data: this.data,
      currentStep: this.data[this.state.index].value
    };
    const { disabled } = this.state
    return (
      <div style={{ marginLeft: '20px' }}>
        <Wizards {...param} className="eui_wizard_container_sm" disabled={disabled} /><br />
        <Button onClick={() => this.setState({ disabled: !disabled })} text={'disabled'} style={{ marginRight: '20px' }}>disabled</Button>
        <Button onClick={this.pre} text={'Previous'} style={{ marginRight: '20px' }} disabled={this.state.index === 0 || disabled} />
        <Button onClick={this.next} text={'Next'} disabled={this.state.index === this.data.length - 1 || disabled} />
      </div>
    )
  }
}
