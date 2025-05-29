import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsInt, IsObject, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConversationDto {
  @ApiProperty({
    description: '会话标题',
    required: false,
    example: '客户咨询',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Agent ID',
    required: true,
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  agentId: number;

  @ApiProperty({
    description: '会话元数据',
    required: false,
    example: { category: 'customer-support', priority: 'normal' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateMessageDto {
  @ApiProperty({
    description: '消息内容',
    required: true,
    example: '我想了解产品退款政策',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '消息角色',
    required: true,
    enum: ['user', 'assistant'],
    example: 'user',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['user', 'assistant'])
  role: string;

  @ApiProperty({
    description: '会话ID',
    required: true,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({
    description: '元数据',
    required: false,
    example: {
      modelName: 'gpt-4',
      processingTime: '1.2s',
      tokens: { input: 245, output: 567 },
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class MessageDto {
  @ApiProperty({
    description: '消息内容',
    required: true,
    example: '我想了解产品退款政策',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '消息角色',
    required: true,
    enum: ['user', 'assistant'],
    example: 'user',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['user', 'assistant'])
  role: string;

  @ApiProperty({
    description: '元数据',
    required: false,
    example: {
      modelName: 'gpt-4',
      processingTime: '1.2s',
      tokens: { input: 245, output: 567 },
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SaveConversationHistoryDto {
  @ApiProperty({
    description: '会话ID',
    required: true,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({
    description: '会话消息数组',
    required: true,
    type: [MessageDto],
    example: [
      {
        content: '我想了解产品退款政策',
        role: 'user',
        metadata: { timestamp: '2025-05-14T10:30:00Z' },
      },
      {
        content: '您好，根据我们的退款政策...',
        role: 'assistant',
        metadata: { modelName: 'gpt-4', processingTime: '1.2s' },
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}

export class UpdateConversationDto {
  @ApiProperty({
    description: '会话标题',
    required: false,
    example: '产品退款咨询',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: '元数据',
    required: false,
    example: {
      category: 'support',
      status: 'resolved',
      tags: ['refund', 'policy'],
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class GetConversationsQueryDto {
  @ApiProperty({
    description: '页码',
    required: false,
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number) // 显式转换为数字
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number) // 显式转换为数字
  pageSize?: number = 10;

  @ApiProperty({
    description: 'Agent ID - 根据特定Agent筛选会话',
    required: false,
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number) // 显式转换为数字
  agentId?: number;
}
