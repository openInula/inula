import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TestSetsService } from './test-sets.service';
import { CreateTestSetDto } from './dto/create-test-set.dto';
import { UpdateTestSetDto } from './dto/update-test-set.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam, 
  ApiBody, 
  ApiResponse, 
  ApiSecurity,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';

@ApiTags('test-sets')
@ApiBearerAuth()
@ApiSecurity('bearer')
@Controller('test-sets')
@UseGuards(JwtAuthGuard)
export class TestSetsController {
  constructor(private readonly testSetsService: TestSetsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new test set',
    description: 'Creates a new test set for the authenticated user. Optionally can include test cases.'
  })
  @ApiBody({ type: CreateTestSetDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The test set has been successfully created.',
    schema: {
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        name: { type: 'string', example: '基础UI组件测试集' },
        description: { type: 'string', example: '测试基本UI组件的生成能力' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        testCases: { 
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              prompt: { type: 'string' },
              expectedResult: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() createTestSetDto: CreateTestSetDto) {
    return this.testSetsService.create(req.user.id, createTestSetDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all test sets for the current user',
    description: 'Returns all test sets belonging to the authenticated user, including a count of test cases for each set.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of test sets',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          testCases: { 
            type: 'array',
            items: {
              properties: {
                id: { type: 'string' },
                prompt: { type: 'string' },
                expectedResult: { type: 'string' }
              }
            }
          },
          _count: {
            properties: {
              testCases: { type: 'number' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.testSetsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a test set by id',
    description: 'Returns detailed information about a specific test set, including all its test cases.'
  })
  @ApiParam({ name: 'id', description: 'Test set ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: 200, 
    description: 'The test set with its test cases',
    schema: {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        testCases: { 
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              prompt: { type: 'string' },
              expectedResult: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test set not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.testSetsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a test set',
    description: 'Updates properties of a test set. Only the specified fields will be updated.'
  })
  @ApiParam({ name: 'id', description: 'Test set ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateTestSetDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The test set has been successfully updated',
    schema: {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        testCases: { 
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              prompt: { type: 'string' },
              expectedResult: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test set not found' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateTestSetDto: UpdateTestSetDto,
  ) {
    return this.testSetsService.update(id, req.user.id, updateTestSetDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a test set',
    description: 'Deletes a test set and all its associated test cases. This operation cannot be undone.'
  })
  @ApiParam({ name: 'id', description: 'Test set ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'The test set has been successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test set not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.testSetsService.remove(id, req.user.id);
  }

  // Test Case endpoints
  @Post(':id/test-cases')
  @ApiOperation({ 
    summary: 'Add a test case to a test set',
    description: 'Creates a new test case within the specified test set'
  })
  @ApiParam({ name: 'id', description: 'Test set ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: CreateTestCaseDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The test case has been successfully created',
    schema: {
      properties: {
        id: { type: 'string' },
        prompt: { type: 'string' },
        expectedResult: { type: 'string' },
        testSetId: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test set not found' })
  addTestCase(
    @Param('id') testSetId: string,
    @Request() req,
    @Body() createTestCaseDto: CreateTestCaseDto,
  ) {
    return this.testSetsService.addTestCase(
      testSetId,
      req.user.id,
      createTestCaseDto,
    );
  }

  @Patch(':id/test-cases/:testCaseId')
  @ApiOperation({ 
    summary: 'Update a test case',
    description: 'Updates the properties of a specific test case within a test set'
  })
  @ApiParam({ name: 'id', description: 'Test set ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiParam({ name: 'testCaseId', description: 'Test case ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174001' })
  @ApiBody({ type: UpdateTestCaseDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The test case has been successfully updated',
    schema: {
      properties: {
        id: { type: 'string' },
        prompt: { type: 'string' },
        expectedResult: { type: 'string' },
        testSetId: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test set or test case not found' })
  updateTestCase(
    @Param('id') testSetId: string,
    @Param('testCaseId') testCaseId: string,
    @Request() req,
    @Body() updateTestCaseDto: UpdateTestCaseDto,
  ) {
    return this.testSetsService.updateTestCase(
      testCaseId,
      testSetId,
      req.user.id,
      updateTestCaseDto,
    );
  }

  @Delete(':id/test-cases/:testCaseId')
  @ApiOperation({ 
    summary: 'Delete a test case',
    description: 'Removes a test case from a test set. This operation cannot be undone.'
  })
  @ApiParam({ name: 'id', description: 'Test set ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiParam({ name: 'testCaseId', description: 'Test case ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174001' })
  @ApiResponse({ status: 200, description: 'The test case has been successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Test set or test case not found' })
  removeTestCase(
    @Param('id') testSetId: string,
    @Param('testCaseId') testCaseId: string,
    @Request() req,
  ) {
    return this.testSetsService.removeTestCase(
      testCaseId,
      testSetId,
      req.user.id,
    );
  }
}
