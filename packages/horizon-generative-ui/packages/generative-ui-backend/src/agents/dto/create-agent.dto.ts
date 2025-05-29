import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 定义DSL行为类型枚举
export enum DSLActionType {
  link = 'router',
  event = 'event',
  function = 'function'
}

// 定义路由行为DTO
export class DSLRouteActionDto {
  @ApiProperty({
    description: '行为唯一标识符',
    example: 'goto_home',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: '行为类型',
    enum: [DSLActionType.link],
    example: DSLActionType.link,
  })
  @IsString()
  @IsNotEmpty()
  type: DSLActionType.link;

  @ApiPropertyOptional({
    description: '行为描述',
    example: '跳转到首页',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '跳转目标路径',
    example: '/home',
  })
  @IsString()
  @IsNotEmpty()
  target: string;
}

// 定义事件行为DTO
export class DSLEventActionDto {
  @ApiProperty({
    description: '行为唯一标识符',
    example: 'submit_form',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: '行为类型',
    enum: [DSLActionType.event],
    example: DSLActionType.event,
  })
  @IsString()
  @IsNotEmpty()
  type: DSLActionType.event;

  @ApiProperty({
    description: '事件名称',
    example: 'onSubmit',
  })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiPropertyOptional({
    description: '事件参数',
    example: { formId: 'contact_form' },
  })
  @IsOptional()
  param?: Record<string, any>;
}

// 定义函数行为DTO
export class DSLFunctionActionDto {
  @ApiProperty({
    description: '行为唯一标识符',
    example: 'calculate_total',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: '行为类型',
    enum: [DSLActionType.function],
    example: DSLActionType.function,
  })
  @IsString()
  @IsNotEmpty()
  type: DSLActionType.function;

  @ApiProperty({
    description: '函数名称',
    example: 'calculateTotal',
  })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiPropertyOptional({
    description: '函数参数',
    example: { tax: 0.1 },
  })
  @IsOptional()
  param?: Record<string, any>;
}

// 定义测试集DTO
export class TestSetDto {
  @ApiProperty({
    description: '测试问题',
    example: '你能帮我查询订单状态吗？',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: '预期结果',
    example: '我可以帮您查询订单状态，请提供您的订单号。',
  })
  @IsString()
  @IsNotEmpty()
  expectedResult: string;

  @ApiPropertyOptional({
    description: '运行记录',
    example: '用户提问 -> AI分析意图 -> 返回回答',
  })
  @IsString()
  @IsOptional()
  runRecord?: string;
}

// 定义模板问题DTO
export class TemplateQuestionDto {
  @ApiProperty({
    description: '模板问题内容',
    example: '如何查询我的订单状态？',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

// 创建Agent的DTO
export class CreateAgentDto {
  @ApiProperty({
    description: 'Agent名称',
    example: '客户服务助手',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'agent描述',
    example: '用于排障场景',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: '提示词模板',
    example: '你是一个专业的客户服务助手，负责解答用户关于产品和服务的问题。',
  })
  @IsString()
  @IsOptional()
  promptTemplate: string;

  @ApiPropertyOptional({
    description: '用户数据',
    example: '用户偏好: {...}, 历史交互: [...]',
  })
  @IsString()
  @IsOptional()
  userData?: string;

  @ApiPropertyOptional({
    description: '提示词查询',
    example: '常见问题: [...], 回答模板: {...}',
  })
  @IsString()
  @IsOptional()
  promptQueries?: string;

  @ApiPropertyOptional({
    description: 'UI行为集合',
    type: [Object],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: DSLRouteActionDto, name: DSLActionType.link },
        { value: DSLEventActionDto, name: DSLActionType.event },
        { value: DSLFunctionActionDto, name: DSLActionType.function },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  uiActions?: Array<DSLRouteActionDto | DSLEventActionDto | DSLFunctionActionDto>;

  @ApiPropertyOptional({
    description: '测试集合',
    type: [TestSetDto],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TestSetDto)
  testSets?: TestSetDto[];

  @ApiPropertyOptional({
    description: '模板问题集合',
    type: [TemplateQuestionDto],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TemplateQuestionDto)
  templateQuestions?: TemplateQuestionDto[];
}
