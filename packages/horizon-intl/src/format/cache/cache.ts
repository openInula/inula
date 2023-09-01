/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import { I18nCache } from '../../types/interfaces';

/**
 * 缓存机制
 */
function creatI18nCache(): I18nCache {
  return {
    dateTimeFormat: {},
    numberFormat: {},
    plurals: {},
    messages: {},
    select: {},
    octothorpe: {},
  };
}

export default creatI18nCache;
