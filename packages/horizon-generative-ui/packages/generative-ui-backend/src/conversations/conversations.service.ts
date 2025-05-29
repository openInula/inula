import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateConversationDto, 
  CreateMessageDto, 
  UpdateConversationDto, 
  GetConversationsQueryDto,
  SaveConversationHistoryDto, 
} from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async createConversation(userId: number, dto: CreateConversationDto) {
    // 验证Agent是否存在
    const agent = await this.prisma.agent.findUnique({
      where: { id: dto.agentId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${dto.agentId} not found`);
    }

    return this.prisma.conversation.create({
      data: {
        title: dto.title,
        userId,
        agentId: dto.agentId,
        metadata: dto.metadata,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getAllConversations(userId: number, query: GetConversationsQueryDto) {
    const { page = 1, pageSize = 10, agentId } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      userId,
      ...(agentId ? { agentId } : {}),
    };

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // 获取最新一条消息作为预览
          },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      data: conversations,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getConversationById(userId: number, id: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found or not accessible`);
    }

    return conversation;
  }

  async updateConversation(userId: number, id: string, dto: UpdateConversationDto) {
    // 首先检查会话是否存在且属于该用户
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingConversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found or not accessible`);
    }

    return this.prisma.conversation.update({
      where: {
        id,
      },
      data: {
        title: dto.title,
        metadata: dto.metadata,
      },
    });
  }

  async deleteConversation(userId: number, id: string) {
    // 首先检查会话是否存在且属于该用户
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingConversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found or not accessible`);
    }

    return this.prisma.conversation.delete({
      where: {
        id,
      },
    });
  }

  async createMessage(userId: number, dto: CreateMessageDto) {
    // 验证会话是否属于该用户
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: dto.conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or not accessible');
    }

    if (dto.role !== 'user' && dto.role !== 'assistant') {
      throw new ForbiddenException('Invalid role. Role must be either \'user\' or \'assistant\'');
    }

    // 创建消息
    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        role: dto.role,
        conversationId: dto.conversationId,
        metadata: dto.metadata,
      },
    });

    // 更新会话的updatedAt
    await this.prisma.conversation.update({
      where: {
        id: dto.conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  }

  async getMessagesByConversationId(userId: number, conversationId: string) {
    // 验证会话是否属于该用户
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or not accessible');
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async saveConversationHistory(userId: number, dto: SaveConversationHistoryDto) {
    // 验证会话是否属于该用户
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: dto.conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or not accessible');
    }

    if (!dto.messages || dto.messages.length === 0) {
      throw new BadRequestException('At least one message is required');
    }

    // 验证所有消息的角色是否有效
    for (const message of dto.messages) {
      if (message.role !== 'user' && message.role !== 'assistant') {
        throw new BadRequestException(`Invalid role in messages: ${message.role}. Role must be either 'user' or 'assistant'`);
      }
    }

    // 首先删除该会话的所有现有消息
    await this.prisma.message.deleteMany({
      where: {
        conversationId: dto.conversationId,
      },
    });

    // 批量创建新消息
    const createdMessages = await this.prisma.message.createMany({
      data: dto.messages.map((message) => ({
        content: message.content,
        role: message.role,
        conversationId: dto.conversationId,
        metadata: message.metadata,
      })),
    });

    // 更新会话的updatedAt
    await this.prisma.conversation.update({
      where: {
        id: dto.conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // 获取并返回更新后的完整会话
    return this.getConversationById(userId, dto.conversationId);
  }
}
