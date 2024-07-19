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

const API_URL = 'https://jsonplaceholder.typicode.com/users';
const users = await (await fetch(API_URL)).json();
function List({ arr }) {
  return (
    <ul>
      <for each={arr}>{item => <li>{item.name}</li>}</for>
    </ul>
  );
}

function App() {
  return <List arr={users} />;
}

render(App, document.getElementById('app'));
