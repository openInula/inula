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
import utils, { createI18nProps } from '../../utils/utils';
import { I18nContext } from '../components/InjectI18n';
import I18n from '../I18n';

/**
 *  useI18n hook，与 Inula 组件一起使用。
 *  使用 useI18n 钩子函数可以更方便地在函数组件中进行国际化操作
 */
function useIntl(): any {
  const ContextI18n = useContext<any>(I18nContext);

  // 用于兼容通过createI18n对象直接创建一个I18n实例.
  const i18nInstance = ContextI18n.i18nInstance ? ContextI18n.i18nInstance : ContextI18n;
  utils.isVariantI18n(i18nInstance);
  return useMemo(() => {
    return createI18nProps(i18nInstance);
  }, [i18nInstance]);
}

export default useIntl;
