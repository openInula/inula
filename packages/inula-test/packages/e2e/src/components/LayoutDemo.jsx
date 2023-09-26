import React from 'react';
import { LabelField, Layout } from '@cloudsop/eview-ui';

export default function LayoutDemo() {
  let leftPanel = <div id="leftPanel" key="leftPanel" className={'eui_layout_fix'} style={{ background: '#ffffff', width: '200px' }} />;
  let rightPanel = <div id="rightPanel" key="rightPanel" style={{ background: '#ffffff' }} />;
  let topPanel = <div id="topPanel" key="topPanel" style={{ background: '#ffffff' }} />;
  let bottomPanel = <div id="bottomPanel" key="bottomPanel" style={{ background: '#ffffff' }} />;

  let horizontalLayout = <Layout type={'horizontal'} leftPanel={leftPanel} rightPanel={rightPanel} />
  let verticalLayout = <Layout type={'vertical'} leftPanel={topPanel} rightPanel={bottomPanel} />

  return (
    <div id="LayoutDemo" style={{ margin: '20px' }}>

      <LabelField text={'Type : Full'} />
      <div id="full" style={{ background: '#e8e8e8', height: '200px' }}>
        <Layout type={'full'} style={{ background: '#fff' }} />
      </div>

      <LabelField text={'Type : horizontal'} />
      <div id="horizontal" style={{ background: '#e8e8e8', height: '200px' }}>
        {horizontalLayout}
      </div>

      <LabelField text={'Type : vertical'} />
      <div id="vertical" style={{ background: '#e8e8e8', height: '200px' }}>
        {verticalLayout}
      </div>

      <LabelField text={'Combined Layout'} />
      <div id="Combined" style={{ background: '#e8e8e8', height: '200px' }}>
        <Layout type={'horizontal'}
          leftPanel={<div id="CombinedLeft" key="CombinedLeft" className={'eui_layout_fix'} style={{ background: '#fff', width: '100px', marginRight: '20px' }} />}
          rightPanel={verticalLayout} />
      </div>
    </div>
  );
}
