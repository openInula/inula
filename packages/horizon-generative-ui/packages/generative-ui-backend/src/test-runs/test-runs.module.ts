import { Module } from '@nestjs/common';
import { TestRunsService } from './test-runs.service';
import { TestRunsController } from './test-runs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TestSetsModule } from '../test-sets/test-sets.module';

@Module({
  imports: [PrismaModule, TestSetsModule],
  controllers: [TestRunsController],
  providers: [TestRunsService],
})
export class TestRunsModule {}
