import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ActiveStatus } from 'src/types/enums';
import { Direction } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMessageDto) {
    // Verify conversation exists
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
  }

  async findAll(conversationId?: string) {
    const where: any = { status: ActiveStatus.active };

    if (conversationId) {
      // Verify conversation exists if conversationId is provided
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
    }

    return this.prisma.message.findMany({
      where,
      include: {
        attachment: true,
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findOne(id: string) {
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
  }

  async update(id: string, data: UpdateMessageDto) {
    await this.findOne(id); // Verify it exists

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
  }

  async remove(id: string) {
    await this.findOne(id); // Verify it exists

    return this.prisma.message.update({
      where: { id },
      data: {
        status: ActiveStatus.inactive,
      },
    });
  }

  async getMessagesByConversation(conversationId: string) {
    const conversationExists = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true }, // Only check existence
    });

    if (!conversationExists) {
      throw new NotFoundException(
        `Conversation with ID "${conversationId}" not found`,
      );
    }

    return this.prisma.message.findMany({
      where: {
        conversation_id: conversationId,
        status: ActiveStatus.active,
      },
      include: {
        attachment: true,
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  // Additional useful methods
  async findByDirection(direction: string) {
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
  }

  async findWithAttachments() {
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
  }

  // Optional: Method to get message with full conversation details when needed
  async findOneWithConversation(id: string) {
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
  }
}
