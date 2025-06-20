/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import { useI18n } from '../../index';

const Example9 = () => {
  const localeMessage = {
    zh: {
      hello: '你好，世界！',
      selectAll: '全选',
    },
    en: {
      hello: 'Hello, world!',
      selectAll: 'select all',
    },
  };

  const { t, locale, changeLanguage, setLocalMessage } = useI18n();
  setLocalMessage('Example9', localeMessage);
  const handleChange2 = () => {
    changeLanguage(locale === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="card">
      <h2>局部message切换</h2>
      <pre>
        <p>{t('hello', {}, 'Example9')}</p>
        <p>{locale}</p>
      </pre>
      <div className="button">
        <button onClick={handleChange2}>切换语言</button>
      </div>
    </div>
  );
};

export default Example9;
