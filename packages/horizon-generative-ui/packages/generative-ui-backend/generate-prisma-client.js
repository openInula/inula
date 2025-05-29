// 生成Prisma客户端并应用数据库迁移
const { exec } = require('child_process');

console.log('开始生成Prisma客户端和应用数据库迁移...');

// 执行Prisma生成命令
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('生成Prisma客户端时出错:', error);
    return;
  }
  
  console.log('Prisma客户端生成输出:');
  console.log(stdout);
  
  if (stderr) {
    console.error('stderr:', stderr);
  }
  
  console.log('Prisma客户端生成完成');
  
  // 接下来执行数据库迁移命令
  console.log('开始应用数据库迁移...');
  
  exec('npx prisma migrate dev --name add_agent_models', (migrationError, migrationStdout, migrationStderr) => {
    if (migrationError) {
      console.error('应用数据库迁移时出错:', migrationError);
      return;
    }
    
    console.log('数据库迁移输出:');
    console.log(migrationStdout);
    
    if (migrationStderr) {
      console.error('stderr:', migrationStderr);
    }
    
    console.log('数据库迁移完成');
  });
});
