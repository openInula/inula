import { Controller, Request, Post, UseGuards, Body, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {
    this.logger.log('AuthController 已初始化');
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册', description: '创建一个新用户' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ 
    description: '用户注册成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        username: { type: 'string', example: '张三' },
        account: { type: 'string', example: 'zhangsan' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误或用户已存在' })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`注册请求: ${JSON.stringify(registerDto)}`);
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: '用户登录', description: '用户登录并获取JWT令牌' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ 
    description: '登录成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            account: { type: 'string', example: 'zhangsan' },
            username: { type: 'string', example: '张三' },
          },
        },
      },
    }, 
  })
  @ApiUnauthorizedResponse({ description: '用户名或密码错误' })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    try {
      this.logger.log(`登录请求接收到: ${JSON.stringify(loginDto)}`);
      
      if (!req.user) {
        this.logger.error('登录失败: 请求中没有用户对象');
        throw new HttpException('认证失败', HttpStatus.UNAUTHORIZED);
      }
      
      this.logger.log(`用户验证成功: ${JSON.stringify(req.user)}`);
      const result = await this.authService.login(req.user);
      this.logger.log('登录成功，返回token');
      return result;
    } catch (error) {
      this.logger.error(`登录过程中发生错误: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取用户资料', description: '获取当前登录用户的资料信息' })
  @ApiOkResponse({ 
    description: '成功返回用户资料',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        account: { type: 'string', example: 'zhangsan' },
        username: { type: 'string', example: '张三' },
      },
    }, 
  })
  @ApiUnauthorizedResponse({ description: '未授权访问' })
  getProfile(@Request() req) {
    this.logger.log(`获取用户资料: ${JSON.stringify(req.user)}`);
    return req.user;
  }
}