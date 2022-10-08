/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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
const childProcess = require('child_process');

const version = process.env.releaseVersion;
const DIST_PATH = path.resolve(__dirname, '../build/horizon');

const NPMRC = `registry=https://cmc.centralrepo.rnd.huawei.com/npm
@cloudsop:registry=https://cmc.centralrepo.rnd.huawei.com/artifactory/product_npm
_auth = Y2xvdWRzb3BhcnRpZmFjdG9yeTpDbG91ZHNvcDY2NiEhIQ
always-auth = true
email = cloudsop@huawei.com
`;
if (!version) {
  process.exit();
}
if (!/\d+\.\d+\.\d+/.test(version)) {
  console.log('请输入正确版本号');
  process.exit();
}

const exec = (cmd, cwd) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(
      cmd,
      {
        cwd,
      },
      function (error, stdout, stderr) {
        if (error) {
          error && console.log(`Error: ${error}`);
          reject(error);
        } else {
          stdout && console.log(`STDOUT: ${stdout}`);
          resolve(stdout);
        }
      }
    );
  });
};

const main = async () => {
  try {
    console.log(`==== Horizon Upgrade ${version} ====`);
    await exec(`npm version ${version}`, DIST_PATH);
    fs.writeFileSync(path.resolve(DIST_PATH, '.npmrc'), NPMRC);

    console.log('==== Publish new version====');
    await exec('npm publish', DIST_PATH);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
main();
