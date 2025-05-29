import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TestRunsService } from './test-runs.service';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam, 
  ApiBody, 
  ApiResponse, 
  ApiSecurity,
  ApiBearerAuth
} from '@nestjs/swagger';

@ApiTags('test-runs')
@ApiBearerAuth()
@ApiSecurity('bearer')
@Controller('test-runs')
@UseGuards(JwtAuthGuard)
export class TestRunsController {
  constructor(private readonly testRunsService: TestRunsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new test run',
    description: 'Creates a new test run with results for test cases. This endpoint is used to record the results of running tests against one or more test sets.'
  })
  @ApiBody({ type: CreateTestRunDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The test run has been successfully created',
    schema: {
      properties: {
        id: { type: 'string' },
        name: { type: 'string', example: '测试运行 #1' },
        date: { type: 'string', format: 'date-time' },
        version: { type: 'string', example: 'v1.0.0' },
        totalTests: { type: 'integer', example: 15 },
        passedTests: { type: 'integer', example: 12 },
        failedTests: { type: 'integer', example: 3 },
        avgSimilarity: { type: 'number', format: 'float', example: 87.5 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        testSets: { 
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              name: { type: 'string' }
            }
          }
        },
        testResults: { 
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              actualResult: { type: 'string' },
              similarity: { type: 'number', format: 'float' },
              passed: { type: 'boolean' },
              notes: { type: 'string' },
              testCase: {
                properties: {
                  id: { type: 'string' },
                  prompt: { type: 'string' },
                  expectedResult: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() createTestRunDto: CreateTestRunDto) {
    return this.testRunsService.create(req.user.id, createTestRunDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all test runs for the current user',
    description: 'Returns a list of all test runs performed by the authenticated user, with basic information about each run.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of test runs',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          version: { type: 'string' },
          totalTests: { type: 'integer' },
          passedTests: { type: 'integer' },
          failedTests: { type: 'integer' },
          avgSimilarity: { type: 'number', format: 'float' },
          testSets: { 
            type: 'array',
            items: {
              properties: {
                id: { type: 'string' },
                name: { type: 'string' }
              }
            }
          },
          _count: {
            properties: {
              testResults: { type: 'integer' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.testRunsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a test run by id',
    description: 'Returns detailed information about a specific test run, including all test results.'
  })
  @ApiParam({ name: 'id', description: 'Test run ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed test run information',
    schema: {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        totalTests: { type: 'integer' },
        passedTests: { type: 'integer' },
        failedTests: { type: 'integer' },
        avgSimilarity: { type: 'number', format: 'float' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        testSets: { 
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        testResults: { 
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              actualResult: { type: 'string' },
              similarity: { type: 'number', format: 'float' },
              passed: { type: 'boolean' },
              notes: { type: 'string' },
              testCase: {
                properties: {
                  id: { type: 'string' },
                  prompt: { type: 'string' },
                  expectedResult: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test run not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.testRunsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a test run',
    description: 'Deletes a test run and all its associated test results. This operation cannot be undone.'
  })
  @ApiParam({ name: 'id', description: 'Test run ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'The test run has been successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test run not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.testRunsService.remove(id, req.user.id);
  }

  @Get(':id/test-sets/:testSetId')
  @ApiOperation({ 
    summary: 'Get test results for a specific test set in a test run',
    description: 'Returns all test case results for a specific test set within a test run.'
  })
  @ApiParam({ name: 'id', description: 'Test run ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiParam({ name: 'testSetId', description: 'Test set ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174001' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of test case results for the specified test set',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          actualResult: { type: 'string' },
          similarity: { type: 'number', format: 'float' },
          passed: { type: 'boolean' },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          testCase: {
            properties: {
              id: { type: 'string' },
              prompt: { type: 'string' },
              expectedResult: { type: 'string' },
              testSetId: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test run or test set not found' })
  getTestSetResults(
    @Param('id') testRunId: string,
    @Param('testSetId') testSetId: string,
    @Request() req,
  ) {
    return this.testRunsService.getTestSetResults(
      testRunId,
      testSetId,
      req.user.id,
    );
  }
}
