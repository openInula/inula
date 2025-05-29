import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(account: string) {
    return this.prisma.user.findUnique({
      where: { account },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: { username: string; account: string; password: string }) {
    console.log('UsersService.create 被调用:', { username: data.username, account: data.account });
    
    try {
      // 使用Node.js内置的crypto库进行简单哈希
      console.log('开始对密码进行哈希处理');
      const hashedPassword = this.hashPassword(data.password);
      console.log('密码哈希完成, 哈希长度:', hashedPassword.length);
      
      console.log('准备调用 prisma.user.create 创建用户');
      const result = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });
      
      console.log('prisma.user.create 返回结果:', { 
        id: result.id, 
        username: result.username, 
        account: result.account, 
        passwordLength: result.password?.length,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      });
      
      return result;
    } catch (error) {
      console.error('创建用户过程中发生错误:', error);
      throw error;
    }
  }

  // 简单的密码哈希函数
  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // 验证密码函数
  public verifyPassword(password: string, storedPassword: string): boolean {
    console.log('Verifying password:', { password, storedPasswordLength: storedPassword?.length });
    
    try {
      const [salt, storedHash] = storedPassword.split(':');
      console.log('Split password parts:', { saltLength: salt?.length, hashLength: storedHash?.length });
      
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      console.log('Computed hash length:', hash?.length);
      
      const result = storedHash === hash;
      console.log('Password verification result:', result);
      
      return result;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }
}
