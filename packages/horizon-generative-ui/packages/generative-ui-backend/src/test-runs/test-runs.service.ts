import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { TestCaseResultDto } from './dto/test-case-result.dto';
import { TestSetsService } from '../test-sets/test-sets.service';

@Injectable()
export class TestRunsService {
  constructor(
    private prisma: PrismaService,
    private testSetsService: TestSetsService,
  ) {}

  async create(userId: number, createTestRunDto: CreateTestRunDto) {
    const { testSetIds, testCaseResults, ...testRunData } = createTestRunDto;
    
    // Calculate statistics based on testCaseResults
    const totalTests = testCaseResults.length;
    const passedTests = testCaseResults.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    const avgSimilarity = totalTests > 0 
      ? testCaseResults.reduce((sum, result) => sum + result.similarity, 0) / totalTests 
      : 0;

    // Create the test run along with test case results
    return this.prisma.testRun.create({
      data: {
        ...testRunData,
        totalTests,
        passedTests,
        failedTests,
        avgSimilarity,
        userId,
        testSets: {
          connect: testSetIds.map(id => ({ id })),
        },
        testResults: {
          create: testCaseResults.map(result => ({
            actualResult: result.actualResult,
            similarity: result.similarity,
            passed: result.passed,
            notes: result.notes,
            testCase: {
              connect: {
                id: result.testCaseId,
              },
            },
          })),
        },
      },
      include: {
        testSets: true,
        testResults: {
          include: {
            testCase: true,
          },
        },
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.testRun.findMany({
      where: {
        userId,
      },
      include: {
        testSets: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            testResults: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: number) {
    return this.prisma.testRun.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        testSets: true,
        testResults: {
          include: {
            testCase: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: number) {
    return this.prisma.testRun.delete({
      where: {
        id,
        userId,
      },
    });
  }

  // Get results for a specific test set in a test run
  async getTestSetResults(testRunId: string, testSetId: string, userId: number) {
    // First verify the test run belongs to the user
    await this.findOne(testRunId, userId);
    
    // Get all test case results for the specified test set
    return this.prisma.testCaseResult.findMany({
      where: {
        testRunId,
        testCase: {
          testSetId,
        },
      },
      include: {
        testCase: true,
      },
      orderBy: {
        testCase: {
          prompt: 'asc',
        },
      },
    });
  }
}
