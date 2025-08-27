import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Status, ChannelName, SessionStatus } from '../types/enums';

const mockPrismaService = {
  customer: {
    upsert: jest.fn(),
  },
  agent: {
    upsert: jest.fn(),
  },
  channel: {
    upsert: jest.fn(),
  },
  session: {
    upsert: jest.fn(),
  },
  conversation: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
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
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
        },
        channel: {
          id: '507f1f77bcf86cd799439013',
          name: ChannelName.waba,
        },
        session: {
          id: '507f1f77bcf86cd799439014',
          status: SessionStatus.open,
        },
        status: Status.active,
      };
      const mockCustomer = { ...dto.customer };
      const mockChannel = { ...dto.channel };
      const mockSession = { ...dto.session };
      const expectedResult = {
        id: 'conv123',
        customer_id: mockCustomer.id,
        channel_id: mockChannel.id,
        session_id: mockSession.id,
        status: Status.active,
      };
      mockPrismaService.customer.upsert.mockResolvedValue(mockCustomer);
      mockPrismaService.channel.upsert.mockResolvedValue(mockChannel);
      mockPrismaService.session.upsert.mockResolvedValue(mockSession);
      mockPrismaService.conversation.create.mockResolvedValue(expectedResult);
      const result = await service.create(dto);
      expect(mockPrismaService.customer.upsert).toHaveBeenCalled();
      expect(mockPrismaService.channel.upsert).toHaveBeenCalled();
      expect(mockPrismaService.session.upsert).toHaveBeenCalled();
      expect(mockPrismaService.conversation.create).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if customer has no identifiers', async () => {
      const dto: CreateConversationDto = {
        customer: {
          id: '507f1f77bcf86cd799439011',
          // No name, email, or phone
        },
        channel: {
          id: '507f1f77bcf86cd799439013',
          name: ChannelName.waba,
        },
        session: {
          id: '507f1f77bcf86cd799439014',
          status: SessionStatus.open,
        },
      };
      await expect(service.create(dto)).rejects.toThrow(
        'Customer must have at least one identifier',
      );
    });

    it('should throw error for invalid ObjectID', async () => {
      const dto: CreateConversationDto = {
        customer: {
          id: 'invalid-id',
          name: 'John Doe',
        },
        channel: {
          id: '507f1f77bcf86cd799439013',
          name: ChannelName.waba,
        },
        session: {
          id: '507f1f77bcf86cd799439014',
          status: SessionStatus.open,
        },
      };
      await expect(service.create(dto)).rejects.toThrow(
        'Invalid customer ID format',
      );
    });

    it('should throw error for duplicate email', async () => {
      const dto: CreateConversationDto = {
        customer: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
        },
        channel: {
          id: '507f1f77bcf86cd799439013',
          name: ChannelName.waba,
        },
        session: {
          id: '507f1f77bcf86cd799439014',
          status: SessionStatus.open,
        },
      };
      mockPrismaService.customer.upsert.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });
      await expect(service.create(dto)).rejects.toThrow(
        'Duplicate email found',
      );
    });
  });

  describe('findAll', () => {
    it('should return all active conversations', async () => {
      const expectedResult = [{ id: 'conv1', status: Status.active }];
      mockPrismaService.conversation.findMany.mockResolvedValue(expectedResult);
      const result = await service.findAll({ skip: 0, take: 10 });
      expect(mockPrismaService.conversation.findMany).toHaveBeenCalledWith({
        where: { status: Status.active },
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
          messages: {
            include: { attachment: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a conversation by ID', async () => {
      const id = '507f1f77bcf86cd799439015';
      const expectedResult = { id, status: Status.active };
      mockPrismaService.conversation.findUnique.mockResolvedValue(
        expectedResult,
      );
      const result = await service.findOne(id);
      expect(mockPrismaService.conversation.findUnique).toHaveBeenCalledWith({
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
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if conversation not found', async () => {
      const id = '507f1f77bcf86cd799439015';
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a conversation', async () => {
      const id = '507f1f77bcf86cd799439015';
      const dto: UpdateConversationDto = { status: Status.inactive };
      const expectedResult = { id, status: Status.inactive };
      mockPrismaService.conversation.findUnique.mockResolvedValue({
        id,
        status: Status.active,
      });
      mockPrismaService.conversation.update.mockResolvedValue(expectedResult);
      const result = await service.update(id, dto);
      expect(mockPrismaService.conversation.update).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should soft delete a conversation', async () => {
      const id = '507f1f77bcf86cd799439015';
      const expectedResult = { id, status: Status.inactive };
      mockPrismaService.conversation.findUnique.mockResolvedValue({
        id,
        status: Status.active,
      });
      mockPrismaService.conversation.update.mockResolvedValue(expectedResult);
      const result = await service.remove(id);
      expect(mockPrismaService.conversation.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          status: Status.inactive,
          updated_at: expect.any(Date),
        },
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('archive', () => {
    it('should archive a conversation', async () => {
      const id = '507f1f77bcf86cd799439015';
      const expectedResult = { id, status: Status.archive };
      mockPrismaService.conversation.findUnique.mockResolvedValue({
        id,
        status: Status.active,
      });
      mockPrismaService.conversation.update.mockResolvedValue(expectedResult);
      const result = await service.archive(id);
      expect(mockPrismaService.conversation.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          status: Status.archive,
          updated_at: expect.any(Date),
        },
        include: {
          customer: true,
          agent: true,
          channel: true,
          session: true,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
