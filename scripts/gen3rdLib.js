'use strict'
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const console = require('console');
const rimRaf = require('rimRaf');
const argv = require('minimist')(process.argv.slice(2));

const libPathPrefix = '../build';
const suffix = argv.dev ? 'development.js' : 'production.js';
const template = argv.type === 'horizon' ? 'horizon3rdTemplate.ejs' : 'template.ejs';
const readLib = (lib) => {
  const libName = lib.split('.')[0];
  const libPath = path.resolve(__dirname, `${libPathPrefix}/${libName}/umd/${lib}`);
  if (fs.existsSync(libPath)) {
    return fs.readFileSync(libPath,'utf-8');
  } else {
    console.log(chalk.red(`Error: "${libPath}" 文件不存在\n先运行 npm run build`))
  }
};

ejs.renderFile(path.resolve(__dirname, `./${template}`), {
  Horizon: readLib(`horizon.${suffix}`),
}, null, function(err, result) {
  const common3rdLibPath = path.resolve(__dirname, `${libPathPrefix}/horizonCommon3rdlib.min.js`)
  rimRaf(common3rdLibPath, e => {
    if (e) {
      console.log(e)
    }
    fs.writeFileSync(common3rdLibPath, result);
    console.log(chalk.green(`成功生成: ${common3rdLibPath}`))
  })
});
