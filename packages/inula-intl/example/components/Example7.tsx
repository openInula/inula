/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import { useI18n } from '../../index';

const Example7 = () => {
  const { t } = useI18n();
  return (
    <div className="card">
      <h2>useI18n方式测试VueDemo</h2>
      <pre>{t({ id: 'hello' })}</pre>
    </div>
  );
};

export default Example7;
