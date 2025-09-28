import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import FormComponent from './components/Form';
import { getFormConfig } from './tools/formTools';
import { callComponentTool, registerComponent } from './utils/ComponentRegistry';
import { Button, Input, Select } from 'antd';
import SelectComponent from './components/Select';
import { getSelectConfig } from './tools/selectTool';
function App() {
  const formRef=useRef(null);
  const selectRef=useRef(null);
  const [text,setText]=useState("")

  useEffect(()=>{
    const Formtools=getFormConfig();
    registerComponent(Formtools,formRef.current);
    const SelectTools=getSelectConfig();
    registerComponent(SelectTools,selectRef.current);
  },[])

  async function handleSubmit(){
    const response=await fetch("http://localhost:8000/api/execute",{
      method:"POST",
      headers:{
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        user_input:text
      })
    })
    if(!response.ok){
      const err=await response.json()
      console.log(err)
    }
    else{
      const responseData=await response.json()
      
      const results = [];
      for (const action of responseData.actions) {
        try {
          const result = await callComponentTool(
            action.component,
            action.tool,
            action.parameters
          );
          results.push({
            component: action.component,
            tool: action.tool,
            status: 'success',
            result
          });
        } catch (error:any) {
          results.push({
            component: action.component,
            tool: action.tool,
            status: 'error',
            error: error.message
          });
        }
      }

      console.log(results)
    }
  }

  return (
    <div className="App">
      <FormComponent ref={formRef}/>
      <SelectComponent ref={selectRef}/>
      <Input value={text} onChange={(e)=>{setText(e.target.value)}}></Input>
      <Button onClick={handleSubmit}>提交</Button>
    </div>
  );
}

export default App;
