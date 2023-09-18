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

import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'dotenv';

export default function initializeEnv(): void {
  const envPath: string = join(process.cwd(), '.env');
  const localEnvPath: string = join(process.cwd(), '.local.env');
  loadEnv(envPath);
  if (process.env.NODE_ENV === 'development') {
    loadEnv(localEnvPath);
  }
}

function loadEnv(envPath: string): void {
  if (existsSync(envPath)) {
    const parsed = parse(readFileSync(envPath, 'utf-8')) || {};
    Object.keys(parsed).forEach(key => {
      process.env[key] = parsed[key];
    });
  }
}
