/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import Inula, { useState } from 'inulajs';
import { IntlProvider } from "../index";
import zh from "./locale/zh";
import en from "./locale/en";
import Example1 from "./components/Example1";
import Example2 from "./components/Example2";
import Example3 from "./components/Example3";
import Example4 from "./components/Example4";
import Example5 from "./components/Example5";
import Example6 from "./components/Example6";

const App = () => {
  const [locale, setLocale] = useState('zh');
  const handleChange = () => {
    locale === 'zh' ? setLocale('en') : setLocale('zh');
  };
  const message = locale === 'zh' ? zh : en


    return (
    <IntlProvider locale={locale} messages={locale === 'zh' ? zh : en}>
      <header>Inula-Intl API Test Demo</header>

      <div className='container'>
        <Example1/>
        <Example2/>
        <Example3/>
      </div>
      <div className='container'>
        <Example4 locale={locale} messages={message}/>
        <Example5/>
        <Example6 locale={{ locale }} messages={message}/>
      </div>
      <div className='button'>
        <button onClick={handleChange}>切换语言</button>
      </div>
    </IntlProvider>
  );
}

export default App
