import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class TestCaseResultDto {
  @ApiProperty({ 
    description: 'ID of the test case',
    example: 'test-case-uuid-1' 
  })
  @IsString()
  testCaseId: string;

  @ApiProperty({ 
    description: 'Actual result from the test',
    example: 'form > input + input + button' 
  })
  @IsString()
  actualResult: string;

  @ApiProperty({ 
    description: 'Similarity percentage between expected and actual results',
    example: 85.5
  })
  @IsNumber()
  similarity: number;

  @ApiProperty({ 
    description: 'Whether the test passed',
    example: true
  })
  @IsBoolean()
  passed: boolean;

  @ApiPropertyOptional({ 
    description: 'Optional notes about the test result',
    example: 'Minor structural differences but functionality matches' 
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
