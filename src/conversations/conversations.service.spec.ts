import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Channel, Status } from '@prisma/client';

const mockPrismaService = {
  conversation: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ConversationsService', () => {
  let service: ConversationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conversation', async () => {
      const dto: CreateConversationDto = {
        customer_id: 'customer123',
        advisor_id: 'advisor456',
        channel: Channel.watsonx,
        session_id: 'sess_123',
        status: Status.active,
      };
      const expectedResult = { id: 'conv123', ...dto };
      mockPrismaService.conversation.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);

      expect(mockPrismaService.conversation.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all conversations', async () => {
      const expectedResult = [
        { id: 'conv1', customer_id: 'cust1' },
        { id: 'conv2', customer_id: 'cust2' },
      ];
      mockPrismaService.conversation.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(mockPrismaService.conversation.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a conversation by ID', async () => {
      const id = 'conv123';
      const expectedResult = { id, customer_id: 'cust1' };
      mockPrismaService.conversation.findUnique.mockResolvedValue(
        expectedResult,
      );

      const result = await service.findOne(id);

      expect(mockPrismaService.conversation.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if conversation not found', async () => {
      const id = 'nonexistent';
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(
        new NotFoundException(`Conversation with ID "${id}" not found`),
      );
    });
  });

  describe('update', () => {
    it('should update a conversation', async () => {
      const id = 'conv123';
      const dto: UpdateConversationDto = { status: Status.closed };
      const expectedResult = { id, status: Status.closed };
      mockPrismaService.conversation.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, dto);

      expect(mockPrismaService.conversation.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a conversation', async () => {
      const id = 'conv123';
      const expectedResult = { id };
      mockPrismaService.conversation.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id);

      expect(mockPrismaService.conversation.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
