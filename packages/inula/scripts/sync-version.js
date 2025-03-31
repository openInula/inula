const fs = require('fs');
const path = require('path');

// 读取主 package.json
const mainPackagePath = path.resolve('./packages/inula/package.json');
const mainPackage = require(mainPackagePath);

// 读取目标 package.json
const targetPackagePath = path.resolve('./packages/inula/scripts/package.json');
const targetPackage = require(targetPackagePath);

// 同步版本号
targetPackage.version = mainPackage.version;

// 写回目标文件
fs.writeFileSync(targetPackagePath, JSON.stringify(targetPackage, null, 2) + '\n', 'utf8');

console.log(`版本号已同步: ${mainPackage.version}`);
