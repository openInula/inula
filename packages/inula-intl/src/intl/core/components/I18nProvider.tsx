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
import { useCallback, useEffect, useMemo, useState } from '@cloudsop/horizon';
import { InjectProvider } from './InjectI18n';
import { createI18nInstance, I18n } from '../I18n';
import { I18nProviderProps } from '../../types/types';
import VueI18n from '../../vueI18n-adapter/VueI18n';

/**
 * 用于为应用程序提供国际化的格式化功能，管理程序中的语言文本信息和本地化资源信息
 * @param props
 * @constructor
 */
const I18nProvider = (props: I18nProviderProps) => {
  // 使用 useMemo 创建或获取 i18n 实例
  const { locale, messages, i18n, children } = props;
  const i18nInstance = useMemo(() => {
    return i18n || createI18nInstance({ locale, messages });
  }, [i18n, locale, messages]);

  // 监听message和locale的变化
  const { currentLocale, currentMessages } = useI18nSync(i18nInstance);

  // 创建一个 memoized 的 context 值
  const contextValue = useMemo(
    () => ({
      ...i18nInstance,
      i18nInstance,
      locale: currentLocale,
      messages: currentMessages,
      changeLanguage: i18nInstance.changeLanguage,
      changeMessage: i18nInstance.changeMessage,
    }),
    [i18nInstance, currentLocale, currentMessages]
  );
  // 提供一个 Provider 组件
  return <InjectProvider value={contextValue}>{children}</InjectProvider>;
};

export const useI18nSync = (i18nInstance: VueI18n | I18n) => {
  const [currentLocale, setCurrentLocale] = useState(i18nInstance.locale);
  const [currentMessages, setCurrentMessages] = useState(i18nInstance.messages);

  const handleChange = useCallback(() => {
    if (currentLocale !== i18nInstance.locale) {
      setCurrentLocale(i18nInstance.locale);
    }
    if (currentMessages !== i18nInstance.messages) {
      setCurrentMessages(i18nInstance.messages);
    }
  }, [i18nInstance, currentLocale, currentMessages]);

  useEffect(() => {
    // 清理函数
    return i18nInstance.on('change', handleChange);
  }, [i18nInstance, handleChange]);

  return { currentLocale, currentMessages };
};

export default I18nProvider;
