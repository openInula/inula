import React from 'react';
import { DivMessage, Tree } from '@cloudsop/eview-ui';


export default class TreeExample extends React.Component {

  state = {
    checkedKeys: [],
    selectedKeys: [1],
    expandedKeys: [1],
    msg: ''
  };

  handleSelect = (selectedKeys, node, event) => {
    let eventType = event.type;
    this.setState({ selectedKeys: selectedKeys, msg: `OnSelect event callback: node id is ${node.props.eventKey}, event type is ${eventType}` });
  };

  handleCheck = (checkedKeys, node) => {
    this.setState({ checkedKeys: checkedKeys, msg: 'OnCheck event callback: node id is' + node.props.eventKey });
  };

  handleExpand = (expandedKeys, node) => {
    this.setState({ expandedKeys: expandedKeys, msg: 'OnExpand event callback: node id is' + node.props.eventKey });
  };

  render() {
    let data = [
      {
        text: 'Root Node', id: 1,
        children: [
          {
            text: 'Subnet0', id: 11,
            children: [
              {
                text: 'NE_1', id: 21,
                children: [
                  { text: 'NE_1', id: 31 },
                  { text: 'NE_2', id: 32 }]
              },
              { text: 'NE_2', id: 22 }]
          },
          {
            text: 'NE_3', id: 12,
            children: [
              { text: 'NE_1', id: 23 },
              { text: 'NE_2', id: 24 }]
          }]
      }
    ];
    return (
      <div>
        <Tree
          data={data}
          nodeKey={'id'}
          enableCheckbox={true}
          onSelect={this.handleSelect}
          onCheck={this.handleCheck}
          onExpand={this.handleExpand}
          checkedKeys={this.state.checkedKeys}
          selectedKeys={this.state.selectedKeys}
          style={{ width: '400px', height: '600px' }}
          expandedKeys={this.state.expandedKeys}
          treeTextStyle={{ width: '400px' }}
        />
        {this.state.msg ? <DivMessage text={this.state.msg} type="success" style={{ marginTop: '10px', width: '560px' }} /> : ''}
      </div>);
  }
}
