/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import Horizon, {useRef, useState, useEffect, useMemo, Component} from 'inulajs';
import utils from '../../utils/utils';
import { InjectProvider } from './InjectI18n';
import { I18nProviderProps} from '../../types/interfaces';
import I18n, {createI18nInstance} from "../I18n";

/**
 * 用于为应用程序提供国际化的格式化功能，管理程序中的语言文本信息和本地化资源信息
 * @param props
 * @constructor
 */
const I18nProvider = (props: I18nProviderProps)=> {
  const { locale, messages, children } = props;

  const i18n = useMemo(() => {
    return createI18nInstance({
      locale: locale,
      messages: messages,
    });
  }, [locale, messages]);

  // 使用useRef保存上次的locale值
  const localeRef = useRef<string | undefined>(i18n.locale);

  const [context, setContext] = useState<I18n>(i18n);

  useEffect(() => {
    const handleChange = () => {
      if (localeRef.current !== i18n.locale) {
        localeRef.current = i18n.locale;
        setContext(i18n);
      }
    };
    let removeListener = i18n.on('change', handleChange);

    // 手动触发一次 handleChange，以确保 context 的正确性
    handleChange();

    // 在组件卸载时取消事件监听
    return () => {
      removeListener();
    };
  }, [i18n]);

  // 提供一个Provider组件
  return <InjectProvider value={context}>{children}</InjectProvider>;
};

export default I18nProvider;
