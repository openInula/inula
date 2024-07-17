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

import chalk from 'chalk';
import lodash from 'lodash';

function getDescriptions(commands: any) {
  return Object.keys(commands)
    .filter(name => typeof commands[name] !== 'string')
    .map(name => {
      return getDescription(commands[name]);
    });
}

function getDescription(command: any) {
  return `    ${chalk.green(lodash.padEnd(command.name, 10))}${command.description || ''}`;
}

function padLeft(str: string) {
  return str
    .split('\n')
    .map((line: string) => `    ${line}`)
    .join('\n');
}

export default (api: any) => {
  api.registerCommand({
    name: 'help',
    description: 'show command helps',

    fn: (args: any, config: any) => {
      console.log(`
      Usage: inula-cli <command> [options]

${getDescriptions(api.commands).join('\n')}
          `);
    },
  });
};
