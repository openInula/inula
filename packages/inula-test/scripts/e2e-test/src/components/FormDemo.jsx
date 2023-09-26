import React, { useState } from 'react';
import { Form, TextField, RadioGroup, MultipleSelect, Toggle, GridLayout } from '@cloudsop/eview-ui';
const { Row, Col } = GridLayout;

export default function FormDemo() {
  const [name, setName] = useState('');
  const [toggle, setToggle] = useState(1);
  const [cellphone, setCellphone] = useState('');
  const [gender, setGender] = useState(1);
  const [category, setCategory] = useState([]);

  let props1 = {
    action: '',
    title: 'Single Column Form',
    style: {
      border: '1px solid #ccc',
    }
  };
  let textFiledProps = {
    name: 'name',
    label: 'Name:',
    required: true,
    value: name,
    className: 'eui_form_ctrl',
    onChange: v => setName(v)
  };
  let toggleProps = {
    name: 'toggle',
    label: 'toggleProps:',
    data: [1, 2],
    value: toggle,
    required: true,
    className: 'eui_form_ctrl',
    onChange: v => setToggle(v)
  };
  let numberTextFiledProps = {
    required: true,
    name: 'cellphone',
    label: 'Cellphone number:',
    value: cellphone,
    className: 'eui_form_ctrl',
    onChange: v => setCellphone(v)
  };
  let genderRadioGroupProps = {
    name: 'gender',
    value: gender,
    required: true,
    data: [{ value: 1, text: 'MALE' }, { value: 2, text: 'FEMALE' }],
    label: 'Gender:',
    className: 'eui_form_ctrl',
    onChange: v => setGender(v)
  };
  let categoryMultipleSelectProps = {
    name: 'category',
    label: 'category:',
    required: true,
    selectedValue: category,
    options: [
      { value: '1', text: 'The internet' },
      { value: '2', text: 'Network' },
      { value: '3', text: 'item 03' },
      { value: '4', text: 'item 04' },
      { value: '5', text: 'item 05' },
      { value: '6', text: 'item 06' },
      { value: '7', text: 'item 07' },
      { value: '8', text: 'item 08' },
      { value: '9', text: 'item 09' },
      { value: '10', text: 'item 10' }
    ],
    className: 'eui_form_ctrl',
    onChange: v => setCategory(v)
  };

  return (
    <div style={{ margin: '20px' }}>
      <Form {...props1}>
        <Row totalCols={12}>
          <Col cols={12}>
            <TextField {...textFiledProps} id="text-field1" />
          </Col>
        </Row>
        <Row totalCols={12}>
          <Col cols={12}>
            <RadioGroup {...genderRadioGroupProps} id="text-field2" />
          </Col>
        </Row>
        <Row totalCols={12}>
          <Col cols={12}>
            <MultipleSelect {...categoryMultipleSelectProps} id="multip-select1" />
          </Col>
        </Row>
        <Row totalCols={12}>
          <Col cols={12}>
            <TextField {...numberTextFiledProps} id="text-field3" />
          </Col>
        </Row>
        <Row totalCols={12}>
          <Col cols={12}>
            <Toggle {...toggleProps} id="toggle1" />
          </Col>
        </Row>
      </Form>
    </div>
  )
}
