import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  try {
    console.log('正在启动应用...');
    // 创建NestJS应用实例
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
    }));
    app.useLogger(new Logger('debug'));

    // 配置Swagger文档
    const config = new DocumentBuilder()
      .setTitle('Horizon Low-Code Backend API')
      .setDescription('Horizon低代码平台的后端API文档')
      .setVersion('1.0')
      .addTag('auth', '认证相关接口')
      .addTag('agents', 'Agent管理相关接口')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'JWT-auth', // 这个名称是在 @ApiSecurity() 中使用的
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    // 启用CORS
    app.enableCors();

    // 使用3001端口以避免冲突
    await app.listen(3001);

    console.log(`应用已启动，运行在: ${await app.getUrl()}`);
    console.log(`Swagger文档可在 ${await app.getUrl()}/api-docs 访问`);
  } catch (error) {
    console.error('应用启动失败:', error);
  }
}

bootstrap();
