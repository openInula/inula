/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
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
