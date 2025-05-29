import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  Put,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiBody, 
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import {
  CreateConversationDto,
  CreateMessageDto,
  UpdateConversationDto,
  GetConversationsQueryDto,
  SaveConversationHistoryDto
} from './dto/conversation.dto';

@ApiTags('conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: '创建新会话', description: '创建一个新的会话，并关联到指定的Agent' })
  @ApiBody({ type: CreateConversationDto, description: '会话创建数据' })
  @ApiCreatedResponse({ description: '会话创建成功',
schema: { 
    properties: {
      id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
      title: { type: 'string', nullable: true, example: '客户服务咨询' },
      agentId: { type: 'number', example: 1 },
      userId: { type: 'number', example: 1 },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      agent: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: '客服助手' },
        },
      },
    }, 
  } })
  @ApiUnauthorizedResponse({ description: '未授权' })
  async createConversation(@Request() req, @Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.createConversation(req.user.id, createConversationDto);
  }

  @Get()
  @ApiOperation({ 
    summary: '获取所有会话', 
    description: '分页获取当前用户的所有会话，可按Agent筛选', 
  })
  @ApiQuery({ type: GetConversationsQueryDto })
  @ApiOkResponse({ 
    description: '成功获取会话列表',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              agent: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                },
              },
              messages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    content: { type: 'string' },
                    role: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    }, 
  })
  @ApiUnauthorizedResponse({ description: '未授权' })
  async getAllConversations(@Request() req, @Query() query: GetConversationsQueryDto) {
    console.log('Controller: getAllConversations called with query:', query);
    console.log('User ID:', req.user.id);
    try {
      const result = await this.conversationsService.getAllConversations(req.user.id, query);
      console.log('Controller: getAllConversations result:', result);
      return result;
    } catch (error) {
      console.error('Controller: getAllConversations error:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '通过ID获取会话', 
    description: '获取特定会话的详细信息及其所有消息', 
  })
  @ApiParam({ name: 'id', description: '会话ID', type: 'string' })
  @ApiOkResponse({ 
    description: '成功获取会话',
    schema: {
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        userId: { type: 'number' },
        agentId: { type: 'number' },
        metadata: { type: 'object', nullable: true },
        agent: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
          },
        },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              content: { type: 'string' },
              role: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              metadata: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '未授权' })
  @ApiNotFoundResponse({ description: '会话不存在' })
  async getConversationById(@Request() req, @Param('id') id: string) {
    return this.conversationsService.getConversationById(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: '更新会话', 
    description: '更新会话的标题或元数据', 
  })
  @ApiParam({ name: 'id', description: '会话ID', type: 'string' })
  @ApiBody({ type: UpdateConversationDto, description: '会话更新数据' })
  @ApiOkResponse({ description: '会话更新成功' })
  @ApiUnauthorizedResponse({ description: '未授权' })
  @ApiNotFoundResponse({ description: '会话不存在' })
  @ApiForbiddenResponse({ description: '无权操作此会话' })
  async updateConversation(
    @Request() req,
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.updateConversation(req.user.id, id, updateConversationDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: '删除会话', 
    description: '删除会话及其所有相关消息', 
  })
  @ApiParam({ name: 'id', description: '会话ID', type: 'string' })
  @ApiOkResponse({ description: '会话删除成功' })
  @ApiUnauthorizedResponse({ description: '未授权' })
  @ApiNotFoundResponse({ description: '会话不存在' })
  @ApiForbiddenResponse({ description: '无权操作此会话' })
  async deleteConversation(@Request() req, @Param('id') id: string) {
    return this.conversationsService.deleteConversation(req.user.id, id);
  }

  @Post('messages')
  @ApiOperation({ 
    summary: '创建消息', 
    description: '向指定会话添加新消息，自动更新会话最后更新时间', 
  })
  @ApiBody({ type: CreateMessageDto, description: '消息创建数据' })
  @ApiCreatedResponse({ 
    description: '消息创建成功',
    schema: {
      properties: {
        id: { type: 'string', format: 'uuid' },
        content: { type: 'string' },
        role: { type: 'string', example: 'user' },
        conversationId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        metadata: { type: 'object', nullable: true },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '未授权' })
  @ApiNotFoundResponse({ description: '会话不存在' })
  @ApiForbiddenResponse({ description: '无权操作此会话' })
  async createMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.conversationsService.createMessage(req.user.id, createMessageDto);
  }

  @Get(':id/messages')
  @ApiOperation({ 
    summary: '获取会话的所有消息', 
    description: '获取指定会话的所有消息记录，按时间顺序排列', 
  })
  @ApiParam({ name: 'id', description: '会话ID', type: 'string' })
  @ApiOkResponse({ 
    description: '成功获取消息列表',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          role: { type: 'string' },
          conversationId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          metadata: { type: 'object', nullable: true },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '未授权' })
  @ApiNotFoundResponse({ description: '会话不存在' })
  @ApiForbiddenResponse({ description: '无权访问此会话' })
  async getMessagesByConversationId(@Request() req, @Param('id') id: string) {
    return this.conversationsService.getMessagesByConversationId(req.user.id, id);
  }

  @Put(':id/history')
  @ApiOperation({ 
    summary: '保存完整会话历史', 
    description: '替换指定会话的所有消息，一次性保存整个对话历史', 
  })
  @ApiParam({ name: 'id', description: '会话ID', type: 'string' })
  @ApiBody({ type: SaveConversationHistoryDto, description: '会话历史数据' })
  @ApiOkResponse({ 
    description: '会话历史保存成功',
    schema: {
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        userId: { type: 'number' },
        agentId: { type: 'number' },
        metadata: { type: 'object', nullable: true },
        agent: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
          },
        },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              content: { type: 'string' },
              role: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              metadata: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '未授权' })
  @ApiNotFoundResponse({ description: '会话不存在' })
  @ApiForbiddenResponse({ description: '无权操作此会话' })
  @ApiBadRequestResponse({ description: '请求数据无效，如空消息数组或无效的角色值' })
  async saveConversationHistory(
    @Request() req, 
    @Param('id') id: string,
    @Body() saveHistoryDto: SaveConversationHistoryDto,
  ) {
    // 确保路径参数和请求体中的ID匹配
    if (id !== saveHistoryDto.conversationId) {
      saveHistoryDto.conversationId = id;
    }
    return this.conversationsService.saveConversationHistory(req.user.id, saveHistoryDto);
  }
}
