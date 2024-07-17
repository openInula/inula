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
import { useRef, useState, useEffect, useMemo } from 'openinula';
import { InjectProvider } from './InjectI18n';
import I18n, { createI18nInstance } from '../I18n';
import { AllMessages, I18nProviderProps, Messages } from '../../types/types';

/**
 * 用于为应用程序提供国际化的格式化功能，管理程序中的语言文本信息和本地化资源信息
 * @param props
 * @constructor
 */
const I18nProvider = (props: I18nProviderProps) => {
  const { locale, messages, children, i18n } = props;

  const i18nInstance =
    i18n ||
    useMemo(() => {
      return createI18nInstance({
        locale: locale,
        messages: messages,
      });
    }, [locale, messages]);

  // 使用useRef保存上次的locale值
  const localeRef = useRef<string | undefined>(i18nInstance.locale);
  const localeMessage = useRef<string | Messages | AllMessages>(i18nInstance.messages);
  const [context, setContext] = useState<I18n>(i18nInstance);

  useEffect(() => {
    const handleChange = () => {
      if (localeRef.current !== i18nInstance.locale || localeMessage.current !== i18nInstance.messages) {
        localeRef.current = i18nInstance.locale;
        localeMessage.current = i18nInstance.messages;
        setContext(i18nInstance);
      }
    };
    const removeListener = i18nInstance.on('change', handleChange);

    // 手动触发一次 handleChange，以确保 context 的正确性
    handleChange();

    // 在组件卸载时取消事件监听
    return () => {
      removeListener();
    };
  }, [i18nInstance]);

  // 提供一个Provider组件
  return <InjectProvider value={context}>{children}</InjectProvider>;
};

export default I18nProvider;
