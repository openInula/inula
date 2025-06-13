import { useMemo, useRef } from '@cloudsop/horizon';
import { AllMessages } from '../../intl/types/types';
import { useI18n } from './useI18n';
import { dealMsgArgs } from '../utils/utils';

export const useLocalMessage = (messages: AllMessages): any => {
  const instance = useI18n();
  const { t, formatMessage, path, on, locale } = instance;
  const currentLocale = useRef(locale);
  useMemo(() => {
    on('change', ({ locale }) => {
      currentLocale.current = locale;
    });
  }, []);
  const $t = (msgKey: string, values?: any) => {
    const currentMessages = messages[currentLocale.current] || {};
    const pathRet = path.getPathValue(currentMessages, msgKey);
    if (pathRet || currentMessages[msgKey]) {
      const msgId = pathRet !== null ? dealMsgArgs(pathRet, currentMessages, msgKey) : currentMessages[msgKey];
      return formatMessage(msgId, values);
    }
    return t(msgKey, values);
  };
  return { $t, t: $t };
};
