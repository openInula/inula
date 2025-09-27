import React from 'react';
import { FormComponent } from '@smart-components/react';

function TestApp() {
  return (
    <div>
      <h1>Test App</h1>
      <FormComponent 
        tools={['setFieldValue']}
        fields={[
          { name: 'test', label: '测试', type: 'text', required: true }
        ]}
      />
    </div>
  );
}

export default TestApp;