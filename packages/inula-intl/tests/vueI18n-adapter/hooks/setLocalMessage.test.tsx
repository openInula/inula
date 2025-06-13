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

import { IntlProvider, useI18n } from '../../../src/intl';
import { render } from '../../testingLibrary/testingLibrary';
import VueI18n from '../../../src/vueI18n/VueI18n';
import { useLocalMessage } from '../../../src/vueI18n/hooks/useLocalMessage';

describe('setLocalMessage', () => {
  it('test cases for local messages should be preferred', () => {
    const vueI18n = new VueI18n({
      locale: 'zh',
      messages: {
        en: { hello: 'Hello', world: 'World' },
        zh: { hello: '你好', world: '世界' },
        es: { hello: '¡Hola!', world: 'mundo' },
      },
    });
    let $t;
    const FunctionComponent = () => {
      $t = useLocalMessage({
        en: { hello: 'Hi there!', component: 'MyComponent' },
        zh: { hello: '嗨！', component: '我的组件' },
      }).$t;
      expect($t('hello')).toEqual('嗨！'); // 输出: "Hi there!" (使用局部消息)
      expect(vueI18n.$t('world')).toEqual('世界'); // 输出: "World" (使用全局消息)

      vueI18n.changeLanguage('en');
      expect($t('hello')).toEqual('Hi there!'); // 输出: "Hi there!" (使用局部消息)
      expect(vueI18n.$t('world')).toEqual('World'); // 输出: "World" (使用全局消息)
      return <div></div>;
    };

    render(
      <IntlProvider locale="en" i18n={vueI18n}>
        <FunctionComponent />
      </IntlProvider>
    );
  });
});
