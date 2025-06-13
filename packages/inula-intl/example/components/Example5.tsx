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

import { injectIntl } from '../../src/intl';

const Example5 = ({ intl }) => {
  // 使用intl.formatMessage来获取国际化消息
  return (
    <div className="card">
      <h2>injectIntl方式测试Demo</h2>
      <pre>{intl.formatMessage({ id: 'text4' })}</pre>
      <pre>{intl.formatMessage({ id: 'text6' }, { num: 100, total: 29639, list: 44 })}</pre>
    </div>
  );
};
export default injectIntl(Example5);
