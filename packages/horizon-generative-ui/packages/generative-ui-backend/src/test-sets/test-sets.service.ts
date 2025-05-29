import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestSetDto } from './dto/create-test-set.dto';
import { UpdateTestSetDto } from './dto/update-test-set.dto';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';

@Injectable()
export class TestSetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createTestSetDto: CreateTestSetDto) {
    const { testCases, ...testSetData } = createTestSetDto;
    
    return this.prisma.testSet.create({
      data: {
        ...testSetData,
        userId,
        testCases: {
          create: testCases || [],
        },
      },
      include: {
        testCases: true,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.testSet.findMany({
      where: {
        userId,
      },
      include: {
        testCases: true,
        _count: {
          select: {
            testCases: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: number) {
    return this.prisma.testSet.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        testCases: true,
      },
    });
  }

  async update(id: string, userId: number, updateTestSetDto: UpdateTestSetDto) {
    const { testCases, ...testSetData } = updateTestSetDto;
    
    return this.prisma.testSet.update({
      where: {
        id,
        userId,
      },
      data: {
        ...testSetData,
      },
      include: {
        testCases: true,
      },
    });
  }

  async remove(id: string, userId: number) {
    return this.prisma.testSet.delete({
      where: {
        id,
        userId,
      },
    });
  }

  // Test Case methods
  async addTestCase(testSetId: string, userId: number, createTestCaseDto: CreateTestCaseDto) {
    // First verify the test set belongs to the user
    await this.findOne(testSetId, userId);
    
    return this.prisma.testCase.create({
      data: {
        ...createTestCaseDto,
        testSetId,
      },
    });
  }

  async updateTestCase(
    testCaseId: string, 
    testSetId: string,
    userId: number, 
    updateTestCaseDto: UpdateTestCaseDto
  ) {
    // First verify the test set belongs to the user
    await this.findOne(testSetId, userId);
    
    return this.prisma.testCase.update({
      where: {
        id: testCaseId,
        testSetId,
      },
      data: updateTestCaseDto,
    });
  }

  async removeTestCase(testCaseId: string, testSetId: string, userId: number) {
    // First verify the test set belongs to the user
    await this.findOne(testSetId, userId);
    
    return this.prisma.testCase.delete({
      where: {
        id: testCaseId,
        testSetId,
      },
    });
  }
}
