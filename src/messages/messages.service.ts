import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMessageDto) {
    return this.prisma.message.create({ data });
  }

  async findAll() {
    return this.prisma.message.findMany();
  }

  async findOne(id: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID "${id}" not found`);
    }
    return message;
  }

  async update(id: string, data: UpdateMessageDto) {
    return this.prisma.message.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.message.delete({ where: { id } });
  }

  async getMessagesByConversation(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID "${conversationId}" not found`,
      );
    }
    return this.prisma.message.findMany({
      where: { conversation_id: conversationId },
    });
  }
}
