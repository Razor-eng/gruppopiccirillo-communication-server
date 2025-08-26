import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Direction, ActiveStatus } from 'src/types/enums';

const mockPrismaService = {
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  conversation: {
    findUnique: jest.fn(),
  },
  attachment: {
    create: jest.fn(),
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
        content: 'Hello',
        direction: Direction.incoming,
      };

      const conversation = { id: 'conv123', channel: { id: 'chan123' } };
      const expectedResult = { id: 'msg123', ...dto };

      mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);
      mockPrismaService.message.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);
      expect(mockPrismaService.message.create).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if conversation not found', async () => {
      const dto: CreateMessageDto = {
        conversation_id: 'nonexistent',
        content: 'Hello',
        direction: Direction.incoming,
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(
        new NotFoundException(
          `Conversation with ID "${dto.conversation_id}" not found`,
        ),
      );
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
      });
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
        where: { id, status: ActiveStatus.active },
        include: { attachment: true },
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
      const id = 'msg123';
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
});
