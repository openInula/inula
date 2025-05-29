// 安装Swagger相关依赖的脚本
const { exec } = require('child_process');

console.log('开始安装Swagger相关依赖...');

const packages = [
  '@nestjs/swagger',
  'swagger-ui-express'
];

const command = `pnpm install ${packages.join(' ')}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('安装依赖时出错:', error);
    return;
  }
  
  console.log('安装输出:');
  console.log(stdout);
  
  if (stderr) {
    console.error('stderr:', stderr);
  }
  
  console.log('Swagger相关依赖安装完成');
});
