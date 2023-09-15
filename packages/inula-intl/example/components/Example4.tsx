/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import Inula from "@cloudsop/horizon";
import { createIntl } from "../../index";

const Example4 = (props) => {
  // 受渲染时机影响，createIntl方式需控制时序，否则慢一拍
  const intl = createIntl({ ...props });
  const msg = intl.formatMessage({ id: 'text3' });

  return (
    <div className="card">
      <h2>createIntl方式测试Demo</h2>
      <pre>{msg}</pre>
    </div>
  );
};

export default Example4;
