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

const Example3 = props => {
  const { locale, setLocale } = props;
  return (
    <div className="card">
      <h2>FormattedMessage方式测试Demo</h2>
      <pre>
        <button
          className="testButton"
          onClick={() => {
            setLocale(locale === 'zh' ? 'en' : 'zh');
          }}
        >
          <FormattedMessage id={'button'} />
        </button>
        <br />
      </pre>
    </div>
  );
};

export default Example3;
