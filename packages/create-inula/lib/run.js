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

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const inquirer = require('inquirer');
const yeoman = require('yeoman-environment');

const generatorType = fs
  .readdirSync(`${__dirname}/generators`)
  .filter(file => !file.startsWith('.'))
  .map(file => {
    return {
      name: file,
      value: file,
      short: file,
    };
  });

const runGenerator = async (templatePath, { name = '', cwd = process.cwd(), args = {} }) => {
  return new Promise(resolve => {
    let currentPath;
    if (name) {
      mkdirp.sync(name);
      currentPath = path.join(cwd, name);
    }

    const Generator = require(templatePath);
    const env = yeoman.createEnv([], {
      cwd: currentPath,
    });
    const generator = new Generator({
      name,
      env,
      resolved: path.join(__dirname, templatePath),
      args,
    });
    return generator.run(() => {
      console.log('File Generate Done');
      resolve(true);
    });
  });
};

const run = async config => {
  if (typeof process.send === 'function') {
    process.send({ type: 'prompt' });
  }
  process.emit('message', { type: 'prompt' });

  let { type } = config;
  if (!type) {
    const answers = await inquirer.prompt([
      {
        name: 'type',
        message: 'Please select the template',
        type: 'list',
        choices: generatorType,
      },
    ]);
    type = answers.type;
  }
  const templatePath = `./generators/${type}`;
  try {
    return runGenerator(templatePath, config);
  } catch (e) {
    console.error(chalk.red('> Generate failed'), e);
    process.exit(1);
  }
};

module.exports = run;
