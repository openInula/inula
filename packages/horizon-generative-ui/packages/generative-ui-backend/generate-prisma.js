// 简单脚本，用于生成 Prisma 客户端
const { exec } = require('child_process');

console.log('开始生成 Prisma 客户端...');

// 执行 prisma generate 命令
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('生成 Prisma 客户端时出错:', error);
    return;
  }
  
  console.log('Prisma 客户端生成输出:');
  console.log(stdout);
  
  if (stderr) {
    console.error('stderr:', stderr);
  }
  
  console.log('Prisma 客户端生成完成');
  
  // 接下来执行 prisma db push 命令，将 schema 推送到数据库
  console.log('开始将 schema 推送到数据库...');
  