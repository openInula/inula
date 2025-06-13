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

import { useState } from '@cloudsop/horizon';
import { createI18n, I18nProvider, IntlProvider } from '../src/intl';
import zh from './locale/zh';
import en from './locale/en';
import Example1 from './components/Example1';
import Example2 from './components/Example2';
import Example3 from './components/Example3';
import Example4 from './components/Example4';
import Example5 from './components/Example5';
import Example6 from './components/Example6';
import Example7 from './components/Example7';
import Example8 from './components/Example8';
import Example9 from './components/Example9';
import Example10 from './components/Example10';

const App = () => {
  const [locale, setLocale] = useState('zh');
  const handleChange = () => {
    locale === 'zh' ? setLocale('en') : setLocale('zh');
  };

  const message = locale === 'zh' ? zh : en;

  const { global: i18n } = createI18n({
    locale: 'en',
    messages: {
      en: {
        hello: 'Welcome to vue-i18n internationalization',
        change: 'change',
      },
      zh: {
        hello: '欢迎使用vue-i18n国际化',
        change: '切换',
      },
    },
  });
  const handleChange1 = () => {
    i18n.locale = i18n.locale === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(i18n.locale);
  };

  return (
    <>
      <IntlProvider locale={locale} messages={locale === 'zh' ? zh : en}>
        <header>Inula-Intl API Test Demo</header>
        <div className="container">
          <Example1 />
          <Example2 />
          <Example3 locale={locale} setLocale={setLocale} />
          <Example5 />
        </div>
        <div className="button">
          <button onClick={handleChange}>切换语言</button>
        </div>
      </IntlProvider>
      <div className="container">
        <Example4 locale={locale} messages={message} />
        <Example6 locale={{ locale }} messages={message} />
        <Example10 locale={{ locale }} messages={message} />
      </div>
      <div className="container">
        <I18nProvider i18n={i18n}>
          <Example7 />
          <Example8 />
        </I18nProvider>
      </div>
      <div className="container">
        <I18nProvider i18n={i18n}>
          <Example9 />
        </I18nProvider>
      </div>
      <div className="button">
        <button onClick={handleChange1}>切换语言</button>
      </div>
    </>
  );
};

export default App;
