import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Status, ChannelName, SessionStatus } from 'src/types/enums';

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
        customer: {
          id: 'cust123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        channel: {
          id: 'chan123',
          name: ChannelName.waba,
        },
        session: {
          id: 'sess123',
          status: SessionStatus.open,
        },
        status: Status.active,
      };

      const expectedResult = { id: 'conv123', ...dto };
      mockPrismaService.conversation.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);
      expect(mockPrismaService.conversation.create).toHaveBeenCalledWith({
        data: { ...dto, status: Status.active },
        include: { messages: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if customer has no identifiers', async () => {
      const dto: CreateConversationDto = {
        customer: {
          id: 'cust123',
          // No name, email, or phone
        },
        channel: {
          id: 'chan123',
          name: ChannelName.waba,
        },
        session: {
          id: 'sess123',
          status: SessionStatus.open,
        },
      };

      await expect(service.create(dto)).rejects.toThrow(
        'Customer must have at least one identifier',
      );
    });
  });

  describe('findAll', () => {
    it('should return all non-archived conversations', async () => {
      const expectedResult = [
        { id: 'conv1', customer: { id: 'cust1' } },
        { id: 'conv2', customer: { id: 'cust2' } },
      ];
      mockPrismaService.conversation.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(mockPrismaService.conversation.findMany).toHaveBeenCalledWith({
        where: { status: { not: Status.archive } },
        include: { messages: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a conversation by ID', async () => {
      const id = 'conv123';
      const expectedResult = { id, customer: { id: 'cust1' } };
      mockPrismaService.conversation.findUnique.mockResolvedValue(
        expectedResult,
      );

      const result = await service.findOne(id);
      expect(mockPrismaService.conversation.findUnique).toHaveBeenCalledWith({
        where: { id, status: { not: Status.archive } },
        include: {
          messages: {
            where: { status: 'active' },
            include: { attachment: true },
          },
        },
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
      const dto: UpdateConversationDto = { status: Status.inactive };
      const expectedResult = { id, status: Status.inactive };

      mockPrismaService.conversation.findUnique.mockResolvedValue({ id });
      mockPrismaService.conversation.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, dto);
      expect(mockPrismaService.conversation.update).toHaveBeenCalledWith({
        where: { id },
        data: { ...dto, updated_at: new Date() },
        include: {
          messages: {
            where: { status: 'active' },
            include: { attachment: true },
          },
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should soft delete a conversation', async () => {
      const id = 'conv123';
      const expectedResult = { id, status: Status.inactive };

      mockPrismaService.conversation.findUnique.mockResolvedValue({ id });
      mockPrismaService.conversation.update.mockResolvedValue(expectedResult);

      const result = await service.remove(id);
      expect(mockPrismaService.conversation.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          status: Status.inactive,
          updated_at: new Date(),
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
