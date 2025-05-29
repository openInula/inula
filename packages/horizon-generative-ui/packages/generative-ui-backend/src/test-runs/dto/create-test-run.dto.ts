import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsArray, 
  ValidateNested, 
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TestCaseResultDto } from './test-case-result.dto';

export class CreateTestRunDto {
  @ApiProperty({ description: 'Test run name', example: '测试运行 #1' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ 
    description: 'Date of the test run', 
    example: new Date().toISOString(),
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @ApiProperty({ description: 'Version being tested', example: 'v1.0.0' })
  @IsString()
  version: string;

  @ApiProperty({ 
    description: 'Test set IDs included in this run',
    type: [String],
    example: ['test-set-uuid-1', 'test-set-uuid-2'] 
  })
  @IsArray()
  @IsString({ each: true })
  testSetIds: string[];

  @ApiProperty({ 
    description: 'Results for each test case',
    type: [TestCaseResultDto],
    example: [
      {
        testCaseId: 'test-case-uuid-1',
        actualResult: 'form > input + input + button',
        similarity: 85.5,
        passed: true,
        notes: 'Minor structural differences but functionality matches',
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseResultDto)
  testCaseResults: TestCaseResultDto[];
}
