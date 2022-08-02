/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2022-2022. All rights reserved.
 */

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const version = process.env.releaseVersion;
const HORIZON_PACKAGE_JSON = path.resolve(__dirname, '../libs/horizon/package.json');
const DIST_PATH = path.resolve(__dirname, '../build/horizon');

const NPMRC = `registry=https://cmc.centralrepo.rnd.huawei.com/npm
@cloudsop:registry=https://cmc.centralrepo.rnd.huawei.com/artifactory/product_npm
_auth = Y2xvdWRzb3BhcnRpZmFjdG9yeTpDbG91ZHNvcDY2NiEhIQ
always-auth = true
email = cloudsop@huawei.com
`;
if (!version) {
  return;
}
if (!/\d+\.\d+\.\d+/.test(version)) {
  console.log('请输入正确版本号');
  return;
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


const writeVersion = version => {
  return new Promise((resolve, reject) => {
    const file = HORIZON_PACKAGE_JSON;
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        console.log(`${file}: write version failed`);
        reject(err);
      }
      const packageJson = JSON.parse(data);
      packageJson.version = version;
      fs.writeFileSync(file, JSON.stringify(packageJson, null, 2));
      resolve();
    });
  });
};

const main = async () => {
  console.log(`==== Horizon Upgrade ${version} ====`);
  await writeVersion(version);

  if (!version.includes('SNAPSHOT')) {
    console.log('==== Create git tag =====');
    const tagName = `v${version}-h1`;
    await exec(`git tag ${tagName}`);
    await exec('git push --tags');
  }

  fs.writeFileSync(path.resolve(DIST_PATH, '.npmrc'), NPMRC);

  console.log('==== Publish new version====');
  await exec('npm publish', DIST_PATH);
};
main();
