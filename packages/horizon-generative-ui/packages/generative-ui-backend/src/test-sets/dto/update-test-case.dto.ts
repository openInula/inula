import { PartialType } from '@nestjs/swagger';
import { CreateTestCaseDto } from './create-test-case.dto';

export class UpdateTestCaseDto extends PartialType(CreateTestCaseDto) {}
