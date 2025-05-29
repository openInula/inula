import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(account: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(account);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = this.usersService.verifyPassword(password, user.password);
    
    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    const payload = { account: user.account, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        account: user.account,
        username: user.username
      }
    };
  }

  async register(data: { username: string; account: string; password: string }) {
    try {
      const user = await this.usersService.create(data);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('注册过程中发生错误:', error);
      throw error;
    }
  }
}
