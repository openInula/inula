/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

import { useI18n } from '../../src/vueI18n-adapter/src/hooks/useI18n';

const Example8 = () => {
  const { t, locale, changeLanguage } = useI18n();
  const sayHello = () => {
    alert(t('text1'));
  };
  const change = () => {
    changeLanguage(locale === 'zh' ? 'en' : 'zh');
  };
  return (
    <div className="card">
      <p>测试国际化组件</p>
      <p>{t('hello')}</p>
      <button onClick={sayHello}>{t('hello')}</button>
      <pre>
        <button onClick={change}> {t('change')}</button>
      </pre>
    </div>
  );
};

export default Example8;
