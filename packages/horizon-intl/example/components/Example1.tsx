/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import Inula from "inulajs";
import { useIntl } from "../../index";

const Example1 = () => {
  const { i18n } = useIntl();

  return (
    <div className="card">
      <h2>useIntl方式测试Demo</h2>
      <pre>{i18n.formatMessage({ id: 'text1' })}</pre>
    </div>
  );
};

export default Example1;
