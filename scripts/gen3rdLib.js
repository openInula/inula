/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

'use strict';
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const inulaEcoPath = path.resolve(__dirname, '../../inula-ecosystem');
if (!fs.existsSync(inulaEcoPath)) {
  throw Error('inula-ecosystem not found, put inula-core and inula-ecosystem in same folder plz!');
}

const cmd = process.argv[2];
childProcess.exec(
  `npm run ${cmd}`,
  {
    cwd: inulaEcoPath,
  },
  function (error, stdout) {
    if (error) {
      console.log(`Error: ${error}`);
    } else {
      console.log(`STDOUT: ${stdout}`);
    }
  }
);
