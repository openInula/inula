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
import { FormattedMessage } from '../../src/intl';

const Example2 = () => {
  return (
    <div className="card">
      <h2>FormattedMessage方式测试Demo</h2>
      <pre>
        <FormattedMessage id="text2" />
      </pre>
      <pre>
        <FormattedMessage id="text5" values={{ testComponent1: <b>123</b>, testComponent2: <b>456</b> }} />
      </pre>
    </div>
  );
};

export default Example2;
