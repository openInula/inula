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

import { createIntl } from '../../src/intl';

const Example4 = props => {
  // 受渲染时机影响，createIntl方式需控制时序，否则慢一拍
  const intl = createIntl({ ...props });
  const msg1 = intl.formatMessage({ id: 'text3' });
  const msg2 = intl.formatMessage({ id: 'text6' }, { num: 100, total: 253, list: 456 });

  return (
    <div className="card">
      <h2>createIntl方式测试Demo</h2>
      <pre>{msg1}</pre>
      <pre>{msg2}</pre>
    </div>
  );
};

export default Example4;
