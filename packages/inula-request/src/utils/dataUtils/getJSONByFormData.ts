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

import utils from '../commonUtils/utils';

export function parsePath(name: string): string[] {
  const matches = Array.from(name.matchAll(/\w+|\[(\w*)]/g));
  const arr = [];

  for (const match of matches) {
    const matchValue = match[0] === '[]' ? '' : match[1] || match[0];
    arr.push(matchValue);
  }

  return arr;
}

function getJSONByFormData(formData: FormData): Record<string, any> | null {
  if (utils.checkFormData(formData) && utils.checkFunction((formData as any).entries)) {
    const obj: Record<string, any> = {};

    for (const [key, value] of (formData as any).entries()) {
      obj[key] = value;
    }
    return obj;
  }

  return null;
}

export default getJSONByFormData;
