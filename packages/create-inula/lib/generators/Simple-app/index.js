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

const BasicGenerator = require('../../BasicGenerator');

class Generator extends BasicGenerator {
  prompting() {
    return this.prompt([
      {
        type: 'list',
        name: 'bundlerType',
        message: 'Please select the build type',
        choices: ['webpack', 'vite'],
      },
    ]).then(props => {
      this.prompts = props;
    });
  }

  writing() {
    const src = this.templatePath(this.prompts.bundlerType);
    const dest = this.destinationPath();
    this.writeFiles(src, dest, {
      context: {
        ...this.prompts,
      },
    });
  }
}

module.exports = Generator;
