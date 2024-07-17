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
import { useContext, useMemo } from 'openinula';
import utils from '../../utils/utils';
import { I18nContext } from '../components/InjectI18n';
import I18n from '../I18n';
import { IntlType } from '../../types/types';

/**
 *  useI18n hook，与 Inula 组件一起使用。
 *  使用 useI18n 钩子函数可以更方便地在函数组件中进行国际化操作
 */
function useI18n(): IntlType {
  const i18n = useContext<I18n>(I18nContext);
  utils.isVariantI18n(i18n);
  return useMemo(() => {
    return {
      i18n: i18n,
      locale: i18n.locale,
      messages: i18n.messages,
      defaultLocale: i18n.defaultLocale,
      timeZone: i18n.timeZone,
      onError: i18n.onError,
      formatMessage: i18n.formatMessage.bind(i18n),
      formatNumber: i18n.formatNumber.bind(i18n),
      formatDate: i18n.formatDate.bind(i18n),
      $t: i18n.formatMessage.bind(i18n),
    };
  }, [i18n]);
}

export default useI18n;
