import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTestCaseDto {
  @ApiProperty({ 
    description: 'Test case prompt', 
    example: '设计一个登录表单，包含用户名、密码字段和提交按钮' 
  })
  @IsString()
  prompt: string;

  @ApiProperty({ 
    description: 'Expected result for the test case', 
    example: 'form > div > input + div > input + button' 
  })
  @IsString()
  expectedResult: string;
}
