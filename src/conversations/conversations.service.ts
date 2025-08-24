import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateConversationDto) {
    return this.prisma.conversation.create({ data });
  }

  async findAll() {
    return this.prisma.conversation.findMany();
  }

  async findOne(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID "${id}" not found`);
    }
    return conversation;
  }

  async update(id: string, data: UpdateConversationDto) {
    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.conversation.delete({ where: { id } });
  }
}
