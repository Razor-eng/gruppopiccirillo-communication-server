import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ActiveStatus } from '../types/enums';
import { Direction } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  async create(data: CreateMessageDto) {
    // Validate ObjectIDs
    if (!this.isValidObjectId(data.conversation_id)) {
      throw new BadRequestException('Invalid conversation ID format');
    }

    // Verify conversation exists
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: data.conversation_id },
      });
      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID "${data.conversation_id}" not found`,
        );
      }

      let attachment_id: string | null = null;
      // Create attachment if provided
      if (data.attachment) {
        const attachment = await this.prisma.attachment.create({
          data: {
            type: data.attachment.type,
            url: data.attachment.url,
            mime_type: data.attachment.mime_type,
            status: ActiveStatus.active,
          },
        });
        attachment_id = attachment.id;
      }

      // Create the message
      return this.prisma.message.create({
        data: {
          conversation_id: data.conversation_id,
          content: data.content,
          direction: data.direction,
          status: ActiveStatus.active,
          attachment_id,
        },
        include: {
          attachment: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        const target = error.meta?.target?.join(', ') || 'field';
        throw new BadRequestException(`Duplicate ${target} found`);
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Foreign key constraint failed');
      }
      throw new BadRequestException('Failed to create message');
    }
  }

  async findAll(
    conversationId?: string,
    { skip = 0, take = 10 }: { skip?: number; take?: number } = {},
  ) {
    const where: any = { status: ActiveStatus.active };
    if (conversationId) {
      if (!this.isValidObjectId(conversationId)) {
        throw new BadRequestException('Invalid conversation ID format');
      }
      // Verify conversation exists if conversationId is provided
      try {
        const conversationExists = await this.prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { id: true },
        });
        if (!conversationExists) {
          throw new NotFoundException(
            `Conversation with ID "${conversationId}" not found`,
          );
        }
        where.conversation_id = conversationId;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException('Failed to fetch messages');
      }
    }
    try {
      return this.prisma.message.findMany({
        where,
        include: {
          attachment: true,
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take,
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch messages');
    }
  }

  async findOne(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid message ID format');
    }
    try {
      const message = await this.prisma.message.findUnique({
        where: { id, status: ActiveStatus.active },
        include: {
          attachment: true,
        },
      });
      if (!message) {
        throw new NotFoundException(`Message with ID "${id}" not found`);
      }
      return message;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch message');
    }
  }

  async update(id: string, data: UpdateMessageDto) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid message ID format');
    }
    await this.findOne(id); // Verify it exists
    try {
      return this.prisma.message.update({
        where: { id },
        data: {
          content: data.content,
          status: data.status,
        },
        include: {
          attachment: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update message');
    }
  }

  async remove(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid message ID format');
    }
    await this.findOne(id); // Verify it exists
    try {
      return this.prisma.message.update({
        where: { id },
        data: {
          status: ActiveStatus.inactive,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete message');
    }
  }

  async findByDirection(direction: string) {
    try {
      return this.prisma.message.findMany({
        where: {
          direction: direction as Direction,
          status: ActiveStatus.active,
        },
        include: {
          attachment: true,
        },
        orderBy: { timestamp: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch messages by direction');
    }
  }

  async findWithAttachments() {
    try {
      return this.prisma.message.findMany({
        where: {
          attachment_id: { not: null },
          status: ActiveStatus.active,
        },
        include: {
          attachment: true,
        },
        orderBy: { timestamp: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch messages with attachments',
      );
    }
  }

  async findOneWithConversation(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid message ID format');
    }
    try {
      const message = await this.prisma.message.findUnique({
        where: { id, status: ActiveStatus.active },
        include: {
          attachment: true,
          conversation: {
            include: {
              customer: true,
              advisor: true,
              channel: true,
              session: true,
            },
          },
        },
      });
      if (!message) {
        throw new NotFoundException(`Message with ID "${id}" not found`);
      }
      return message;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to fetch message with conversation',
      );
    }
  }
}
