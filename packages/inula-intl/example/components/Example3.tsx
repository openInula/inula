/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import Inula from 'inulajs';
import { FormattedMessage } from "../../index";

const Example3 = (props) => {
  const { locale, setLocale } = props;
  return (
    <div className="card">
      <h2>FormattedMessage方式测试Demo</h2>
      <pre>
          <button className="testButton" onClick={() => {
            setLocale(locale === 'zh' ? 'en' : 'zh')
          }}>
          <FormattedMessage id={'button'}/>
        </button>
        <br/>
        </pre>
    </div>
  );
}

export default Example3;
