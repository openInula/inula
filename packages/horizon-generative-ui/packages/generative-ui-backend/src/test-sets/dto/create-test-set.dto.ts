import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTestCaseDto } from './create-test-case.dto';

export class CreateTestSetDto {
  @ApiProperty({ description: 'Test set name', example: '基础UI组件测试集' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Test set description', example: '测试基本UI组件的生成能力' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Test cases in this test set',
    type: [CreateTestCaseDto],
    example: [
      {
        prompt: '设计一个登录表单，包含用户名、密码字段和提交按钮',
        expectedResult: 'form > div > input + div > input + button',
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestCaseDto)
  @IsOptional()
  testCases?: CreateTestCaseDto[];
}
