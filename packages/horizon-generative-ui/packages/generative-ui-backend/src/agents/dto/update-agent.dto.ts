import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentDto } from './create-agent.dto';

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  // PartialType 已经使所有字段可选，这里不需要添加额外的属性
  // 错误是由于添加了一个没有关联到类属性的 ApiProperty 装饰器
}
