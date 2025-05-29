import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto, DSLActionType } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(private prisma: PrismaService) { }

  async create(createAgentDto: CreateAgentDto, userId: number) {
    this.logger.log(`创建新Agent: ${createAgentDto.name} 用户ID: ${userId}`);

    try {
      // 创建Agent基本信息
      const agent = await this.prisma.agent.create({
        data: {
          name: createAgentDto.name,
          description: createAgentDto.description,
          promptTemplate: '',
          userData: '',
          promptQueries: '',
          user: {
            connect: { id: userId },
          },
        },
      });

      // 处理UI行为
      if (createAgentDto.uiActions && createAgentDto.uiActions.length > 0) {
        await this.createUiActions(agent.id, createAgentDto.uiActions);
      }

      // 返回完整的Agent信息，包含关联数据
      return this.findOne(agent.id, userId);
    } catch (error) {
      this.logger.error(`创建Agent失败: ${error.message}`, error.stack);
      throw new BadRequestException(`创建Agent失败: ${error.message}`);
    }
  }

  async findAll(userId: number) {
    this.logger.log(`获取用户ID: ${userId} 的所有Agent`);

    try {
      return await this.prisma.agent.findMany({
        where: { userId },
        include: {
          uiActions: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`获取Agent列表失败: ${error.message}`, error.stack);
      throw new BadRequestException(`获取Agent列表失败: ${error.message}`);
    }
  }

  async findOne(id: number, userId: number) {
    this.logger.log(`获取Agent ID: ${id}, 用户ID: ${userId}`);

    try {
      const agent = await this.prisma.agent.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          uiActions: true,
          templateQuestions: true,
        },
      });

      if (!agent) {
        throw new NotFoundException(`Agent ID ${id} 不存在或不属于该用户`);
      }

      return agent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`获取Agent失败: ${error.message}`, error.stack);
      throw new BadRequestException(`获取Agent失败: ${error.message}`);
    }
  }

  async update(id: number, updateAgentDto: UpdateAgentDto, userId: number) {
    this.logger.log(`更新Agent ID: ${id}, 用户ID: ${userId}`);

    // 检查Agent是否存在且属于该用户
    await this.findOne(id, userId);

    try {
      // 更新Agent基本信息
      const updateData: any = {
        publishedAt: new Date(),
      };
      if (updateAgentDto.name !== undefined) updateData.name = updateAgentDto.name;
      if (updateAgentDto.promptTemplate !== undefined) updateData.promptTemplate = updateAgentDto.promptTemplate;
      if (updateAgentDto.userData !== undefined) updateData.userData = updateAgentDto.userData;
      if (updateAgentDto.promptQueries !== undefined) updateData.promptQueries = updateAgentDto.promptQueries;

      await this.prisma.agent.update({
        where: { id },
        data: updateData,
      });

      // 处理UI行为 - 如果提供了新的行为列表，则完全替换旧的
      if (updateAgentDto.uiActions !== undefined) {
        // 删除旧的UI行为
        await this.prisma.uiAction.deleteMany({
          where: { agentId: id },
        });

        // 创建新的UI行为
        if (updateAgentDto.uiActions.length > 0) {
          await this.createUiActions(id, updateAgentDto.uiActions);
        }
      }

      // 处理模板问题 - 如果提供了新的模板问题列表，则完全替换旧的
      if (updateAgentDto.templateQuestions !== undefined) {
        // 删除旧的模板问题
        await this.prisma.templateQuestion.deleteMany({
          where: { agentId: id },
        });

        // 创建新的模板问题
        if (updateAgentDto.templateQuestions.length > 0) {
          await this.createTemplateQuestions(id, updateAgentDto.templateQuestions);
        }
      }

      // 返回更新后的完整Agent信息
      return this.findOne(id, userId);
    } catch (error) {
      this.logger.error(`更新Agent失败: ${error.message}`, error.stack);
      throw new BadRequestException(`更新Agent失败: ${error.message}`);
    }
  }

  async remove(id: number, userId: number) {
    this.logger.log(`删除Agent ID: ${id}, 用户ID: ${userId}`);

    // 检查Agent是否存在且属于该用户
    await this.findOne(id, userId);

    try {
      // 由于设置了级联删除，删除Agent时会自动删除相关的UI行为和测试集
      await this.prisma.agent.delete({
        where: { id },
      });

      return { message: `Agent ID ${id} 已成功删除` };
    } catch (error) {
      this.logger.error(`删除Agent失败: ${error.message}`, error.stack);
      throw new BadRequestException(`删除Agent失败: ${error.message}`);
    }
  }

  // 辅助方法：创建UI行为
  private async createUiActions(agentId: number, uiActions: any[]) {
    const uiActionsData = uiActions.map((action) => {
      const baseAction = {
        key: action.key,
        type: action.type,
        agentId,
      };

      // 根据类型添加特定字段
      if (action.type === DSLActionType.link) {
        return {
          ...baseAction,
          description: action.description || null,
          target: action.target,
        };
      } else if (action.type === DSLActionType.event || action.type === DSLActionType.function) {
        return {
          ...baseAction,
          eventName: action.eventName,
          param: action.param ? action.param : {},
        };
      }

      return baseAction;
    });

    await this.prisma.uiAction.createMany({
      data: uiActionsData,
    });
  }

  // 辅助方法：创建模板问题
  private async createTemplateQuestions(agentId: number, templateQuestions: any[]) {
    this.logger.log(`为Agent ID: ${agentId} 创建 ${templateQuestions.length} 个模板问题`);
    
    const templateQuestionsData = templateQuestions.map((question) => ({
      content: question.content,
      agentId,
    }));

    await this.prisma.templateQuestion.createMany({
      data: templateQuestionsData,
    });
  }
}
