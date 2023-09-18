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

import Inula from "inulajs";
import { createIntl, createIntlCache, RawIntlProvider } from "../../index";
import Example6Child from "./Example6Child";

const Example6 = (props: any) => {

  const { locale, messages } = props;

  const cache = createIntlCache();
  let i18n = createIntl(
        { locale: locale, messages: messages },
        cache
    );

  return (
    <RawIntlProvider value={i18n}>
      <Example6Child/>
    </RawIntlProvider>
  );
}

export default Example6;
