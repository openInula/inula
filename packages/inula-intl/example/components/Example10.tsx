/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import { createIntl } from '../../index';

const Example10 = props => {
  // 受渲染时机影响，createIntl方式需控制时序，否则慢一拍
  const intl = createIntl({ ...props });
  const msg1 = intl.formatMessage({ id: 'text7' }, { value: 'female' });
  const msg2 = intl.formatMessage({ id: 'text6' }, { num: 100, total: 6000, list: 5000 });
  const msg3 = intl.formatMessage({ id: 'text7' }, { value: 'male' });
  const msg4 = intl.formatMessage({ id: 'text6' }, { num: 100, total: 100, list: 300 });
  const msg5 = intl.formatMessage({ id: 'text6' }, { num: 100, total: 60, list: 120 });
  return (
    <div className="card">
      <h2>复数形式测试Demo</h2>
      <pre>{msg1}</pre>
      <pre>{msg2}</pre>
      <pre>{msg3}</pre>
      <pre>{msg4}</pre>
      <pre>{msg5}</pre>
    </div>
  );
};

export default Example10;
