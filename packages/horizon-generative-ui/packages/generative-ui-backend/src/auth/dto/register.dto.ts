import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: '张三',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '用户账号',
    example: 'zhangsan',
  })
  @IsString()
  @IsNotEmpty()
  account: string;

  @ApiProperty({
    description: '用户密码，最少6个字符',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
