const symlink = require('symlink-dir');
const fs = require('fs');
const path = require('path');
const pathJson = require('./path.json');

fs.readdirSync(path.join(__dirname, 'packages')).forEach(name => {
  symlink('packages/' + name, 'node_modules/' + name)
    .then(() => {
      console.log('源码构建：为' + name + '创建node_modules链接');
    })
    .catch(err => {
      console.log('Error:为' + name + '创建node_modules链接失败');
    });
});

const libs = [
  'inula',
];
libs.forEach((name) => {
  symlink(`${pathJson['horizon-path']}/packages/` + name, 'node_modules/' + name)
    .then(() => {
      console.log('源码构建：为' + name + '创建node_modules链接...');
    })
    .catch(err => {
      console.log('Error:为' + name + '创建node_modules链接失败');
    });
});
