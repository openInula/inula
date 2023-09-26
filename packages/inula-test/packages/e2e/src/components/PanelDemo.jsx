import React from 'react';
import { DivMessage } from '@cloudsop/eview-ui';
import PanelE from '@cloudsop/eview-ui/Panel';
const { Panel, PanelItem } = PanelE;

export default class PanelEventExample extends React.Component {

  title = () => {
    return <div>Custom Title Area</div>
  };

  state = {
    selectedIndex: [0],
    msg: '',
  };

  handlePanelExpand = (index) => {
    this.setState({ msg: 'onExpand event callback on Panel, Index Id : ' + index,selectedIndex: [index]})
  };

  handlePanelClose = (index,e,collapsed) => {
    this.setState({ msg: 'onClose event callback on Panel, Index Id : ' + index + ' collpased : ' + collapsed, selectedIndex:[] })
  };

  render() {
    return (<div style={{ width: 500 }}>

      <Panel enableMultiExpand={true} selectedIndex={this.state.selectedIndex} onExpand={this.handlePanelExpand} onClose={this.handlePanelClose}>

        <PanelItem title={this.title()} >
          <div style={{ padding: 50 }}>Content of My Folding Panel 1</div>
        </PanelItem>

        <PanelItem title={this.title()}>
          <div style={{ padding: 50 }}>Content of My Folding Panel 2</div>
        </PanelItem>

      </Panel>

      {this.state.msg ? <DivMessage text={this.state.msg} type="success" style={{ marginTop: '10px', width: '600px' }} /> : ''}
    </div>)
  }

}
