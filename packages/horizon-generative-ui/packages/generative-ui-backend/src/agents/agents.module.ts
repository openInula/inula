import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AgentsController],
  providers: [AgentsService, PrismaService],
  exports: [AgentsService],
})
export class AgentsModule {}
