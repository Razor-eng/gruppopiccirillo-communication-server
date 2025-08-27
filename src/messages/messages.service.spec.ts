import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Direction, ActiveStatus, AttachType } from '../types/enums';

const mockPrismaService = {
  conversation: {
    findUnique: jest.fn(),
  },
  attachment: {
    create: jest.fn(),
  },
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
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
        conversation_id: '507f1f77bcf86cd799439015',
        content: 'Hello',
        direction: Direction.incoming,
      };

      const conversation = { id: dto.conversation_id };
      const expectedResult = { id: 'msg123', ...dto };

      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);
      mockPrismaService.message.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);
      expect(mockPrismaService.message.create).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should create a message with attachment', async () => {
      const dto: CreateMessageDto = {
        conversation_id: '507f1f77bcf86cd799439015',
        content: 'Hello',
        direction: Direction.incoming,
        attachment: {
          type: AttachType.image,
          url: 'https://example.com/image.jpg',
          mime_type: 'image/jpeg',
        },
      };

      const conversation = { id: dto.conversation_id };
      const attachment = { id: 'attach123' };
      const expectedResult = {
        id: 'msg123',
        ...dto,
        attachment_id: attachment.id,
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);
      mockPrismaService.attachment.create.mockResolvedValue(attachment);
      mockPrismaService.message.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);
      expect(mockPrismaService.attachment.create).toHaveBeenCalled();
      expect(mockPrismaService.message.create).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if conversation not found', async () => {
      const dto: CreateMessageDto = {
        conversation_id: '507f1f77bcf86cd799439015',
        content: 'Hello',
        direction: Direction.incoming,
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw error for invalid ObjectID', async () => {
      const dto: CreateMessageDto = {
        conversation_id: 'invalid-id',
        content: 'Hello',
        direction: Direction.incoming,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all active messages', async () => {
      const expectedResult = [{ id: 'msg1' }, { id: 'msg2' }];
      mockPrismaService.message.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
        where: { status: ActiveStatus.active },
        include: { attachment: true },
        orderBy: { timestamp: 'desc' },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return messages filtered by conversation', async () => {
      const conversationId = '507f1f77bcf86cd799439015';
      const expectedResult = [{ id: 'msg1' }];

      mockPrismaService.conversation.findUnique.mockResolvedValue({
        id: conversationId,
      });
      mockPrismaService.message.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(conversationId);
      expect(mockPrismaService.message.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a message by ID', async () => {
      const id = '507f1f77bcf86cd799439016';
      const expectedResult = { id };
      mockPrismaService.message.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(id);
      expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
        where: { id, status: ActiveStatus.active },
        include: { attachment: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if message not found', async () => {
      const id = '507f1f77bcf86cd799439016';
      mockPrismaService.message.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const id = '507f1f77bcf86cd799439016';
      const dto: UpdateMessageDto = { content: 'Updated' };
      const expectedResult = { id, content: 'Updated' };

      mockPrismaService.message.findUnique.mockResolvedValue({ id });
      mockPrismaService.message.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, dto);
      expect(mockPrismaService.message.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
        include: { attachment: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should soft delete a message', async () => {
      const id = '507f1f77bcf86cd799439016';
      const expectedResult = { id, status: ActiveStatus.inactive };

      mockPrismaService.message.findUnique.mockResolvedValue({ id });
      mockPrismaService.message.update.mockResolvedValue(expectedResult);

      const result = await service.remove(id);
      expect(mockPrismaService.message.update).toHaveBeenCalledWith({
        where: { id },
        data: { status: ActiveStatus.inactive },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMessagesByConversation', () => {
    it('should return messages by conversation ID', async () => {
      const conversationId = '507f1f77bcf86cd799439015';
      const expectedResult = [{ id: 'msg1' }];

      mockPrismaService.conversation.findUnique.mockResolvedValue({
        id: conversationId,
      });
      mockPrismaService.message.findMany.mockResolvedValue(expectedResult);

      const result = await service.getMessagesByConversation(conversationId);
      expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
        where: {
          conversation_id: conversationId,
          status: ActiveStatus.active,
        },
        include: { attachment: true },
        orderBy: { timestamp: 'asc' },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
