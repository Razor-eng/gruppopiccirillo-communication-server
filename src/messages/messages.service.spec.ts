import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Channel } from '@prisma/client';

const mockPrismaService = {
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  conversation: {
    findUnique: jest.fn(),
  },
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new message', async () => {
      const dto: CreateMessageDto = {
        conversation_id: 'conv123',
        channel: Channel.watsonx,
        type: 'text',
        direction: 'incoming',
        content: 'Hello',
        attachments: [{ type: 'image', url: 'https://example.com' }],
      };
      const expectedResult = { id: 'msg123', ...dto };
      mockPrismaService.message.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);
      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all messages', async () => {
      const expectedResult = [{ id: 'msg1' }];
      mockPrismaService.message.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(mockPrismaService.message.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a message by ID', async () => {
      const id = 'msg123';
      const expectedResult = { id };
      mockPrismaService.message.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(id);
      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if message not found', async () => {
      const id = 'nonexistent';
      mockPrismaService.message.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(
        new NotFoundException(`Message with ID "${id}" not found`),
      );
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const id = 'msg123';
      const dto: UpdateMessageDto = { content: 'Updated' };
      const expectedResult = { id, content: 'Updated' };
      mockPrismaService.message.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, dto);
      expect(mockPrismaService.message.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a message', async () => {
      const id = 'msg123';
      const expectedResult = { id };
      mockPrismaService.message.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id);
      expect(mockPrismaService.message.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMessagesByConversation', () => {
    it('should return messages for a conversation', async () => {
      const conversationId = 'conv123';
      mockPrismaService.conversation.findUnique.mockResolvedValue({
        id: conversationId,
      });
      const expectedResult = [{ id: 'msg1', conversation_id: conversationId }];
      mockPrismaService.message.findMany.mockResolvedValue(expectedResult);

      const result = await service.getMessagesByConversation(conversationId);
      expect(mockPrismaService.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: conversationId },
      });
      expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
        where: { conversation_id: conversationId },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if conversation not found', async () => {
      const conversationId = 'nonexistent';
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.getMessagesByConversation(conversationId),
      ).rejects.toThrow(
        new NotFoundException(
          `Conversation with ID "${conversationId}" not found`,
        ),
      );
    });
  });
});
