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

function TrafficLight() {
  let lightIndex = 0;

  let light = lightIndex ? 'green' : 'red';

  function nextLight() {
    lightIndex = (lightIndex + 1) % 2;
  }

  return (
    <>
      <button onClick={nextLight}>Next light</button>
      <p>Light is: {light}</p>
      <p>
        You must
        <if cond={light === 'red'}>
          <span>STOP</span>
        </if>
        <else-if cond={light === 'green'}>
          <span>GO</span>
        </else-if>
      </p>
    </>
  );
}

render(TrafficLight, document.getElementById('app'));
