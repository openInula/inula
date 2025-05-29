import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({
      usernameField: 'account',
      passwordField: 'password',
    });
    this.logger.log('本地验证策略已初始化，字段映射: account -> username, password -> password');
  }

  async validate(account: string, password: string): Promise<any> {
    try {
      this.logger.log(`开始验证用户: ${account}`);
      
      if (!account) {
        this.logger.error('验证失败: 账号为空');
        throw new UnauthorizedException('账号不能为空');
      }
      
      if (!password) {
        this.logger.error('验证失败: 密码为空');
        throw new UnauthorizedException('密码不能为空');
      }
      
      this.logger.log('调用 authService.validateUser 进行验证');
      const user = await this.authService.validateUser(account, password);
      
      if (!user) {
        this.logger.error(`验证失败: 用户 ${account} 不存在或密码无效`);
        throw new UnauthorizedException('无效的凭据');
      }
      
      this.logger.log(`用户 ${account} 验证成功`);
      return user;
    } catch (error) {
      this.logger.error(`验证过程出错: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('身份验证过程中出现错误');
    }
  }
}
