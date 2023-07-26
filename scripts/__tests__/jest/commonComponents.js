/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Inula from '../../../libs/inula/index';
import { getLogUtils } from './testUtils';

export const App = props => {
  const Parent = props.parent;
  const Child = props.child;

  return (
    <div>
      <Parent>
        <Child />
      </Parent>
    </div>
  );
};

export const Text = props => {
  const LogUtils = getLogUtils();
  LogUtils.log(props.text);
  return <p id={props.id}>{props.text}</p>;
};

export function triggerClickEvent(container, id) {
  const event = new MouseEvent('click', {
    bubbles: true,
  });
  container.querySelector(`#${id}`).dispatchEvent(event);
}
