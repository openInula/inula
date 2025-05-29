import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private logger = new Logger('LocalAuthGuard');

  constructor() {
    super();
    this.logger.debug('LocalAuthGuard 被实例化');
  }

  handleRequest(err, user, info, context) {
    console.log(user);
    this.logger.debug(`认证处理：error=${!!err}, user=${!!user}, info=${!!info}`);
    
    if (err || !user) {
      this.logger.error('认证失败:');
      if (err) this.logger.error(`错误: ${err.message}`);
      if (info) this.logger.error(`附加信息: ${JSON.stringify(info)}`);
    }

    return super.handleRequest(err, user, info, context);
  }
}
