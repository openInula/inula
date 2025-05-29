import { Module } from '@nestjs/common';
import { TestSetsService } from './test-sets.service';
import { TestSetsController } from './test-sets.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TestSetsController],
  providers: [TestSetsService],
  exports: [TestSetsService],
})
export class TestSetsModule {}
