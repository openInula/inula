import { PartialType } from '@nestjs/swagger';
import { CreateTestSetDto } from './create-test-set.dto';

export class UpdateTestSetDto extends PartialType(CreateTestSetDto) {}
