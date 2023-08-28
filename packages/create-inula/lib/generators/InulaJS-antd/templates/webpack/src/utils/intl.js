/**
 * 国际化，支持按需加载
 */

import Inula from 'inulajs';
import { createIntl, createIntlCache, FormattedMessage } from 'react-intl';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import enUS from 'antd/lib/locale-provider/en_US';
import ptBR from 'antd/lib/locale-provider/pt_BR';

import enMessage from '@/locales/en/messages';
import zhMessage from '@/locales/zh/messages';
import ptMessage from '@/locales/pt-br/messages';

const _langResource = {
  zh: { ...zhCN, ...zhMessage },
  en: { ...enUS, ...enMessage },
  'pt-br': { ...ptBR, ...ptMessage },
};

let _intl = null;

export const getLangResource = lan => {
  if (!_intl) {
    _intl = createIntl({ locale: lan, messages: _langResource[lan] }, createIntlCache());
  }

  return _langResource;
};

export const loadLangResource = async lan => {
  if (!_intl) {
    _intl = createIntl({ locale: lan, messages: _langResource[lan] }, createIntlCache());
  }

  const messages = await import(`@/locales/${lan}/messages`);

  Object.keys(messages.default).forEach(key => {
    _langResource[lan][key] = messages.default[key];
  });

  Object.assign(_intl.messages, _langResource[lan]);
};

export const t = (key, values) => {
  if (!key) {
    return;
  }

  return _intl.formatMessage({ id: key }, values) || key;
};

export const Trans = ({ children }) => {
  return <FormattedMessage id={children} />;
};
