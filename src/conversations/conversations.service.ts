import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Status } from '../types/enums';
import { ConversationResponseDto } from './dto/conversation-response.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  // Transform Prisma response to match ConversationResponseDto
  private transformToResponseDto(conversation: any): ConversationResponseDto {
    const {
      customer_id,
      agent_id,
      channel_id,
      session_id,
      customer,
      agent,
      channel,
      session,
      messages,
      ...rest
    } = conversation;
    return {
      ...rest,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      agent: agent
        ? {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            phone: agent.phone,
          }
        : undefined,
      channel: {
        id: channel.id,
        name: channel.name,
      },
      session: {
        id: session.id,
        status: session.status,
      },
      messages: messages?.map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        content: msg.content,
        direction: msg.direction,
        timestamp: msg.timestamp,
        status: msg.status,
        attachment_id: msg.attachment_id,
        attachment: msg.attachment
          ? {
              type: msg.attachment.type,
              url: msg.attachment.url,
              mime_type: msg.attachment.mime_type,
              status: msg.attachment.status,
            }
          : undefined,
      })),
    };
  }

  async create(data: CreateConversationDto) {
    // Validate ObjectIDs
    if (!this.isValidObjectId(data.customer.id)) {
      throw new BadRequestException('Invalid customer ID format');
    }
    if (data.agent && !this.isValidObjectId(data.agent.id)) {
      throw new BadRequestException('Invalid agent ID format');
    }
    if (!this.isValidObjectId(data.channel.id)) {
      throw new BadRequestException('Invalid channel ID format');
    }
    if (!this.isValidObjectId(data.session.id)) {
      throw new BadRequestException('Invalid session ID format');
    }

    // Validate that customer has at least one identifier
    if (!data.customer.name && !data.customer.email && !data.customer.phone) {
      throw new BadRequestException(
        'Customer must have at least one identifier (name, email, or phone)',
      );
    }

    // Validate that agent has at least one identifier if provided
    if (
      data.agent &&
      !data.agent.name &&
      !data.agent.email &&
      !data.agent.phone
    ) {
      throw new BadRequestException(
        'Agent must have at least one identifier (name, email, or phone)',
      );
    }

    try {
      // Use upsert for related entities to handle existing records
      const customer = await this.prisma.customer.upsert({
        where: { id: data.customer.id },
        update: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
        },
        create: data.customer,
      });

      // Explicitly type the agent variable
      let agent: { id: string } | null = null;
      if (data.agent) {
        const agentResult = await this.prisma.agent.upsert({
          where: { id: data.agent.id },
          update: {
            name: data.agent.name,
            email: data.agent.email,
            phone: data.agent.phone,
          },
          create: data.agent,
        });
        agent = agentResult;
      }

      const channel = await this.prisma.channel.upsert({
        where: { id: data.channel.id },
        update: {
          name: data.channel.name,
        },
        create: data.channel,
      });

      const session = await this.prisma.session.upsert({
        where: { id: data.session.id },
        update: {
          status: data.session.status,
        },
        create: data.session,
      });

      // Create the conversation with relations
      const conversation = await this.prisma.conversation.create({
        data: {
          customer_id: customer.id,
          agent_id: agent?.id,
          channel_id: channel.id,
          session_id: session.id,
          created_by: data.created_by,
          created_by_client: data.created_by_client,
          status: data.status || Status.active,
        },
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
          messages: {
            include: {
              attachment: true,
            },
          },
        },
      });

      return this.transformToResponseDto(conversation);
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target?.join(', ') || 'field';
        throw new BadRequestException(`Duplicate ${target} found`);
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Foreign key constraint failed');
      }
      throw error;
    }
  }

  async findAll({ skip = 0, take = 10 }: { skip?: number; take?: number }) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: { status: Status.active }, // Exclude both archive and inactive
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
          messages: {
            include: {
              attachment: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take,
      });
      return conversations.map((conv) => this.transformToResponseDto(conv));
    } catch (error) {
      throw new BadRequestException('Failed to fetch conversations');
    }
  }

  async findOne(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid conversation ID format');
    }
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id },
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
          messages: {
            where: { status: 'active' },
            include: { attachment: true },
            orderBy: { timestamp: 'asc' },
          },
        },
      });
      if (!conversation || conversation.status !== Status.active) {
        throw new NotFoundException(`Conversation with ID "${id}" not found`);
      }
      return this.transformToResponseDto(conversation);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch conversation');
    }
  }

  async update(id: string, data: UpdateConversationDto) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid conversation ID format');
    }
    await this.findOne(id); // Verify it exists
    try {
      const updateData: any = {
        status: data.status,
        updated_by: data.updated_by,
        updated_by_client: data.updated_by_client,
        updated_at: new Date(),
      };

      // Handle session update if provided
      if (data.session) {
        if (data.session.id && !this.isValidObjectId(data.session.id)) {
          throw new BadRequestException('Invalid session ID format');
        }
        // First get current conversation to get session_id
        const current = await this.prisma.conversation.findUnique({
          where: { id },
        });
        if (current) {
          // Update the session (use provided session ID or current session_id)
          const sessionId = data.session.id || current.session_id;
          await this.prisma.session.update({
            where: { id: sessionId },
            data: {
              status: data.session.status,
            },
          });
          if (data.session.id) {
            updateData.session_id = data.session.id; // Update session_id if provided
          }
        }
      }

      const conversation = await this.prisma.conversation.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
          messages: {
            where: { status: 'active' },
            include: { attachment: true },
          },
        },
      });
      return this.transformToResponseDto(conversation);
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target?.join(', ') || 'field';
        throw new BadRequestException(`Duplicate ${target} found`);
      }
      throw new BadRequestException('Failed to update conversation');
    }
  }

  async remove(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid conversation ID format');
    }
    await this.findOne(id); // Verify it exists
    try {
      const conversation = await this.prisma.conversation.update({
        where: { id },
        data: {
          status: Status.inactive,
          updated_at: new Date(),
        },
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
        },
      });
      return this.transformToResponseDto(conversation);
    } catch (error) {
      throw new BadRequestException('Failed to delete conversation');
    }
  }

  async archive(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid conversation ID format');
    }
    await this.findOne(id); // Verify it exists
    try {
      const conversation = await this.prisma.conversation.update({
        where: { id },
        data: {
          status: Status.archive,
          updated_at: new Date(),
        },
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
        },
      });
      return this.transformToResponseDto(conversation);
    } catch (error) {
      throw new BadRequestException('Failed to archive conversation');
    }
  }

  async findByCustomer(customerId: string) {
    if (!this.isValidObjectId(customerId)) {
      throw new BadRequestException('Invalid customer ID format');
    }
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          customer_id: customerId,
          status: Status.active,
        },
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
          messages: {
            include: {
              attachment: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      return conversations.map((conv) => this.transformToResponseDto(conv));
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch conversations by customer',
      );
    }
  }

  async findByStatus(status: Status) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: { status },
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
          messages: {
            include: {
              attachment: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      return conversations.map((conv) => this.transformToResponseDto(conv));
    } catch (error) {
      throw new BadRequestException('Failed to fetch conversations by status');
    }
  }
}
