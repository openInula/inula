/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { transform as transformWithBabel } from '@babel/core';
import generate from '@babel/generator';
import { types as t } from '@openinula/babel-api';
import plugin from '../src';

export function genCode(ast: t.Node | null) {
  if (!ast) {
    throw new Error('ast is null');
  }
  return generate(ast).code;
}

export function transform(code: string) {
  return transformWithBabel(code, {
    presets: [plugin],
    filename: 'test.tsx',
  })?.code;
}
