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

import { useIntl } from '../../index';

const Example1 = () => {
  const i18n = useIntl();

  return (
    <div className="card">
      <h2>useIntl方式测试Demo</h2>
      <pre>{i18n.formatMessage({ id: 'text1' })}</pre>
      <pre>{i18n.$t({ id: 'text1' })}</pre>
    </div>
  );
};

export default Example1;
