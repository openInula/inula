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

import { useI18n } from '../../../src/vueI18n-adapter/src/hooks/useI18n';
import vueI18n from '../../../src/vueI18n-adapter/src/VueI18n';
import Inula from 'openinula';

// 模拟 createVueI18nInstance 函数
const createVueI18nInstance = jest.fn(options => new vueI18n(options));

// 导入并模拟被测试的模块
jest.mock('./i18nInstance', () => ({ createVueI18nInstance }));

describe('useI18n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Inula.useContext.mockReturnValue(null); // 默认没有 context
  });

  it('load useIntl when exit options with messages', () => {
    const i18n = useI18n({
      locale: 'en',
      messages: {
        en: {
          hello: 'hello!',
        },
      },
    });
    expect(i18n.t('hello')).toEqual('hello!');
  });

  it('load useIntl when exit options with messages1', () => {
    const i18n = useI18n({
      locale: 'en',
      messages: {
        hello: 'hello!',
      },
    });
    expect(i18n.t('hello')).toEqual('hello!');
  });

  it('should use context when available', () => {
    const contextI18n = new vueI18n({
      locale: 'fr',
      messages: { fr: { hello: 'bonjour!' } },
    });
    React.useContext.mockReturnValue(contextI18n);

    const i18n = useI18n();
    expect(i18n.t('hello')).toEqual('bonjour!');
  });
});
