/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import { useIntl } from "../../index";

const Example6Child = (props: any) => {

  const {formatMessage} = useIntl();

  return (
    <div className="card">
      <h2>RawIntlProvider方式测试Demo</h2>
      <pre>{formatMessage({ id: 'text4' })}</pre>
    </div>
  );
}

export default Example6Child;
