/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { render } from '@openinula/next';
function Form() {
  let text = 'a';
  let checked = true;
  let picked = 'One';
  let selected = 'A';
  let multiSelected = [];
  function updateValue(e) {
    text = e.target.value;
  }
  function handleCheckboxChange(e) {
    checked = e.target.checked;
  }
  function handleRadioChange(e) {
    picked = e.target.value;
  }
  function handleSelectChange(e) {
    selected = e.target.value;
  }
  function handleMultiSelectChange(e) {
    multiSelected = Array.from(e.target.selectedOptions).map(option => option.value);
  }
  return (
    <>
      <h2>Text Input</h2>
      <input value={text} onInput={updateValue} />
      <p>{text}</p>

      <h2>Checkbox</h2>
      <input id="checkbox" type="checkbox" checked={checked} onChange={handleCheckboxChange} />
      <label for="checkbox"> Checked: {checked + ''}</label>

      <h2>Radio</h2>
      <input type="radio" id="one" value="One" name="num" checked={picked === 'One'} onChange={handleRadioChange} />
      <label for="one">One</label>
      <br />
      <input type="radio" id="two" value="Two" name="num" checked={picked === 'Two'} onChange={handleRadioChange} />
      <label for="two">Two</label>
      <p>Picked: {picked}</p>

      <h2>Select</h2>
      <select id="select" value={selected} onChange={handleSelectChange} style={{ width: '100px' }}>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
      </select>
      <p>Selected: {selected}</p>

      <h2>Multi Select</h2>
      <select multiple style={{ width: '100px' }} value={multiSelected} onChange={handleMultiSelectChange}>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
      </select>
      <p>Selected: {multiSelected}</p>
    </>
  );
}

render(Form, document.getElementById('app'));
