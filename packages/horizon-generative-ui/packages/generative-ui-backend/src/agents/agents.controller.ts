import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Logger } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('agents')
@ApiBearerAuth('JWT-auth')
@Controller('agents')
@UseGuards(JwtAuthGuard) // 确保所有agent接口都需要登录
export class AgentsController {
  private readonly logger = new Logger(AgentsController.name);

  constructor(private readonly agentsService: AgentsService) { }

  @Post()
  @ApiOperation({ summary: '创建Agent', description: '为当前登录用户创建一个新的Agent' })
  @ApiBody({ type: CreateAgentDto })
  @ApiCreatedResponse({
    description: 'Agent创建成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: '客户服务助手' },
        promptTemplate: { type: 'string', example: '你是一个客户服务助手...' },
        userData: { type: 'string', example: '用户相关数据' },
        promptQueries: { type: 'string', example: '常见问题列表' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        uiActions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              key: { type: 'string' },
              type: { type: 'string', enum: ['link', 'event', 'function'] },
            },
          },
        },
        testSets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              question: { type: 'string' },
              expectedResult: { type: 'string' },
              runRecord: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '未授权访问' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createAgentDto: CreateAgentDto, @Request() req) {
    this.logger.log(`用户 ${req.user.account} 请求创建新Agent: ${createAgentDto.name}`);
    return this.agentsService.create(createAgentDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取所有Agent', description: '获取当前登录用户的所有Agent列表' })
  @ApiOkResponse({
    description: '成功返回Agent列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          promptTemplate: { type: 'string' },
          userData: { type: 'string' },
          promptQueries: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '未授权访问' })
  async findAll(@Request() req) {
    this.logger.log(`用户 ${req.user.account} 请求获取所有Agent`);
    return this.agentsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取Agent详情', description: '获取指定ID的Agent详细信息' })
  @ApiParam({ name: 'id', description: 'Agent ID', type: 'number' })
  @ApiOkResponse({
    description: '成功返回Agent详情',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        promptTemplate: { type: 'string' },
        userData: { type: 'string' },
        promptQueries: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        uiActions: { type: 'array', items: { type: 'object' } },
        testSets: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '未授权访问' })
  @ApiNotFoundResponse({ description: 'Agent不存在或不属于当前用户' })
  async findOne(@Param('id') id: string, @Request() req) {
    this.logger.log(`用户 ${req.user.account} 请求获取Agent: ${id}`);
    return this.agentsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新Agent', description: '更新指定ID的Agent信息' })
  @ApiParam({ name: 'id', description: 'Agent ID', type: 'number' })
  @ApiBody({ type: UpdateAgentDto })
  @ApiOkResponse({ description: '成功更新Agent信息' })
  @ApiUnauthorizedResponse({ description: '未授权访问' })
  @ApiNotFoundResponse({ description: 'Agent不存在或不属于当前用户' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto, @Request() req) {
    this.logger.log(`用户 ${req.user.account} 请求更新Agent: ${id}`);
    return this.agentsService.update(+id, updateAgentDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除Agent', description: '删除指定ID的Agent' })
  @ApiParam({ name: 'id', description: 'Agent ID', type: 'number' })
  @ApiOkResponse({
    description: '成功删除Agent',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Agent ID 1 已成功删除' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '未授权访问' })
  @ApiNotFoundResponse({ description: 'Agent不存在或不属于当前用户' })
  async remove(@Param('id') id: string, @Request() req) {
    this.logger.log(`用户 ${req.user.account} 请求删除Agent: ${id}`);
    return this.agentsService.remove(+id, req.user.id);
  }
}